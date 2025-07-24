from fastapi import APIRouter, Depends, Body, HTTPException
from sqlalchemy.orm import Session
from ...api import deps
from ...db import models
from ...schemas import UserOut, UserPreferencesUpdate
from ...core import auth

router = APIRouter()

@router.get("/", response_model=UserOut)
def get_profile(user=Depends(deps.get_current_user), db: Session = Depends(deps.get_db)):
    # Refresh user from database to get latest XP
    db.refresh(user)
    
    # Ensure default values for preferences if they're None
    if user.theme_preference is None:
        user.theme_preference = 'light'
        db.commit()
    if user.font_size is None:
        user.font_size = 'medium'
        db.commit()
    
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
    
    # Get streak information
    from ...utils.streak_calculator import get_user_streak_info
    streak_info = get_user_streak_info(user.id, db)
    
    return {
        "total_submissions": total_submissions,
        "problems_solved": problems_solved,
        "total_xp": user.total_xp or 0,
        "easy_solved": easy_solved,
        "medium_solved": medium_solved,
        "hard_solved": hard_solved,
        "current_streak": streak_info.get("current_streak", 0),
        "longest_streak": streak_info.get("longest_streak", 0),
        "streak_active": streak_info.get("streak_active", False)
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

@router.put("/preferences", response_model=UserOut)
def update_preferences(
    preferences: UserPreferencesUpdate,
    user=Depends(deps.get_current_user), 
    db: Session = Depends(deps.get_db)
):
    """Update user preferences (theme, font size, etc.)"""
    if preferences.theme_preference is not None:
        # Validate theme preference
        valid_themes = ['light', 'dark', 'high-contrast', 'blue', 'green', 'purple']
        if preferences.theme_preference not in valid_themes:
            raise HTTPException(status_code=400, detail=f"Invalid theme. Must be one of: {valid_themes}")
        user.theme_preference = preferences.theme_preference
    
    if preferences.font_size is not None:
        # Validate font size
        valid_sizes = ['small', 'medium', 'large', 'extra-large']
        if preferences.font_size not in valid_sizes:
            raise HTTPException(status_code=400, detail=f"Invalid font size. Must be one of: {valid_sizes}")
        user.font_size = preferences.font_size
    
    db.commit()
    db.refresh(user)
    return user 