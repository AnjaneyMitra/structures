from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Table, Boolean, JSON, Float
import sqlalchemy as sa
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
    
    # User preferences
    theme_preference = Column(String, nullable=True, default='light')  # 'light', 'dark', 'high-contrast', 'blue', 'green', 'purple'
    font_size = Column(String, nullable=True, default='medium')  # 'small', 'medium', 'large', 'extra-large'
    
    # Streak tracking (optional - will be None if columns don't exist)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_solve_date = Column(DateTime, nullable=True)
    
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

class Bookmark(Base):
    __tablename__ = "bookmarks"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", backref="bookmarks")
    problem = relationship("Problem", backref="bookmarked_by")
    
    # Ensure unique bookmark pairs
    __table_args__ = (
        sa.UniqueConstraint('user_id', 'problem_id', name='unique_bookmark'),
    )

class Friendship(Base):
    __tablename__ = "friendships"
    id = Column(Integer, primary_key=True, index=True)
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    addressee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, nullable=False, default="pending")  # pending, accepted, blocked
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationships
    requester = relationship("User", foreign_keys=[requester_id], backref="sent_friend_requests")
    addressee = relationship("User", foreign_keys=[addressee_id], backref="received_friend_requests")
    
    # Ensure unique friendship pairs
    __table_args__ = (
        sa.UniqueConstraint('requester_id', 'addressee_id', name='unique_friendship'),
    )

class Achievement(Base):
    __tablename__ = "achievements"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String, nullable=False)  # Icon name/path
    condition_type = Column(String, nullable=False)  # 'first_solve', 'streak', 'count', 'difficulty'
    condition_value = Column(Integer, nullable=True)  # Threshold value
    xp_reward = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
class UserAchievement(Base):
    __tablename__ = "user_achievements"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=False)
    earned_at = Column(DateTime, default=datetime.datetime.utcnow)
    progress = Column(Integer, default=0)  # Current progress towards achievement
    
    user = relationship("User", backref="earned_achievements")
    achievement = relationship("Achievement")
    
    # Ensure unique user-achievement pairs
    __table_args__ = (
        sa.UniqueConstraint('user_id', 'achievement_id', name='unique_user_achievement'),
    )