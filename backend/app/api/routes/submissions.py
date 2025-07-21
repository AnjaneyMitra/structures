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
    
    # Execute code against test cases
    execution_results = executor.run_all_test_cases(submission.code, test_case_data)
    
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
            memory_usage=0,  # Will be calculated if needed
            overall_status=execution_results['overall_status'],
            error_message=None
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
            memory_usage=0,  # Will be calculated if needed
            overall_status=execution_results['overall_status'],
            error_message=None
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

@router.get("/problem/{problem_id}", response_model=list[schemas.SubmissionOut])
def get_submissions(problem_id: int, db: Session = Depends(deps.get_db), user=Depends(deps.get_current_user)):
    """
    Get all submissions for a specific problem by the current user.
    """
    return db.query(models.Submission).filter(
        models.Submission.problem_id == problem_id, 
        models.Submission.user_id == user.id
    ).order_by(models.Submission.submission_time.desc()).all() 