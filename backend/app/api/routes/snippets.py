from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, func, or_
from typing import List, Optional
from datetime import datetime
import logging

from ...db.models import CodeSnippet, SnippetLike, SnippetComment, SnippetUsage, User
from ..deps import get_db, get_current_user
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models
class SnippetCreate(BaseModel):
    title: str
    description: Optional[str] = None
    code: str
    language: str
    category: Optional[str] = None  # "template", "utility", "algorithm"
    tags: Optional[str] = None
    is_public: bool = False

class SnippetUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    code: Optional[str] = None
    language: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None
    is_public: Optional[bool] = None

class SnippetResponse(BaseModel):
    id: int
    user_id: int
    username: str
    title: str
    description: Optional[str]
    code: str
    language: str
    tags: Optional[str]
    is_public: bool
    is_featured: bool
    view_count: int
    like_count: int
    is_liked: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CommentCreate(BaseModel):
    content: str

class CommentResponse(BaseModel):
    id: int
    user_id: int
    username: str
    content: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

@router.post("/", response_model=SnippetResponse)
async def create_snippet(
    snippet_data: SnippetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new code snippet"""
    try:
        snippet = CodeSnippet(
            user_id=current_user.id,
            title=snippet_data.title,
            description=snippet_data.description,
            code=snippet_data.code,
            language=snippet_data.language,
            category=snippet_data.category,
            tags=snippet_data.tags,
            is_public=snippet_data.is_public
        )
        
        db.add(snippet)
        db.commit()
        db.refresh(snippet)
        
        return SnippetResponse(
            id=snippet.id,
            user_id=snippet.user_id,
            username=current_user.username,
            title=snippet.title,
            description=snippet.description,
            code=snippet.code,
            language=snippet.language,
            tags=snippet.tags,
            is_public=snippet.is_public,
            is_featured=snippet.is_featured,
            view_count=snippet.view_count,
            like_count=snippet.like_count,
            is_liked=False,
            created_at=snippet.created_at,
            updated_at=snippet.updated_at
        )
        
    except Exception as e:
        logger.error(f"Error creating snippet: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create snippet"
        )

@router.get("/", response_model=List[SnippetResponse])
async def get_snippets(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    language: Optional[str] = Query(None),
    tags: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("created_at", regex="^(created_at|updated_at|like_count|view_count|title)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    public_only: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get code snippets with filtering and sorting"""
    try:
        query = db.query(CodeSnippet).join(User)
        
        # Filter by public/private
        if public_only and current_user:
            query = query.filter(
                or_(
                    CodeSnippet.is_public == True,
                    CodeSnippet.user_id == current_user.id
                )
            )
        elif public_only:
            query = query.filter(CodeSnippet.is_public == True)
        elif current_user:
            query = query.filter(CodeSnippet.user_id == current_user.id)
        else:
            query = query.filter(CodeSnippet.is_public == True)
        
        # Filter by language
        if language:
            query = query.filter(CodeSnippet.language == language)
        
        # Filter by tags
        if tags:
            tag_list = [tag.strip() for tag in tags.split(',')]
            for tag in tag_list:
                query = query.filter(CodeSnippet.tags.contains(tag))
        
        # Search in title, description, and code
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    CodeSnippet.title.ilike(search_term),
                    CodeSnippet.description.ilike(search_term),
                    CodeSnippet.code.ilike(search_term)
                )
            )
        
        # Sorting
        sort_column = getattr(CodeSnippet, sort_by)
        if sort_order == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
        
        # Pagination
        snippets = query.offset(skip).limit(limit).all()
        
        # Build response with like status
        result = []
        for snippet in snippets:
            is_liked = False
            if current_user:
                like = db.query(SnippetLike).filter(
                    SnippetLike.user_id == current_user.id,
                    SnippetLike.snippet_id == snippet.id
                ).first()
                is_liked = like is not None
            
            result.append(SnippetResponse(
                id=snippet.id,
                user_id=snippet.user_id,
                username=snippet.user.username,
                title=snippet.title,
                description=snippet.description,
                code=snippet.code,
                language=snippet.language,
                tags=snippet.tags,
                is_public=snippet.is_public,
                is_featured=snippet.is_featured,
                view_count=snippet.view_count,
                like_count=snippet.like_count,
                is_liked=is_liked,
                created_at=snippet.created_at,
                updated_at=snippet.updated_at
            ))
        
        return result
        
    except Exception as e:
        logger.error(f"Error fetching snippets: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch snippets"
        )

