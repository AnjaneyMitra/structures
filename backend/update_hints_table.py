#!/usr/bin/env python3
"""
Migration script to add new columns to the hints table for contextual hints.
"""

import os
import sys
from sqlalchemy import create_engine, text

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.db.base import engine

def update_hints_table():
    """Add new columns to the hints table for contextual hints."""
    try:
        print("Updating hints table with new columns...")
        
        with engine.connect() as conn:
            # Add new columns
            try:
                conn.execute(text("ALTER TABLE hints ADD COLUMN is_contextual BOOLEAN DEFAULT FALSE"))
                print("✅ Added is_contextual column")
            except Exception as e:
                print(f"⚠️ is_contextual column may already exist: {e}")
            
            try:
                conn.execute(text("ALTER TABLE hints ADD COLUMN user_code TEXT"))
                print("✅ Added user_code column")
            except Exception as e:
                print(f"⚠️ user_code column may already exist: {e}")
            
            try:
                conn.execute(text("ALTER TABLE hints ADD COLUMN language VARCHAR"))
                print("✅ Added language column")
            except Exception as e:
                print(f"⚠️ language column may already exist: {e}")
            
            conn.commit()
        
        print("\n🎉 Hints table updated successfully!")
        print("Contextual hints are now supported!")
        
    except Exception as e:
        print(f"❌ Error updating hints table: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🔧 Updating hints table for contextual hints...")
    print("=" * 50)
    
    success = update_hints_table()
    
    if success:
        print("\n✅ Migration completed successfully!")
    else:
        print("\n❌ Migration failed!")
        sys.exit(1)