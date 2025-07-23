#!/usr/bin/env python3
"""
Deployment setup script to ensure database tables are properly created.
This should be run after deployment to ensure all tables exist.
"""

import os
import sys
import requests
from sqlalchemy import create_engine, text

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def check_api_health():
    """Check if the API is running."""
    try:
        response = requests.get("https://structures-production.up.railway.app/health", timeout=10)
        if response.status_code == 200:
            print("✓ API is running")
            return True
        else:
            print(f"✗ API health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ API health check failed: {e}")
        return False

def check_friends_health():
    """Check friends API health."""
    try:
        response = requests.get("https://structures-production.up.railway.app/api/friends/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Friends API status: {data.get('status')}")
            print(f"  - Users: {data.get('user_count', 0)}")
            print(f"  - Friendships: {data.get('friendship_count', 0)}")
            print(f"  - Friendship table exists: {data.get('friendship_table_exists', False)}")
            return data.get('friendship_table_exists', False)
        else:
            print(f"✗ Friends health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Friends health check failed: {e}")
        return False

def init_friendship_table():
    """Initialize the friendship table."""
    try:
        response = requests.post("https://structures-production.up.railway.app/api/admin/init-friendship-table", timeout=30)
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Friendship table initialization: {data.get('message')}")
            return True
        else:
            print(f"✗ Friendship table initialization failed: {response.status_code}")
            if response.text:
                print(f"  Response: {response.text}")
            return False
    except Exception as e:
        print(f"✗ Friendship table initialization failed: {e}")
        return False

def main():
    """Main deployment setup function."""
    print("=== Deployment Setup ===")
    
    # Check API health
    if not check_api_health():
        print("API is not running. Deployment setup cannot continue.")
        sys.exit(1)
    
    # Check friends API health
    friendship_table_exists = check_friends_health()
    
    # Initialize friendship table if needed
    if not friendship_table_exists:
        print("Friendship table doesn't exist. Initializing...")
        if init_friendship_table():
            print("✓ Friendship table initialized successfully")
        else:
            print("✗ Failed to initialize friendship table")
            sys.exit(1)
    else:
        print("✓ Friendship table already exists")
    
    # Final health check
    print("\n=== Final Health Check ===")
    if check_friends_health():
        print("✓ Deployment setup completed successfully")
    else:
        print("✗ Deployment setup completed with issues")
        sys.exit(1)

if __name__ == "__main__":
    main()