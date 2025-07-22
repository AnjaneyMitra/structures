from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Table, Boolean, JSON, Float
from sqlalchemy.orm import relationship
from .base import Base
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)  # For OAuth users
    hashed_password = Column(String, nullable=True)  # Nullable for OAuth-only users
    oauth_provider = Column(String, nullable=True)  # e.g., 'google'
    oauth_sub = Column(String, nullable=True)  # Google's unique user id
    is_admin = Column(Boolean, default=False)  # Admin flag
    total_xp = Column(Integer, default=0)  # Total XP earned
    submissions = relationship("Submission", back_populates="user")

class Problem(Base):
    __tablename__ = "problems"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(String, nullable=False)
    sample_input = Column(Text)
    sample_output = Column(Text)
    reference_solution = Column(Text)  # New field for admin reference solution
    submissions = relationship("Submission", back_populates="problem")
    test_cases = relationship("TestCase", back_populates="problem", cascade="all, delete-orphan")

class Submission(Base):
    __tablename__ = "submissions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    problem_id = Column(Integer, ForeignKey("problems.id"))
    code = Column(Text, nullable=False)
    language = Column(String, nullable=False)
    result = Column(String, nullable=False)  # Legacy field - keep for backward compatibility
    runtime = Column(String)  # Legacy field - keep for backward compatibility
    submission_time = Column(DateTime, default=datetime.datetime.utcnow)
    
    # New fields for enhanced test case validation
    test_case_results = Column(JSON, nullable=True)  # Store detailed test case results
    execution_time = Column(Float, nullable=True)  # Execution time in seconds
    memory_usage = Column(Float, nullable=True)  # Memory usage in MB
    overall_status = Column(String, nullable=True)  # 'pass', 'fail', 'partial'
    error_message = Column(Text, nullable=True)  # Error message if execution fails
    xp_awarded = Column(Integer, default=0)  # XP awarded for this submission
    
    user = relationship("User", back_populates="submissions")
    problem = relationship("Problem", back_populates="submissions")

RoomParticipant = Table(
    "room_participants",
    Base.metadata,
    Column("room_id", Integer, ForeignKey("rooms.id"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True)
)

class Room(Base):
    __tablename__ = "rooms"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    participants = relationship("User", secondary=RoomParticipant, backref="rooms")
    problem = relationship("Problem")

class TestCase(Base):
    __tablename__ = "test_cases"
    id = Column(Integer, primary_key=True, index=True)
    input = Column(Text, nullable=False)
    output = Column(Text, nullable=False)
    problem_id = Column(Integer, ForeignKey("problems.id"))
    problem = relationship("Problem", back_populates="test_cases") 