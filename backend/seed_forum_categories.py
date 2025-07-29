#!/usr/bin/env python3
"""
Script to seed the database with initial forum categories.
Run this after the forum tables are created.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.base import SessionLocal, engine
from app.db.models import ForumCategory, Base

def seed_categories():
    """Create initial forum categories."""
    
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if categories already exist
        existing_count = db.query(ForumCategory).count()
        if existing_count > 0:
            print(f"Forum categories already exist ({existing_count} found). Skipping seed.")
            return
        
        # Default categories
        categories = [
            {
                "name": "General Discussion",
                "description": "General programming and algorithm discussions",
                "order": 1
            },
            {
                "name": "Problem Help",
                "description": "Get help with specific coding problems",
                "order": 2
            },
            {
                "name": "Algorithm Explanations",
                "description": "Discuss and explain different algorithms and approaches",
                "order": 3
            },
            {
                "name": "Code Review",
                "description": "Share your solutions for feedback and review",
                "order": 4
            },
            {
                "name": "Study Groups",
                "description": "Organize and join study groups",
                "order": 5
            },
            {
                "name": "Career & Interviews",
                "description": "Discuss technical interviews and career advice",
                "order": 6
            },
            {
                "name": "Site Feedback",
                "description": "Suggestions and feedback about the platform",
                "order": 7
            }
        ]
        
        # Create categories
        for cat_data in categories:
            category = ForumCategory(**cat_data)
            db.add(category)
        
        db.commit()
        print(f"✅ Successfully created {len(categories)} forum categories")
        
        # List created categories
        for category in db.query(ForumCategory).order_by(ForumCategory.order).all():
            print(f"  - {category.name}: {category.description}")
            
    except Exception as e:
        print(f"❌ Error seeding categories: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_categories()