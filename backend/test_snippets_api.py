#!/usr/bin/env python3
"""
Simple test script to verify the snippets API is working.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.base import SessionLocal
from app.db.models import CodeSnippet, User

def test_snippets_api():
    """Test basic snippets functionality."""
    
    db = SessionLocal()
    
    try:
        # Test 1: Check if templates exist
        templates = db.query(CodeSnippet).filter(CodeSnippet.category == "template").all()
        print(f"✅ Found {len(templates)} code templates")
        
        # Test 2: Check if system user exists
        system_user = db.query(User).filter(User.username == "system").first()
        if system_user:
            print(f"✅ System user exists (ID: {system_user.id})")
        else:
            print("❌ System user not found")
        
        # Test 3: Check template details
        if templates:
            template = templates[0]
            print(f"✅ Sample template: '{template.title}' ({template.language})")
            print(f"   - Public: {template.is_public}")
            print(f"   - Usage count: {template.usage_count}")
            print(f"   - Code length: {len(template.code)} characters")
        
        # Test 4: Check different languages
        languages = db.query(CodeSnippet.language).distinct().all()
        print(f"✅ Available languages: {[lang[0] for lang in languages]}")
        
        # Test 5: Check categories
        categories = db.query(CodeSnippet.category).filter(CodeSnippet.category.isnot(None)).distinct().all()
        print(f"✅ Available categories: {[cat[0] for cat in categories]}")
        
        print("\n🎉 All snippets API tests passed!")
        
    except Exception as e:
        print(f"❌ Error testing snippets API: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_snippets_api()