#!/usr/bin/env python3
"""
Create a test problem for room functionality testing
"""

import requests
import json

BASE_URL = "http://localhost:8001"

def create_test_problem():
    print("Creating test problem...")
    
    # Login as admin or test user
    test_user = {
        "username": "testuser",
        "password": "testpass123"
    }
    
    try:
        # Login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", data=test_user)
        if login_response.status_code == 200:
            token_data = login_response.json()
            token = token_data.get("access_token")
            headers = {"Authorization": f"Bearer {token}"}
            print("✅ Authentication successful")
        else:
            print(f"❌ Login failed: {login_response.text}")
            return
        
        # Create a simple problem
        problem_data = {
            "title": "Simple Addition",
            "description": "Write a function that adds two numbers.\n\nFunction signature: def solution(a, b):\n    # Your code here\n    return result",
            "difficulty": "Easy",
            "sample_input": "2 3",
            "sample_output": "5"
        }
        
        create_response = requests.post(f"{BASE_URL}/api/problems/", json=problem_data, headers=headers)
        if create_response.status_code == 200:
            problem = create_response.json()
            print(f"✅ Problem created successfully: ID {problem['id']}")
            
            # Add test cases
            test_cases = [
                {"input": "2 3", "output": "5"},
                {"input": "10 20", "output": "30"},
                {"input": "0 0", "output": "0"},
                {"input": "-5 5", "output": "0"}
            ]
            
            for tc in test_cases:
                tc_data = {
                    "input": tc["input"],
                    "output": tc["output"],
                    "problem_id": problem["id"]
                }
                tc_response = requests.post(f"{BASE_URL}/api/problems/{problem['id']}/test-cases/", json=tc_data, headers=headers)
                if tc_response.status_code == 200:
                    print(f"✅ Test case added: {tc['input']} -> {tc['output']}")
                else:
                    print(f"❌ Failed to add test case: {tc_response.text}")
            
            return problem["id"]
        else:
            print(f"❌ Problem creation failed: {create_response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

if __name__ == "__main__":
    create_test_problem()