#!/usr/bin/env python3
"""
Test Gemini API connection and hint generation locally.
"""

import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def test_gemini_connection():
    """Test if Gemini API is working properly."""
    
    print("🔍 Testing Gemini API Connection")
    print("=" * 50)
    
    # Check environment variable
    api_key = os.getenv("GEMINI_API_KEY")
    print(f"1. API Key Status: {'✅ Found' if api_key else '❌ Missing'}")
    if api_key:
        print(f"   Key length: {len(api_key)} characters")
        print(f"   Key preview: {api_key[:10]}...{api_key[-5:]}")
    
    # Test import
    try:
        from app.utils.gemini_service import gemini_hint_generator
        print("2. Import Status: ✅ Success")
    except Exception as e:
        print(f"2. Import Status: ❌ Failed - {e}")
        return False
    
    # Test initialization
    try:
        gemini_hint_generator._ensure_initialized()
        print("3. Initialization: ✅ Success")
    except Exception as e:
        print(f"3. Initialization: ❌ Failed - {e}")
        return False
    
    # Test actual hint generation
    print("\n🧪 Testing Hint Generation")
    print("-" * 30)
    
    test_code = """def solution(nums, target):
    for i in range(len(nums)):
        for j in range(i+1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]"""
    
    try:
        hint = gemini_hint_generator.generate_contextual_hint(
            "Two Sum",
            "Find two numbers that add up to target",
            test_code,
            "python"
        )
        
        print(f"4. Hint Generation: ✅ Success")
        print(f"   Generated hint: '{hint}'")
        
        # Check if it's the fallback
        fallback_hint = "Review your current approach and consider if there's a more efficient way to solve this problem. Think about edge cases and test your logic step by step."
        
        if hint == fallback_hint:
            print("   ⚠️  WARNING: This is the fallback hint, not from Gemini!")
            return False
        else:
            print("   ✅ This appears to be a real Gemini response!")
            return True
            
    except Exception as e:
        print(f"4. Hint Generation: ❌ Failed - {e}")
        return False

def test_with_manual_api_key():
    """Test with manually set API key."""
    print("\n🔑 Testing with Manual API Key")
    print("-" * 30)
    
    # Load .env file and set the API key manually
    from dotenv import load_dotenv
    load_dotenv()
    os.environ["GEMINI_API_KEY"] = "AIzaSyCMACw5UE2SlFEsypUoPzmc0YuVUnw4VYU"
    
    # Clear any cached initialization
    from app.utils.gemini_service import gemini_hint_generator
    gemini_hint_generator._initialized = False
    gemini_hint_generator.model = None
    
    return test_gemini_connection()

if __name__ == "__main__":
    success = test_gemini_connection()
    
    if not success:
        print("\n🔧 Trying with manual API key...")
        success = test_with_manual_api_key()
    
    if success:
        print("\n🎉 Gemini API is working correctly!")
    else:
        print("\n💥 Gemini API is not working - using fallback hints")
        print("\nPossible issues:")
        print("- API key not set in environment")
        print("- API key is invalid")
        print("- Network connectivity issues")
        print("- Gemini API quota exceeded")