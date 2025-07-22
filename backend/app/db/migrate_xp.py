"""
Migration script to add XP fields to existing database.
Run this script to update existing users with XP fields.
"""

from sqlalchemy import text
from .base import engine
import os

def migrate_xp_fields():
    """Add XP fields to existing database tables."""
    
    with engine.connect() as conn:
        try:
            # Check if columns already exist to avoid errors
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'total_xp'
            """))
            
            if not result.fetchone():
                # Add total_xp column to users table
                conn.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN total_xp INTEGER DEFAULT 0
                """))
                print("✅ Added total_xp column to users table")
            
            # Check if xp_awarded column exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'submissions' AND column_name = 'xp_awarded'
            """))
            
            if not result.fetchone():
                # Add xp_awarded column to submissions table
                conn.execute(text("""
                    ALTER TABLE submissions 
                    ADD COLUMN xp_awarded INTEGER DEFAULT 0
                """))
                print("✅ Added xp_awarded column to submissions table")
            
            # Update existing users to have 0 XP if NULL
            conn.execute(text("""
                UPDATE users 
                SET total_xp = 0 
                WHERE total_xp IS NULL
            """))
            
            # Update existing submissions to have 0 XP if NULL
            conn.execute(text("""
                UPDATE submissions 
                SET xp_awarded = 0 
                WHERE xp_awarded IS NULL
            """))
            
            conn.commit()
            print("✅ XP fields migration completed successfully!")
            
        except Exception as e:
            print(f"⚠️ Migration warning (may be normal if already applied): {e}")
            conn.rollback()

if __name__ == "__main__":
    migrate_xp_fields()