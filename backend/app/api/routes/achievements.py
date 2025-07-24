from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ...db.models import User, Achievement, UserAchievement
from ...utils.achievements import (
    get_user_achievements, 
    initialize_default_achievements,
    check_achievements
)
from ...api import deps

router = APIRouter()

@router.get("/", response_model=List[Dict[str, Any]])
async def get_all_achievements(db: Session = Depends(deps.get_db)):
    """Get all available achievements"""
    
    # Initialize default achievements if they don't exist
    initialize_default_achievements(db)
    
    achievements = db.query(Achievement).all()
    
    return [
        {
            "id": achievement.id,
            "name": achievement.name,
            "description": achievement.description,
            "icon": achievement.icon,
            "condition_type": achievement.condition_type,
            "condition_value": achievement.condition_value,
            "xp_reward": achievement.xp_reward
        }
        for achievement in achievements
    ]

@router.get("/user", response_model=Dict[str, Any])
async def get_user_achievements_endpoint(
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Get user's achievements with progress"""
    
    # Initialize default achievements if they don't exist
    initialize_default_achievements(db)
    
    return get_user_achievements(current_user.id, db)

@router.post("/check")
async def trigger_achievement_check(
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Manually trigger achievement check (for testing)"""
    
    # Initialize default achievements if they don't exist
    initialize_default_achievements(db)
    
    newly_earned = check_achievements(current_user.id, "manual_check", db)
    
    return {
        "message": f"Achievement check completed. {len(newly_earned)} new achievements earned.",
        "newly_earned": newly_earned
    }

@router.get("/stats")
async def get_achievement_stats(
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Get achievement statistics for the user"""
    
    total_achievements = db.query(Achievement).count()
    earned_achievements = db.query(UserAchievement).filter(
        UserAchievement.user_id == current_user.id
    ).count()
    
    total_xp_from_achievements = db.query(Achievement.xp_reward).join(
        UserAchievement, Achievement.id == UserAchievement.achievement_id
    ).filter(UserAchievement.user_id == current_user.id).all()
    
    xp_from_achievements = sum(xp[0] for xp in total_xp_from_achievements)
    
    return {
        "total_achievements": total_achievements,
        "earned_achievements": earned_achievements,
        "completion_percentage": round((earned_achievements / total_achievements * 100) if total_achievements > 0 else 0, 1),
        "xp_from_achievements": xp_from_achievements,
        "user_total_xp": current_user.total_xp
    }