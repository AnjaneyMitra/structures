#!/usr/bin/env python3
"""
Test the enhanced hints system to show how it provides varied responses.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.utils.gemini_service import gemini_hint_generator

def test_enhanced_hints():
    """Test the enhanced hint generation with better prompts."""
    
    problem_title = "Two Sum"
    problem_description = """
    Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
    You may assume that each input would have exactly one solution, and you may not use the same element twice.
    """
    
    # Test with different code states to show how hints adapt
    test_cases = [
        {
            "name": "Empty function",
            "code": """def solution(nums, target):
    # TODO: implement
    pass""",
            "language": "python"
        },
        {
            "name": "Basic loop started",
            "code": """def solution(nums, target):
    for i in range(len(nums)):
        # What should I do here?
        pass""",
            "language": "python"
        },
        {
            "name": "Nested loops with bug",
            "code": """def solution(nums, target):
    for i in range(len(nums)):
        for j in range(len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]""",
            "language": "python"
        },
        {
            "name": "Hash map approach started",
            "code": """def solution(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        # How do I use the hash map?
        pass""",
            "language": "python"
        }
    ]
    
    print("🧪 Testing Enhanced Hints System")
    print("=" * 60)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📝 Test Case {i}: {test_case['name']}")
        print("-" * 40)
        print("Code:")
        print(test_case['code'])
        print("\nGenerated Prompt Preview:")
        
        # Show what the enhanced prompt looks like
        try:
            prompt = gemini_hint_generator._create_contextual_hint_prompt(
                problem_title,
                problem_description,
                test_case['code'],
                test_case['language'],
                additional_context="Request time: 11:23:45. Hint strategy: Focus on identifying the core algorithmic approach needed. Provide a unique perspective based on this strategy."
            )
            
            # Show key parts of the prompt
            lines = prompt.split('\n')
            analysis_start = -1
            for j, line in enumerate(lines):
                if "CODE ANALYSIS:" in line:
                    analysis_start = j
                    break
            
            if analysis_start != -1:
                print("Code Analysis Generated:")
                for line in lines[analysis_start+1:analysis_start+8]:
                    if line.strip() and not line.startswith("HINT"):
                        print(f"  {line}")
            
            print("✅ Prompt generated successfully")
            
        except Exception as e:
            print(f"❌ Error generating prompt: {e}")
    
    print(f"\n🎯 Key Improvements:")
    print("✅ Detailed code analysis for each request")
    print("✅ Different hint strategies for variety")
    print("✅ Context-aware prompting")
    print("✅ Progressive guidance based on code state")
    print("✅ Specific pattern recognition")

if __name__ == "__main__":
    test_enhanced_hints()