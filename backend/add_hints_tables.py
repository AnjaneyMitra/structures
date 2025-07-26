#!/usr/bin/env python3
"""
Migration script to add hints tables to the database.
Run this script to add the Hint and UserHint tables.
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.db.base import Base, engine
from app.db.models import Hint, UserHint

def create_hints_tables():
    """Create the hints tables if they don't exist."""
    try:
        print("Creating hints tables...")
        
        # Create the tables
        Base.metadata.create_all(bind=engine, tables=[Hint.__table__, UserHint.__table__])
        
        print("✅ Hints tables created successfully!")
        
        # Verify the tables were created
        with engine.connect() as conn:
            # Check if hints table exists
            result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='hints'"))
            if result.fetchone():
                print("✅ 'hints' table verified")
            else:
                print("❌ 'hints' table not found")
            
            # Check if user_hints table exists
            result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='user_hints'"))
            if result.fetchone():
                print("✅ 'user_hints' table verified")
            else:
                print("❌ 'user_hints' table not found")
                
        print("\n🎉 Hints system is ready to use!")
        print("You can now:")
        print("- Generate AI hints for problems automatically")
        print("- Allow users to reveal hints with XP penalties")
        print("- Track hint usage per user")
        
    except Exception as e:
        print(f"❌ Error creating hints tables: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🔧 Setting up hints system...")
    print("=" * 50)
    
    success = create_hints_tables()
    
    if success:
        print("\n✅ Migration completed successfully!")
    else:
        print("\n❌ Migration failed!")
        sys.exit(1)