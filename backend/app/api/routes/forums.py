from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, func
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from ...db.base import get_db
from ...db.models import ForumCategory, ForumThread, ForumReply, ForumVote, User, Problem
from ..deps import get_current_user

router = APIRouter()

# Pydantic models for request/response
class ForumCategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    order: int
    thread_count: int
    latest_thread: Optional[dict]
    created_at: datetime

    class Config:
        from_attributes = True

class ForumThreadCreate(BaseModel):
    category_id: int
    problem_id: Optional[int] = None
    title: str
    content: str

class ForumThreadResponse(BaseModel):
    id: int
    category_id: int
    problem_id: Optional[int]
    author_id: int
    title: str
    content: str
    is_pinned: bool
    is_locked: bool
    view_count: int
    reply_count: int
    created_at: datetime
    updated_at: datetime
    author: dict
    category: dict
    problem: Optional[dict]

    class Config:
        from_attributes = True

class ForumReplyCreate(BaseModel):
    content: str
    parent_id: Optional[int] = None

class ForumReplyResponse(BaseModel):
    id: int
    thread_id: int
    author_id: int
    content: str
    parent_id: Optional[int]
    is_solution: bool
    upvotes: int
    downvotes: int
    created_at: datetime
    updated_at: datetime
    author: dict
    user_vote: Optional[str]  # "up", "down", or None

    class Config:
        from_attributes = True

class VoteRequest(BaseModel):
    vote_type: str  # "up" or "down"

@router.get("/categories", response_model=List[ForumCategoryResponse])
def get_forum_categories(db: Session = Depends(get_db)):
    """Get all forum categories with thread counts and latest threads."""
    categories = db.query(ForumCategory).order_by(ForumCategory.order, ForumCategory.name).all()
    
    result = []
    for category in categories:
        # Get thread count
        thread_count = db.query(ForumThread).filter(ForumThread.category_id == category.id).count()
        
        # Get latest thread
        latest_thread = db.query(ForumThread)\
            .filter(ForumThread.category_id == category.id)\
            .order_by(desc(ForumThread.updated_at))\
            .first()
        
        latest_thread_data = None
        if latest_thread:
            latest_thread_data = {
                "id": latest_thread.id,
                "title": latest_thread.title,
                "author": latest_thread.author.username,
                "updated_at": latest_thread.updated_at
            }
        
        result.append(ForumCategoryResponse(
            id=category.id,
            name=category.name,
            description=category.description,
            order=category.order,
            thread_count=thread_count,
            latest_thread=latest_thread_data,
            created_at=category.created_at
        ))
    
    return result

