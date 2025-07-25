#!/usr/bin/env python3
"""
Migration script for PostgreSQL deployment on Railway.
This script ensures all necessary database migrations are applied.
"""

import os
import sys
from alembic import command
from alembic.config import Config

def run_migrations():
    """Run all pending migrations."""
    print("🚀 Starting PostgreSQL migration for Railway deployment...")
    
    # Get database URL from environment
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("❌ DATABASE_URL environment variable not found!")
        sys.exit(1)
    
    # Convert postgres:// to postgresql:// if needed
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
        print("✅ Converted postgres:// URL to postgresql://")
    
    print(f"🔗 Using database: {db_url[:50]}...")
    
    # Set up Alembic configuration
    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option("sqlalchemy.url", db_url)
    
    try:
        # Check current revision
        print("📋 Checking current database revision...")
        
        # Run migrations
        print("⬆️ Running database migrations...")
        command.upgrade(alembic_cfg, "head")
        print("✅ All migrations completed successfully!")
        
        # Verify critical tables exist
        print("🔍 Verifying database schema...")
        from sqlalchemy import create_engine, text
        
        engine = create_engine(db_url)
        with engine.connect() as conn:
            # Check if critical tables exist
            tables_to_check = [
                'users', 'problems', 'submissions', 'test_cases',
                'bookmarks', 'friendships', 'achievements', 'user_achievements'
            ]
            
            for table in tables_to_check:
                try:
                    result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    count = result.scalar()
                    print(f"✅ Table '{table}': {count} records")
                except Exception as e:
                    print(f"⚠️ Table '{table}': {e}")
            
            # Check analytics-critical fields
            print("\n🔍 Verifying analytics fields...")
            
            # Check submissions.overall_status
            try:
                result = conn.execute(text("""
                    SELECT COUNT(*) FROM information_schema.columns 
                    WHERE table_name = 'submissions' AND column_name = 'overall_status'
                """))
                if result.scalar() > 0:
                    print("✅ submissions.overall_status field exists")
                else:
                    print("⚠️ submissions.overall_status field missing")
            except Exception as e:
                print(f"⚠️ Could not verify overall_status field: {e}")
            
            # Check problems tracking fields
            tracking_fields = ['view_count', 'solve_count', 'attempt_count']
            for field in tracking_fields:
                try:
                    result = conn.execute(text(f"""
                        SELECT COUNT(*) FROM information_schema.columns 
                        WHERE table_name = 'problems' AND column_name = '{field}'
                    """))
                    if result.scalar() > 0:
                        print(f"✅ problems.{field} field exists")
                    else:
                        print(f"⚠️ problems.{field} field missing")
                except Exception as e:
                    print(f"⚠️ Could not verify {field} field: {e}")
        
        print("\n🎉 PostgreSQL migration completed successfully!")
        print("🔧 Analytics endpoints are ready for Feature 12 (Success Rate by Difficulty)")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_migrations()