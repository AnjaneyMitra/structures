"""
Streak calculation utilities for tracking user problem-solving streaks.
"""

import datetime
from sqlalchemy.orm import Session
from ..db.models import User


def update_user_streak(user_id: int, db: Session) -> dict:
    """
    Update user's streak after a successful problem solve.
    
    Args:
        user_id: ID of the user who solved a problem
        db: Database session
        
    Returns:
        dict: Updated streak information
    """
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"error": "User not found"}
        
        # Check if streak columns exist by trying to access them
        _ = user.current_streak
        _ = user.longest_streak
        _ = user.last_solve_date
        
    except AttributeError as e:
        return {"error": f"Streak columns not available: {e}"}
    except Exception as e:
        return {"error": f"Database error: {e}"}
    
    today = datetime.date.today()
    
    # If user has never solved a problem before
    if not user.last_solve_date:
        user.current_streak = 1
        user.longest_streak = 1
        user.last_solve_date = datetime.datetime.now()
    else:
        last_solve = user.last_solve_date.date()
        
        # If already solved today, don't update streak
        if last_solve == today:
            return {
                "current_streak": user.current_streak,
                "longest_streak": user.longest_streak,
                "streak_updated": False,
                "message": "Already solved a problem today"
            }
        
        # If solved yesterday, continue streak
        elif last_solve == today - datetime.timedelta(days=1):
            user.current_streak += 1
            user.last_solve_date = datetime.datetime.now()
        
        # If gap in solving, reset streak
        else:
            user.current_streak = 1
            user.last_solve_date = datetime.datetime.now()
    
    # Update longest streak if current streak is higher
    if user.current_streak > user.longest_streak:
        user.longest_streak = user.current_streak
    
    db.commit()
    db.refresh(user)
    
    return {
        "current_streak": user.current_streak,
        "longest_streak": user.longest_streak,
        "streak_updated": True,
        "is_new_record": user.current_streak == user.longest_streak and user.current_streak > 1
    }


def get_user_streak_info(user_id: int, db: Session) -> dict:
    """
    Get user's current streak information.
    
    Args:
        user_id: ID of the user
        db: Database session
        
    Returns:
        dict: User's streak information
    """
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"error": "User not found"}
        
        # Check if streak columns exist by trying to access them
        _ = user.current_streak
        _ = user.longest_streak
        _ = user.last_solve_date
        
    except AttributeError as e:
        return {"error": f"Streak columns not available: {e}"}
    except Exception as e:
        return {"error": f"Database error: {e}"}
    
    today = datetime.date.today()
    streak_active = False
    
    if user.last_solve_date:
        last_solve = user.last_solve_date.date()
        # Streak is active if solved today or yesterday
        streak_active = last_solve >= today - datetime.timedelta(days=1)
        
        # If haven't solved today or yesterday, streak is broken
        if last_solve < today - datetime.timedelta(days=1):
            # Reset current streak to 0 but don't update database yet
            # This will be updated when they solve their next problem
            current_streak = 0
        else:
            current_streak = user.current_streak
    else:
        current_streak = 0
    
    return {
        "current_streak": current_streak,
        "longest_streak": user.longest_streak or 0,
        "last_solve_date": user.last_solve_date.isoformat() if user.last_solve_date else None,
        "streak_active": streak_active,
        "days_since_last_solve": (today - user.last_solve_date.date()).days if user.last_solve_date else None
    }


def get_streak_calendar_data(user_id: int, db: Session, days: int = 30) -> dict:
    """
    Get calendar data showing solve history for streak visualization.
    
    Args:
        user_id: ID of the user
        db: Database session
        days: Number of days to look back (default 30)
        
    Returns:
        dict: Calendar data with solve dates
    """
    from ..db.models import Submission
    
    end_date = datetime.date.today()
    start_date = end_date - datetime.timedelta(days=days - 1)
    
    # Get all successful submissions in the date range
    successful_submissions = db.query(Submission).filter(
        Submission.user_id == user_id,
        Submission.overall_status == "pass",  # Use overall_status for successful submissions
        Submission.submission_time >= datetime.datetime.combine(start_date, datetime.time.min),
        Submission.submission_time <= datetime.datetime.combine(end_date, datetime.time.max)
    ).all()
    
    # Group by date
    solve_dates = set()
    for submission in successful_submissions:
        solve_dates.add(submission.submission_time.date())
    
    # Create calendar data
    calendar_data = []
    current_date = start_date
    
    while current_date <= end_date:
        calendar_data.append({
            "date": current_date.isoformat(),
            "solved": current_date in solve_dates,
            "is_today": current_date == end_date
        })
        current_date += datetime.timedelta(days=1)
    
    return {
        "calendar_data": calendar_data,
        "total_solve_days": len(solve_dates),
        "date_range": {
            "start": start_date.isoformat(),
            "end": end_date.isoformat()
        }
    }