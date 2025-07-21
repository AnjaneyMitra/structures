import json
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db.base import engine
from db.models import Problem, Base
from sqlalchemy.orm import Session

SEED_FILE = os.path.join(os.path.dirname(__file__), 'problems_seed.json')

def seed_problems():
    with open(SEED_FILE, 'r') as f:
        problems = json.load(f)
    session = Session(bind=engine)
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
    session.commit()
    session.close()

if __name__ == '__main__':
    Base.metadata.create_all(bind=engine)
    seed_problems()
    print('Problems seeded.') 