#!/usr/bin/env python3
"""
Script to initialize the friendship table if it doesn't exist.
This can be run manually or as part of deployment.
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.db.base import Base, engine
from app.db.models import Friendship, User

def init_friendship_table():
    """Initialize the friendship table and ensure it exists."""
    try:
        print("Checking database connection...")
        
        # Test basic connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✓ Database connection successful")
        
        print("Checking if friendship table exists...")
        
        # Check if friendship table exists
        with engine.connect() as conn:
            try:
                result = conn.execute(text("SELECT COUNT(*) FROM friendships"))
                count = result.scalar()
                print(f"✓ Friendship table exists with {count} records")
                return True
            except Exception as e:
                print(f"✗ Friendship table doesn't exist: {e}")
                
        print("Creating friendship table...")
        
        # Create the table
        Base.metadata.create_all(bind=engine, tables=[Friendship.__table__])
        
        # Verify it was created
        with engine.connect() as conn:
            result = conn.execute(text("SELECT COUNT(*) FROM friendships"))
            count = result.scalar()
            print(f"✓ Friendship table created successfully with {count} records")
            
        return True
        
    except Exception as e:
        print(f"✗ Error initializing friendship table: {e}")
        import traceback
        traceback.print_exc()
        return False

def check_users_table():
    """Check if users table exists and has data."""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT COUNT(*) FROM users"))
            count = result.scalar()
            print(f"✓ Users table exists with {count} users")
            
            # Show sample users
            result = conn.execute(text("SELECT id, username FROM users LIMIT 5"))
            users = result.fetchall()
            print("Sample users:")
            for user in users:
                print(f"  - ID: {user[0]}, Username: {user[1]}")
                
        return True
    except Exception as e:
        print(f"✗ Error checking users table: {e}")
        return False

if __name__ == "__main__":
    print("=== Friendship Table Initialization ===")
    
    # Check users table first
    if not check_users_table():
        print("Users table check failed")
        sys.exit(1)
    
    # Initialize friendship table
    if init_friendship_table():
        print("✓ Friendship system initialization completed successfully")
    else:
        print("✗ Friendship system initialization failed")
        sys.exit(1)