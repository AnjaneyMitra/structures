from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime
import logging

from ...db.models import CodeSnippet, User
from ..deps import get_db, get_current_user
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter()

# Simple Pydantic models - minimal approach
class SimpleSnippetCreate(BaseModel):
    title: str
    description: Optional[str] = None
    code: str
    language: str
    tags: Optional[str] = None
    is_public: bool = False

class SimpleSnippetResponse(BaseModel):
    id: int
    user_id: int
    username: str
    title: str
    description: Optional[str]
    code: str
    language: str
    tags: Optional[str]
    is_public: bool
    view_count: int
    like_count: int
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("/", response_model=SimpleSnippetResponse)
async def create_snippet(
    snippet_data: SimpleSnippetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a simple code snippet"""
    try:
        snippet = CodeSnippet(
            user_id=current_user.id,
            title=snippet_data.title,
            description=snippet_data.description,
            code=snippet_data.code,
            language=snippet_data.language,
            tags=snippet_data.tags,
            is_public=snippet_data.is_public
        )
        
        db.add(snippet)
        db.commit()
        db.refresh(snippet)
        
        return SimpleSnippetResponse(
            id=snippet.id,
            user_id=snippet.user_id,
            username=current_user.username,
            title=snippet.title,
            description=snippet.description,
            code=snippet.code,
            language=snippet.language,
            tags=snippet.tags,
            is_public=snippet.is_public,
            view_count=snippet.view_count,
            like_count=snippet.like_count,
            created_at=snippet.created_at
        )
        
    except Exception as e:
        logger.error(f"Error creating snippet: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create snippet")

@router.get("/", response_model=List[SimpleSnippetResponse])
async def get_snippets(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get public code snippets"""
    try:
        query = db.query(CodeSnippet).join(User).filter(CodeSnippet.is_public == True)
        snippets = query.order_by(desc(CodeSnippet.created_at)).offset(skip).limit(limit).all()
        
        result = []
        for snippet in snippets:
            result.append(SimpleSnippetResponse(
                id=snippet.id,
                user_id=snippet.user_id,
                username=snippet.user.username,
                title=snippet.title,
                description=snippet.description,
                code=snippet.code,
                language=snippet.language,
                tags=snippet.tags,
                is_public=snippet.is_public,
                view_count=snippet.view_count,
                like_count=snippet.like_count,
                created_at=snippet.created_at
            ))
        
        return result
        
    except Exception as e:
        logger.error(f"Error fetching snippets: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch snippets")

@router.get("/my", response_model=List[SimpleSnippetResponse])
async def get_my_snippets(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's snippets"""
    try:
        snippets = db.query(CodeSnippet).filter(
            CodeSnippet.user_id == current_user.id
        ).order_by(desc(CodeSnippet.created_at)).offset(skip).limit(limit).all()
        
        result = []
        for snippet in snippets:
            result.append(SimpleSnippetResponse(
                id=snippet.id,
                user_id=snippet.user_id,
                username=current_user.username,
                title=snippet.title,
                description=snippet.description,
                code=snippet.code,
                language=snippet.language,
                tags=snippet.tags,
                is_public=snippet.is_public,
                view_count=snippet.view_count,
                like_count=snippet.like_count,
                created_at=snippet.created_at
            ))
        
        return result
        
    except Exception as e:
        logger.error(f"Error fetching user snippets: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch user snippets")

@router.get("/{snippet_id}", response_model=SimpleSnippetResponse)
async def get_snippet(
    snippet_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get a specific snippet by ID"""
    try:
        snippet = db.query(CodeSnippet).join(User).filter(CodeSnippet.id == snippet_id).first()
        if not snippet:
            raise HTTPException(status_code=404, detail="Snippet not found")
        
        # Check if user can view this snippet
        if not snippet.is_public and (not current_user or snippet.user_id != current_user.id):
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Increment view count (only if not the owner)
        if not current_user or snippet.user_id != current_user.id:
            snippet.view_count += 1
            db.commit()
        
        return SimpleSnippetResponse(
            id=snippet.id,
            user_id=snippet.user_id,
            username=snippet.user.username,
            title=snippet.title,
            description=snippet.description,
            code=snippet.code,
            language=snippet.language,
            tags=snippet.tags,
            is_public=snippet.is_public,
            view_count=snippet.view_count,
            like_count=snippet.like_count,
            created_at=snippet.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching snippet: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch snippet")

@router.delete("/{snippet_id}")
async def delete_snippet(
    snippet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a snippet"""
    try:
        snippet = db.query(CodeSnippet).filter(CodeSnippet.id == snippet_id).first()
        if not snippet:
            raise HTTPException(status_code=404, detail="Snippet not found")
        
        if snippet.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        db.delete(snippet)
        db.commit()
        
        return {"message": "Snippet deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting snippet: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete snippet")