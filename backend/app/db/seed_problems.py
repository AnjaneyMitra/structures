import json
import sys
import os
from sqlalchemy.exc import SQLAlchemyError
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db.base import engine, SessionLocal
from db.models import Problem, Base, TestCase

SEED_FILE = os.path.join(os.path.dirname(__file__), 'problems_seed.json')

def seed_problems():
    print(f"Starting database seeding process...")
    print(f"Using seed file: {SEED_FILE}")
    
    if not os.path.exists(SEED_FILE):
        raise FileNotFoundError(f"Seed file not found: {SEED_FILE}")
    
    try:
        # Create tables if they don't exist
        print("Creating database tables if they don't exist...")
        Base.metadata.create_all(bind=engine)
        
        # Read seed data
        print("Reading seed data...")
        with open(SEED_FILE, 'r') as f:
            problems = json.load(f)
        
        print(f"Found {len(problems)} problems in seed file")
        
        # Start database session
        session = SessionLocal()
        try:
            # Count existing problems
            existing_count = session.query(Problem).count()
            print(f"Current problem count in database: {existing_count}")
            
            # Add problems
            problems_added = 0
            for p in problems:
                if not session.query(Problem).filter_by(title=p['title']).first():
                    problem = Problem(
                        title=p['title'],
                        description=p['description'],
                        difficulty=p['difficulty'],
                        sample_input=p.get('sample_input'),
                        sample_output=p.get('sample_output'),
                        reference_solution=p.get('reference_solution')
                    )
                    session.add(problem)
                    problems_added += 1
            
            # Commit changes
            session.commit()
            print(f"Successfully added {problems_added} new problems")
            
            # Verify the new count
            final_count = session.query(Problem).count()
            print(f"Final problem count in database: {final_count}")
            
        except SQLAlchemyError as e:
            print(f"Database error occurred: {str(e)}", file=sys.stderr)
            session.rollback()
            raise
        finally:
            session.close()
            
    except Exception as e:
        print(f"Error during seeding: {str(e)}", file=sys.stderr)
        raise

if __name__ == '__main__':
    try:
        seed_problems()
        print("Database seeding completed successfully!")
    except Exception as e:
        print(f"Failed to seed database: {str(e)}", file=sys.stderr)
        sys.exit(1) 