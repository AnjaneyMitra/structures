#!/usr/bin/env python3
"""
Test runner for the DSA App backend
Runs all tests in the organized test directory structure
"""
import os
import sys
import subprocess
from pathlib import Path

def run_tests():
    """Run all tests with proper organization"""
    
    print("🧪 DSA App Backend Test Runner")
    print("=" * 50)
    
    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    # Test categories
    test_categories = {
        "Unit Tests": "tests/unit/",
        "API Tests": "tests/api/", 
        "Integration Tests": "tests/integration/",
        "Utility Tests": "tests/utils/"
    }
    
    total_passed = 0
    total_failed = 0
    
    for category, path in test_categories.items():
        if os.path.exists(path) and any(f.endswith('.py') and f.startswith('test_') for f in os.listdir(path)):
            print(f"\n📋 Running {category}...")
            print("-" * 30)
            
            try:
                result = subprocess.run([
                    sys.executable, "-m", "pytest", path, "-v", "--tb=short"
                ], capture_output=True, text=True)
                
                print(result.stdout)
                if result.stderr:
                    print("Errors:", result.stderr)
                
                if result.returncode == 0:
                    print(f"✅ {category} PASSED")
                    total_passed += 1
                else:
                    print(f"❌ {category} FAILED")
                    total_failed += 1
                    
            except Exception as e:
                print(f"❌ Error running {category}: {e}")
                total_failed += 1
        else:
            print(f"⚠️  No tests found in {category}")
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Summary")
    print(f"✅ Passed: {total_passed}")
    print(f"❌ Failed: {total_failed}")
    
    if total_failed == 0:
        print("🎉 All tests passed!")
        return True
    else:
        print("⚠️  Some tests failed")
        return False

def run_specific_test(test_path):
    """Run a specific test file"""
    print(f"🧪 Running specific test: {test_path}")
    
    try:
        result = subprocess.run([
            sys.executable, "-m", "pytest", test_path, "-v"
        ])
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Error running test: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Run specific test
        test_path = sys.argv[1]
        success = run_specific_test(test_path)
    else:
        # Run all tests
        success = run_tests()
    
    sys.exit(0 if success else 1)