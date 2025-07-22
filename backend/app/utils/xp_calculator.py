"""
XP calculation utilities for the gamification system.
"""

def calculate_xp_for_problem(difficulty: str) -> int:
    """
    Calculate XP points based on problem difficulty.
    
    Args:
        difficulty: Problem difficulty level ('easy', 'medium', 'hard')
        
    Returns:
        XP points to award
    """
    xp_mapping = {
        'easy': 50,
        'medium': 100,
        'hard': 150
    }
    
    return xp_mapping.get(difficulty.lower(), 50)  # Default to easy if unknown

def should_award_xp(user_id: int, problem_id: int, db) -> bool:
    """
    Check if user should be awarded XP for solving this problem.
    XP is only awarded for the first successful submission of each problem.
    
    Args:
        user_id: User ID
        problem_id: Problem ID
        db: Database session
        
    Returns:
        True if XP should be awarded, False otherwise
    """
    from ..db.models import Submission
    
    # Check if user has already successfully solved this problem
    previous_success = db.query(Submission).filter(
        Submission.user_id == user_id,
        Submission.problem_id == problem_id,
        Submission.overall_status == 'pass'
    ).first()
    
    return previous_success is None