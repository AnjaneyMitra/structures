from sqlalchemy.orm import Session
from sqlalchemy import and_
from ..db.models import Problem, Submission
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

def increment_problem_view(problem_id: int, db: Session) -> bool:
    """
    Increment the view count for a problem.
    
    Args:
        problem_id: The ID of the problem
        db: Database session
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        result = db.query(Problem).filter(Problem.id == problem_id).update(
            {Problem.view_count: Problem.view_count + 1}
        )
        db.commit()
        return result > 0
    except Exception as e:
        logger.error(f"Failed to increment view count for problem {problem_id}: {e}")
        db.rollback()
        return False

def increment_problem_attempt(problem_id: int, db: Session) -> bool:
    """
    Increment the attempt count for a problem.
    
    Args:
        problem_id: The ID of the problem
        db: Database session
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        result = db.query(Problem).filter(Problem.id == problem_id).update(
            {Problem.attempt_count: Problem.attempt_count + 1}
        )
        db.commit()
        return result > 0
    except Exception as e:
        logger.error(f"Failed to increment attempt count for problem {problem_id}: {e}")
        db.rollback()
        return False

def increment_problem_solve(problem_id: int, db: Session) -> bool:
    """
    Increment the solve count for a problem.
    
    Args:
        problem_id: The ID of the problem
        db: Database session
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        result = db.query(Problem).filter(Problem.id == problem_id).update(
            {Problem.solve_count: Problem.solve_count + 1}
        )
        db.commit()
        return result > 0
    except Exception as e:
        logger.error(f"Failed to increment solve count for problem {problem_id}: {e}")
        db.rollback()
        return False

def get_popular_problems(db: Session, limit: int = 10):
    """
    Get the most popular problems based on view count.
    
    Args:
        db: Database session
        limit: Maximum number of problems to return
        
    Returns:
        List of problems ordered by popularity
    """
    try:
        return db.query(Problem).order_by(
            Problem.view_count.desc(),
            Problem.solve_count.desc()
        ).limit(limit).all()
    except Exception as e:
        logger.error(f"Failed to get popular problems: {e}")
        return []

def get_trending_problems(db: Session, limit: int = 10, days: int = 7):
    """
    Get trending problems based on recent activity.
    
    Args:
        db: Database session
        limit: Maximum number of problems to return
        days: Number of days to look back for trending calculation
        
    Returns:
        List of problems ordered by recent activity
    """
    try:
        # Calculate trending based on recent submissions
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Get problem IDs with recent submissions
        recent_problem_ids = db.query(Submission.problem_id).filter(
            Submission.submission_time >= cutoff_date
        ).distinct().subquery()
        
        # Get problems that have recent activity, ordered by view count
        trending_problems = db.query(Problem).filter(
            Problem.id.in_(db.query(recent_problem_ids.c.problem_id))
        ).order_by(
            Problem.view_count.desc()
        ).limit(limit).all()
        
        return trending_problems
    except Exception as e:
        logger.error(f"Failed to get trending problems: {e}")
        return []

def get_problem_stats(problem_id: int, db: Session):
    """
    Get detailed statistics for a specific problem.
    
    Args:
        problem_id: The ID of the problem
        db: Database session
        
    Returns:
        Dict with problem statistics
    """
    try:
        problem = db.query(Problem).filter(Problem.id == problem_id).first()
        if not problem:
            return None
            
        total_submissions = db.query(Submission).filter(Submission.problem_id == problem_id).count()
        successful_submissions = db.query(Submission).filter(
            and_(
                Submission.problem_id == problem_id,
                Submission.overall_status == 'pass'
            )
        ).count()
        
        success_rate = (successful_submissions / total_submissions * 100) if total_submissions > 0 else 0
        
        return {
            'problem_id': problem_id,
            'title': problem.title,
            'view_count': problem.view_count,
            'solve_count': problem.solve_count,
            'attempt_count': problem.attempt_count,
            'total_submissions': total_submissions,
            'successful_submissions': successful_submissions,
            'success_rate': round(success_rate, 2)
        }
    except Exception as e:
        logger.error(f"Failed to get problem stats for problem {problem_id}: {e}")
        return None
