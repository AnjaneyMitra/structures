from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import logging

from ...db.models import Challenge, ChallengeResult, User, Problem, Submission, Friendship
from ..deps import get_db, get_current_user
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models
class ChallengeCreate(BaseModel):
    challenged_username: str
    problem_id: int
    message: Optional[str] = None
    time_limit: Optional[int] = None  # Minutes

class ChallengeResponse(BaseModel):
    id: int
    challenger_username: str
    challenged_username: str
    problem_id: int
    problem_title: str
    status: str
    message: Optional[str]
    time_limit: Optional[int]
    created_at: datetime
    accepted_at: Optional[datetime]
    expires_at: Optional[datetime]
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True

class ChallengeResultResponse(BaseModel):
    id: int
    challenge_id: int
    user_id: int
    username: str
    completion_time: Optional[int]
    status: str
    completed_at: datetime

    class Config:
        from_attributes = True

@router.post("/", response_model=ChallengeResponse)
async def create_challenge(
    challenge_data: ChallengeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new challenge"""
    try:
        # Find the challenged user
        challenged_user = db.query(User).filter(User.username == challenge_data.challenged_username).first()
        if not challenged_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if they are friends
        friendship = db.query(Friendship).filter(
            ((Friendship.requester_id == current_user.id) & (Friendship.addressee_id == challenged_user.id)) |
            ((Friendship.requester_id == challenged_user.id) & (Friendship.addressee_id == current_user.id))
        ).filter(Friendship.status == "accepted").first()
        
        if not friendship:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only challenge friends"
            )
        
        # Check if problem exists
        problem = db.query(Problem).filter(Problem.id == challenge_data.problem_id).first()
        if not problem:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Problem not found"
            )
        
        # Create expiration time if time limit is set
        expires_at = None
        if challenge_data.time_limit:
            expires_at = datetime.utcnow() + timedelta(hours=24)  # Challenge expires in 24 hours
        
        # Create challenge
        challenge = Challenge(
            challenger_id=current_user.id,
            challenged_id=challenged_user.id,
            problem_id=challenge_data.problem_id,
            message=challenge_data.message,
            time_limit=challenge_data.time_limit,
            expires_at=expires_at
        )
        
        db.add(challenge)
        db.commit()
        db.refresh(challenge)
        
        # Return challenge with additional info
        return ChallengeResponse(
            id=challenge.id,
            challenger_username=current_user.username,
            challenged_username=challenged_user.username,
            problem_id=challenge.problem_id,
            problem_title=problem.title,
            status=challenge.status,
            message=challenge.message,
            time_limit=challenge.time_limit,
            created_at=challenge.created_at,
            accepted_at=challenge.accepted_at,
            expires_at=challenge.expires_at,
            completed_at=challenge.completed_at
        )
        
    except Exception as e:
        logger.error(f"Error creating challenge: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create challenge"
        )

@router.get("/received", response_model=List[ChallengeResponse])
async def get_received_challenges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get challenges received by the current user"""
    try:
        challenges = db.query(Challenge).filter(
            Challenge.challenged_id == current_user.id
        ).order_by(Challenge.created_at.desc()).all()
        
        result = []
        for challenge in challenges:
            challenger = db.query(User).filter(User.id == challenge.challenger_id).first()
            problem = db.query(Problem).filter(Problem.id == challenge.problem_id).first()
            
            result.append(ChallengeResponse(
                id=challenge.id,
                challenger_username=challenger.username if challenger else "Unknown",
                challenged_username=current_user.username,
                problem_id=challenge.problem_id,
                problem_title=problem.title if problem else "Unknown Problem",
                status=challenge.status,
                message=challenge.message,
                time_limit=challenge.time_limit,
                created_at=challenge.created_at,
                accepted_at=challenge.accepted_at,
                expires_at=challenge.expires_at,
                completed_at=challenge.completed_at
            ))
        
        return result
        
    except Exception as e:
        logger.error(f"Error fetching received challenges: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch challenges"
        )

@router.get("/sent", response_model=List[ChallengeResponse])
async def get_sent_challenges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get challenges sent by the current user"""
    try:
        challenges = db.query(Challenge).filter(
            Challenge.challenger_id == current_user.id
        ).order_by(Challenge.created_at.desc()).all()
        
        result = []
        for challenge in challenges:
            challenged = db.query(User).filter(User.id == challenge.challenged_id).first()
            problem = db.query(Problem).filter(Problem.id == challenge.problem_id).first()
            
            result.append(ChallengeResponse(
                id=challenge.id,
                challenger_username=current_user.username,
                challenged_username=challenged.username if challenged else "Unknown",
                problem_id=challenge.problem_id,
                problem_title=problem.title if problem else "Unknown Problem",
                status=challenge.status,
                message=challenge.message,
                time_limit=challenge.time_limit,
                created_at=challenge.created_at,
                accepted_at=challenge.accepted_at,
                expires_at=challenge.expires_at,
                completed_at=challenge.completed_at
            ))
        
        return result
        
    except Exception as e:
        logger.error(f"Error fetching sent challenges: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch challenges"
        )

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
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Challenge not found"
            )
        
        if challenge.challenged_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only accept challenges sent to you"
            )
        
        if challenge.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Challenge is no longer pending"
            )
        
        # Check if challenge has expired
        if challenge.expires_at and challenge.expires_at < datetime.utcnow():
            challenge.status = "expired"
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Challenge has expired"
            )
        
        challenge.status = "accepted"
        challenge.accepted_at = datetime.utcnow()
        db.commit()
        
        return {"message": "Challenge accepted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error accepting challenge: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to accept challenge"
        )

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
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Challenge not found"
            )
        
        if challenge.challenged_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only decline challenges sent to you"
            )
        
        if challenge.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Challenge is no longer pending"
            )
        
        challenge.status = "declined"
        db.commit()
        
        return {"message": "Challenge declined"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error declining challenge: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to decline challenge"
        )

@router.get("/{challenge_id}", response_model=ChallengeResponse)
async def get_challenge(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get challenge details by ID"""
    try:
        challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
        if not challenge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Challenge not found"
            )
        
        # Check if user is involved in this challenge
        if challenge.challenger_id != current_user.id and challenge.challenged_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not involved in this challenge"
            )
        
        challenger = db.query(User).filter(User.id == challenge.challenger_id).first()
        challenged = db.query(User).filter(User.id == challenge.challenged_id).first()
        problem = db.query(Problem).filter(Problem.id == challenge.problem_id).first()
        
        return ChallengeResponse(
            id=challenge.id,
            challenger_username=challenger.username if challenger else "Unknown",
            challenged_username=challenged.username if challenged else "Unknown",
            problem_id=challenge.problem_id,
            problem_title=problem.title if problem else "Unknown Problem",
            status=challenge.status,
            message=challenge.message,
            time_limit=challenge.time_limit,
            created_at=challenge.created_at,
            accepted_at=challenge.accepted_at,
            expires_at=challenge.expires_at,
            completed_at=challenge.completed_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching challenge: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch challenge"
        )

