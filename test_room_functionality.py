#!/usr/bin/env python3
"""
Test script for room functionality
Run this to verify the room endpoints work correctly
"""

import requests
import json
import time

BASE_URL = "https://structures-production.up.railway.app"

def test_room_functionality():
    print("🧪 Testing Room Functionality")
    print("=" * 50)
    
    # Test data
    test_user = {
        "username": "testuser",
        "password": "testpass123"
    }
    
    session = requests.Session()
    
    try:
        # 1. Login or register user
        print("1. 🔐 Authenticating user...")
        try:
            login_response = session.post(f"{BASE_URL}/api/auth/login", data=test_user)
            if login_response.status_code != 200:
                # Try to register
                register_response = session.post(f"{BASE_URL}/api/auth/register", json=test_user)
                if register_response.status_code in [200, 201]:
                    print("   ✅ User registered successfully")
                    login_response = session.post(f"{BASE_URL}/api/auth/login", data=test_user)
                elif "already exists" in register_response.text.lower() or register_response.status_code == 400:
                    print("   ℹ️ User already exists, trying login...")
                    login_response = session.post(f"{BASE_URL}/api/auth/login", data=test_user)
                else:
                    print(f"   ❌ Registration failed: {register_response.text}")
                    return
            
            if login_response.status_code == 200:
                token_data = login_response.json()
                token = token_data.get("access_token")
                headers = {"Authorization": f"Bearer {token}"}
                print("   ✅ Authentication successful")
            else:
                print(f"   ❌ Login failed: {login_response.text}")
                return
        except Exception as e:
            print(f"   ❌ Authentication error: {e}")
            return
        
        # 2. Get available problems
        print("2. 📋 Fetching problems...")
        try:
            problems_response = requests.get(f"{BASE_URL}/api/problems/", headers=headers)
            if problems_response.status_code == 200:
                problems = problems_response.json()
                if problems:
                    problem_id = problems[0]["id"]
                    print(f"   ✅ Found {len(problems)} problems, using problem #{problem_id}")
                else:
                    print("   ❌ No problems found")
                    return
            else:
                print(f"   ❌ Failed to fetch problems: {problems_response.text}")
                return
        except Exception as e:
            print(f"   ❌ Problems fetch error: {e}")
            return
        
        # 3. Create a room
        print("3. 🏠 Creating room...")
        try:
            room_data = {"problem_id": problem_id}
            create_response = requests.post(f"{BASE_URL}/api/rooms/", json=room_data, headers=headers)
            if create_response.status_code == 200:
                room = create_response.json()
                room_code = room["code"]
                room_id = room["id"]
                print(f"   ✅ Room created successfully: {room_code}")
            else:
                print(f"   ❌ Room creation failed: {create_response.text}")
                return
        except Exception as e:
            print(f"   ❌ Room creation error: {e}")
            return
        
        # 4. Test room endpoints
        print("4. 🔍 Testing room endpoints...")
        
        # Get room by code
        try:
            room_response = requests.get(f"{BASE_URL}/api/rooms/code/{room_code}", headers=headers)
            if room_response.status_code == 200:
                print("   ✅ Get room by code: SUCCESS")
            else:
                print(f"   ❌ Get room by code failed: {room_response.text}")
        except Exception as e:
            print(f"   ❌ Get room by code error: {e}")
        
        # Get room users
        try:
            users_response = requests.get(f"{BASE_URL}/api/rooms/{room_code}/users", headers=headers)
            if users_response.status_code == 200:
                users = users_response.json()
                print(f"   ✅ Get room users: SUCCESS ({len(users)} users)")
            else:
                print(f"   ❌ Get room users failed: {users_response.text}")
        except Exception as e:
            print(f"   ❌ Get room users error: {e}")
        
        # Test code execution in room
        print("5. ⚡ Testing code execution...")
        try:
            code_data = {
                "code": "print('Hello from room!')",
                "language": "python",
                "sample_only": True
            }
            execute_response = requests.post(f"{BASE_URL}/api/rooms/{room_code}/execute", json=code_data, headers=headers)
            if execute_response.status_code == 200:
                result = execute_response.json()
                print("   ✅ Code execution: SUCCESS")
                if result.get("test_case_results"):
                    test_result = result["test_case_results"][0]
                    print(f"      Output: {test_result.get('output', 'N/A')}")
            else:
                print(f"   ❌ Code execution failed: {execute_response.text}")
        except Exception as e:
            print(f"   ❌ Code execution error: {e}")
        
        # Test code submission in room
        print("6. 📤 Testing code submission...")
        try:
            submit_data = {
                "code": "print('Hello submission!')",
                "language": "python"
            }
            submit_response = requests.post(f"{BASE_URL}/api/rooms/{room_code}/submit", json=submit_data, headers=headers)
            if submit_response.status_code == 200:
                result = submit_response.json()
                print("   ✅ Code submission: SUCCESS")
                print(f"      Status: {result.get('overall_status', 'N/A')}")
            else:
                print(f"   ❌ Code submission failed: {submit_response.text}")
        except Exception as e:
            print(f"   ❌ Code submission error: {e}")
        
        # Get room submissions
        print("7. 📊 Testing submissions history...")
        try:
            submissions_response = requests.get(f"{BASE_URL}/api/rooms/{room_code}/submissions", headers=headers)
            if submissions_response.status_code == 200:
                submissions = submissions_response.json()
                print(f"   ✅ Get submissions: SUCCESS ({len(submissions)} submissions)")
            else:
                print(f"   ❌ Get submissions failed: {submissions_response.text}")
        except Exception as e:
            print(f"   ❌ Get submissions error: {e}")
        
        print("\n🎉 Room functionality test completed!")
        print(f"Room Code: {room_code}")
        print("You can now test the frontend by joining this room.")
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_room_functionality()