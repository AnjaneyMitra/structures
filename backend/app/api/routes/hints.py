from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging

from app.core.auth import get_db
from app.db.models import User, Problem, Hint, UserHint
from app.schemas import HintOut, HintRevealRequest, HintRevealResponse, HintsAvailableResponse, ContextualHintRequest
from app.api import deps
from app.utils.gemini_service import gemini_hint_generator

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/problems/{problem_id}/hints/available", response_model=HintsAvailableResponse)
def get_hints_available(
    problem_id: int,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(get_db)
):
    """Get information about available hints for a problem."""
    
    # Check if problem exists
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # Get or generate hints for this problem
    hints = db.query(Hint).filter(Hint.problem_id == problem_id).order_by(Hint.order).all()
    
    if not hints:
        # Generate hints using Gemini if they don't exist
        try:
            generated_hints = gemini_hint_generator.generate_hints(
                problem.title, 
                problem.description, 
                problem.reference_solution
            )
            
            # Save generated hints to database
            for i, hint_content in enumerate(generated_hints, 1):
                hint = Hint(
                    problem_id=problem_id,
                    content=hint_content,
                    order=i,
                    xp_penalty=5,  # Default penalty
                    generated_by_ai=True
                )
                db.add(hint)
            
            db.commit()
            
            # Refresh hints from database
            hints = db.query(Hint).filter(Hint.problem_id == problem_id).order_by(Hint.order).all()
            
        except Exception as e:
            logger.error(f"Failed to generate hints for problem {problem_id}: {str(e)}")
            raise HTTPException(
                status_code=500, 
                detail="Failed to generate hints. Please try again later."
            )
    
    # Get user's revealed hints
    revealed_hints = db.query(UserHint).filter(
        UserHint.user_id == current_user.id,
        UserHint.hint_id.in_([h.id for h in hints])
    ).all()
    
    revealed_hint_ids = {uh.hint_id for uh in revealed_hints}
    revealed_count = len(revealed_hint_ids)
    total_hints = len(hints)
    
    # Find next hint order
    next_hint_order = None
    for hint in hints:
        if hint.id not in revealed_hint_ids:
            next_hint_order = hint.order
            break
    
    return HintsAvailableResponse(
        total_hints=total_hints,
        revealed_hints=revealed_count,
        next_hint_order=next_hint_order,
        hints_exhausted=revealed_count >= total_hints
    )

@router.post("/problems/{problem_id}/hints/reveal", response_model=HintRevealResponse)
def reveal_hint(
    problem_id: int,
    request: HintRevealRequest,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(get_db)
):
    """Reveal a specific hint for a problem and apply XP penalty."""
    
    # Check if problem exists
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # Get the specific hint
    hint = db.query(Hint).filter(
        Hint.problem_id == problem_id,
        Hint.order == request.hint_order
    ).first()
    
    if not hint:
        raise HTTPException(status_code=404, detail="Hint not found")
    
    # Check if user has already revealed this hint
    existing_user_hint = db.query(UserHint).filter(
        UserHint.user_id == current_user.id,
        UserHint.hint_id == hint.id
    ).first()
    
    if existing_user_hint:
        # Hint already revealed, return it without penalty
        return HintRevealResponse(
            hint=HintOut.from_orm(hint),
            xp_penalty_applied=0,
            remaining_xp=current_user.total_xp
        )
    
    # Check if user is revealing hints in order
    previous_hints = db.query(Hint).filter(
        Hint.problem_id == problem_id,
        Hint.order < request.hint_order
    ).all()
    
    if previous_hints:
        # Check if all previous hints have been revealed
        revealed_previous = db.query(UserHint).filter(
            UserHint.user_id == current_user.id,
            UserHint.hint_id.in_([h.id for h in previous_hints])
        ).count()
        
        if revealed_previous < len(previous_hints):
            raise HTTPException(
                status_code=400, 
                detail=f"You must reveal hint {request.hint_order - 1} first"
            )
    
    # Apply XP penalty
    xp_penalty = hint.xp_penalty
    new_xp = max(0, current_user.total_xp - xp_penalty)  # Don't go below 0
    current_user.total_xp = new_xp
    
    # Record that user revealed this hint
    user_hint = UserHint(
        user_id=current_user.id,
        hint_id=hint.id
    )
    db.add(user_hint)
    
    db.commit()
    db.refresh(current_user)
    
    return HintRevealResponse(
        hint=HintOut.from_orm(hint),
        xp_penalty_applied=xp_penalty,
        remaining_xp=current_user.total_xp
    )

@router.get("/problems/{problem_id}/hints/revealed", response_model=List[HintOut])
def get_revealed_hints(
    problem_id: int,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(get_db)
):
    """Get all hints that the user has already revealed for a problem."""
    
    # Check if problem exists
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # Get user's revealed hints for this problem
    revealed_hints = db.query(Hint).join(UserHint).filter(
        UserHint.user_id == current_user.id,
        Hint.problem_id == problem_id
    ).order_by(Hint.order).all()
    
    return [HintOut.from_orm(hint) for hint in revealed_hints]

