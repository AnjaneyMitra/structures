"""
Global leaderboards API routes.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from ...core.auth import get_db, get_current_user
from ...db.models import User, LeaderboardEntry, Friendship
from ...schemas import LeaderboardEntry as LeaderboardEntrySchema
from ...utils.leaderboard_updater import (
    update_global_leaderboard,
    update_weekly_leaderboard, 
    update_monthly_leaderboard,
    update_all_leaderboards,
    calculate_level,
    get_problems_solved_count
)

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/global", response_model=List[LeaderboardEntrySchema])
def get_global_leaderboard(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get the global leaderboard based on total XP."""
    try:
        # Get leaderboard entries
        entries = db.query(LeaderboardEntry).filter(
            LeaderboardEntry.leaderboard_type == "global"
        ).order_by(LeaderboardEntry.rank).offset(offset).limit(limit).all()
        
        # If no entries exist, update the leaderboard first
        if not entries:
            logger.info("No global leaderboard entries found, updating...")
            update_result = update_global_leaderboard(db)
            if update_result["success"]:
                entries = db.query(LeaderboardEntry).filter(
                    LeaderboardEntry.leaderboard_type == "global"
                ).order_by(LeaderboardEntry.rank).offset(offset).limit(limit).all()
        
        # Convert to response format
        result = []
        for entry in entries:
            user = entry.user
            level, title = calculate_level(user.total_xp)
            problems_solved = get_problems_solved_count(db, user.id)
            
            result.append(LeaderboardEntrySchema(
                rank=entry.rank,
                id=user.id,
                username=user.username,
                total_xp=user.total_xp,
                problems_solved=problems_solved,
                level=level,
                title=title
            ))
        
        return result
        
    except Exception as e:
        logger.error(f"Error getting global leaderboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to get global leaderboard")

