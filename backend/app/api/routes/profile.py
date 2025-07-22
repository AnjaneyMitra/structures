from fastapi import APIRouter, Depends, Body, HTTPException
from sqlalchemy.orm import Session
from ...api import deps
from ...db import models, schemas
from ...core import auth

router = APIRouter()

@router.get("/", response_model=schemas.UserOut)
def get_profile(user=Depends(deps.get_current_user), db: Session = Depends(deps.get_db)):
    # Refresh user from database to get latest XP
    db.refresh(user)
    return user

@router.get("/submissions/")
def get_user_submissions(user=Depends(deps.get_current_user), db: Session = Depends(deps.get_db)):
    submissions = db.query(models.Submission).filter(models.Submission.user_id == user.id).all()
    result = []
    for sub in submissions:
        problem = db.query(models.Problem).filter(models.Problem.id == sub.problem_id).first()
        result.append({
            "id": sub.id,
            "problem_id": sub.problem_id,
            "problem_title": problem.title if problem else f"Problem {sub.problem_id}",
            "problem_difficulty": problem.difficulty if problem else None,
            "result": sub.result,
            "runtime": sub.runtime,
            "submission_time": sub.submission_time,
            "language": sub.language,
            "code": sub.code,
            # New fields for detailed results
            "overall_status": sub.overall_status,
            "test_case_results": sub.test_case_results,
            "error_message": sub.error_message,
            "execution_time": sub.execution_time,
            "memory_usage": sub.memory_usage,
            "xp_awarded": sub.xp_awarded or 0
        })
    return result

@router.get("/stats/", response_model=dict)
def get_user_stats(user=Depends(deps.get_current_user), db: Session = Depends(deps.get_db)):
    total_submissions = db.query(models.Submission).filter(models.Submission.user_id == user.id).count()
    problems_solved = db.query(models.Submission.problem_id).filter(models.Submission.user_id == user.id, models.Submission.overall_status == "pass").distinct().count()
    
    # Calculate XP breakdown by difficulty
    easy_solved = db.query(models.Submission.problem_id).join(models.Problem).filter(
        models.Submission.user_id == user.id,
        models.Submission.overall_status == "pass",
        models.Problem.difficulty == "easy"
    ).distinct().count()
    
    medium_solved = db.query(models.Submission.problem_id).join(models.Problem).filter(
        models.Submission.user_id == user.id,
        models.Submission.overall_status == "pass",
        models.Problem.difficulty == "medium"
    ).distinct().count()
    
    hard_solved = db.query(models.Submission.problem_id).join(models.Problem).filter(
        models.Submission.user_id == user.id,
        models.Submission.overall_status == "pass",
        models.Problem.difficulty == "hard"
    ).distinct().count()
    
    return {
        "total_submissions": total_submissions,
        "problems_solved": problems_solved,
        "total_xp": user.total_xp or 0,
        "easy_solved": easy_solved,
        "medium_solved": medium_solved,
        "hard_solved": hard_solved
    }

@router.put("/username")
def update_username(new_username: str = Body(..., embed=True), user=Depends(deps.get_current_user), db: Session = Depends(deps.get_db)):
    if db.query(models.User).filter(models.User.username == new_username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    user.username = new_username
    db.commit()
    db.refresh(user)
    access_token = auth.create_access_token({"sub": user.username})
    return {"user": user, "access_token": access_token} 