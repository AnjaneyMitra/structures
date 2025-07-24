#!/usr/bin/env python3
"""
Test script for the Level System implementation.
Run this to verify all level calculations work correctly.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__)))

from app.utils.level_calculator import calculate_level, get_level_progress, get_all_levels, get_xp_for_next_level

def test_level_calculations():
    """Test basic level calculations."""
    print("=== Testing Level Calculations ===")
    
    test_cases = [
        (0, 1, "Novice"),
        (499, 1, "Novice"),
        (500, 2, "Apprentice"),
        (1499, 2, "Apprentice"),
        (1500, 3, "Practitioner"),
        (2999, 3, "Practitioner"),
        (3000, 4, "Expert"),
        (5999, 4, "Expert"),
        (6000, 5, "Master"),
        (9999, 5, "Master"),
        (10000, 6, "Grandmaster"),
        (15000, 6, "Grandmaster"),
    ]
    
    for xp, expected_level, expected_title in test_cases:
        level, title = calculate_level(xp)
        status = "✅" if (level == expected_level and title == expected_title) else "❌"
        print(f"{status} {xp:5d} XP -> Level {level} ({title})")
        if level != expected_level or title != expected_title:
            print(f"    Expected: Level {expected_level} ({expected_title})")

def test_xp_for_next_level():
    """Test XP needed for next level calculations."""
    print("\n=== Testing XP for Next Level ===")
    
    test_cases = [
        (0, 500),      # Novice -> Apprentice
        (250, 250),    # Halfway to Apprentice
        (500, 1000),   # Apprentice -> Practitioner
        (1000, 500),   # Halfway to Practitioner
        (1500, 1500),  # Practitioner -> Expert
        (10000, 0),    # Max level
        (15000, 0),    # Beyond max level
    ]
    
    for xp, expected_xp_needed in test_cases:
        xp_needed = get_xp_for_next_level(xp)
        status = "✅" if xp_needed == expected_xp_needed else "❌"
        print(f"{status} {xp:5d} XP -> {xp_needed:4d} XP needed for next level")
        if xp_needed != expected_xp_needed:
            print(f"    Expected: {expected_xp_needed}")

def test_level_progress():
    """Test detailed level progress calculations."""
    print("\n=== Testing Level Progress ===")
    
    test_cases = [
        (0, 0.0),      # Start of Novice
        (250, 50.0),   # Halfway through Novice
        (499, 99.8),   # Almost Apprentice
        (500, 0.0),    # Start of Apprentice
        (1000, 50.0),  # Halfway through Apprentice
        (1500, 0.0),   # Start of Practitioner
        (10000, 100.0), # Max level
    ]
    
    for xp, expected_percentage in test_cases:
        progress = get_level_progress(xp)
        actual_percentage = progress['progress_percentage']
        status = "✅" if abs(actual_percentage - expected_percentage) < 1.0 else "❌"
        print(f"{status} {xp:5d} XP -> {actual_percentage:5.1f}% progress (Level {progress['level']} - {progress['title']})")
        if abs(actual_percentage - expected_percentage) >= 1.0:
            print(f"    Expected: {expected_percentage}%")

def test_all_levels():
    """Test get_all_levels function."""
    print("\n=== Testing All Levels Info ===")
    
    levels = get_all_levels()
    expected_count = 6
    
    if len(levels) == expected_count:
        print(f"✅ Correct number of levels: {len(levels)}")
    else:
        print(f"❌ Expected {expected_count} levels, got {len(levels)}")
    
    for level_info in levels:
        print(f"   Level {level_info['level']}: {level_info['title']} ({level_info['xp_required']} XP)")

def test_problem_solving_simulation():
    """Simulate a user solving problems and leveling up."""
    print("\n=== Problem Solving Simulation ===")
    
    xp = 0
    problems_solved = []
    
    # Simulate solving various problems
    problems = [
        ("Easy Problem 1", "easy", 50),
        ("Easy Problem 2", "easy", 50),
        ("Medium Problem 1", "medium", 100),
        ("Easy Problem 3", "easy", 50),
        ("Medium Problem 2", "medium", 100),
        ("Hard Problem 1", "hard", 150),
        ("Medium Problem 3", "medium", 100),
        ("Hard Problem 2", "hard", 150),
        ("Hard Problem 3", "hard", 150),
        ("Medium Problem 4", "medium", 100),
    ]
    
    current_level = 1
    
    for problem_name, difficulty, xp_reward in problems:
        old_xp = xp
        xp += xp_reward
        old_level, old_title = calculate_level(old_xp)
        new_level, new_title = calculate_level(xp)
        
        if new_level > current_level:
            print(f"🎊 LEVEL UP! Solved '{problem_name}' -> Level {new_level} ({new_title})")
            current_level = new_level
        else:
            print(f"   Solved '{problem_name}' (+{xp_reward} XP) -> {xp} total XP")
    
    final_progress = get_level_progress(xp)
    print(f"\nFinal Status: Level {final_progress['level']} ({final_progress['title']})")
    print(f"Total XP: {xp}")
    print(f"Progress: {final_progress['progress_percentage']:.1f}%")
    print(f"XP to next level: {final_progress['xp_to_next_level']}")

if __name__ == "__main__":
    print("🎮 Level System Test Suite")
    print("=" * 50)
    
    test_level_calculations()
    test_xp_for_next_level()
    test_level_progress()
    test_all_levels()
    test_problem_solving_simulation()
    
    print("\n" + "=" * 50)
    print("✅ Level System tests completed!")