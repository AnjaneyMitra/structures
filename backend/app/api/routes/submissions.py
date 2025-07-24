from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session, joinedload
from ...db import models, schemas
from ...api import deps
from ...code_runner.executor import CodeExecutor
from ...utils.xp_calculator import calculate_xp_for_problem, should_award_xp
from ...utils.achievements import check_achievements
import datetime

router = APIRouter()

@router.post("/", response_model=schemas.SubmissionOut)
async def submit_code(submission: schemas.SubmissionCreate = Body(...), db: Session = Depends(deps.get_db), user=Depends(deps.get_current_user)):
    """
    Submit code for evaluation against test cases.
    """
    try:
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
            # Calculate XP and update streak if problem is solved successfully
            xp_awarded = 0
            newly_earned_achievements = []
            streak_info = None
            
            if execution_results['overall_status'] == 'pass' and should_award_xp(user.id, problem.id, db):
                xp_awarded = calculate_xp_for_problem(problem.difficulty)
                old_xp = user.total_xp or 0
                # Update user's total XP
                user.total_xp = old_xp + xp_awarded
                db.add(user)
                print(f"🎉 XP AWARDED: User {user.id} earned {xp_awarded} XP for {problem.difficulty} problem. Total XP: {old_xp} -> {user.total_xp}")
                
                # Update user's streak
                from ...utils.streak_calculator import update_user_streak
                streak_info = update_user_streak(user.id, db)
                if streak_info.get("streak_updated"):
                    print(f"🔥 STREAK UPDATED: User {user.id} current streak: {streak_info['current_streak']}, longest: {streak_info['longest_streak']}")
                    if streak_info.get("is_new_record"):
                        print(f"🏆 NEW STREAK RECORD: User {user.id} achieved a new personal best streak!")
                
                # Check for achievements after successful submission
                newly_earned_achievements = check_achievements(
                    user.id, 
                    "submission_success", 
                    db,
                    execution_time=execution_results['total_execution_time'],
                    difficulty=problem.difficulty
                )
                
                if newly_earned_achievements:
                    print(f"🏆 ACHIEVEMENTS EARNED: User {user.id} earned {len(newly_earned_achievements)} new achievements!")
                    for achievement in newly_earned_achievements:
                        print(f"   - {achievement['name']}: {achievement['description']}")
            else:
                print(f"❌ NO XP: User {user.id}, Status: {execution_results['overall_status']}, Should award: {should_award_xp(user.id, problem.id, db) if execution_results['overall_status'] == 'pass' else 'N/A (not passed)'}")
            
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
                error_message=top_error_message,
                xp_awarded=xp_awarded
            )
            db.add(new_submission)
            db.commit()
            db.refresh(new_submission)
            if xp_awarded > 0:
                db.refresh(user)  # Refresh user to get updated total_xp
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
                error_message=new_submission.error_message,
                xp_awarded=new_submission.xp_awarded,
                newly_earned_achievements=newly_earned_achievements,
                streak_info=streak_info
            )
    except Exception as e:
        print(f"Submission error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Submission failed: {str(e)}")

@router.post("/run", response_model=schemas.SubmissionOut)
async def run_code(submission: schemas.SubmissionCreate = Body(...), db: Session = Depends(deps.get_db), user=Depends(deps.get_current_user)):
    """
    Run code against sample test case only (no database storage).
    """
    # Set sample_only to True for this endpoint
    submission.sample_only = True
    return await submit_code(submission, db, user)

@router.post("/test")
async def test_run_code(data: dict = Body(...), db: Session = Depends(deps.get_db), user=Depends(deps.get_current_user)):
    """
    Execute code directly for testing purposes (simple execution without test cases).
    """
    code = data.get("code", "")
    language = data.get("language", "python")
    simple_run = data.get("simple_run", False)
    
    if not simple_run:
        raise HTTPException(status_code=400, detail="This endpoint only supports simple_run mode")
    
    try:
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
async def get_submissions(problem_id: int, db: Session = Depends(deps.get_db), user=Depends(deps.get_current_user)):
    """
    Get all submissions for a specific problem by the current user.
    """
    return db.query(models.Submission).filter(
        models.Submission.problem_id == problem_id, 
        models.Submission.user_id == user.id
    ).order_by(models.Submission.submission_time.desc()).all()

@router.get("/health")
async def health_check():
    """
    Simple health check endpoint for submissions API.
    """
    return {"status": "ok", "message": "Submissions API is working"} 