@router.get("/categories/{category_id}/threads")
def get_category_threads(
    category_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort: str = Query("updated", regex="^(created|updated|replies|views)$"),
    order: str = Query("desc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db)
):
    """Get threads in a category with pagination and sorting."""
    # Verify category exists
    category = db.query(ForumCategory).filter(ForumCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Build query
    query = db.query(ForumThread).filter(ForumThread.category_id == category_id)
    
    # Apply sorting
    sort_column = {
        "created": ForumThread.created_at,
        "updated": ForumThread.updated_at,
        "replies": ForumThread.reply_count,
        "views": ForumThread.view_count
    }[sort]
    
    if order == "desc":
        query = query.order_by(desc(ForumThread.is_pinned), desc(sort_column))
    else:
        query = query.order_by(desc(ForumThread.is_pinned), asc(sort_column))
    
    # Apply pagination
    offset = (page - 1) * limit
    threads = query.offset(offset).limit(limit).all()
    total = query.count()
    
    # Format response
    thread_list = []
    for thread in threads:
        thread_data = {
            "id": thread.id,
            "category_id": thread.category_id,
            "problem_id": thread.problem_id,
            "author_id": thread.author_id,
            "title": thread.title,
            "content": thread.content[:200] + "..." if len(thread.content) > 200 else thread.content,
            "is_pinned": thread.is_pinned,
            "is_locked": thread.is_locked,
            "view_count": thread.view_count,
            "reply_count": thread.reply_count,
            "created_at": thread.created_at,
            "updated_at": thread.updated_at,
            "author": {
                "id": thread.author.id,
                "username": thread.author.username
            },
            "category": {
                "id": thread.category.id,
                "name": thread.category.name
            },
            "problem": {
                "id": thread.problem.id,
                "title": thread.problem.title
            } if thread.problem else None
        }
        thread_list.append(thread_data)
    
    return {
        "threads": thread_list,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit
        },
        "category": {
            "id": category.id,
            "name": category.name,
            "description": category.description
        }
    }

@router.get("/threads/{thread_id}")
def get_thread(
    thread_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get thread with replies and pagination."""
    # Get thread and increment view count
    thread = db.query(ForumThread).filter(ForumThread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    # Increment view count
    thread.view_count += 1
    db.commit()
    
    # Get replies with pagination
    offset = (page - 1) * limit
    replies_query = db.query(ForumReply)\
        .filter(ForumReply.thread_id == thread_id)\
        .order_by(ForumReply.created_at)
    
    replies = replies_query.offset(offset).limit(limit).all()
    total_replies = replies_query.count()
    
    # Get user votes for replies
    reply_ids = [reply.id for reply in replies]
    user_votes = {}
    if reply_ids:
        votes = db.query(ForumVote)\
            .filter(ForumVote.user_id == current_user.id, ForumVote.reply_id.in_(reply_ids))\
            .all()
        user_votes = {vote.reply_id: vote.vote_type for vote in votes}
    
    # Format replies
    reply_list = []
    for reply in replies:
        reply_data = {
            "id": reply.id,
            "thread_id": reply.thread_id,
            "author_id": reply.author_id,
            "content": reply.content,
            "parent_id": reply.parent_id,
            "is_solution": reply.is_solution,
            "upvotes": reply.upvotes,
            "downvotes": reply.downvotes,
            "created_at": reply.created_at,
            "updated_at": reply.updated_at,
            "author": {
                "id": reply.author.id,
                "username": reply.author.username
            },
            "user_vote": user_votes.get(reply.id)
        }
        reply_list.append(reply_data)
    
    # Format thread
    thread_data = {
        "id": thread.id,
        "category_id": thread.category_id,
        "problem_id": thread.problem_id,
        "author_id": thread.author_id,
        "title": thread.title,
        "content": thread.content,
        "is_pinned": thread.is_pinned,
        "is_locked": thread.is_locked,
        "view_count": thread.view_count,
        "reply_count": thread.reply_count,
        "created_at": thread.created_at,
        "updated_at": thread.updated_at,
        "author": {
            "id": thread.author.id,
            "username": thread.author.username
        },
        "category": {
            "id": thread.category.id,
            "name": thread.category.name
        },
        "problem": {
            "id": thread.problem.id,
            "title": thread.problem.title
        } if thread.problem else None
    }
    
    return {
        "thread": thread_data,
        "replies": reply_list,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total_replies,
            "pages": (total_replies + limit - 1) // limit
        }
    }

@router.post("/threads")
def create_thread(
    thread_data: ForumThreadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new forum thread."""
    # Verify category exists
    category = db.query(ForumCategory).filter(ForumCategory.id == thread_data.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Verify problem exists if provided
    if thread_data.problem_id:
        problem = db.query(Problem).filter(Problem.id == thread_data.problem_id).first()
        if not problem:
            raise HTTPException(status_code=404, detail="Problem not found")
    
    # Create thread
    thread = ForumThread(
        category_id=thread_data.category_id,
        problem_id=thread_data.problem_id,
        author_id=current_user.id,
        title=thread_data.title,
        content=thread_data.content
    )
    
    db.add(thread)
    db.commit()
    db.refresh(thread)
    
    return {
        "id": thread.id,
        "message": "Thread created successfully"
    }

@router.post("/threads/{thread_id}/replies")
def create_reply(
    thread_id: int,
    reply_data: ForumReplyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reply to a thread."""
    # Verify thread exists and is not locked
    thread = db.query(ForumThread).filter(ForumThread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    if thread.is_locked:
        raise HTTPException(status_code=403, detail="Thread is locked")
    
    # Verify parent reply exists if provided
    if reply_data.parent_id:
        parent = db.query(ForumReply).filter(
            ForumReply.id == reply_data.parent_id,
            ForumReply.thread_id == thread_id
        ).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent reply not found")
    
    # Create reply
    reply = ForumReply(
        thread_id=thread_id,
        author_id=current_user.id,
        content=reply_data.content,
        parent_id=reply_data.parent_id
    )
    
    db.add(reply)
    
    # Update thread reply count and updated_at
    thread.reply_count += 1
    thread.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(reply)
    
    return {
        "id": reply.id,
        "message": "Reply created successfully"
    }

@router.post("/replies/{reply_id}/vote")
def vote_reply(
    reply_id: int,
    vote_data: VoteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Vote on a reply (upvote or downvote)."""
    # Verify reply exists
    reply = db.query(ForumReply).filter(ForumReply.id == reply_id).first()
    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found")
    
    # Check if user already voted
    existing_vote = db.query(ForumVote).filter(
        ForumVote.user_id == current_user.id,
        ForumVote.reply_id == reply_id
    ).first()
    
    if existing_vote:
        if existing_vote.vote_type == vote_data.vote_type:
            # Remove vote if same type
            db.delete(existing_vote)
            if vote_data.vote_type == "up":
                reply.upvotes -= 1
            else:
                reply.downvotes -= 1
            message = "Vote removed"
        else:
            # Change vote type
            old_type = existing_vote.vote_type
            existing_vote.vote_type = vote_data.vote_type
            
            if old_type == "up":
                reply.upvotes -= 1
                reply.downvotes += 1
            else:
                reply.downvotes -= 1
                reply.upvotes += 1
            message = "Vote changed"
    else:
        # Create new vote
        vote = ForumVote(
            user_id=current_user.id,
            reply_id=reply_id,
            vote_type=vote_data.vote_type
        )
        db.add(vote)
        
        if vote_data.vote_type == "up":
            reply.upvotes += 1
        else:
            reply.downvotes += 1
        message = "Vote added"
    
    db.commit()
    
    return {
        "message": message,
        "upvotes": reply.upvotes,
        "downvotes": reply.downvotes
    }

@router.post("/replies/{reply_id}/solution")
def mark_solution(
    reply_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a reply as the solution (thread author only)."""
    # Get reply and thread
    reply = db.query(ForumReply).filter(ForumReply.id == reply_id).first()
    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found")
    
    thread = reply.thread
    
    # Check if current user is thread author or admin
    if thread.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only thread author can mark solutions")
    
    # Unmark other solutions in this thread
    db.query(ForumReply).filter(
        ForumReply.thread_id == thread.id,
        ForumReply.is_solution == True
    ).update({"is_solution": False})
    
    # Mark this reply as solution
    reply.is_solution = True
    db.commit()
    
    return {"message": "Reply marked as solution"}

@router.put("/replies/{reply_id}")
def edit_reply(
    reply_id: int,
    content: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Edit a reply (author only)."""
    reply = db.query(ForumReply).filter(ForumReply.id == reply_id).first()
    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found")
    
    # Check if current user is reply author or admin
    if reply.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only reply author can edit")
    
    reply.content = content
    reply.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Reply updated successfully"}

@router.delete("/replies/{reply_id}")
def delete_reply(
    reply_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a reply (author or admin only)."""
    reply = db.query(ForumReply).filter(ForumReply.id == reply_id).first()
    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found")
    
    # Check if current user is reply author or admin
    if reply.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only reply author or admin can delete")
    
    thread = reply.thread
    
    # Delete associated votes
    db.query(ForumVote).filter(ForumVote.reply_id == reply_id).delete()
    
    # Delete reply
    db.delete(reply)
    
    # Update thread reply count
    thread.reply_count -= 1
    
    db.commit()
    
    return {"message": "Reply deleted successfully"}

# Admin endpoints
@router.post("/categories")
def create_category(
    name: str,
    description: Optional[str] = None,
    order: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a forum category (admin only)."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    category = ForumCategory(
        name=name,
        description=description,
        order=order
    )
    
    db.add(category)
    db.commit()
    db.refresh(category)
    
    return {
        "id": category.id,
        "message": "Category created successfully"
    }

@router.put("/threads/{thread_id}/pin")
def toggle_pin_thread(
    thread_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Pin/unpin a thread (admin only)."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    thread = db.query(ForumThread).filter(ForumThread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    thread.is_pinned = not thread.is_pinned
    db.commit()
    
    return {
        "message": f"Thread {'pinned' if thread.is_pinned else 'unpinned'}",
        "is_pinned": thread.is_pinned
    }

@router.put("/threads/{thread_id}/lock")
def toggle_lock_thread(
    thread_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lock/unlock a thread (admin only)."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    thread = db.query(ForumThread).filter(ForumThread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    thread.is_locked = not thread.is_locked
    db.commit()
    
    return {
        "message": f"Thread {'locked' if thread.is_locked else 'unlocked'}",
        "is_locked": thread.is_locked
    }