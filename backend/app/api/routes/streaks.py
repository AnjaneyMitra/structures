"""
API routes for streak tracking functionality.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ...api import deps
from ...db.models import User
from ...utils.streak_calculator import get_user_streak_info, get_streak_calendar_data

router = APIRouter()


@router.get("/")
def get_current_user_streak(
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Get current user's streak information."""
    streak_info = get_user_streak_info(current_user.id, db)
    
    if "error" in streak_info:
        raise HTTPException(status_code=404, detail=streak_info["error"])
    
    return streak_info


@router.get("/calendar")
def get_streak_calendar(
    days: int = 30,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Get calendar data showing solve history for streak visualization."""
    if days < 1 or days > 365:
        raise HTTPException(status_code=400, detail="Days must be between 1 and 365")
    
    calendar_data = get_streak_calendar_data(current_user.id, db, days)
    return calendar_data


@router.get("/leaderboard")
def get_streak_leaderboard(
    limit: int = 10,
    db: Session = Depends(deps.get_db)
):
    """Get streak leaderboard showing users with highest current streaks."""
    if limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="Limit must be between 1 and 100")
    
    # Get users with highest current streaks
    users = db.query(User).filter(
        User.current_streak > 0
    ).order_by(
        User.current_streak.desc(),
        User.longest_streak.desc()
    ).limit(limit).all()
    
    leaderboard = []
    for i, user in enumerate(users, 1):
        leaderboard.append({
            "rank": i,
            "username": user.username,
            "current_streak": user.current_streak,
            "longest_streak": user.longest_streak
        })
    
    return {
        "leaderboard": leaderboard,
        "total_users": len(leaderboard)
    }


@router.get("/stats")
def get_streak_stats(
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Get detailed streak statistics for the current user."""
    streak_info = get_user_streak_info(current_user.id, db)
    
    if "error" in streak_info:
        raise HTTPException(status_code=404, detail=streak_info["error"])
    
    # Get additional stats
    calendar_data = get_streak_calendar_data(current_user.id, db, 365)  # Full year
    
    # Calculate streak statistics
    total_solve_days = calendar_data["total_solve_days"]
    
    # Get user's rank in current streak leaderboard
    users_with_higher_streak = db.query(User).filter(
        User.current_streak > current_user.current_streak
    ).count()
    current_streak_rank = users_with_higher_streak + 1
    
    # Get user's rank in longest streak leaderboard
    users_with_higher_longest = db.query(User).filter(
        User.longest_streak > current_user.longest_streak
    ).count()
    longest_streak_rank = users_with_higher_longest + 1
    
    return {
        **streak_info,
        "total_solve_days_this_year": total_solve_days,
        "current_streak_rank": current_streak_rank,
        "longest_streak_rank": longest_streak_rank,
        "streak_percentage": round((streak_info["current_streak"] / 365) * 100, 2) if streak_info["current_streak"] > 0 else 0
    }