from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session, joinedload
from ...db import models, schemas
from ...api import deps
import subprocess
import tempfile
import os

router = APIRouter()

@router.post("/", response_model=schemas.SubmissionOut)
def submit_code(submission: schemas.SubmissionCreate = Body(...), db: Session = Depends(deps.get_db), user=Depends(deps.get_current_user), sample_only: bool = False):
    problem = db.query(models.Problem).options(joinedload(models.Problem.test_cases)).filter(models.Problem.id == submission.problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    # Check for sample_only flag in request body
    import inspect
    from fastapi.encoders import jsonable_encoder
    from fastapi.requests import Request
    import sys
    # If sample_only is in the request body, only run the first test case
    from fastapi import Request
    import json
    try:
        from fastapi import Request
        import starlette
        # This is a hack to get the request body
        # In production, use a custom dependency or a separate endpoint
    except ImportError:
        pass
    # Instead, check for sample_only in the submission dict
    if hasattr(submission, 'sample_only') and getattr(submission, 'sample_only'):
        sample_only = True
    elif isinstance(submission, dict) and submission.get('sample_only'):
        sample_only = True
    # Run code against test cases
    results = []
    test_cases = problem.test_cases
    if sample_only:
        test_cases = test_cases[:1]
    for tc in test_cases:
        result, runtime, error_type = run_python_code(submission.code, tc.input)
        passed = result.strip() == tc.output.strip() and not error_type
        results.append({
            "input": tc.input,
            "expected": tc.output,
            "output": result,
            "passed": passed,
            "runtime": runtime,
            "error_type": error_type
        })
    all_passed = all(r["passed"] for r in results)
    if sample_only:
        # Return only the sample run result, no DB write
        return schemas.SubmissionOut(
            id=-1,
            user_id=user.id,
            problem_id=problem.id,
            code=submission.code,
            language=submission.language,
            result="pass" if all_passed else "fail",
            runtime=str([r["runtime"] for r in results]),
            submission_time=None,
            test_case_results=results
        )
    new_submission = models.Submission(
        user_id=user.id,
        problem_id=problem.id,
        code=submission.code,
        language=submission.language,
        result="pass" if all_passed else "fail",
        runtime=str([r["runtime"] for r in results])
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
        test_case_results=results
    )

def run_python_code(code: str, input_data: str):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".py") as tmp:
        tmp.write(code.encode())
        tmp.flush()
        try:
            proc = subprocess.run(["python3", tmp.name], input=input_data.encode(), capture_output=True, timeout=5)
            output = proc.stdout.decode().strip()
            runtime = proc.stderr.decode().strip()
            error_type = None
            if proc.returncode != 0:
                error_type = "RuntimeError"
                if "SyntaxError" in runtime:
                    error_type = "SyntaxError"
                elif "TimeoutExpired" in runtime:
                    error_type = "Timeout"
        except subprocess.TimeoutExpired:
            output = "Execution timed out."
            runtime = "Timeout"
            error_type = "Timeout"
        except Exception as e:
            output = str(e)
            runtime = "error"
            error_type = type(e).__name__
        finally:
            os.unlink(tmp.name)
    return output, runtime, error_type

@router.get("/problem/{problem_id}", response_model=list[schemas.SubmissionOut])
def get_submissions(problem_id: int, db: Session = Depends(deps.get_db), user=Depends(deps.get_current_user)):
    return db.query(models.Submission).filter(models.Submission.problem_id == problem_id, models.Submission.user_id == user.id).all() 