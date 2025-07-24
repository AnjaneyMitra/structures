from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ...db.models import User
from ...schemas import LevelInfo, UserLevelProgress
from ...utils.level_calculator import get_all_levels, get_level_progress
from ..deps import get_current_user, get_db

router = APIRouter()

@router.get("/all", response_model=List[LevelInfo])
def get_all_level_info():
    """Get information about all available levels and titles."""
    return get_all_levels()

@router.get("/progress", response_model=UserLevelProgress)
def get_user_level_progress(
    current_user: User = Depends(get_current_user)
):
    """Get current user's level progress information."""
    return get_level_progress(current_user.total_xp or 0)

@router.get("/user/{user_id}/progress", response_model=UserLevelProgress)
def get_user_level_progress_by_id(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get level progress for a specific user by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return get_level_progress(user.total_xp or 0)

@router.get("/test/{xp_amount}")
def test_level_calculation(xp_amount: int):
    """Test endpoint to see what level and title a given XP amount would result in."""
    from ...utils.level_calculator import calculate_level, get_level_progress
    
    level, title = calculate_level(xp_amount)
    progress = get_level_progress(xp_amount)
    
    return {
        "xp_input": xp_amount,
        "level": level,
        "title": title,
        "detailed_progress": progress
    }

@router.post("/debug/set-xp/{xp_amount}")
def debug_set_user_xp(
    xp_amount: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Debug endpoint to manually set current user's XP for testing level system."""
    old_xp = current_user.total_xp or 0
    old_level, old_title = calculate_level(old_xp)
    
    current_user.total_xp = xp_amount
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    new_level, new_title = calculate_level(xp_amount)
    progress = get_level_progress(xp_amount)
    
    return {
        "success": True,
        "user_id": current_user.id,
        "username": current_user.username,
        "old_xp": old_xp,
        "new_xp": xp_amount,
        "old_level": old_level,
        "old_title": old_title,
        "new_level": new_level,
        "new_title": new_title,
        "leveled_up": new_level > old_level,
        "progress": progress
    }