@router.post("/problems/{problem_id}/hints/contextual", response_model=HintRevealResponse)
def get_contextual_hint(
    problem_id: int,
    request: ContextualHintRequest,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(get_db)
):
    """Get a contextual hint based on the user's current code."""
    
    # Check if problem exists
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    try:
        # Generate contextual hint using Gemini
        hint_content = gemini_hint_generator.generate_contextual_hint(
            problem.title,
            problem.description,
            request.user_code,
            request.language,
            problem.reference_solution
        )
        
        # Apply XP penalty for contextual hint
        xp_penalty = 3  # Lower penalty for contextual hints since they're more helpful
        new_xp = max(0, current_user.total_xp - xp_penalty)
        current_user.total_xp = new_xp
        
        # Create a contextual hint record (not stored as a regular hint)
        contextual_hint = Hint(
            problem_id=problem_id,
            content=hint_content,
            order=0,  # Contextual hints don't have an order
            xp_penalty=xp_penalty,
            generated_by_ai=True,
            is_contextual=True,
            user_code=request.user_code,
            language=request.language
        )
        
        # Save the contextual hint for tracking
        db.add(contextual_hint)
        
        # Record that user used this contextual hint
        user_hint = UserHint(
            user_id=current_user.id,
            hint_id=contextual_hint.id
        )
        db.add(user_hint)
        
        db.commit()
        db.refresh(contextual_hint)
        db.refresh(current_user)
        
        return HintRevealResponse(
            hint=HintOut.from_orm(contextual_hint),
            xp_penalty_applied=xp_penalty,
            remaining_xp=current_user.total_xp
        )
        
    except Exception as e:
        logger.error(f"Failed to generate contextual hint for problem {problem_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate contextual hint. Please try again later."
        )

# Admin endpoints for hint management
@router.post("/hints", response_model=HintOut)
def create_hint(
    problem_id: int,
    content: str,
    order: int,
    xp_penalty: int = 5,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(get_db)
):
    """Create a custom hint (admin only)."""
    
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check if problem exists
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # Check if hint with this order already exists
    existing_hint = db.query(Hint).filter(
        Hint.problem_id == problem_id,
        Hint.order == order
    ).first()
    
    if existing_hint:
        raise HTTPException(
            status_code=400, 
            detail=f"Hint with order {order} already exists for this problem"
        )
    
    hint = Hint(
        problem_id=problem_id,
        content=content,
        order=order,
        xp_penalty=xp_penalty,
        generated_by_ai=False
    )
    
    db.add(hint)
    db.commit()
    db.refresh(hint)
    
    return HintOut.from_orm(hint)

@router.put("/hints/{hint_id}", response_model=HintOut)
def update_hint(
    hint_id: int,
    content: str,
    xp_penalty: int,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(get_db)
):
    """Update a hint (admin only)."""
    
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    hint = db.query(Hint).filter(Hint.id == hint_id).first()
    if not hint:
        raise HTTPException(status_code=404, detail="Hint not found")
    
    hint.content = content
    hint.xp_penalty = xp_penalty
    
    db.commit()
    db.refresh(hint)
    
    return HintOut.from_orm(hint)

@router.delete("/hints/{hint_id}")
def delete_hint(
    hint_id: int,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a hint (admin only)."""
    
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    hint = db.query(Hint).filter(Hint.id == hint_id).first()
    if not hint:
        raise HTTPException(status_code=404, detail="Hint not found")
    
    # Delete associated user hints first
    db.query(UserHint).filter(UserHint.hint_id == hint_id).delete()
    
    # Delete the hint
    db.delete(hint)
    db.commit()
    
    return {"message": "Hint deleted successfully"}

@router.post("/problems/{problem_id}/hints/regenerate")
def regenerate_hints(
    problem_id: int,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(get_db)
):
    """Regenerate AI hints for a problem (admin only)."""
    
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check if problem exists
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # Delete existing AI-generated hints
    existing_hints = db.query(Hint).filter(
        Hint.problem_id == problem_id,
        Hint.generated_by_ai == True
    ).all()
    
    for hint in existing_hints:
        # Delete associated user hints
        db.query(UserHint).filter(UserHint.hint_id == hint.id).delete()
        db.delete(hint)
    
    db.commit()
    
    # Generate new hints
    try:
        generated_hints = gemini_hint_generator.generate_hints(
            problem.title, 
            problem.description, 
            problem.reference_solution
        )
        
        # Save new hints
        for i, hint_content in enumerate(generated_hints, 1):
            hint = Hint(
                problem_id=problem_id,
                content=hint_content,
                order=i,
                xp_penalty=5,
                generated_by_ai=True
            )
            db.add(hint)
        
        db.commit()
        
        return {"message": f"Successfully regenerated {len(generated_hints)} hints"}
        
    except Exception as e:
        logger.error(f"Failed to regenerate hints for problem {problem_id}: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Failed to regenerate hints. Please try again later."
        )