@router.get("/{challenge_id}/status", response_model=ChallengeResponse)
async def get_challenge_status(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get challenge status and details"""
    try:
        challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
        if not challenge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Challenge not found"
            )
        
        # Check if user is involved in this challenge
        if challenge.challenger_id != current_user.id and challenge.challenged_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not involved in this challenge"
            )
        
        challenger = db.query(User).filter(User.id == challenge.challenger_id).first()
        challenged = db.query(User).filter(User.id == challenge.challenged_id).first()
        problem = db.query(Problem).filter(Problem.id == challenge.problem_id).first()
        
        return ChallengeResponse(
            id=challenge.id,
            challenger_username=challenger.username if challenger else "Unknown",
            challenged_username=challenged.username if challenged else "Unknown",
            problem_id=challenge.problem_id,
            problem_title=problem.title if problem else "Unknown Problem",
            status=challenge.status,
            message=challenge.message,
            time_limit=challenge.time_limit,
            created_at=challenge.created_at,
            accepted_at=challenge.accepted_at,
            expires_at=challenge.expires_at,
            completed_at=challenge.completed_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching challenge status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch challenge status"
        )

@router.post("/{challenge_id}/complete")
async def complete_challenge(
    challenge_id: int,
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Complete a challenge with a submission"""
    try:
        challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
        if not challenge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Challenge not found"
            )
        
        # Check if user is the challenged user
        if challenge.challenged_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the challenged user can complete the challenge"
            )
        
        if challenge.status != "accepted":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Challenge must be accepted first"
            )
        
        # Verify submission exists and belongs to user
        submission = db.query(Submission).filter(
            Submission.id == submission_id,
            Submission.user_id == current_user.id,
            Submission.problem_id == challenge.problem_id
        ).first()
        
        if not submission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Submission not found or doesn't match challenge"
            )
        
        # Calculate completion time (from challenge acceptance to submission)
        completion_time = None
        if submission.submission_time and challenge.created_at:
            completion_time = int((submission.submission_time - challenge.created_at).total_seconds())
        
        # Determine status based on submission result
        result_status = "completed" if submission.overall_status == "pass" else "failed"
        
        # Create challenge result
        challenge_result = ChallengeResult(
            challenge_id=challenge.id,
            user_id=current_user.id,
            submission_id=submission.id,
            completion_time=completion_time,
            status=result_status
        )
        
        db.add(challenge_result)
        
        # Update challenge status
        challenge.status = "completed"
        challenge.completed_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "message": "Challenge completed successfully",
            "status": result_status,
            "completion_time": completion_time
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error completing challenge: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to complete challenge"
        )

@router.get("/{challenge_id}/results", response_model=List[ChallengeResultResponse])
async def get_challenge_results(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get results for a challenge"""
    try:
        challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
        if not challenge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Challenge not found"
            )
        
        # Check if user is involved in this challenge
        if challenge.challenger_id != current_user.id and challenge.challenged_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not involved in this challenge"
            )
        
        results = db.query(ChallengeResult).filter(
            ChallengeResult.challenge_id == challenge_id
        ).all()
        
        response = []
        for result in results:
            user = db.query(User).filter(User.id == result.user_id).first()
            response.append(ChallengeResultResponse(
                id=result.id,
                challenge_id=result.challenge_id,
                user_id=result.user_id,
                username=user.username if user else "Unknown",
                completion_time=result.completion_time,
                status=result.status,
                completed_at=result.completed_at
            ))
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching challenge results: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch challenge results"
        )