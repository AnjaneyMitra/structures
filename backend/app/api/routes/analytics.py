from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from ...db import models
from ...api import deps
from typing import Dict, List, Any

router = APIRouter()

@router.get("/success-rate")
def get_success_rate(
    user: models.User = Depends(deps.get_current_user), 
    db: Session = Depends(deps.get_db)
) -> List[Dict[str, Any]]:
    """Get user's success rate by difficulty level."""
    
    # Query to get success rate by difficulty for the current user
    stats = db.query(
        models.Problem.difficulty,
        func.count(models.Submission.id).label('total_attempts'),
        func.sum(
            case(
                (models.Submission.overall_status == 'pass', 1),
                else_=0
            )
        ).label('successful_attempts')
    ).join(
        models.Submission, models.Problem.id == models.Submission.problem_id
    ).filter(
        models.Submission.user_id == user.id
    ).group_by(
        models.Problem.difficulty
    ).all()
    
    result = []
    for stat in stats:
        success_rate = (stat.successful_attempts / stat.total_attempts * 100) if stat.total_attempts > 0 else 0
        result.append({
            "difficulty": stat.difficulty,
            "success_rate": round(success_rate, 1),
            "total_attempts": stat.total_attempts,
            "successful_attempts": stat.successful_attempts or 0
        })
    
    # Ensure all difficulties are represented, even with 0 attempts
    existing_difficulties = {stat["difficulty"] for stat in result}
    all_difficulties = ["Easy", "Medium", "Hard"]
    
    for difficulty in all_difficulties:
        if difficulty not in existing_difficulties:
            result.append({
                "difficulty": difficulty,
                "success_rate": 0.0,
                "total_attempts": 0,
                "successful_attempts": 0
            })
    
    # Sort by difficulty order
    difficulty_order = {"Easy": 1, "Medium": 2, "Hard": 3}
    result.sort(key=lambda x: difficulty_order.get(x["difficulty"], 4))
    
    return result

@router.get("/problem-acceptance-rates")
def get_problem_acceptance_rates(db: Session = Depends(deps.get_db)) -> List[Dict[str, Any]]:
    """Get acceptance rates for all problems (global statistics)."""
    
    # Query to get acceptance rate for each problem
    stats = db.query(
        models.Problem.id,
        models.Problem.title,
        models.Problem.difficulty,
        func.count(models.Submission.id).label('total_attempts'),
        func.sum(
            case(
                (models.Submission.overall_status == 'pass', 1),
                else_=0
            )
        ).label('successful_attempts')
    ).outerjoin(
        models.Submission, models.Problem.id == models.Submission.problem_id
    ).group_by(
        models.Problem.id, models.Problem.title, models.Problem.difficulty
    ).all()
    
    result = []
    for stat in stats:
        acceptance_rate = (stat.successful_attempts / stat.total_attempts * 100) if stat.total_attempts > 0 else 0
        result.append({
            "problem_id": stat.id,
            "title": stat.title,
            "difficulty": stat.difficulty,
            "acceptance_rate": round(acceptance_rate, 1),
            "total_attempts": stat.total_attempts or 0,
            "successful_attempts": stat.successful_attempts or 0
        })
    
    return result

@router.get("/global-success-rate")
def get_global_success_rate(db: Session = Depends(deps.get_db)) -> List[Dict[str, Any]]:
    """Get global success rate by difficulty (all users combined)."""
    
    # Query to get global success rate by difficulty
    stats = db.query(
        models.Problem.difficulty,
        func.count(models.Submission.id).label('total_attempts'),
        func.sum(
            case(
                (models.Submission.overall_status == 'pass', 1),
                else_=0
            )
        ).label('successful_attempts')
    ).join(
        models.Submission, models.Problem.id == models.Submission.problem_id
    ).group_by(
        models.Problem.difficulty
    ).all()
    
    result = []
    for stat in stats:
        success_rate = (stat.successful_attempts / stat.total_attempts * 100) if stat.total_attempts > 0 else 0
        result.append({
            "difficulty": stat.difficulty,
            "success_rate": round(success_rate, 1),
            "total_attempts": stat.total_attempts,
            "successful_attempts": stat.successful_attempts or 0
        })
    
    # Ensure all difficulties are represented
    existing_difficulties = {stat["difficulty"] for stat in result}
    all_difficulties = ["Easy", "Medium", "Hard"]
    
    for difficulty in all_difficulties:
        if difficulty not in existing_difficulties:
            result.append({
                "difficulty": difficulty,
                "success_rate": 0.0,
                "total_attempts": 0,
                "successful_attempts": 0
            })
    
    # Sort by difficulty order
    difficulty_order = {"Easy": 1, "Medium": 2, "Hard": 3}
    result.sort(key=lambda x: difficulty_order.get(x["difficulty"], 4))
    
    return result