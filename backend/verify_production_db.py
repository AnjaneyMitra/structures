#!/usr/bin/env python3
"""
Production database verification script.
Verifies that all required tables exist and migrations are applied.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def check_migration_status():
    """Check current Alembic migration status."""
    try:
        import subprocess
        
        print("🔍 Checking Alembic migration status...")
        
        # Get current migration
        result = subprocess.run(['python3', '-m', 'alembic', 'current'], 
                              capture_output=True, text=True)
        
        if result.returncode == 0:
            current_migration = result.stdout.strip()
            print(f"✅ Current migration: {current_migration}")
            
            # Check if we're at head
            head_result = subprocess.run(['python3', '-m', 'alembic', 'show', 'head'], 
                                       capture_output=True, text=True)
            
            if head_result.returncode == 0:
                head_migration = head_result.stdout.strip().split('\n')[0]
                if current_migration in head_migration:
                    print("✅ Database is up to date with latest migrations")
                    return True
                else:
                    print("⚠️ Database is not at the latest migration")
                    print(f"Current: {current_migration}")
                    print(f"Latest: {head_migration}")
                    return False
        else:
            print(f"❌ Failed to check migration status: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Migration status check failed: {e}")
        return False

def verify_tables():
    """Verify that all required tables exist."""
    try:
        from app.db.base import engine
        from sqlalchemy import text, inspect
        
        print("🔍 Verifying database tables...")
        
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        
        # Required tables for new features
        required_tables = [
            'forum_categories',
            'forum_threads', 
            'forum_replies',
            'forum_votes',
            'code_snippets',
            'snippet_usage',
            'snippet_likes',
            'snippet_comments'
        ]
        
        missing_tables = []
        existing_new_tables = []
        
        for table in required_tables:
            if table in existing_tables:
                existing_new_tables.append(table)
                print(f"✅ Table exists: {table}")
            else:
                missing_tables.append(table)
                print(f"❌ Missing table: {table}")
        
        if missing_tables:
            print(f"\n⚠️ Missing {len(missing_tables)} required tables:")
            for table in missing_tables:
                print(f"   - {table}")
            print("\n🔧 To fix: Run 'python3 -m alembic upgrade head'")
            return False
        else:
            print(f"\n✅ All {len(required_tables)} required tables exist!")
            return True
            
    except Exception as e:
        print(f"❌ Table verification failed: {e}")
        return False

def check_data():
    """Check if initial data exists."""
    try:
        from app.db.base import SessionLocal
        from app.db.models import ForumCategory, CodeSnippet
        
        print("🔍 Checking initial data...")
        
        db = SessionLocal()
        try:
            # Check forum categories
            category_count = db.query(ForumCategory).count()
            print(f"📊 Forum categories: {category_count}")
            
            # Check code snippets
            snippet_count = db.query(CodeSnippet).count()
            print(f"📊 Code snippets: {snippet_count}")
            
            if category_count == 0:
                print("⚠️ No forum categories found - run seeding script")
            
            if snippet_count == 0:
                print("⚠️ No code snippets found - run seeding script")
                
            return category_count > 0 or snippet_count > 0
            
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Data check failed: {e}")
        return False

def main():
    """Main verification function."""
    print("🔍 Production Database Verification")
    print("=" * 50)
    
    # Check migration status
    migration_ok = check_migration_status()
    print()
    
    # Verify tables exist
    tables_ok = verify_tables()
    print()
    
    # Check initial data
    data_ok = check_data()
    print()
    
    print("=" * 50)
    
    if migration_ok and tables_ok:
        print("🎉 Database verification PASSED!")
        print("✅ All migrations applied and tables exist")
        
        if not data_ok:
            print("💡 Consider running: python3 init_production_db.py")
            
        return True
    else:
        print("❌ Database verification FAILED!")
        print("\n🔧 To fix the issues:")
        
        if not migration_ok:
            print("   1. Run: python3 -m alembic upgrade head")
            
        if not tables_ok:
            print("   2. Verify migration files exist")
            print("   3. Check database connection")
            
        print("   4. Run this script again to verify")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)