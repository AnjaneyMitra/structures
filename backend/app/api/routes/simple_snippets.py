from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
import logging
import json
import os

from ...db.models import User
from ..deps import get_current_user
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter()

# In-memory storage for snippets (will persist to file)
SNIPPETS_FILE = "snippets_data.json"
snippets_storage = []
next_snippet_id = 1

def load_snippets():
    """Load snippets from file"""
    global snippets_storage, next_snippet_id
    try:
        if os.path.exists(SNIPPETS_FILE):
            with open(SNIPPETS_FILE, 'r') as f:
                data = json.load(f)
                snippets_storage = data.get('snippets', [])
                next_snippet_id = data.get('next_id', 1)
    except Exception as e:
        logger.error(f"Error loading snippets: {e}")
        snippets_storage = []
        next_snippet_id = 1

def save_snippets():
    """Save snippets to file"""
    try:
        with open(SNIPPETS_FILE, 'w') as f:
            json.dump({
                'snippets': snippets_storage,
                'next_id': next_snippet_id
            }, f, default=str)
    except Exception as e:
        logger.error(f"Error saving snippets: {e}")

# Load snippets on startup
load_snippets()

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
    current_user: User = Depends(get_current_user)
):
    """Create a simple code snippet"""
    global next_snippet_id
    try:
        snippet = {
            'id': next_snippet_id,
            'user_id': current_user.id,
            'username': current_user.username,
            'title': snippet_data.title,
            'description': snippet_data.description,
            'code': snippet_data.code,
            'language': snippet_data.language,
            'tags': snippet_data.tags,
            'is_public': snippet_data.is_public,
            'view_count': 0,
            'like_count': 0,
            'created_at': datetime.now()
        }
        
        snippets_storage.append(snippet)
        next_snippet_id += 1
        save_snippets()
        
        return SimpleSnippetResponse(**snippet)
        
    except Exception as e:
        logger.error(f"Error creating snippet: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create snippet")

@router.get("/", response_model=List[SimpleSnippetResponse])
async def get_snippets(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get public code snippets"""
    try:
        # Filter public snippets and sort by created_at
        public_snippets = [s for s in snippets_storage if s['is_public']]
        public_snippets.sort(key=lambda x: x['created_at'], reverse=True)
        
        # Apply pagination
        paginated = public_snippets[skip:skip + limit]
        
        return [SimpleSnippetResponse(**snippet) for snippet in paginated]
        
    except Exception as e:
        logger.error(f"Error fetching snippets: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch snippets")

@router.get("/my", response_model=List[SimpleSnippetResponse])
async def get_my_snippets(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user)
):
    """Get current user's snippets"""
    try:
        # Filter user's snippets and sort by created_at
        user_snippets = [s for s in snippets_storage if s['user_id'] == current_user.id]
        user_snippets.sort(key=lambda x: x['created_at'], reverse=True)
        
        # Apply pagination
        paginated = user_snippets[skip:skip + limit]
        
        return [SimpleSnippetResponse(**snippet) for snippet in paginated]
        
    except Exception as e:
        logger.error(f"Error fetching user snippets: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch user snippets")

@router.get("/{snippet_id}", response_model=SimpleSnippetResponse)
async def get_snippet(
    snippet_id: int,
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get a specific snippet by ID"""
    try:
        snippet = next((s for s in snippets_storage if s['id'] == snippet_id), None)
        if not snippet:
            raise HTTPException(status_code=404, detail="Snippet not found")
        
        # Check if user can view this snippet
        if not snippet['is_public'] and (not current_user or snippet['user_id'] != current_user.id):
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Increment view count (only if not the owner)
        if not current_user or snippet['user_id'] != current_user.id:
            snippet['view_count'] += 1
            save_snippets()
        
        return SimpleSnippetResponse(**snippet)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching snippet: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch snippet")

@router.delete("/{snippet_id}")
async def delete_snippet(
    snippet_id: int,
    current_user: User = Depends(get_current_user)
):
    """Delete a snippet"""
    try:
        snippet_index = next((i for i, s in enumerate(snippets_storage) if s['id'] == snippet_id), None)
        if snippet_index is None:
            raise HTTPException(status_code=404, detail="Snippet not found")
        
        snippet = snippets_storage[snippet_index]
        if snippet['user_id'] != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        snippets_storage.pop(snippet_index)
        save_snippets()
        
        return {"message": "Snippet deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting snippet: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete snippet")