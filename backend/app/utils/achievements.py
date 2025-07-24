from sqlalchemy.orm import Session
from sqlalchemy import func
from ..db.models import Achievement, UserAchievement, User, Submission, Problem
import datetime
from typing import List, Dict, Any

def initialize_default_achievements(db: Session):
    """Initialize default achievements if they don't exist"""
    
    # Check if achievements already exist
    existing_count = db.query(Achievement).count()
    if existing_count > 0:
        return
    
    default_achievements = [
        # First solve achievements
        {
            "name": "First Steps",
            "description": "Solve your first problem",
            "icon": "🎯",
            "condition_type": "first_solve",
            "condition_value": 1,
            "xp_reward": 50
        },
        {
            "name": "Problem Solver",
            "description": "Solve 5 problems",
            "icon": "🧩",
            "condition_type": "count",
            "condition_value": 5,
            "xp_reward": 100
        },
        {
            "name": "Code Warrior",
            "description": "Solve 10 problems",
            "icon": "⚔️",
            "condition_type": "count",
            "condition_value": 10,
            "xp_reward": 200
        },
        {
            "name": "Algorithm Master",
            "description": "Solve 25 problems",
            "icon": "🏆",
            "condition_type": "count",
            "condition_value": 25,
            "xp_reward": 500
        },
        {
            "name": "Coding Legend",
            "description": "Solve 50 problems",
            "icon": "👑",
            "condition_type": "count",
            "condition_value": 50,
            "xp_reward": 1000
        },
        
        # Difficulty-based achievements
        {
            "name": "Easy Rider",
            "description": "Solve 10 Easy problems",
            "icon": "🟢",
            "condition_type": "difficulty_easy",
            "condition_value": 10,
            "xp_reward": 150
        },
        {
            "name": "Medium Challenger",
            "description": "Solve 10 Medium problems",
            "icon": "🟡",
            "condition_type": "difficulty_medium",
            "condition_value": 10,
            "xp_reward": 300
        },
        {
            "name": "Hard Core",
            "description": "Solve 5 Hard problems",
            "icon": "🔴",
            "condition_type": "difficulty_hard",
            "condition_value": 5,
            "xp_reward": 500
        },
        
        # Streak achievements
        {
            "name": "On Fire",
            "description": "Solve problems for 3 days in a row",
            "icon": "🔥",
            "condition_type": "streak",
            "condition_value": 3,
            "xp_reward": 200
        },
        {
            "name": "Unstoppable",
            "description": "Solve problems for 7 days in a row",
            "icon": "⚡",
            "condition_type": "streak",
            "condition_value": 7,
            "xp_reward": 500
        },
        
        # Special achievements
        {
            "name": "Speed Demon",
            "description": "Solve a problem in under 5 minutes",
            "icon": "💨",
            "condition_type": "speed",
            "condition_value": 300,  # 5 minutes in seconds
            "xp_reward": 100
        },
        {
            "name": "Perfectionist",
            "description": "Get 100% on first try for 5 problems",
            "icon": "✨",
            "condition_type": "perfect_streak",
            "condition_value": 5,
            "xp_reward": 300
        }
    ]
    
    for achievement_data in default_achievements:
        achievement = Achievement(**achievement_data)
        db.add(achievement)
    
    db.commit()

def check_achievements(user_id: int, event_type: str, db: Session, **kwargs) -> List[Dict[str, Any]]:
    """
    Check for new achievements based on user actions
    Returns list of newly earned achievements
    """
    newly_earned = []
    
    # Get all achievements that the user hasn't earned yet
    earned_achievement_ids = db.query(UserAchievement.achievement_id).filter(
        UserAchievement.user_id == user_id
    ).subquery()
    
    available_achievements = db.query(Achievement).filter(
        ~Achievement.id.in_(earned_achievement_ids)
    ).all()
    
    for achievement in available_achievements:
        if check_achievement_condition(user_id, achievement, db, event_type, **kwargs):
            # Award the achievement
            user_achievement = UserAchievement(
                user_id=user_id,
                achievement_id=achievement.id,
                progress=achievement.condition_value or 1
            )
            db.add(user_achievement)
            
            # Award XP
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                user.total_xp += achievement.xp_reward
            
            newly_earned.append({
                "id": achievement.id,
                "name": achievement.name,
                "description": achievement.description,
                "icon": achievement.icon,
                "xp_reward": achievement.xp_reward
            })
    
    if newly_earned:
        db.commit()
    
    return newly_earned