@router.get("/my", response_model=List[SnippetResponse])
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
            result.append(SnippetResponse(
                id=snippet.id,
                user_id=snippet.user_id,
                username=current_user.username,
                title=snippet.title,
                description=snippet.description,
                code=snippet.code,
                language=snippet.language,
                tags=snippet.tags,
                is_public=snippet.is_public,
                is_featured=snippet.is_featured,
                view_count=snippet.view_count,
                like_count=snippet.like_count,
                is_liked=False,  # User can't like their own snippets
                created_at=snippet.created_at,
                updated_at=snippet.updated_at
            ))
        
        return result
        
    except Exception as e:
        logger.error(f"Error fetching user snippets: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user snippets"
        )

@router.get("/{snippet_id}", response_model=SnippetResponse)
async def get_snippet(
    snippet_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get a specific snippet by ID"""
    try:
        snippet = db.query(CodeSnippet).join(User).filter(CodeSnippet.id == snippet_id).first()
        if not snippet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Snippet not found"
            )
        
        # Check if user can view this snippet
        if not snippet.is_public and (not current_user or snippet.user_id != current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to view this snippet"
            )
        
        # Increment view count (only if not the owner)
        if not current_user or snippet.user_id != current_user.id:
            snippet.view_count += 1
            db.commit()
        
        # Check if user liked this snippet
        is_liked = False
        if current_user and snippet.user_id != current_user.id:
            like = db.query(SnippetLike).filter(
                SnippetLike.user_id == current_user.id,
                SnippetLike.snippet_id == snippet.id
            ).first()
            is_liked = like is not None
        
        return SnippetResponse(
            id=snippet.id,
            user_id=snippet.user_id,
            username=snippet.user.username,
            title=snippet.title,
            description=snippet.description,
            code=snippet.code,
            language=snippet.language,
            tags=snippet.tags,
            is_public=snippet.is_public,
            is_featured=snippet.is_featured,
            view_count=snippet.view_count,
            like_count=snippet.like_count,
            is_liked=is_liked,
            created_at=snippet.created_at,
            updated_at=snippet.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching snippet: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch snippet"
        )

@router.put("/{snippet_id}", response_model=SnippetResponse)
async def update_snippet(
    snippet_id: int,
    snippet_data: SnippetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a snippet"""
    try:
        snippet = db.query(CodeSnippet).filter(CodeSnippet.id == snippet_id).first()
        if not snippet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Snippet not found"
            )
        
        if snippet.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update your own snippets"
            )
        
        # Update fields
        update_data = snippet_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(snippet, field, value)
        
        snippet.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(snippet)
        
        return SnippetResponse(
            id=snippet.id,
            user_id=snippet.user_id,
            username=current_user.username,
            title=snippet.title,
            description=snippet.description,
            code=snippet.code,
            language=snippet.language,
            tags=snippet.tags,
            is_public=snippet.is_public,
            is_featured=snippet.is_featured,
            view_count=snippet.view_count,
            like_count=snippet.like_count,
            is_liked=False,
            created_at=snippet.created_at,
            updated_at=snippet.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating snippet: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update snippet"
        )

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
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Snippet not found"
            )
        
        if snippet.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete your own snippets"
            )
        
        db.delete(snippet)
        db.commit()
        
        return {"message": "Snippet deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting snippet: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete snippet"
        )

