#!/usr/bin/env python3
"""
Script to fix migration state issues between local and production environments
"""
import os
import sys
from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, text, inspect
from app.db.base import DATABASE_URL

def fix_migration_state():
    """Fix migration state and ensure database is properly set up for analytics"""
    
    print("🔧 Fixing migration state for analytics support...")
    
    # Create engine
    engine = create_engine(DATABASE_URL)
    
    try:
        with engine.connect() as conn:
            # Check current database state
            inspector = inspect(conn)
            tables = inspector.get_table_names()
            print(f"📊 Found {len(tables)} tables in database")
            
            if 'problems' in tables:
                columns = [col['name'] for col in inspector.get_columns('problems')]
                print(f"📋 Problems table columns: {columns}")
                
                # Check if analytics columns exist
                analytics_columns = ['view_count', 'solve_count', 'attempt_count']
                missing_columns = [col for col in analytics_columns if col not in columns]
                
                if missing_columns:
                    print(f"⚠️  Missing analytics columns: {missing_columns}")
                    
                    # Add missing columns with proper defaults
                    for col in missing_columns:
                        try:
                            conn.execute(text(f"ALTER TABLE problems ADD COLUMN {col} INTEGER DEFAULT 0 NOT NULL"))
                            conn.commit()
                            print(f"✅ Added column: {col}")
                        except Exception as e:
                            print(f"❌ Failed to add {col}: {e}")
                            conn.rollback()
                else:
                    print("✅ All analytics columns exist")
                
                # Ensure no NULL values exist
                try:
                    for col in analytics_columns:
                        if col in columns:
                            conn.execute(text(f"UPDATE problems SET {col} = COALESCE({col}, 0)"))
                    conn.commit()
                    print("✅ Updated NULL values to 0")
                except Exception as e:
                    print(f"⚠️  Update warning: {e}")
                    conn.rollback()
            
            # Check submissions table for overall_status column
            if 'submissions' in tables:
                sub_columns = [col['name'] for col in inspector.get_columns('submissions')]
                if 'overall_status' not in sub_columns:
                    print("⚠️  Missing overall_status column in submissions")
                    try:
                        conn.execute(text("ALTER TABLE submissions ADD COLUMN overall_status VARCHAR"))
                        conn.commit()
                        print("✅ Added overall_status column")
                    except Exception as e:
                        print(f"❌ Failed to add overall_status: {e}")
                        conn.rollback()
                else:
                    print("✅ overall_status column exists")
    
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return False
    
    # Now try to mark the migration as applied
    try:
        alembic_cfg = Config("alembic.ini")
        
        # Check current migration state
        print("\n🔍 Checking migration state...")
        
        # Try to stamp the database with the latest migration
        try:
            command.stamp(alembic_cfg, "head")
            print("✅ Migration state updated to head")
        except Exception as e:
            print(f"⚠️  Migration stamp warning: {e}")
    
    except Exception as e:
        print(f"❌ Alembic error: {e}")
    
    print("\n✅ Migration fix completed!")
    return True

if __name__ == "__main__":
    fix_migration_state()