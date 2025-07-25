#!/usr/bin/env python3
"""
Emergency migration fix for Railway - handles multiple heads issue
"""
import os
from sqlalchemy import create_engine, text, inspect
from app.db.base import DATABASE_URL

def emergency_fix():
    """Emergency fix for Railway deployment"""
    print("🚨 Emergency migration fix for Railway...")
    
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # Clear migration state
        try:
            conn.execute(text("DELETE FROM alembic_version"))
            conn.commit()
            print("✅ Cleared migration state")
        except:
            pass
        
        # Ensure required tables and columns exist
        inspector = inspect(conn)
        tables = inspector.get_table_names()
        
        # Check problems table
        if 'problems' in tables:
            columns = [col['name'] for col in inspector.get_columns('problems')]
            
            # Add missing analytics columns
            required_columns = {
                'view_count': 'INTEGER DEFAULT 0 NOT NULL',
                'solve_count': 'INTEGER DEFAULT 0 NOT NULL', 
                'attempt_count': 'INTEGER DEFAULT 0 NOT NULL'
            }
            
            for col_name, col_def in required_columns.items():
                if col_name not in columns:
                    try:
                        conn.execute(text(f"ALTER TABLE problems ADD COLUMN {col_name} {col_def}"))
                        print(f"✅ Added column: {col_name}")
                    except Exception as e:
                        print(f"⚠️  Column {col_name}: {e}")
            
            conn.commit()
        
        # Check submissions table
        if 'submissions' in tables:
            sub_columns = [col['name'] for col in inspector.get_columns('submissions')]
            if 'overall_status' not in sub_columns:
                try:
                    conn.execute(text("ALTER TABLE submissions ADD COLUMN overall_status VARCHAR"))
                    print("✅ Added overall_status column")
                except Exception as e:
                    print(f"⚠️  overall_status: {e}")
                conn.commit()
        
        # Set clean migration state
        try:
            conn.execute(text("INSERT INTO alembic_version (version_num) VALUES ('7a3dbbdeb512')"))
            conn.commit()
            print("✅ Set migration state to 7a3dbbdeb512")
        except Exception as e:
            print(f"⚠️  Migration state: {e}")
    
    print("🎉 Emergency fix completed!")

if __name__ == "__main__":
    emergency_fix()