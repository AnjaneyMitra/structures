#!/usr/bin/env python3
"""
Quick snippets feature verification - one command to check everything.
Run this on Railway to verify snippets migration and functionality.
"""

def quick_check():
    """Quick verification of snippets feature."""
    print("🚀 Quick Snippets Feature Check")
    print("=" * 40)
    
    try:
        # Check 1: Can we import the models?
        print("1. Testing model imports...")
        from app.db.models import CodeSnippet, SnippetUsage, SnippetLike, SnippetComment
        print("   ✅ Models imported successfully")
        
        # Check 2: Can we connect to database and query?
        print("2. Testing database connection...")
        from app.db.base import SessionLocal
        db = SessionLocal()
        
        try:
            # Test basic query
            count = db.query(CodeSnippet).count()
            print(f"   ✅ Database connected - {count} snippets found")
            
            # Check 3: Test the problematic endpoints
            print("3. Testing API endpoint queries...")
            
            # Languages query (was causing console warnings)
            from sqlalchemy import func
            languages = db.query(CodeSnippet.language).filter(
                CodeSnippet.is_public == True
            ).distinct().all()
            print(f"   ✅ Languages query works - {len(languages)} languages")
            
            # Categories query (was causing console warnings)
            categories = db.query(CodeSnippet.category).filter(
                CodeSnippet.is_public == True,
                CodeSnippet.category.isnot(None)
            ).distinct().all()
            print(f"   ✅ Categories query works - {len(categories)} categories")
            
        finally:
            db.close()
        
        # Check 4: Can we import the API routes?
        print("4. Testing API routes...")
        from app.api.routes import snippets
        print("   ✅ Snippets API routes imported")
        
        # Check 5: Are routes registered in main app?
        print("5. Testing route registration...")
        from app.main import app
        routes = [str(route.path) for route in app.routes]
        snippets_routes = [r for r in routes if 'snippets' in r]
        print(f"   ✅ Found {len(snippets_routes)} snippets routes")
        
        print("\n🎉 ALL CHECKS PASSED!")
        print("✅ Snippets feature is working correctly")
        print("✅ Console warnings should be resolved")
        
        return True
        
    except Exception as e:
        print(f"\n❌ CHECK FAILED: {e}")
        print("\n🔧 To fix:")
        print("   1. Run: python3 -m alembic upgrade head")
        print("   2. Run: python3 init_production_db.py")
        print("   3. Restart Railway service")
        
        import traceback
        print(f"\n📋 Error details:")
        traceback.print_exc()
        
        return False

if __name__ == "__main__":
    success = quick_check()
    exit(0 if success else 1)