#!/usr/bin/env python3
"""
Snippets Feature Migration Verification Script.
Specifically checks if the code snippets migration was applied correctly.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def check_snippets_migration():
    """Check if snippets migration was applied."""
    try:
        import subprocess
        
        print("🔍 Checking snippets migration status...")
        
        # Get migration history
        result = subprocess.run(['python3', '-m', 'alembic', 'history'], 
                              capture_output=True, text=True)
        
        if result.returncode == 0:
            history = result.stdout
            
            # Look for snippets migration
            snippets_migrations = [line for line in history.split('\n') 
                                 if 'snippet' in line.lower() or 'code_snippet' in line.lower()]
            
            print("📋 Found snippets-related migrations:")
            for migration in snippets_migrations:
                print(f"   {migration}")
            
            # Check current migration
            current_result = subprocess.run(['python3', '-m', 'alembic', 'current'], 
                                          capture_output=True, text=True)
            
            if current_result.returncode == 0:
                current = current_result.stdout.strip()
                print(f"✅ Current migration: {current}")
                return len(snippets_migrations) > 0
            else:
                print(f"❌ Failed to get current migration: {current_result.stderr}")
                return False
        else:
            print(f"❌ Failed to get migration history: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Migration check failed: {e}")
        return False

def verify_snippets_tables():
    """Verify that all snippets tables exist."""
    try:
        from app.db.base import engine
        from sqlalchemy import text, inspect
        
        print("\n🔍 Verifying snippets tables...")
        
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        
        # Required tables for snippets feature
        required_snippets_tables = [
            'code_snippets',
            'snippet_usage', 
            'snippet_likes',
            'snippet_comments'
        ]
        
        missing_tables = []
        existing_tables_info = []
        
        for table in required_snippets_tables:
            if table in existing_tables:
                # Get column info
                columns = inspector.get_columns(table)
                column_names = [col['name'] for col in columns]
                existing_tables_info.append({
                    'table': table,
                    'columns': column_names,
                    'column_count': len(column_names)
                })
                print(f"✅ Table exists: {table} ({len(column_names)} columns)")
            else:
                missing_tables.append(table)
                print(f"❌ Missing table: {table}")
        
        if missing_tables:
            print(f"\n⚠️ Missing {len(missing_tables)} snippets tables:")
            for table in missing_tables:
                print(f"   - {table}")
            print("\n🔧 To fix: Run 'python3 -m alembic upgrade head'")
            return False, existing_tables_info
        else:
            print(f"\n✅ All {len(required_snippets_tables)} snippets tables exist!")
            return True, existing_tables_info
            
    except Exception as e:
        print(f"❌ Snippets table verification failed: {e}")
        return False, []

def test_snippets_api_imports():
    """Test if snippets API can be imported without errors."""
    try:
        print("\n🔍 Testing snippets API imports...")
        
        # Test model imports
        from app.db.models import CodeSnippet, SnippetUsage, SnippetLike, SnippetComment
        print("✅ Snippets models imported successfully")
        
        # Test API route imports
        from app.api.routes import snippets
        print("✅ Snippets API routes imported successfully")
        
        # Test if routes are registered
        from app.main import app
        routes = [route.path for route in app.routes]
        snippets_routes = [r for r in routes if '/snippets' in r]
        
        print(f"✅ Found {len(snippets_routes)} snippets API routes")
        
        # Show key routes
        key_routes = [
            '/api/snippets/public',
            '/api/snippets/languages/popular', 
            '/api/snippets/categories',
            '/api/snippets/templates'
        ]
        
        print("🔍 Checking key snippets endpoints:")
        for route in key_routes:
            if any(route in r for r in snippets_routes):
                print(f"   ✅ {route}")
            else:
                print(f"   ❌ {route} - NOT FOUND")
        
        return len(snippets_routes) > 0
        
    except Exception as e:
        print(f"❌ Snippets API import test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def check_snippets_data():
    """Check if snippets data exists and can be queried."""
    try:
        print("\n🔍 Testing snippets data access...")
        
        from app.db.base import SessionLocal
        from app.db.models import CodeSnippet, User
        
        db = SessionLocal()
        try:
            # Test basic query
            snippet_count = db.query(CodeSnippet).count()
            print(f"📊 Total code snippets: {snippet_count}")
            
            # Test template query
            template_count = db.query(CodeSnippet).filter(
                CodeSnippet.category == 'template'
            ).count()
            print(f"📊 Code templates: {template_count}")
            
            # Test public snippets query
            public_count = db.query(CodeSnippet).filter(
                CodeSnippet.is_public == True
            ).count()
            print(f"📊 Public snippets: {public_count}")
            
            # Test languages query
            languages = db.query(CodeSnippet.language).distinct().all()
            language_list = [lang[0] for lang in languages if lang[0]]
            print(f"📊 Available languages: {language_list}")
            
            return True
            
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Snippets data check failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_api_endpoints():
    """Test if the problematic API endpoints work."""
    try:
        print("\n🔍 Testing API endpoint functionality...")
        
        from app.db.base import SessionLocal
        from app.db.models import CodeSnippet
        from sqlalchemy import func
        
        db = SessionLocal()
        try:
            # Test languages/popular endpoint logic
            languages = db.query(
                CodeSnippet.language,
                func.count(CodeSnippet.id).label('count')
            ).filter(
                CodeSnippet.is_public == True
            ).group_by(
                CodeSnippet.language
            ).all()
            
            print(f"✅ Languages query works: {len(languages)} languages found")
            for lang, count in languages:
                print(f"   - {lang}: {count} snippets")
            
            # Test categories endpoint logic
            categories = db.query(
                CodeSnippet.category,
                func.count(CodeSnippet.id).label('count')
            ).filter(
                CodeSnippet.is_public == True,
                CodeSnippet.category.isnot(None)
            ).group_by(
                CodeSnippet.category
            ).all()
            
            print(f"✅ Categories query works: {len(categories)} categories found")
            for cat, count in categories:
                print(f"   - {cat}: {count} snippets")
            
            return True
            
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ API endpoint test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main verification function for snippets feature."""
    print("🔍 Snippets Feature Migration Verification")
    print("=" * 60)
    
    # Check migration status
    migration_ok = check_snippets_migration()
    
    # Verify tables exist
    tables_ok, table_info = verify_snippets_tables()
    
    # Test API imports
    imports_ok = test_snippets_api_imports()
    
    # Check data access
    data_ok = check_snippets_data()
    
    # Test API endpoints
    api_ok = test_api_endpoints()
    
    print("\n" + "=" * 60)
    print("📋 VERIFICATION SUMMARY:")
    print(f"   Migration Status: {'✅ PASS' if migration_ok else '❌ FAIL'}")
    print(f"   Tables Exist: {'✅ PASS' if tables_ok else '❌ FAIL'}")
    print(f"   API Imports: {'✅ PASS' if imports_ok else '❌ FAIL'}")
    print(f"   Data Access: {'✅ PASS' if data_ok else '❌ FAIL'}")
    print(f"   API Endpoints: {'✅ PASS' if api_ok else '❌ FAIL'}")
    
    all_passed = migration_ok and tables_ok and imports_ok and data_ok and api_ok
    
    if all_passed:
        print("\n🎉 SNIPPETS FEATURE VERIFICATION PASSED!")
        print("✅ All snippets functionality should be working")
        print("✅ API endpoints should return proper JSON responses")
        print("✅ Frontend console warnings should be resolved")
    else:
        print("\n❌ SNIPPETS FEATURE VERIFICATION FAILED!")
        print("\n🔧 Next steps to fix:")
        
        if not migration_ok or not tables_ok:
            print("   1. Run: python3 -m alembic upgrade head")
            
        if not data_ok:
            print("   2. Run: python3 init_production_db.py")
            
        if not imports_ok or not api_ok:
            print("   3. Check for import errors in logs")
            print("   4. Restart the application")
            
        print("   5. Run this verification script again")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)