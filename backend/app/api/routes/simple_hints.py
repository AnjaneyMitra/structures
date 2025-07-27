from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import logging

from app.core.auth import get_db, get_current_user
from app.db.models import User, Problem
from app.schemas import ContextualHintRequest
from app.utils.gemini_service import gemini_hint_generator

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/health")
def hints_health_check():
    """Health check endpoint for hints system."""
    import os
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        has_api_key = bool(api_key)
        
        return {
            "status": "healthy",
            "gemini_api_configured": has_api_key,
            "message": "Simple hints system is operational"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "message": "Hints system has issues"
        }

@router.post("/problems/{problem_id}/hint")
def get_contextual_hint(
    problem_id: int,
    request: ContextualHintRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a contextual hint based on the user's current code."""
    
    # Check if problem exists
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # Validate request
    if not request.user_code or not request.user_code.strip():
        raise HTTPException(status_code=400, detail="No code provided for hint generation")
    
    try:
        # Add context to encourage varied responses
        import time
        import random
        
        current_time = time.strftime("%H:%M:%S")
        hint_strategies = [
            "Focus on identifying the core algorithmic approach needed",
            "Look for potential bugs or logical errors in the current implementation", 
            "Consider edge cases and input validation",
            "Think about code efficiency and optimization opportunities",
            "Examine the data structures being used and if they're optimal",
            "Check if the solution handles all requirements from the problem description"
        ]
        
        strategy = random.choice(hint_strategies)
        
        # Generate contextual hint using Gemini
        hint_content = gemini_hint_generator.generate_contextual_hint(
            problem.title,
            problem.description,
            request.user_code,
            request.language,
            problem.reference_solution,
            additional_context=f"Request time: {current_time}. Hint strategy: {strategy}. Provide a unique perspective based on this strategy."
        )
        
        # Apply XP penalty for using hint
        xp_penalty = 3  # Small penalty for getting help
        old_xp = current_user.total_xp
        new_xp = max(0, old_xp - xp_penalty)
        current_user.total_xp = new_xp
        
        db.commit()
        db.refresh(current_user)
        
        return {
            "hint": hint_content,
            "xp_penalty_applied": xp_penalty,
            "old_xp": old_xp,
            "new_xp": current_user.total_xp,
            "message": "Hint generated successfully"
        }
        
    except Exception as e:
        logger.error(f"Failed to generate contextual hint for problem {problem_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate hint. Please try again later."
        )

@router.get("/problems/{problem_id}/hint/cost")
def get_hint_cost(problem_id: int):
    """Get the XP cost for requesting a hint."""
    return {
        "xp_cost": 3,
        "message": "Each hint costs 3 XP"
    }