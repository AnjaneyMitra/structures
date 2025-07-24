from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ...db import models
from ...schemas import BookmarkOut
from ...api import deps

router = APIRouter()

@router.post("/{problem_id}", status_code=status.HTTP_201_CREATED)
def add_bookmark(
    problem_id: int,
    db: Session = Depends(deps.get_db),
    user: models.User = Depends(deps.get_current_user)
):
    """Add a problem to user's bookmarks."""
    # Check if problem exists
    problem = db.query(models.Problem).filter(models.Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # Check if bookmark already exists
    existing_bookmark = db.query(models.Bookmark).filter(
        models.Bookmark.user_id == user.id,
        models.Bookmark.problem_id == problem_id
    ).first()
    
    if existing_bookmark:
        raise HTTPException(status_code=400, detail="Problem already bookmarked")
    
    # Create new bookmark
    bookmark = models.Bookmark(user_id=user.id, problem_id=problem_id)
    db.add(bookmark)
    db.commit()
    db.refresh(bookmark)
    
    return {"message": "Problem bookmarked successfully", "bookmark_id": bookmark.id}

@router.delete("/{problem_id}", status_code=status.HTTP_200_OK)
def remove_bookmark(
    problem_id: int,
    db: Session = Depends(deps.get_db),
    user: models.User = Depends(deps.get_current_user)
):
    """Remove a problem from user's bookmarks."""
    bookmark = db.query(models.Bookmark).filter(
        models.Bookmark.user_id == user.id,
        models.Bookmark.problem_id == problem_id
    ).first()
    
    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    
    db.delete(bookmark)
    db.commit()
    
    return {"message": "Bookmark removed successfully"}

@router.get("", response_model=List[BookmarkOut])
def get_user_bookmarks(
    db: Session = Depends(deps.get_db),
    user: models.User = Depends(deps.get_current_user)
):
    """Get all bookmarks for the current user."""
    bookmarks = db.query(models.Bookmark).filter(
        models.Bookmark.user_id == user.id
    ).order_by(models.Bookmark.created_at.desc()).all()
    
    return bookmarks

@router.get("/{problem_id}/status")
def get_bookmark_status(
    problem_id: int,
    db: Session = Depends(deps.get_db),
    user: models.User = Depends(deps.get_current_user)
):
    """Check if a problem is bookmarked by the current user."""
    bookmark = db.query(models.Bookmark).filter(
        models.Bookmark.user_id == user.id,
        models.Bookmark.problem_id == problem_id
    ).first()
    
    return {"bookmarked": bookmark is not None}