#!/usr/bin/env python3
"""
Script to reset migration state and ensure analytics support works
This should be run on the production server to fix the migration issue
"""
import os
import sys
from sqlalchemy import create_engine, text, inspect, MetaData
from app.db.base import DATABASE_URL

def reset_migration_for_analytics():
    """Reset migration state and ensure analytics columns exist"""
    
    print("🚀 Resetting migration state for analytics support...")
    print(f"📍 Database URL: {DATABASE_URL[:50]}...")
    
    engine = create_engine(DATABASE_URL)
    
    try:
        with engine.connect() as conn:
            print("✅ Database connection successful")
            
            # First, let's check what we have
            inspector = inspect(conn)
            
            # Check if alembic_version table exists
            tables = inspector.get_table_names()
            if 'alembic_version' in tables:
                result = conn.execute(text("SELECT version_num FROM alembic_version"))
                current_version = result.fetchone()
                if current_version:
                    print(f"📋 Current migration version: {current_version[0]}")
                else:
                    print("📋 No migration version found")
            
            # Check problems table structure
            if 'problems' in tables:
                columns = inspector.get_columns('problems')
                column_names = [col['name'] for col in columns]
                print(f"📊 Problems table columns: {column_names}")
                
                # Required analytics columns
                required_columns = {
                    'view_count': 'INTEGER DEFAULT 0 NOT NULL',
                    'solve_count': 'INTEGER DEFAULT 0 NOT NULL', 
                    'attempt_count': 'INTEGER DEFAULT 0 NOT NULL'
                }
                
                # Add missing columns
                for col_name, col_def in required_columns.items():
                    if col_name not in column_names:
                        try:
                            conn.execute(text(f"ALTER TABLE problems ADD COLUMN {col_name} {col_def}"))
                            conn.commit()
                            print(f"✅ Added column: {col_name}")
                        except Exception as e:
                            print(f"⚠️  Column {col_name} might already exist: {e}")
                            conn.rollback()
                    else:
                        print(f"✅ Column {col_name} already exists")
                
                # Update any NULL values
                for col_name in required_columns.keys():
                    try:
                        result = conn.execute(text(f"UPDATE problems SET {col_name} = 0 WHERE {col_name} IS NULL"))
                        updated_rows = result.rowcount
                        if updated_rows > 0:
                            print(f"✅ Updated {updated_rows} NULL values in {col_name}")
                        conn.commit()
                    except Exception as e:
                        print(f"⚠️  Update {col_name}: {e}")
                        conn.rollback()
            
            # Check submissions table for overall_status
            if 'submissions' in tables:
                sub_columns = [col['name'] for col in inspector.get_columns('submissions')]
                if 'overall_status' not in sub_columns:
                    try:
                        conn.execute(text("ALTER TABLE submissions ADD COLUMN overall_status VARCHAR"))
                        conn.commit()
                        print("✅ Added overall_status column to submissions")
                    except Exception as e:
                        print(f"⚠️  overall_status column: {e}")
                        conn.rollback()
                else:
                    print("✅ overall_status column exists in submissions")
            
            # Now let's try to fix the migration state
            # Remove the problematic migration if it exists
            try:
                conn.execute(text("DELETE FROM alembic_version WHERE version_num = '7af9927e99b5'"))
                conn.commit()
                print("✅ Removed problematic migration version")
            except Exception as e:
                print(f"⚠️  Migration cleanup: {e}")
                conn.rollback()
            
            # Set to a known good state
            try:
                conn.execute(text("DELETE FROM alembic_version"))
                conn.execute(text("INSERT INTO alembic_version (version_num) VALUES ('919ddaf70e77')"))
                conn.commit()
                print("✅ Reset migration state to known good version")
            except Exception as e:
                print(f"⚠️  Migration state reset: {e}")
                conn.rollback()
            
            print("\n🎉 Analytics migration fix completed!")
            print("📝 You can now run: alembic upgrade head")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    reset_migration_for_analytics()