@router.post("/{snippet_id}/like")
async def toggle_like(
    snippet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle like on a snippet"""
    try:
        snippet = db.query(CodeSnippet).filter(CodeSnippet.id == snippet_id).first()
        if not snippet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Snippet not found"
            )
        
        if snippet.user_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot like your own snippet"
            )
        
        # Check if already liked
        existing_like = db.query(SnippetLike).filter(
            SnippetLike.user_id == current_user.id,
            SnippetLike.snippet_id == snippet_id
        ).first()
        
        if existing_like:
            # Unlike
            db.delete(existing_like)
            snippet.like_count = max(0, snippet.like_count - 1)
            action = "unliked"
        else:
            # Like
            like = SnippetLike(
                user_id=current_user.id,
                snippet_id=snippet_id
            )
            db.add(like)
            snippet.like_count += 1
            action = "liked"
        
        db.commit()
        
        return {
            "message": f"Snippet {action} successfully",
            "is_liked": action == "liked",
            "like_count": snippet.like_count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error toggling like: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to toggle like"
        )

@router.get("/{snippet_id}/comments", response_model=List[CommentResponse])
async def get_comments(
    snippet_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get comments for a snippet"""
    try:
        # Check if snippet exists and is public
        snippet = db.query(CodeSnippet).filter(CodeSnippet.id == snippet_id).first()
        if not snippet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Snippet not found"
            )
        
        if not snippet.is_public:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Comments are only available for public snippets"
            )
        
        comments = db.query(SnippetComment).join(User).filter(
            SnippetComment.snippet_id == snippet_id
        ).order_by(desc(SnippetComment.created_at)).offset(skip).limit(limit).all()
        
        result = []
        for comment in comments:
            result.append(CommentResponse(
                id=comment.id,
                user_id=comment.user_id,
                username=comment.user.username,
                content=comment.content,
                created_at=comment.created_at,
                updated_at=comment.updated_at
            ))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching comments: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch comments"
        )

@router.post("/{snippet_id}/comments", response_model=CommentResponse)
async def add_comment(
    snippet_id: int,
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a comment to a snippet"""
    try:
        # Check if snippet exists and is public
        snippet = db.query(CodeSnippet).filter(CodeSnippet.id == snippet_id).first()
        if not snippet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Snippet not found"
            )
        
        if not snippet.is_public:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Comments are only available for public snippets"
            )
        
        comment = SnippetComment(
            user_id=current_user.id,
            snippet_id=snippet_id,
            content=comment_data.content
        )
        
        db.add(comment)
        db.commit()
        db.refresh(comment)
        
        return CommentResponse(
            id=comment.id,
            user_id=comment.user_id,
            username=current_user.username,
            content=comment.content,
            created_at=comment.created_at,
            updated_at=comment.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding comment: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add comment"
        )

@router.get("/public", response_model=List[SnippetResponse])
async def get_public_snippets(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    language: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    tags: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("created_at", regex="^(created_at|updated_at|like_count|view_count|usage_count|title)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get public code snippets with filtering and sorting"""
    try:
        query = db.query(CodeSnippet).join(User).filter(CodeSnippet.is_public == True)
        
        # Filter by language
        if language:
            query = query.filter(CodeSnippet.language == language)
        
        # Filter by category
        if category:
            query = query.filter(CodeSnippet.category == category)
        
        # Filter by tags
        if tags:
            tag_list = [tag.strip() for tag in tags.split(',')]
            for tag in tag_list:
                query = query.filter(CodeSnippet.tags.contains(tag))
        
        # Search in title, description, and code
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    CodeSnippet.title.ilike(search_term),
                    CodeSnippet.description.ilike(search_term),
                    CodeSnippet.code.ilike(search_term)
                )
            )
        
        # Sorting
        sort_column = getattr(CodeSnippet, sort_by)
        if sort_order == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
        
        # Pagination
        snippets = query.offset(skip).limit(limit).all()
        
        # Build response with like status
        result = []
        for snippet in snippets:
            is_liked = False
            if current_user:
                like = db.query(SnippetLike).filter(
                    SnippetLike.user_id == current_user.id,
                    SnippetLike.snippet_id == snippet.id
                ).first()
                is_liked = like is not None
            
            result.append(SnippetResponse(
                id=snippet.id,
                user_id=snippet.user_id,
                username=snippet.user.username,
                title=snippet.title,
                description=snippet.description,
                code=snippet.code,
                language=snippet.language,
                tags=snippet.tags,
                is_public=snippet.is_public,
                is_featured=snippet.is_featured,
                view_count=snippet.view_count,
                like_count=snippet.like_count,
                is_liked=is_liked,
                created_at=snippet.created_at,
                updated_at=snippet.updated_at
            ))
        
        return result
        
    except Exception as e:
        logger.error(f"Error fetching public snippets: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch public snippets"
        )

