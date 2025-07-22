from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session, joinedload
from ...db import models, schemas
from ...api import deps
from ...code_runner.executor import CodeExecutor
import datetime

router = APIRouter()

@router.post("/", response_model=schemas.SubmissionOut)
def submit_code(submission: schemas.SubmissionCreate = Body(...), db: Session = Depends(deps.get_db), user=Depends(deps.get_current_user)):
    """
    Submit code for evaluation against test cases.
    """
    problem = db.query(models.Problem).options(joinedload(models.Problem.test_cases)).filter(models.Problem.id == submission.problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # Initialize code executor
    executor = CodeExecutor(timeout=5, memory_limit_mb=128)
    
    # Get test cases
    test_cases = problem.test_cases
    
    # If sample_only is True, only run the first test case
    if getattr(submission, 'sample_only', False):
        test_cases = test_cases[:1] if test_cases else []
    
    if not test_cases:
        raise HTTPException(status_code=400, detail="No test cases available for this problem")
    
    # Prepare test cases for execution
    test_case_data = []
    for tc in test_cases:
        test_case_data.append({
            'input': tc.input,
            'output': tc.output
        })
    
    # Determine function name (default to 'solution', or get from problem definition if available)
    function_name = getattr(problem, 'function_name', None) or getattr(submission, 'function_name', None) or 'solution'
    
    # Execute code against test cases using dynamic function execution
    execution_results = executor.run_all_test_cases(submission.code, test_case_data, function_name=function_name)

    # Determine if all test cases failed due to error (collect errors)
    all_failed = all(not tc['passed'] for tc in execution_results['test_case_results'])
    error_messages = [tc['error'] for tc in execution_results['test_case_results'] if tc['error']]
    top_error_message = None
    if all_failed and error_messages:
        # If all failed and there are error messages, show the first one
        top_error_message = error_messages[0]

    # Collect memory usage if available (use max across test cases)
    memory_usages = [tc.get('memory_usage', 0) for tc in execution_results['test_case_results'] if tc.get('memory_usage') is not None]
    max_memory_usage = max(memory_usages) if memory_usages else 0

    # Add summary of passed/failed test cases
    passed_cases = [i for i, tc in enumerate(execution_results['test_case_results']) if tc['passed']]
    failed_cases = [i for i, tc in enumerate(execution_results['test_case_results']) if not tc['passed']]

    # Create submission result
    if getattr(submission, 'sample_only', False):
        # Return only the sample run result, no DB write
        return schemas.SubmissionOut(
            id=-1,
            user_id=user.id,
            problem_id=problem.id,
            code=submission.code,
            language=submission.language,
            result=execution_results['overall_status'],
            runtime=str(execution_results['total_execution_time']),
            submission_time=datetime.datetime.utcnow(),
            test_case_results=execution_results['test_case_results'],
            execution_time=execution_results['total_execution_time'],
            memory_usage=max_memory_usage,
            overall_status=execution_results['overall_status'],
            error_message=top_error_message,
            # Add summary fields for frontend clarity
            # (If you want to add these to the schema, update schemas.py accordingly)
            # passed_cases=passed_cases,
            # failed_cases=failed_cases
        )
    else:
        # Create new submission in database
        new_submission = models.Submission(
            user_id=user.id,
            problem_id=problem.id,
            code=submission.code,
            language=submission.language,
            result=execution_results['overall_status'],  # Legacy field
            runtime=str(execution_results['total_execution_time']),  # Legacy field
            test_case_results=execution_results['test_case_results'],
            execution_time=execution_results['total_execution_time'],
            memory_usage=max_memory_usage,
            overall_status=execution_results['overall_status'],
            error_message=top_error_message
        )
        db.add(new_submission)
        db.commit()
        db.refresh(new_submission)
        return schemas.SubmissionOut(
            id=new_submission.id,
            user_id=new_submission.user_id,
            problem_id=new_submission.problem_id,
            code=new_submission.code,
            language=new_submission.language,
            result=new_submission.result,
            runtime=new_submission.runtime,
            submission_time=new_submission.submission_time,
            test_case_results=new_submission.test_case_results,
            execution_time=new_submission.execution_time,
            memory_usage=new_submission.memory_usage,
            overall_status=new_submission.overall_status,
            error_message=new_submission.error_message
        )

@router.post("/run", response_model=schemas.SubmissionOut)
def run_code(submission: schemas.SubmissionCreate = Body(...), db: Session = Depends(deps.get_db), user=Depends(deps.get_current_user)):
    """
    Run code against sample test case only (no database storage).
    """
    # Set sample_only to True for this endpoint
    submission.sample_only = True
    return submit_code(submission, db, user)

@router.post("/test")
def test_run_code(data: dict = Body(...), db: Session = Depends(deps.get_db), user=Depends(deps.get_current_user)):
    """
    Execute code directly for testing purposes (simple execution without test cases).
    """
    code = data.get("code", "")
    language = data.get("language", "python")
    simple_run = data.get("simple_run", False)
    
    if not simple_run:
        raise HTTPException(status_code=400, detail="This endpoint only supports simple_run mode")
    
    try:
        from ...code_runner.executor import CodeExecutor
        executor = CodeExecutor(timeout=5, memory_limit_mb=128)
        
        # Simple run mode - just execute the code to see print output
        input_data = ""  # No input for simple test runs
        execution_result = executor.execute_python_code(code, input_data)
        
        result = {
            "simple_execution": True,
            "success": execution_result["success"],
            "output": execution_result["output"],
            "error": execution_result["error"],
            "execution_time": execution_result["execution_time"]
        }
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Execution failed: {str(e)}")

@router.get("/problem/{problem_id}", response_model=list[schemas.SubmissionOut])
def get_submissions(problem_id: int, db: Session = Depends(deps.get_db), user=Depends(deps.get_current_user)):
    """
    Get all submissions for a specific problem by the current user.
    """
    return db.query(models.Submission).filter(
        models.Submission.problem_id == problem_id, 
        models.Submission.user_id == user.id
    ).order_by(models.Submission.submission_time.desc()).all() 