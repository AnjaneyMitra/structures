#!/usr/bin/env python3
"""
Startup script for production deployment.
This ensures database tables exist before starting the server.
"""

import os
import sys

def ensure_database_ready():
    """Ensure database is ready with all required tables."""
    try:
        print("🔄 Checking database status...")
        
        from app.db.base import Base, engine
        
        # Create all tables (this is safe - won't overwrite existing tables)
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables verified/created")
        
        # Quick verification that key tables exist
        from sqlalchemy import text
        with engine.connect() as conn:
            # Check forum tables
            try:
                result = conn.execute(text("SELECT COUNT(*) FROM forum_categories"))
                forum_count = result.scalar()
                print(f"✅ Forum categories table exists ({forum_count} records)")
            except Exception as e:
                print(f"⚠️ Forum tables issue: {e}")
            
            # Check snippet tables
            try:
                result = conn.execute(text("SELECT COUNT(*) FROM code_snippets"))
                snippet_count = result.scalar()
                print(f"✅ Code snippets table exists ({snippet_count} records)")
            except Exception as e:
                print(f"⚠️ Snippet tables issue: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        return False

def seed_initial_data():
    """Seed initial data if tables are empty."""
    try:
        from app.db.base import SessionLocal
        from app.db.models import ForumCategory, CodeSnippet, User
        
        db = SessionLocal()
        
        try:
            # Seed forum categories if empty
            if db.query(ForumCategory).count() == 0:
                print("🌱 Seeding forum categories...")
                categories = [
                    ForumCategory(name="General Discussion", description="General programming discussions", order=1),
                    ForumCategory(name="Problem Help", description="Get help with coding problems", order=2),
                    ForumCategory(name="Algorithm Explanations", description="Discuss algorithms", order=3),
                ]
                for cat in categories:
                    db.add(cat)
                db.commit()
                print(f"✅ Seeded {len(categories)} forum categories")
            
            # Create system user if doesn't exist
            system_user = db.query(User).filter(User.username == "system").first()
            if not system_user:
                system_user = User(
                    username="system",
                    email="system@app.com",
                    is_admin=True,
                    total_xp=0
                )
                db.add(system_user)
                db.commit()
                db.refresh(system_user)
                print("✅ Created system user")
            
            # Seed basic code templates if empty
            if db.query(CodeSnippet).count() == 0:
                print("🌱 Seeding code templates...")
                templates = [
                    CodeSnippet(
                        user_id=system_user.id,
                        title="Binary Search",
                        description="Binary search algorithm template",
                        code="def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1",
                        language="python",
                        category="template",
                        is_public=True
                    )
                ]
                for template in templates:
                    db.add(template)
                db.commit()
                print(f"✅ Seeded {len(templates)} code templates")
                
        finally:
            db.close()
            
    except Exception as e:
        print(f"⚠️ Seeding failed (non-critical): {e}")

if __name__ == "__main__":
    print("🚀 Starting production initialization...")
    
    # Ensure database is ready
    if ensure_database_ready():
        # Seed initial data
        seed_initial_data()
        print("✅ Production initialization completed!")
    else:
        print("❌ Database initialization failed!")
        sys.exit(1)