def check_achievement_condition(user_id: int, achievement: Achievement, db: Session, event_type: str, **kwargs) -> bool:
    """Check if a specific achievement condition is met"""
    
    if achievement.condition_type == "first_solve":
        # Check if user has any successful submissions
        successful_submissions = db.query(Submission).filter(
            Submission.user_id == user_id,
            Submission.overall_status == "pass"
        ).count()
        return successful_submissions >= achievement.condition_value
    
    elif achievement.condition_type == "count":
        # Count total solved problems (unique problems with at least one successful submission)
        solved_problems = db.query(func.count(func.distinct(Submission.problem_id))).filter(
            Submission.user_id == user_id,
            Submission.overall_status == "pass"
        ).scalar()
        return solved_problems >= achievement.condition_value
    
    elif achievement.condition_type.startswith("difficulty_"):
        difficulty = achievement.condition_type.split("_")[1].capitalize()
        # Count solved problems of specific difficulty
        solved_count = db.query(func.count(func.distinct(Submission.problem_id))).join(
            Problem, Submission.problem_id == Problem.id
        ).filter(
            Submission.user_id == user_id,
            Submission.overall_status == "pass",
            Problem.difficulty == difficulty
        ).scalar()
        return solved_count >= achievement.condition_value
    
    elif achievement.condition_type == "streak":
        # This would need streak tracking - for now return False
        # Will be implemented with Feature 7 (Streak Tracking)
        return False
    
    elif achievement.condition_type == "speed":
        # Check if the current submission (if any) was fast enough
        if event_type == "submission_success" and "execution_time" in kwargs:
            return kwargs["execution_time"] <= achievement.condition_value
        return False
    
    elif achievement.condition_type == "perfect_streak":
        # Check for consecutive first-try successes
        # This is a complex query - simplified for now
        return False
    
    return False

def get_user_achievements(user_id: int, db: Session) -> Dict[str, Any]:
    """Get all achievements for a user with progress"""
    
    # Get all achievements
    all_achievements = db.query(Achievement).all()
    
    # Get user's earned achievements
    earned_achievements = db.query(UserAchievement).filter(
        UserAchievement.user_id == user_id
    ).all()
    
    earned_dict = {ua.achievement_id: ua for ua in earned_achievements}
    
    result = {
        "total_achievements": len(all_achievements),
        "earned_count": len(earned_achievements),
        "achievements": []
    }
    
    for achievement in all_achievements:
        achievement_data = {
            "id": achievement.id,
            "name": achievement.name,
            "description": achievement.description,
            "icon": achievement.icon,
            "xp_reward": achievement.xp_reward,
            "earned": achievement.id in earned_dict,
            "earned_at": None,
            "progress": 0,
            "total": achievement.condition_value or 1
        }
        
        if achievement.id in earned_dict:
            user_achievement = earned_dict[achievement.id]
            achievement_data["earned_at"] = user_achievement.earned_at.isoformat()
            achievement_data["progress"] = user_achievement.progress
        else:
            # Calculate current progress
            achievement_data["progress"] = get_achievement_progress(user_id, achievement, db)
        
        result["achievements"].append(achievement_data)
    
    return result

def get_achievement_progress(user_id: int, achievement: Achievement, db: Session) -> int:
    """Get current progress towards an achievement"""
    
    if achievement.condition_type == "first_solve" or achievement.condition_type == "count":
        solved_problems = db.query(func.count(func.distinct(Submission.problem_id))).filter(
            Submission.user_id == user_id,
            Submission.overall_status == "pass"
        ).scalar()
        return min(solved_problems, achievement.condition_value or 1)
    
    elif achievement.condition_type.startswith("difficulty_"):
        difficulty = achievement.condition_type.split("_")[1].capitalize()
        solved_count = db.query(func.count(func.distinct(Submission.problem_id))).join(
            Problem, Submission.problem_id == Problem.id
        ).filter(
            Submission.user_id == user_id,
            Submission.overall_status == "pass",
            Problem.difficulty == difficulty
        ).scalar()
        return min(solved_count, achievement.condition_value or 1)
    
    # For other types, return 0 for now
    return 0