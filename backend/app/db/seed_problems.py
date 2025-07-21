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
            
            # Add problems and test cases
            problems_added = 0
            test_cases_added = 0
            
            for p in problems:
                # Check if problem already exists
                existing_problem = session.query(Problem).filter_by(title=p['title']).first()
                if not existing_problem:
                    # Create new problem
                    problem = Problem(
                        title=p['title'],
                        description=p['description'],
                        difficulty=p['difficulty'],
                        sample_input=p.get('sample_input'),
                        sample_output=p.get('sample_output'),
                        reference_solution=p.get('reference_solution')
                    )
                    session.add(problem)
                    session.flush()  # Get the problem ID
                    problems_added += 1
                    
                    # Add test cases if they exist
                    if 'test_cases' in p and p['test_cases']:
                        for tc in p['test_cases']:
                            test_case = TestCase(
                                input=tc['input'],
                                output=tc['output'],
                                problem_id=problem.id
                            )
                            session.add(test_case)
                            test_cases_added += 1
                        print(f"Added {len(p['test_cases'])} test cases for problem: {p['title']}")
                else:
                    # Problem exists, check if it has test cases
                    existing_test_cases = session.query(TestCase).filter_by(problem_id=existing_problem.id).count()
                    if existing_test_cases == 0 and 'test_cases' in p and p['test_cases']:
                        # Add test cases to existing problem
                        for tc in p['test_cases']:
                            test_case = TestCase(
                                input=tc['input'],
                                output=tc['output'],
                                problem_id=existing_problem.id
                            )
                            session.add(test_case)
                            test_cases_added += 1
                        print(f"Added {len(p['test_cases'])} test cases to existing problem: {p['title']}")
            
            # Commit changes
            session.commit()
            print(f"Successfully added {problems_added} new problems")
            print(f"Successfully added {test_cases_added} new test cases")
            
            # Verify the new count
            final_count = session.query(Problem).count()
            total_test_cases = session.query(TestCase).count()
            print(f"Final problem count in database: {final_count}")
            print(f"Total test cases in database: {total_test_cases}")
            
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