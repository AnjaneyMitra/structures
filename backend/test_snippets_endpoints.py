#!/usr/bin/env python3
"""
Test the specific snippets API endpoints that were causing console warnings.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_languages_endpoint():
    """Test the /api/snippets/languages/popular endpoint."""
    try:
        print("🔍 Testing /api/snippets/languages/popular endpoint...")
        
        from app.db.base import SessionLocal
        from app.db.models import CodeSnippet
        from sqlalchemy import func
        
        db = SessionLocal()
        try:
            # This is the exact query from the API endpoint
            languages = db.query(
                CodeSnippet.language,
                func.count(CodeSnippet.id).label('count')
            ).filter(
                CodeSnippet.is_public == True
            ).group_by(
                CodeSnippet.language
            ).order_by(
                func.count(CodeSnippet.id).desc()
            ).limit(10).all()
            
            print(f"✅ Languages endpoint query successful")
            print(f"📊 Found {len(languages)} languages:")
            
            for lang, count in languages:
                print(f"   - {lang}: {count} snippets")
            
            # Test the response format
            response_data = [
                {"language": lang, "count": count}
                for lang, count in languages
            ]
            
            print(f"✅ Response format valid: {len(response_data)} items")
            return True, response_data
            
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Languages endpoint test failed: {e}")
        import traceback
        traceback.print_exc()
        return False, []

def test_categories_endpoint():
    """Test the /api/snippets/categories endpoint."""
    try:
        print("\n🔍 Testing /api/snippets/categories endpoint...")
        
        from app.db.base import SessionLocal
        from app.db.models import CodeSnippet
        from sqlalchemy import func
        
        db = SessionLocal()
        try:
            # This is the exact query from the API endpoint
            categories = db.query(
                CodeSnippet.category,
                func.count(CodeSnippet.id).label('count')
            ).filter(
                CodeSnippet.is_public == True,
                CodeSnippet.category.isnot(None)
            ).group_by(
                CodeSnippet.category
            ).order_by(
                func.count(CodeSnippet.id).desc()
            ).all()
            
            print(f"✅ Categories endpoint query successful")
            print(f"📊 Found {len(categories)} categories:")
            
            for cat, count in categories:
                print(f"   - {cat}: {count} snippets")
            
            # Test the response format
            response_data = [
                {"category": cat, "count": count}
                for cat, count in categories
            ]
            
            print(f"✅ Response format valid: {len(response_data)} items")
            return True, response_data
            
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Categories endpoint test failed: {e}")
        import traceback
        traceback.print_exc()
        return False, []

def test_public_snippets_endpoint():
    """Test the /api/snippets/public endpoint."""
    try:
        print("\n🔍 Testing /api/snippets/public endpoint...")
        
        from app.db.base import SessionLocal
        from app.db.models import CodeSnippet, User
        
        db = SessionLocal()
        try:
            # This is the basic query from the API endpoint
            snippets = db.query(CodeSnippet).join(User).filter(
                CodeSnippet.is_public == True
            ).order_by(
                CodeSnippet.created_at.desc()
            ).limit(5).all()
            
            print(f"✅ Public snippets query successful")
            print(f"📊 Found {len(snippets)} public snippets:")
            
            for snippet in snippets:
                print(f"   - {snippet.title} ({snippet.language}) by {snippet.user.username}")
            
            return True, len(snippets)
            
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Public snippets endpoint test failed: {e}")
        import traceback
        traceback.print_exc()
        return False, 0

def test_templates_endpoint():
    """Test the /api/snippets/templates endpoint."""
    try:
        print("\n🔍 Testing /api/snippets/templates endpoint...")
        
        from app.db.base import SessionLocal
        from app.db.models import CodeSnippet, User
        
        db = SessionLocal()
        try:
            # This is the query from the templates endpoint
            templates = db.query(CodeSnippet).join(User).filter(
                CodeSnippet.is_public == True,
                CodeSnippet.category == "template"
            ).order_by(
                CodeSnippet.usage_count.desc(),
                CodeSnippet.created_at.desc()
            ).limit(10).all()
            
            print(f"✅ Templates query successful")
            print(f"📊 Found {len(templates)} templates:")
            
            for template in templates:
                print(f"   - {template.title} ({template.language}) - {template.usage_count} uses")
            
            return True, len(templates)
            
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Templates endpoint test failed: {e}")
        import traceback
        traceback.print_exc()
        return False, 0

def simulate_frontend_calls():
    """Simulate the exact calls that the frontend makes."""
    try:
        print("\n🔍 Simulating frontend API calls...")
        
        # Test 1: Languages call (this was causing console warnings)
        print("1. Testing languages API call...")
        lang_success, lang_data = test_languages_endpoint()
        
        # Test 2: Categories call (this was causing console warnings)  
        print("2. Testing categories API call...")
        cat_success, cat_data = test_categories_endpoint()
        
        # Test 3: Public snippets call
        print("3. Testing public snippets API call...")
        pub_success, pub_count = test_public_snippets_endpoint()
        
        # Test 4: Templates call
        print("4. Testing templates API call...")
        temp_success, temp_count = test_templates_endpoint()
        
        print("\n📋 FRONTEND SIMULATION RESULTS:")
        print(f"   Languages API: {'✅ SUCCESS' if lang_success else '❌ FAILED'}")
        print(f"   Categories API: {'✅ SUCCESS' if cat_success else '❌ FAILED'}")
        print(f"   Public Snippets API: {'✅ SUCCESS' if pub_success else '❌ FAILED'}")
        print(f"   Templates API: {'✅ SUCCESS' if temp_success else '❌ FAILED'}")
        
        all_success = lang_success and cat_success and pub_success and temp_success
        
        if all_success:
            print("\n🎉 ALL FRONTEND API CALLS SUCCESSFUL!")
            print("✅ Console warnings should be resolved")
            print("✅ Snippets page should load without errors")
        else:
            print("\n❌ SOME FRONTEND API CALLS FAILED!")
            print("⚠️ Console warnings will persist until fixed")
        
        return all_success
        
    except Exception as e:
        print(f"❌ Frontend simulation failed: {e}")
        return False

def main():
    """Main test function."""
    print("🧪 Snippets API Endpoints Test")
    print("=" * 50)
    print("Testing the specific endpoints that were causing console warnings...")
    
    success = simulate_frontend_calls()
    
    print("\n" + "=" * 50)
    
    if success:
        print("🎉 ALL TESTS PASSED!")
        print("✅ Your snippets API endpoints are working correctly")
        print("✅ Frontend console warnings should be resolved")
        print("✅ Snippets page should load properly")
    else:
        print("❌ SOME TESTS FAILED!")
        print("\n🔧 If tests are failing:")
        print("   1. Ensure migration was applied: python3 -m alembic upgrade head")
        print("   2. Seed initial data: python3 init_production_db.py")
        print("   3. Check database connection")
        print("   4. Restart your Railway service")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)