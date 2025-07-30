#!/usr/bin/env python3
"""
Production database initialization script.
This script ensures all tables exist and initial data is seeded.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def init_database():
    """Initialize database with all tables and seed data."""
    try:
        print("🔄 Initializing production database...")
        
        # Import after path setup
        from app.db.base import Base, engine, SessionLocal
        from app.db.models import (
            User, Problem, Submission, Room, TestCase, Bookmark, Friendship,
            Achievement, UserAchievement, Challenge, ChallengeResult,
            LeaderboardEntry, Hint, UserHint,
            ForumCategory, ForumThread, ForumReply, ForumVote,
            CodeSnippet, SnippetUsage, SnippetLike, SnippetComment
        )
        
        # Create all tables
        print("📋 Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ All tables created successfully")
        
        # Check if forum categories exist
        db = SessionLocal()
        try:
            category_count = db.query(ForumCategory).count()
            if category_count == 0:
                print("🌱 Seeding forum categories...")
                categories = [
                    ForumCategory(name="General Discussion", description="General programming and algorithm discussions", order=1),
                    ForumCategory(name="Problem Help", description="Get help with specific coding problems", order=2),
                    ForumCategory(name="Algorithm Explanations", description="Discuss and explain different algorithms and approaches", order=3),
                    ForumCategory(name="Code Review", description="Share your solutions for feedback and review", order=4),
                    ForumCategory(name="Study Groups", description="Organize and join study groups", order=5),
                    ForumCategory(name="Career & Interviews", description="Discuss technical interviews and career advice", order=6),
                    ForumCategory(name="Site Feedback", description="Suggestions and feedback about the platform", order=7)
                ]
                for category in categories:
                    db.add(category)
                db.commit()
                print(f"✅ Created {len(categories)} forum categories")
            else:
                print(f"✅ Forum categories already exist ({category_count} found)")
            
            # Check if code snippets exist
            snippet_count = db.query(CodeSnippet).count()
            if snippet_count == 0:
                print("🌱 Seeding code templates...")
                
                # Get or create system user
                system_user = db.query(User).filter(User.username == "system").first()
                if not system_user:
                    system_user = User(
                        username="system",
                        email="system@dsa-app.com",
                        is_admin=True,
                        total_xp=0
                    )
                    db.add(system_user)
                    db.commit()
                    db.refresh(system_user)
                
                # Create basic templates
                templates = [
                    CodeSnippet(
                        user_id=system_user.id,
                        title="Binary Search Template",
                        description="Standard binary search implementation template",
                        code="""def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1  # Target not found""",
                        language="python",
                        category="template",
                        tags="binary-search,algorithm,template",
                        is_public=True
                    ),
                    CodeSnippet(
                        user_id=system_user.id,
                        title="Two Pointers Template",
                        description="Two pointers technique template",
                        code="""def two_pointers(arr, target):
    left, right = 0, len(arr) - 1
    
    while left < right:
        current_sum = arr[left] + arr[right]
        
        if current_sum == target:
            return [left, right]
        elif current_sum < target:
            left += 1
        else:
            right -= 1
    
    return []  # No solution found""",
                        language="python",
                        category="template",
                        tags="two-pointers,array,template",
                        is_public=True
                    )
                ]
                
                for template in templates:
                    db.add(template)
                db.commit()
                print(f"✅ Created {len(templates)} code templates")
            else:
                print(f"✅ Code snippets already exist ({snippet_count} found)")
                
        finally:
            db.close()
        
        print("🎉 Database initialization completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def verify_api_routes():
    """Verify that API routes are properly registered."""
    try:
        print("\n🔍 Verifying API routes...")
        
        from app.main import app
        
        # Get all routes
        routes = []
        for route in app.routes:
            if hasattr(route, 'path') and hasattr(route, 'methods'):
                for method in route.methods:
                    if method != 'HEAD':  # Skip HEAD methods
                        routes.append(f"{method} {route.path}")
        
        # Filter for our new routes
        snippet_routes = [r for r in routes if '/snippets' in r]
        forum_routes = [r for r in routes if '/forums' in r]
        
        print(f"✅ Found {len(snippet_routes)} snippets API routes")
        print(f"✅ Found {len(forum_routes)} forums API routes")
        
        if snippet_routes:
            print("Key snippets routes:")
            key_routes = [r for r in snippet_routes if any(x in r for x in ['GET /api/snippets/public', 'GET /api/snippets/languages', 'GET /api/snippets/categories'])]
            for route in key_routes:
                print(f"  - {route}")
        
        if forum_routes:
            print("Key forum routes:")
            key_routes = [r for r in forum_routes if 'GET /api/forums/categories' in r]
            for route in key_routes:
                print(f"  - {route}")
        
        return len(snippet_routes) > 0 and len(forum_routes) > 0
        
    except Exception as e:
        print(f"❌ Route verification failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚀 Production Database Initialization")
    print("=" * 50)
    
    # Initialize database
    db_success = init_database()
    
    # Verify routes
    routes_success = verify_api_routes()
    
    print("\n" + "=" * 50)
    if db_success and routes_success:
        print("🎉 Production initialization completed successfully!")
        print("\n✅ Your API endpoints should now be working:")
        print("   - /api/forums/categories")
        print("   - /api/snippets/public")
        print("   - /api/snippets/languages/popular")
        print("   - /api/snippets/categories")
    else:
        print("❌ Some initialization steps failed.")
        print("\n🔧 Troubleshooting steps:")
        print("   1. Check Railway deployment logs")
        print("   2. Verify environment variables are set")
        print("   3. Check database connection")
        print("   4. Run this script on Railway: python init_production_db.py")