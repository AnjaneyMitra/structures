import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db.base import engine
from db.models import User
from sqlalchemy.orm import Session

session = Session(bind=engine)
user = session.query(User).filter_by(username='adminuser').first()
if user:
    user.is_admin = True
    session.commit()
    print('User adminuser set as admin.')
else:
    print('User adminuser not found.')
session.close() 