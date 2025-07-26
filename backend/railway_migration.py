#!/usr/bin/env python3
"""
Railway deployment migration script.
This should be run once after deploying to Railway to set up the hints tables.
"""

import os
import sys
from sqlalchemy import create_engine, text

def run_railway_migration():
    """Run the migration for Railway deployment."""
    try:
        print("🚀 Running Railway migration for hints system...")
        print("=" * 50)
        
        # Get database URL from environment
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            print("❌ DATABASE_URL environment variable not found")
            return False
        
        print(f"📊 Connecting to database...")
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            print("✅ Database connection successful")
            
            # Check if hints table exists
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_name = 'hints'
            """))
            
            if result.fetchone():
                print("✅ Hints table already exists")
            else:
                print("❌ Hints table not found - this suggests the main migration hasn't run")
                return False
            
            # Add new columns for contextual hints
            try:
                conn.execute(text("ALTER TABLE hints ADD COLUMN IF NOT EXISTS is_contextual BOOLEAN DEFAULT FALSE"))
                print("✅ Added is_contextual column")
            except Exception as e:
                print(f"⚠️ is_contextual column may already exist: {e}")
            
            try:
                conn.execute(text("ALTER TABLE hints ADD COLUMN IF NOT EXISTS user_code TEXT"))
                print("✅ Added user_code column")
            except Exception as e:
                print(f"⚠️ user_code column may already exist: {e}")
            
            try:
                conn.execute(text("ALTER TABLE hints ADD COLUMN IF NOT EXISTS language VARCHAR"))
                print("✅ Added language column")
            except Exception as e:
                print(f"⚠️ language column may already exist: {e}")
            
            conn.commit()
            
            # Verify Gemini API key
            gemini_key = os.getenv("GEMINI_API_KEY")
            if gemini_key:
                print("✅ Gemini API key is configured")
            else:
                print("❌ Gemini API key is missing - hints will use fallbacks")
            
            print("\n🎉 Railway migration completed successfully!")
            return True
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

if __name__ == "__main__":
    success = run_railway_migration()
    
    if success:
        print("\n✅ Ready for production!")
    else:
        print("\n❌ Migration failed - check logs above")
        sys.exit(1)