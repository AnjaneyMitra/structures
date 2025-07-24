"""
Level calculation utilities for the gamification system.
"""

def calculate_level(total_xp: int) -> tuple[int, str]:
    """
    Calculate user level and title based on total XP.
    
    Args:
        total_xp: Total XP earned by the user
        
    Returns:
        Tuple of (level, title)
    """
    levels = [
        (0, "Novice"),
        (500, "Apprentice"),
        (1500, "Practitioner"),
        (3000, "Expert"),
        (6000, "Master"),
        (10000, "Grandmaster"),
    ]
    
    for i, (xp_threshold, title) in enumerate(reversed(levels)):
        if total_xp >= xp_threshold:
            level = len(levels) - i
            return level, title
    
    return 1, "Novice"

def get_xp_for_next_level(total_xp: int) -> int:
    """
    Calculate XP needed to reach the next level.
    
    Args:
        total_xp: Current total XP
        
    Returns:
        XP needed for next level (0 if at max level)
    """
    levels = [0, 500, 1500, 3000, 6000, 10000]
    
    for threshold in levels:
        if total_xp < threshold:
            return threshold - total_xp
    
    return 0  # At max level

def get_level_progress(total_xp: int) -> dict:
    """
    Get detailed level progress information.
    
    Args:
        total_xp: Current total XP
        
    Returns:
        Dictionary with level progress details
    """
    current_level, current_title = calculate_level(total_xp)
    xp_to_next = get_xp_for_next_level(total_xp)
    
    # Calculate progress within current level
    levels = [0, 500, 1500, 3000, 6000, 10000]
    
    if current_level == 6:  # Max level
        level_start_xp = 10000
        level_end_xp = 10000
        progress_percentage = 100
    else:
        level_start_xp = levels[current_level - 1]
        level_end_xp = levels[current_level]
        level_xp_range = level_end_xp - level_start_xp
        current_level_xp = total_xp - level_start_xp
        progress_percentage = (current_level_xp / level_xp_range * 100) if level_xp_range > 0 else 100
    
    return {
        "level": current_level,
        "title": current_title,
        "total_xp": total_xp,
        "xp_to_next_level": xp_to_next,
        "level_start_xp": level_start_xp,
        "level_end_xp": level_end_xp,
        "progress_percentage": min(100, max(0, progress_percentage))
    }

def get_all_levels() -> list[dict]:
    """
    Get information about all available levels.
    
    Returns:
        List of level information dictionaries
    """
    levels = [
        (0, "Novice"),
        (500, "Apprentice"),
        (1500, "Practitioner"),
        (3000, "Expert"),
        (6000, "Master"),
        (10000, "Grandmaster"),
    ]
    
    result = []
    for i, (xp_threshold, title) in enumerate(levels):
        result.append({
            "level": i + 1,
            "title": title,
            "xp_required": xp_threshold,
            "is_max_level": i == len(levels) - 1
        })
    
    return result