@router.get("/weekly", response_model=List[LeaderboardEntrySchema])
def get_weekly_leaderboard(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get the weekly leaderboard based on XP gained in the last 7 days."""
    try:
        # Get leaderboard entries
        entries = db.query(LeaderboardEntry).filter(
            LeaderboardEntry.leaderboard_type == "weekly"
        ).order_by(LeaderboardEntry.rank).offset(offset).limit(limit).all()
        
        # If no entries exist, update the leaderboard first
        if not entries:
            logger.info("No weekly leaderboard entries found, updating...")
            update_result = update_weekly_leaderboard(db)
            if update_result["success"]:
                entries = db.query(LeaderboardEntry).filter(
                    LeaderboardEntry.leaderboard_type == "weekly"
                ).order_by(LeaderboardEntry.rank).offset(offset).limit(limit).all()
        
        # Convert to response format
        result = []
        for entry in entries:
            user = entry.user
            level, title = calculate_level(user.total_xp)
            problems_solved = get_problems_solved_count(db, user.id)
            
            result.append(LeaderboardEntrySchema(
                rank=entry.rank,
                id=user.id,
                username=user.username,
                total_xp=entry.score,  # Weekly XP for this leaderboard
                problems_solved=problems_solved,
                level=level,
                title=title
            ))
        
        return result
        
    except Exception as e:
        logger.error(f"Error getting weekly leaderboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to get weekly leaderboard")

@router.get("/monthly", response_model=List[LeaderboardEntrySchema])
def get_monthly_leaderboard(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get the monthly leaderboard based on XP gained in the last 30 days."""
    try:
        # Get leaderboard entries
        entries = db.query(LeaderboardEntry).filter(
            LeaderboardEntry.leaderboard_type == "monthly"
        ).order_by(LeaderboardEntry.rank).offset(offset).limit(limit).all()
        
        # If no entries exist, update the leaderboard first
        if not entries:
            logger.info("No monthly leaderboard entries found, updating...")
            update_result = update_monthly_leaderboard(db)
            if update_result["success"]:
                entries = db.query(LeaderboardEntry).filter(
                    LeaderboardEntry.leaderboard_type == "monthly"
                ).order_by(LeaderboardEntry.rank).offset(offset).limit(limit).all()
        
        # Convert to response format
        result = []
        for entry in entries:
            user = entry.user
            level, title = calculate_level(user.total_xp)
            problems_solved = get_problems_solved_count(db, user.id)
            
            result.append(LeaderboardEntrySchema(
                rank=entry.rank,
                id=user.id,
                username=user.username,
                total_xp=entry.score,  # Monthly XP for this leaderboard
                problems_solved=problems_solved,
                level=level,
                title=title
            ))
        
        return result
        
    except Exception as e:
        logger.error(f"Error getting monthly leaderboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to get monthly leaderboard")

@router.get("/friends", response_model=List[LeaderboardEntrySchema])
def get_friends_leaderboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get leaderboard of friends sorted by total XP."""
    try:
        # Get all friends
        friendships = db.query(Friendship).filter(
            (
                (Friendship.requester_id == current_user.id) |
                (Friendship.addressee_id == current_user.id)
            ) &
            (Friendship.status == "accepted")
        ).all()
        
        # Collect friend IDs and include current user
        friend_ids = [current_user.id]  # Include current user in leaderboard
        
        for friendship in friendships:
            friend_id = friendship.addressee_id if friendship.requester_id == current_user.id else friendship.requester_id
            friend_ids.append(friend_id)
        
        # Get users with their stats
        users = db.query(User).filter(User.id.in_(friend_ids)).all()
        
        leaderboard = []
        for user in users:
            level, title = calculate_level(user.total_xp or 0)
            problems_solved = get_problems_solved_count(db, user.id)
            
            leaderboard.append({
                "id": user.id,
                "username": user.username,
                "total_xp": user.total_xp or 0,
                "problems_solved": problems_solved,
                "level": level,
                "title": title
            })
        
        # Sort by XP descending
        leaderboard.sort(key=lambda x: x["total_xp"], reverse=True)
        
        # Add ranks and convert to schema
        result = []
        for i, entry in enumerate(leaderboard):
            result.append(LeaderboardEntrySchema(
                rank=i + 1,
                id=entry["id"],
                username=entry["username"],
                total_xp=entry["total_xp"],
                problems_solved=entry["problems_solved"],
                level=entry["level"],
                title=entry["title"]
            ))
        
        return result
        
    except Exception as e:
        logger.error(f"Error getting friends leaderboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to get friends leaderboard")

@router.get("/{leaderboard_type}/rank/{user_id}")
def get_user_rank(
    leaderboard_type: str,
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific user's rank in a leaderboard."""
    if leaderboard_type not in ["global", "weekly", "monthly"]:
        raise HTTPException(status_code=400, detail="Invalid leaderboard type")
    
    try:
        # Get user
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get rank from cached value or leaderboard entry
        if leaderboard_type == "global":
            rank = user.global_rank
        elif leaderboard_type == "weekly":
            rank = user.weekly_rank
        else:  # monthly
            rank = user.monthly_rank
        
        # If no cached rank, try to get from leaderboard entry
        if rank is None:
            entry = db.query(LeaderboardEntry).filter(
                LeaderboardEntry.user_id == user_id,
                LeaderboardEntry.leaderboard_type == leaderboard_type
            ).first()
            rank = entry.rank if entry else None
        
        return {
            "user_id": user_id,
            "username": user.username,
            "leaderboard_type": leaderboard_type,
            "rank": rank,
            "total_xp": user.total_xp,
            "has_rank": rank is not None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user rank: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user rank")

@router.post("/refresh")
def refresh_leaderboards(
    leaderboard_type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Refresh leaderboard rankings (admin only)."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        if leaderboard_type == "global":
            result = update_global_leaderboard(db)
        elif leaderboard_type == "weekly":
            result = update_weekly_leaderboard(db)
        elif leaderboard_type == "monthly":
            result = update_monthly_leaderboard(db)
        elif leaderboard_type is None:
            result = update_all_leaderboards(db)
        else:
            raise HTTPException(status_code=400, detail="Invalid leaderboard type")
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error refreshing leaderboards: {e}")
        raise HTTPException(status_code=500, detail="Failed to refresh leaderboards")

@router.get("/stats")
def get_leaderboard_stats(db: Session = Depends(get_db)):
    """Get general leaderboard statistics."""
    try:
        # Count entries in each leaderboard
        global_count = db.query(LeaderboardEntry).filter(
            LeaderboardEntry.leaderboard_type == "global"
        ).count()
        
        weekly_count = db.query(LeaderboardEntry).filter(
            LeaderboardEntry.leaderboard_type == "weekly"
        ).count()
        
        monthly_count = db.query(LeaderboardEntry).filter(
            LeaderboardEntry.leaderboard_type == "monthly"
        ).count()
        
        # Get last update times
        last_updates = {}
        for lb_type in ["global", "weekly", "monthly"]:
            entry = db.query(LeaderboardEntry).filter(
                LeaderboardEntry.leaderboard_type == lb_type
            ).order_by(LeaderboardEntry.updated_at.desc()).first()
            
            last_updates[lb_type] = entry.updated_at.isoformat() if entry else None
        
        return {
            "global": {
                "count": global_count,
                "last_updated": last_updates["global"]
            },
            "weekly": {
                "count": weekly_count,
                "last_updated": last_updates["weekly"]
            },
            "monthly": {
                "count": monthly_count,
                "last_updated": last_updates["monthly"]
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting leaderboard stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get leaderboard stats")