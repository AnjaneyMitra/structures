"""
Leaderboard calculation and update utilities.
"""

from sqlalchemy.orm import Session
from sqlalchemy import text, desc, func
from datetime import datetime, timedelta
from typing import List, Dict, Any
import logging

from ..db.models import User, LeaderboardEntry, Submission
from ..db.base import SessionLocal

logger = logging.getLogger(__name__)

def calculate_level(total_xp: int) -> tuple[int, str]:
    """Calculate user level and title based on total XP."""
    if total_xp < 100:
        return 1, "Novice"
    elif total_xp < 300:
        return 2, "Beginner"
    elif total_xp < 600:
        return 3, "Apprentice"
    elif total_xp < 1000:
        return 4, "Intermediate"
    elif total_xp < 1500:
        return 5, "Advanced"
    elif total_xp < 2500:
        return 6, "Expert"
    elif total_xp < 4000:
        return 7, "Master"
    elif total_xp < 6000:
        return 8, "Grandmaster"
    elif total_xp < 10000:
        return 9, "Legend"
    else:
        return 10, "Mythic"

def get_problems_solved_count(db: Session, user_id: int) -> int:
    """Get the number of problems solved by a user."""
    return db.query(Submission).filter(
        Submission.user_id == user_id,
        Submission.overall_status == "pass"
    ).distinct(Submission.problem_id).count()

def update_global_leaderboard(db: Session = None) -> Dict[str, Any]:
    """Update the global leaderboard based on total XP."""
    if db is None:
        db = SessionLocal()
        should_close = True
    else:
        should_close = False
    
    try:
        logger.info("Starting global leaderboard update...")
        
        # Get all users ordered by total XP
        users = db.query(User).filter(
            User.total_xp > 0
        ).order_by(desc(User.total_xp)).all()
        
        # Clear existing global leaderboard entries
        db.query(LeaderboardEntry).filter(
            LeaderboardEntry.leaderboard_type == "global"
        ).delete()
        
        # Create new leaderboard entries and update user ranks
        updated_users = 0
        for rank, user in enumerate(users, 1):
            # Create leaderboard entry
            entry = LeaderboardEntry(
                user_id=user.id,
                leaderboard_type="global",
                score=user.total_xp,
                rank=rank,
                updated_at=datetime.utcnow()
            )
            db.add(entry)
            
            # Update user's cached rank
            user.global_rank = rank
            updated_users += 1
        
        db.commit()
        logger.info(f"Global leaderboard updated with {updated_users} users")
        
        return {
            "success": True,
            "leaderboard_type": "global",
            "users_updated": updated_users,
            "updated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error updating global leaderboard: {e}")
        db.rollback()
        return {
            "success": False,
            "error": str(e),
            "leaderboard_type": "global"
        }
    finally:
        if should_close:
            db.close()

