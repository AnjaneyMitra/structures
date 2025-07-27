from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import logging

from ...db.models import Challenge, User, Problem, Friendship
from ..deps import get_db, get_current_user
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter()

# Simple Pydantic models - minimal approach
class SimpleChallengeCreate(BaseModel):
    challenged_username: str
    problem_id: int
    message: Optional[str] = None

class SimpleChallengeResponse(BaseModel):
    id: int
    challenger_username: str
    challenged_username: str
    problem_id: int
    problem_title: str
    status: str
    message: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("/", response_model=SimpleChallengeResponse)
async def create_challenge(
    challenge_data: SimpleChallengeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a simple challenge - minimal implementation"""
    try:
        # Find the challenged user
        challenged_user = db.query(User).filter(User.username == challenge_data.challenged_username).first()
        if not challenged_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get problem
        problem = db.query(Problem).filter(Problem.id == challenge_data.problem_id).first()
        if not problem:
            raise HTTPException(status_code=404, detail="Problem not found")
        
        # Create challenge
        challenge = Challenge(
            challenger_id=current_user.id,
            challenged_id=challenged_user.id,
            problem_id=challenge_data.problem_id,
            message=challenge_data.message,
            status="pending"
        )
        
        db.add(challenge)
        db.commit()
        db.refresh(challenge)
        
        return SimpleChallengeResponse(
            id=challenge.id,
            challenger_username=current_user.username,
            challenged_username=challenged_user.username,
            problem_id=challenge.problem_id,
            problem_title=problem.title,
            status=challenge.status,
            message=challenge.message,
            created_at=challenge.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating challenge: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create challenge")

@router.get("/received", response_model=List[SimpleChallengeResponse])
async def get_received_challenges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get challenges received by current user"""
    try:
        challenges = db.query(Challenge).join(
            User, Challenge.challenger_id == User.id
        ).join(
            Problem, Challenge.problem_id == Problem.id
        ).filter(
            Challenge.challenged_id == current_user.id
        ).all()
        
        result = []
        for challenge in challenges:
            challenger = db.query(User).filter(User.id == challenge.challenger_id).first()
            problem = db.query(Problem).filter(Problem.id == challenge.problem_id).first()
            
            result.append(SimpleChallengeResponse(
                id=challenge.id,
                challenger_username=challenger.username,
                challenged_username=current_user.username,
                problem_id=challenge.problem_id,
                problem_title=problem.title,
                status=challenge.status,
                message=challenge.message,
                created_at=challenge.created_at
            ))
        
        return result
        
    except Exception as e:
        logger.error(f"Error fetching received challenges: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch challenges")

@router.get("/sent", response_model=List[SimpleChallengeResponse])
async def get_sent_challenges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get challenges sent by current user"""
    try:
        challenges = db.query(Challenge).join(
            User, Challenge.challenged_id == User.id
        ).join(
            Problem, Challenge.problem_id == Problem.id
        ).filter(
            Challenge.challenger_id == current_user.id
        ).all()
        
        result = []
        for challenge in challenges:
            challenged = db.query(User).filter(User.id == challenge.challenged_id).first()
            problem = db.query(Problem).filter(Problem.id == challenge.problem_id).first()
            
            result.append(SimpleChallengeResponse(
                id=challenge.id,
                challenger_username=current_user.username,
                challenged_username=challenged.username,
                problem_id=challenge.problem_id,
                problem_title=problem.title,
                status=challenge.status,
                message=challenge.message,
                created_at=challenge.created_at
            ))
        
        return result
        
    except Exception as e:
        logger.error(f"Error fetching sent challenges: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch challenges")

@router.post("/{challenge_id}/accept")
async def accept_challenge(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Accept a challenge"""
    try:
        challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
        if not challenge:
            raise HTTPException(status_code=404, detail="Challenge not found")
        
        if challenge.challenged_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        challenge.status = "accepted"
        db.commit()
        
        return {"message": "Challenge accepted"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error accepting challenge: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to accept challenge")

@router.post("/{challenge_id}/decline")
async def decline_challenge(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Decline a challenge"""
    try:
        challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
        if not challenge:
            raise HTTPException(status_code=404, detail="Challenge not found")
        
        if challenge.challenged_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        challenge.status = "declined"
        db.commit()
        
        return {"message": "Challenge declined"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error declining challenge: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to decline challenge")