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
        # Start a transaction
        trans = conn.begin()
        try:
            print("🔍 Checking current database schema...")
            
            # Check if columns already exist to avoid errors
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'total_xp'
            """))
            
            users_has_xp = bool(result.fetchone())
            print(f"Users table has total_xp: {users_has_xp}")
            
            if not users_has_xp:
                print("➕ Adding total_xp column to users table...")
                conn.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN total_xp INTEGER DEFAULT 0
                """))
                print("✅ Added total_xp column to users table")
            else:
                print("ℹ️ total_xp column already exists in users table")
            
            # Check if xp_awarded column exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'submissions' AND column_name = 'xp_awarded'
            """))
            
            submissions_has_xp = bool(result.fetchone())
            print(f"Submissions table has xp_awarded: {submissions_has_xp}")
            
            if not submissions_has_xp:
                print("➕ Adding xp_awarded column to submissions table...")
                conn.execute(text("""
                    ALTER TABLE submissions 
                    ADD COLUMN xp_awarded INTEGER DEFAULT 0
                """))
                print("✅ Added xp_awarded column to submissions table")
            else:
                print("ℹ️ xp_awarded column already exists in submissions table")
            
            # Update existing users to have 0 XP if NULL (safe to run multiple times)
            print("🔄 Updating existing users with 0 XP...")
            result = conn.execute(text("""
                UPDATE users 
                SET total_xp = 0 
                WHERE total_xp IS NULL
            """))
            print(f"Updated {result.rowcount} users with default XP")
            
            # Update existing submissions to have 0 XP if NULL (safe to run multiple times)
            print("🔄 Updating existing submissions with 0 XP...")
            result = conn.execute(text("""
                UPDATE submissions 
                SET xp_awarded = 0 
                WHERE xp_awarded IS NULL
            """))
            print(f"Updated {result.rowcount} submissions with default XP")
            
            trans.commit()
            print("✅ XP fields migration completed successfully!")
            
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            trans.rollback()
            raise e

if __name__ == "__main__":
    migrate_xp_fields()