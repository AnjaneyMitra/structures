from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List
from ...db import models, schemas
from ...api import deps

router = APIRouter()

@router.post("/request")
def send_friend_request(
    request: schemas.FriendRequestCreate,
    user=Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Send a friend request to another user."""
    # Find the target user
    target_user = db.query(models.User).filter(models.User.username == request.username).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if target_user.id == user.id:
        raise HTTPException(status_code=400, detail="Cannot send friend request to yourself")
    
    # Check if friendship already exists (in either direction)
    existing_friendship = db.query(models.Friendship).filter(
        or_(
            and_(models.Friendship.requester_id == user.id, models.Friendship.addressee_id == target_user.id),
            and_(models.Friendship.requester_id == target_user.id, models.Friendship.addressee_id == user.id)
        )
    ).first()
    
    if existing_friendship:
        if existing_friendship.status == "accepted":
            raise HTTPException(status_code=400, detail="You are already friends")
        elif existing_friendship.status == "pending":
            raise HTTPException(status_code=400, detail="Friend request already pending")
        elif existing_friendship.status == "blocked":
            raise HTTPException(status_code=400, detail="Cannot send friend request")
    
    # Create new friend request
    friendship = models.Friendship(
        requester_id=user.id,
        addressee_id=target_user.id,
        status="pending"
    )
    db.add(friendship)
    db.commit()
    db.refresh(friendship)
    
    return {
        "id": friendship.id,
        "requester_id": friendship.requester_id,
        "addressee_id": friendship.addressee_id,
        "status": friendship.status,
        "created_at": friendship.created_at,
        "requester_username": user.username,
        "addressee_username": target_user.username
    }

@router.get("/requests/received")
def get_received_friend_requests(
    user=Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Get all pending friend requests received by the current user."""
    requests = db.query(models.Friendship).filter(
        models.Friendship.addressee_id == user.id,
        models.Friendship.status == "pending"
    ).all()
    
    result = []
    for req in requests:
        requester = db.query(models.User).filter(models.User.id == req.requester_id).first()
        result.append({
            "id": req.id,
            "requester_id": req.requester_id,
            "addressee_id": req.addressee_id,
            "status": req.status,
            "created_at": req.created_at,
            "requester_username": requester.username,
            "addressee_username": user.username
        })
    
    return result

@router.get("/requests/sent")
def get_sent_friend_requests(
    user=Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Get all friend requests sent by the current user."""
    requests = db.query(models.Friendship).filter(
        models.Friendship.requester_id == user.id,
        models.Friendship.status == "pending"
    ).all()
    
    result = []
    for req in requests:
        addressee = db.query(models.User).filter(models.User.id == req.addressee_id).first()
        result.append({
            "id": req.id,
            "requester_id": req.requester_id,
            "addressee_id": req.addressee_id,
            "status": req.status,
            "created_at": req.created_at,
            "requester_username": user.username,
            "addressee_username": addressee.username
        })
    
    return result

@router.post("/requests/{request_id}/accept")
def accept_friend_request(
    request_id: int,
    user=Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Accept a friend request."""
    friendship = db.query(models.Friendship).filter(
        models.Friendship.id == request_id,
        models.Friendship.addressee_id == user.id,
        models.Friendship.status == "pending"
    ).first()
    
    if not friendship:
        raise HTTPException(status_code=404, detail="Friend request not found")
    
    friendship.status = "accepted"
    db.commit()
    
    return {"message": "Friend request accepted", "friendship_id": friendship.id}

@router.post("/requests/{request_id}/reject")
def reject_friend_request(
    request_id: int,
    user=Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Reject a friend request."""
    friendship = db.query(models.Friendship).filter(
        models.Friendship.id == request_id,
        models.Friendship.addressee_id == user.id,
        models.Friendship.status == "pending"
    ).first()
    
    if not friendship:
        raise HTTPException(status_code=404, detail="Friend request not found")
    
    db.delete(friendship)
    db.commit()
    
    return {"message": "Friend request rejected"}

@router.get("/")
def get_friends(
    user=Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Get all friends of the current user."""
    # Get accepted friendships where user is either requester or addressee
    friendships = db.query(models.Friendship).filter(
        or_(
            models.Friendship.requester_id == user.id,
            models.Friendship.addressee_id == user.id
        ),
        models.Friendship.status == "accepted"
    ).all()
    
    friends = []
    for friendship in friendships:
        # Get the friend (the other person in the friendship)
        friend_id = friendship.addressee_id if friendship.requester_id == user.id else friendship.requester_id
        friend = db.query(models.User).filter(models.User.id == friend_id).first()
        
        if friend:
            friends.append({
                "id": friend.id,
                "username": friend.username,
                "total_xp": friend.total_xp or 0
            })
    
    # Sort by XP descending
    friends.sort(key=lambda x: x.total_xp, reverse=True)
    return friends

@router.delete("/{friend_id}")
def remove_friend(
    friend_id: int,
    user=Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Remove a friend."""
    friendship = db.query(models.Friendship).filter(
        or_(
            and_(models.Friendship.requester_id == user.id, models.Friendship.addressee_id == friend_id),
            and_(models.Friendship.requester_id == friend_id, models.Friendship.addressee_id == user.id)
        ),
        models.Friendship.status == "accepted"
    ).first()
    
    if not friendship:
        raise HTTPException(status_code=404, detail="Friendship not found")
    
    db.delete(friendship)
    db.commit()
    
    return {"message": "Friend removed successfully"}

@router.get("/leaderboard")
def get_friends_leaderboard(
    user=Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Get leaderboard of friends sorted by XP."""
    # Get all friends
    friendships = db.query(models.Friendship).filter(
        or_(
            models.Friendship.requester_id == user.id,
            models.Friendship.addressee_id == user.id
        ),
        models.Friendship.status == "accepted"
    ).all()
    
    # Collect friend IDs and include current user
    friend_ids = [user.id]  # Include current user in leaderboard
    for friendship in friendships:
        friend_id = friendship.addressee_id if friendship.requester_id == user.id else friendship.requester_id
        friend_ids.append(friend_id)
    
    # Get users with their stats
    leaderboard = []
    for friend_id in friend_ids:
        friend = db.query(models.User).filter(models.User.id == friend_id).first()
        if friend:
            # Count problems solved
            problems_solved = db.query(models.Submission.problem_id).filter(
                models.Submission.user_id == friend.id,
                models.Submission.overall_status == "pass"
            ).distinct().count()
            
            leaderboard.append({
                "id": friend.id,
                "username": friend.username,
                "total_xp": friend.total_xp or 0,
                "problems_solved": problems_solved
            })
    
    # Sort by XP descending
    leaderboard.sort(key=lambda x: x["total_xp"], reverse=True)
    
    # Add ranks
    result = []
    for i, entry in enumerate(leaderboard):
        result.append({
            "rank": i + 1,
            "id": entry["id"],
            "username": entry["username"],
            "total_xp": entry["total_xp"],
            "problems_solved": entry["problems_solved"]
        })
    
    return result

@router.get("/search/{username}")
def search_users(
    username: str,
    user=Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Search for users by username."""
    if len(username) < 2:
        raise HTTPException(status_code=400, detail="Username must be at least 2 characters")
    
    users = db.query(models.User).filter(
        models.User.username.ilike(f"%{username}%"),
        models.User.id != user.id  # Exclude current user
    ).limit(10).all()
    
    result = []
    for found_user in users:
        # Check friendship status
        friendship = db.query(models.Friendship).filter(
            or_(
                and_(models.Friendship.requester_id == user.id, models.Friendship.addressee_id == found_user.id),
                and_(models.Friendship.requester_id == found_user.id, models.Friendship.addressee_id == user.id)
            )
        ).first()
        
        status = "none"
        if friendship:
            if friendship.status == "accepted":
                status = "friends"
            elif friendship.status == "pending":
                if friendship.requester_id == user.id:
                    status = "request_sent"
                else:
                    status = "request_received"
        
        result.append({
            "id": found_user.id,
            "username": found_user.username,
            "total_xp": found_user.total_xp or 0,
            "friendship_status": status
        })
    
    return result