def update_weekly_leaderboard(db: Session = None) -> Dict[str, Any]:
    """Update the weekly leaderboard based on XP gained in the last 7 days."""
    if db is None:
        db = SessionLocal()
        should_close = True
    else:
        should_close = False
    
    try:
        logger.info("Starting weekly leaderboard update...")
        
        # Calculate date range for this week
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=7)
        
        # Get XP gained by each user in the last 7 days
        weekly_xp_query = db.query(
            Submission.user_id,
            func.sum(Submission.xp_awarded).label('weekly_xp')
        ).filter(
            Submission.submission_time >= start_date,
            Submission.submission_time <= end_date,
            Submission.xp_awarded > 0
        ).group_by(Submission.user_id).subquery()
        
        # Get users with their weekly XP, ordered by weekly XP
        users_with_weekly_xp = db.query(
            User,
            weekly_xp_query.c.weekly_xp
        ).join(
            weekly_xp_query,
            User.id == weekly_xp_query.c.user_id
        ).order_by(desc(weekly_xp_query.c.weekly_xp)).all()
        
        # Clear existing weekly leaderboard entries
        db.query(LeaderboardEntry).filter(
            LeaderboardEntry.leaderboard_type == "weekly"
        ).delete()
        
        # Reset all users' weekly ranks
        db.query(User).update({User.weekly_rank: None})
        
        # Create new leaderboard entries and update user ranks
        updated_users = 0
        for rank, (user, weekly_xp) in enumerate(users_with_weekly_xp, 1):
            # Create leaderboard entry
            entry = LeaderboardEntry(
                user_id=user.id,
                leaderboard_type="weekly",
                score=int(weekly_xp or 0),
                rank=rank,
                period_start=start_date,
                period_end=end_date,
                updated_at=datetime.utcnow()
            )
            db.add(entry)
            
            # Update user's cached rank
            user.weekly_rank = rank
            updated_users += 1
        
        db.commit()
        logger.info(f"Weekly leaderboard updated with {updated_users} users")
        
        return {
            "success": True,
            "leaderboard_type": "weekly",
            "users_updated": updated_users,
            "period_start": start_date.isoformat(),
            "period_end": end_date.isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error updating weekly leaderboard: {e}")
        db.rollback()
        return {
            "success": False,
            "error": str(e),
            "leaderboard_type": "weekly"
        }
    finally:
        if should_close:
            db.close()

def update_monthly_leaderboard(db: Session = None) -> Dict[str, Any]:
    """Update the monthly leaderboard based on XP gained in the last 30 days."""
    if db is None:
        db = SessionLocal()
        should_close = True
    else:
        should_close = False
    
    try:
        logger.info("Starting monthly leaderboard update...")
        
        # Calculate date range for this month
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=30)
        
        # Get XP gained by each user in the last 30 days
        monthly_xp_query = db.query(
            Submission.user_id,
            func.sum(Submission.xp_awarded).label('monthly_xp')
        ).filter(
            Submission.submission_time >= start_date,
            Submission.submission_time <= end_date,
            Submission.xp_awarded > 0
        ).group_by(Submission.user_id).subquery()
        
        # Get users with their monthly XP, ordered by monthly XP
        users_with_monthly_xp = db.query(
            User,
            monthly_xp_query.c.monthly_xp
        ).join(
            monthly_xp_query,
            User.id == monthly_xp_query.c.user_id
        ).order_by(desc(monthly_xp_query.c.monthly_xp)).all()
        
        # Clear existing monthly leaderboard entries
        db.query(LeaderboardEntry).filter(
            LeaderboardEntry.leaderboard_type == "monthly"
        ).delete()
        
        # Reset all users' monthly ranks
        db.query(User).update({User.monthly_rank: None})
        
        # Create new leaderboard entries and update user ranks
        updated_users = 0
        for rank, (user, monthly_xp) in enumerate(users_with_monthly_xp, 1):
            # Create leaderboard entry
            entry = LeaderboardEntry(
                user_id=user.id,
                leaderboard_type="monthly",
                score=int(monthly_xp or 0),
                rank=rank,
                period_start=start_date,
                period_end=end_date,
                updated_at=datetime.utcnow()
            )
            db.add(entry)
            
            # Update user's cached rank
            user.monthly_rank = rank
            updated_users += 1
        
        db.commit()
        logger.info(f"Monthly leaderboard updated with {updated_users} users")
        
        return {
            "success": True,
            "leaderboard_type": "monthly",
            "users_updated": updated_users,
            "period_start": start_date.isoformat(),
            "period_end": end_date.isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error updating monthly leaderboard: {e}")
        db.rollback()
        return {
            "success": False,
            "error": str(e),
            "leaderboard_type": "monthly"
        }
    finally:
        if should_close:
            db.close()

def update_all_leaderboards(db: Session = None) -> Dict[str, Any]:
    """Update all leaderboard types."""
    if db is None:
        db = SessionLocal()
        should_close = True
    else:
        should_close = False
    
    try:
        results = {
            "global": update_global_leaderboard(db),
            "weekly": update_weekly_leaderboard(db),
            "monthly": update_monthly_leaderboard(db)
        }
        
        success_count = sum(1 for result in results.values() if result["success"])
        
        return {
            "success": success_count == 3,
            "results": results,
            "updated_leaderboards": success_count,
            "total_leaderboards": 3,
            "updated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error updating all leaderboards: {e}")
        return {
            "success": False,
            "error": str(e),
            "updated_at": datetime.utcnow().isoformat()
        }
    finally:
        if should_close:
            db.close()