@router.get("/templates", response_model=List[SnippetResponse])
async def get_code_templates(
    language: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get code templates (snippets with category 'template')"""
    try:
        query = db.query(CodeSnippet).join(User).filter(
            CodeSnippet.is_public == True,
            CodeSnippet.category == "template"
        )
        
        # Filter by language
        if language:
            query = query.filter(CodeSnippet.language == language)
        
        # Order by usage count and creation date
        query = query.order_by(desc(CodeSnippet.usage_count), desc(CodeSnippet.created_at))
        
        # Pagination
        snippets = query.offset(skip).limit(limit).all()
        
        # Build response
        result = []
        for snippet in snippets:
            is_liked = False
            if current_user:
                like = db.query(SnippetLike).filter(
                    SnippetLike.user_id == current_user.id,
                    SnippetLike.snippet_id == snippet.id
                ).first()
                is_liked = like is not None
            
            result.append(SnippetResponse(
                id=snippet.id,
                user_id=snippet.user_id,
                username=snippet.user.username,
                title=snippet.title,
                description=snippet.description,
                code=snippet.code,
                language=snippet.language,
                tags=snippet.tags,
                is_public=snippet.is_public,
                is_featured=snippet.is_featured,
                view_count=snippet.view_count,
                like_count=snippet.like_count,
                is_liked=is_liked,
                created_at=snippet.created_at,
                updated_at=snippet.updated_at
            ))
        
        return result
        
    except Exception as e:
        logger.error(f"Error fetching templates: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch templates"
        )

@router.post("/{snippet_id}/use")
async def track_snippet_usage(
    snippet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Track snippet usage"""
    try:
        snippet = db.query(CodeSnippet).filter(CodeSnippet.id == snippet_id).first()
        if not snippet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Snippet not found"
            )
        
        # Check if user can access this snippet
        if not snippet.is_public and snippet.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to use this snippet"
            )
        
        # Record usage
        usage = SnippetUsage(
            user_id=current_user.id,
            snippet_id=snippet_id
        )
        db.add(usage)
        
        # Increment usage count
        snippet.usage_count += 1
        
        db.commit()
        
        return {
            "message": "Snippet usage tracked successfully",
            "usage_count": snippet.usage_count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error tracking snippet usage: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to track snippet usage"
        )

