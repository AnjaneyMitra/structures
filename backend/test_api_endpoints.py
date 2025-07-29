#!/usr/bin/env python3
"""
Test script to verify API endpoints are working.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_imports():
    """Test if all modules can be imported."""
    try:
        print("Testing imports...")
        
        # Test snippets import
        from app.api.routes import snippets
        print("✅ Snippets module imported successfully")
        
        # Test forums import
        from app.api.routes import forums
        print("✅ Forums module imported successfully")
        
        # Test main app
        from app.main import app
        print("✅ Main app imported successfully")
        
        # Check if routes are registered
        routes = [route.path for route in app.routes]
        snippets_routes = [r for r in routes if '/snippets' in r]
        forums_routes = [r for r in routes if '/forums' in r]
        
        print(f"✅ Found {len(snippets_routes)} snippets routes")
        print(f"✅ Found {len(forums_routes)} forums routes")
        
        if snippets_routes:
            print("Snippets routes:")
            for route in snippets_routes[:5]:  # Show first 5
                print(f"  - {route}")
        
        if forums_routes:
            print("Forums routes:")
            for route in forums_routes[:5]:  # Show first 5
                print(f"  - {route}")
                
        return True
        
    except Exception as e:
        print(f"❌ Import error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_database():
    """Test if database tables exist."""
    try:
        print("\nTesting database...")
        
        from app.db.base import engine
        from sqlalchemy import text
        
        with engine.connect() as conn:
            # Check if snippets tables exist
            result = conn.execute(text("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name LIKE '%snippet%'
            """))
            snippet_tables = [row[0] for row in result.fetchall()]
            
            # Check if forum tables exist
            result = conn.execute(text("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name LIKE '%forum%'
            """))
            forum_tables = [row[0] for row in result.fetchall()]
            
            print(f"✅ Found snippet tables: {snippet_tables}")
            print(f"✅ Found forum tables: {forum_tables}")
            
            if not snippet_tables:
                print("❌ No snippet tables found - migration may not be applied")
                return False
                
            if not forum_tables:
                print("❌ No forum tables found - migration may not be applied")
                return False
                
            return True
            
    except Exception as e:
        print(f"❌ Database error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🔍 Testing API Endpoints and Database")
    print("=" * 50)
    
    imports_ok = test_imports()
    db_ok = test_database()
    
    print("\n" + "=" * 50)
    if imports_ok and db_ok:
        print("🎉 All tests passed! API should be working.")
    else:
        print("❌ Some tests failed. Check the errors above.")
        
    print("\n💡 If tests pass but API still doesn't work in production:")
    print("   1. Check Railway deployment logs")
    print("   2. Verify database migration was applied")
    print("   3. Check environment variables")
    print("   4. Test API endpoints directly")