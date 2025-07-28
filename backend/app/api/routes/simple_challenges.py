from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime
import logging
import json
import os

from ...db.models import User, Problem
from ..deps import get_current_user
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter()

# In-memory storage for challenges (will persist to file)
CHALLENGES_FILE = "challenges_data.json"
challenges_storage = []
next_challenge_id = 1

def load_challenges():
    """Load challenges from file"""
    global challenges_storage, next_challenge_id
    try:
        if os.path.exists(CHALLENGES_FILE):
            with open(CHALLENGES_FILE, 'r') as f:
                data = json.load(f)
                challenges_storage = data.get('challenges', [])
                next_challenge_id = data.get('next_id', 1)
    except Exception as e:
        logger.error(f"Error loading challenges: {e}")
        challenges_storage = []
        next_challenge_id = 1

def save_challenges():
    """Save challenges to file"""
    try:
        with open(CHALLENGES_FILE, 'w') as f:
            json.dump({
                'challenges': challenges_storage,
                'next_id': next_challenge_id
            }, f, default=str)
    except Exception as e:
        logger.error(f"Error saving challenges: {e}")

# Load challenges on startup
load_challenges()

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
    current_user: User = Depends(get_current_user)
):
    """Create a simple challenge - minimal implementation"""
    global next_challenge_id
    try:
        # For now, we'll use a simple mock for challenged user validation
        # In a real app, you'd query the User table, but we're avoiding DB dependencies
        challenged_username = challenge_data.challenged_username
        
        # Mock problem title (in real app, you'd query Problem table)
        problem_title = f"Problem #{challenge_data.problem_id}"
        
        # Create challenge
        challenge = {
            'id': next_challenge_id,
            'challenger_id': current_user.id,
            'challenger_username': current_user.username,
            'challenged_username': challenged_username,
            'problem_id': challenge_data.problem_id,
            'problem_title': problem_title,
            'message': challenge_data.message,
            'status': "pending",
            'created_at': datetime.now()
        }
        
        challenges_storage.append(challenge)
        next_challenge_id += 1
        save_challenges()
        
        return SimpleChallengeResponse(**challenge)
        
    except Exception as e:
        logger.error(f"Error creating challenge: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create challenge")

@router.get("/received", response_model=List[SimpleChallengeResponse])
async def get_received_challenges(
    current_user: User = Depends(get_current_user)
):
    """Get challenges received by current user"""
    try:
        # Filter challenges where current user is the challenged one
        received_challenges = [c for c in challenges_storage if c['challenged_username'] == current_user.username]
        received_challenges.sort(key=lambda x: x['created_at'], reverse=True)
        
        return [SimpleChallengeResponse(**challenge) for challenge in received_challenges]
        
    except Exception as e:
        logger.error(f"Error fetching received challenges: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch challenges")

@router.get("/sent", response_model=List[SimpleChallengeResponse])
async def get_sent_challenges(
    current_user: User = Depends(get_current_user)
):
    """Get challenges sent by current user"""
    try:
        # Filter challenges where current user is the challenger
        sent_challenges = [c for c in challenges_storage if c['challenger_id'] == current_user.id]
        sent_challenges.sort(key=lambda x: x['created_at'], reverse=True)
        
        return [SimpleChallengeResponse(**challenge) for challenge in sent_challenges]
        
    except Exception as e:
        logger.error(f"Error fetching sent challenges: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch challenges")

@router.post("/{challenge_id}/accept")
async def accept_challenge(
    challenge_id: int,
    current_user: User = Depends(get_current_user)
):
    """Accept a challenge"""
    try:
        challenge = next((c for c in challenges_storage if c['id'] == challenge_id), None)
        if not challenge:
            raise HTTPException(status_code=404, detail="Challenge not found")
        
        if challenge['challenged_username'] != current_user.username:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        challenge['status'] = "accepted"
        save_challenges()
        
        return {"message": "Challenge accepted"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error accepting challenge: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to accept challenge")

@router.post("/{challenge_id}/decline")
async def decline_challenge(
    challenge_id: int,
    current_user: User = Depends(get_current_user)
):
    """Decline a challenge"""
    try:
        challenge = next((c for c in challenges_storage if c['id'] == challenge_id), None)
        if not challenge:
            raise HTTPException(status_code=404, detail="Challenge not found")
        
        if challenge['challenged_username'] != current_user.username:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        challenge['status'] = "declined"
        save_challenges()
        
        return {"message": "Challenge declined"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error declining challenge: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to decline challenge")