@router.get("/search", response_model=List[SnippetResponse])
async def search_snippets(
    q: str = Query(..., min_length=1),
    language: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    public_only: bool = Query(True),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Search snippets by title, description, or code content"""
    try:
        query = db.query(CodeSnippet).join(User)
        
        # Filter by public/private
        if public_only and current_user:
            query = query.filter(
                or_(
                    CodeSnippet.is_public == True,
                    CodeSnippet.user_id == current_user.id
                )
            )
        elif public_only:
            query = query.filter(CodeSnippet.is_public == True)
        elif current_user:
            query = query.filter(CodeSnippet.user_id == current_user.id)
        else:
            query = query.filter(CodeSnippet.is_public == True)
        
        # Search in title, description, and code
        search_term = f"%{q}%"
        query = query.filter(
            or_(
                CodeSnippet.title.ilike(search_term),
                CodeSnippet.description.ilike(search_term),
                CodeSnippet.code.ilike(search_term)
            )
        )
        
        # Filter by language
        if language:
            query = query.filter(CodeSnippet.language == language)
        
        # Filter by category
        if category:
            query = query.filter(CodeSnippet.category == category)
        
        # Order by relevance (title matches first, then description, then code)
        query = query.order_by(
            desc(CodeSnippet.title.ilike(search_term)),
            desc(CodeSnippet.description.ilike(search_term)),
            desc(CodeSnippet.created_at)
        )
        
        # Pagination
        snippets = query.offset(skip).limit(limit).all()
        
        # Build response
        result = []
        for snippet in snippets:
            is_liked = False
            if current_user:
                like = db.query(SnippetLike).filter(
                    SnippetLike.user_id == current_user.id,
                    SnippetLike.snippet_id == snippet.id
                ).first()
                is_liked = like is not None
            
            result.append(SnippetResponse(
                id=snippet.id,
                user_id=snippet.user_id,
                username=snippet.user.username,
                title=snippet.title,
                description=snippet.description,
                code=snippet.code,
                language=snippet.language,
                tags=snippet.tags,
                is_public=snippet.is_public,
                is_featured=snippet.is_featured,
                view_count=snippet.view_count,
                like_count=snippet.like_count,
                is_liked=is_liked,
                created_at=snippet.created_at,
                updated_at=snippet.updated_at
            ))
        
        return result
        
    except Exception as e:
        logger.error(f"Error searching snippets: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search snippets"
        )

@router.get("/categories")
async def get_snippet_categories(db: Session = Depends(get_db)):
    """Get available snippet categories with counts"""
    try:
        categories = db.query(
            CodeSnippet.category,
            func.count(CodeSnippet.id).label('count')
        ).filter(
            CodeSnippet.is_public == True,
            CodeSnippet.category.isnot(None)
        ).group_by(
            CodeSnippet.category
        ).order_by(
            desc('count')
        ).all()
        
        # If no categories found, return default categories
        if not categories:
            return [
                {"category": "template", "count": 0},
                {"category": "utility", "count": 0},
                {"category": "algorithm", "count": 0}
            ]
        
        return [
            {"category": cat, "count": count}
            for cat, count in categories
        ]
        
    except Exception as e:
        logger.error(f"Error fetching categories: {str(e)}")
        # Return default categories on error
        return [
            {"category": "template", "count": 0},
            {"category": "utility", "count": 0},
            {"category": "algorithm", "count": 0}
        ]

@router.get("/languages/popular")
async def get_popular_languages(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get most popular programming languages"""
    try:
        languages = db.query(
            CodeSnippet.language,
            func.count(CodeSnippet.id).label('count')
        ).filter(
            CodeSnippet.is_public == True
        ).group_by(
            CodeSnippet.language
        ).order_by(
            desc('count')
        ).limit(limit).all()
        
        # If no languages found, return default languages
        if not languages:
            return [
                {"language": "python", "count": 0},
                {"language": "javascript", "count": 0},
                {"language": "java", "count": 0},
                {"language": "cpp", "count": 0},
                {"language": "typescript", "count": 0}
            ]
        
        return [
            {"language": lang, "count": count}
            for lang, count in languages
        ]
        
    except Exception as e:
        logger.error(f"Error fetching popular languages: {str(e)}")
        # Return default languages on error
        return [
            {"language": "python", "count": 0},
            {"language": "javascript", "count": 0},
            {"language": "java", "count": 0},
            {"language": "cpp", "count": 0},
            {"language": "typescript", "count": 0}
        ]