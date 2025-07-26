#!/usr/bin/env python3
"""
Test script to verify contextual hints are working.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.utils.gemini_service import gemini_hint_generator

def test_contextual_hint():
    """Test contextual hint generation."""
    
    problem_title = "Two Sum"
    problem_description = """
    Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
    You may assume that each input would have exactly one solution, and you may not use the same element twice.
    """
    
    user_code = """
def solution(nums, target):
    # I'm trying to use nested loops but it's not working
    for i in range(len(nums)):
        for j in range(len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []
"""
    
    language = "python"
    
    try:
        print("🧪 Testing contextual hint generation...")
        print("=" * 50)
        print(f"Problem: {problem_title}")
        print(f"User's code approach: Nested loops with potential bug")
        print("\nGenerating contextual hint...")
        
        hint = gemini_hint_generator.generate_contextual_hint(
            problem_title,
            problem_description,
            user_code,
            language
        )
        
        print(f"\n💡 Generated hint:")
        print(f"'{hint}'")
        
        if hint and len(hint) > 10:
            print("\n✅ Contextual hint generation successful!")
            return True
        else:
            print("\n❌ Contextual hint generation failed - hint too short")
            return False
            
    except Exception as e:
        print(f"\n❌ Error testing contextual hints: {e}")
        return False

if __name__ == "__main__":
    success = test_contextual_hint()
    
    if success:
        print("\n🎉 Contextual hints are working!")
    else:
        print("\n💥 Contextual hints test failed!")
        sys.exit(1)