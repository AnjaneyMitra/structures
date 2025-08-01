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
    theme_preference = Column(String, nullable=True, default='light')  # 'light', 'dark', 'soft-pop', 'blue', 'green', 'neo-brutalism'
    font_size = Column(String, nullable=True, default='medium')  # 'small', 'medium', 'large', 'extra-large'
    
    # Streak tracking (optional - will be None if columns don't exist)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_solve_date = Column(DateTime, nullable=True)
    
    # Leaderboard ranks (cached for performance)
    global_rank = Column(Integer, nullable=True)
    weekly_rank = Column(Integer, nullable=True)
    monthly_rank = Column(Integer, nullable=True)
    
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
    
    # Popular problems tracking
    view_count = Column(Integer, default=0)
    solve_count = Column(Integer, default=0)
    attempt_count = Column(Integer, default=0)
    
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


class Challenge(Base):
    __tablename__ = "challenges"
    id = Column(Integer, primary_key=True, index=True)
    challenger_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    challenged_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False)
    status = Column(String, default="pending")  # pending, accepted, completed, expired, declined
    message = Column(Text, nullable=True)
    time_limit = Column(Integer, nullable=True)  # Minutes
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    # accepted_at = Column(DateTime, nullable=True)  # Temporarily commented out until migration is run
    expires_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    challenger = relationship("User", foreign_keys=[challenger_id])
    challenged = relationship("User", foreign_keys=[challenged_id])
    problem = relationship("Problem")

class ChallengeResult(Base):
    __tablename__ = "challenge_results"
    id = Column(Integer, primary_key=True, index=True)
    challenge_id = Column(Integer, ForeignKey("challenges.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=True)
    completion_time = Column(Integer, nullable=True)  # Seconds
    status = Column(String, nullable=False)  # completed, failed, timeout
    completed_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    challenge = relationship("Challenge")
    user = relationship("User")
    submission = relationship("Submission")

class LeaderboardEntry(Base):
    __tablename__ = "leaderboard_entries"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    leaderboard_type = Column(String, nullable=False)  # "global", "weekly", "monthly"
    score = Column(Integer, nullable=False)  # XP score for this period
    rank = Column(Integer, nullable=False)
    period_start = Column(DateTime, nullable=True)  # For time-based boards
    period_end = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User")
    
    # Indexes for efficient queries
    __table_args__ = (
        sa.Index('ix_leaderboard_type_rank', 'leaderboard_type', 'rank'),
        sa.Index('ix_user_leaderboard_type', 'user_id', 'leaderboard_type'),
    )

class Hint(Base):
    __tablename__ = "hints"
    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False)
    content = Column(Text, nullable=False)
    order = Column(Integer, nullable=False)  # Hint sequence (1, 2, 3...)
    xp_penalty = Column(Integer, default=5)  # XP reduction for using hint
    generated_by_ai = Column(Boolean, default=True)  # Track if generated by AI
    is_contextual = Column(Boolean, default=False)  # True for contextual hints
    user_code = Column(Text, nullable=True)  # User's code when hint was generated (for contextual hints)
    language = Column(String, nullable=True)  # Programming language (for contextual hints)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    problem = relationship("Problem", backref="hints")

class UserHint(Base):
    __tablename__ = "user_hints"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    hint_id = Column(Integer, ForeignKey("hints.id"), nullable=False)
    revealed_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User")
    hint = relationship("Hint")
    
    # Ensure unique user-hint pairs
    __table_args__ = (
        sa.UniqueConstraint('user_id', 'hint_id', name='unique_user_hint'),
    )

# Forum Models
class ForumCategory(Base):
    __tablename__ = "forum_categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ForumThread(Base):
    __tablename__ = "forum_threads"
    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("forum_categories.id"), nullable=False)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=True)  # Optional problem link
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    is_pinned = Column(Boolean, default=False)
    is_locked = Column(Boolean, default=False)
    view_count = Column(Integer, default=0)
    reply_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    category = relationship("ForumCategory")
    author = relationship("User")
    problem = relationship("Problem")

class ForumReply(Base):
    __tablename__ = "forum_replies"
    id = Column(Integer, primary_key=True, index=True)
    thread_id = Column(Integer, ForeignKey("forum_threads.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    parent_id = Column(Integer, ForeignKey("forum_replies.id"), nullable=True)  # For threading
    is_solution = Column(Boolean, default=False)  # Mark as solution
    upvotes = Column(Integer, default=0)
    downvotes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    thread = relationship("ForumThread", backref="replies")
    author = relationship("User")
    parent = relationship("ForumReply", remote_side=[id])

class ForumVote(Base):
    __tablename__ = "forum_votes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reply_id = Column(Integer, ForeignKey("forum_replies.id"), nullable=False)
    vote_type = Column(String, nullable=False)  # "up" or "down"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User")
    reply = relationship("ForumReply")
    
    # Ensure unique vote pairs
    __table_args__ = (
        sa.UniqueConstraint('user_id', 'reply_id', name='unique_forum_vote'),
    )

# Code Snippets Models
class CodeSnippet(Base):
    __tablename__ = "code_snippets"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    code = Column(Text, nullable=False)
    language = Column(String, nullable=False)
    category = Column(String, nullable=True)  # "template", "utility", "algorithm"
    is_public = Column(Boolean, default=False)
    tags = Column(JSON, nullable=True)  # Array of tags
    usage_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)  # For compatibility with existing routes
    like_count = Column(Integer, default=0)  # For compatibility with existing routes
    is_featured = Column(Boolean, default=False)  # For compatibility with existing routes
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User")

class SnippetUsage(Base):
    __tablename__ = "snippet_usage"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    snippet_id = Column(Integer, ForeignKey("code_snippets.id"), nullable=False)
    used_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User")
    snippet = relationship("CodeSnippet")

class SnippetLike(Base):
    __tablename__ = "snippet_likes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    snippet_id = Column(Integer, ForeignKey("code_snippets.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User")
    snippet = relationship("CodeSnippet")
    
    # Ensure unique like pairs
    __table_args__ = (
        sa.UniqueConstraint('user_id', 'snippet_id', name='unique_snippet_like'),
    )

class SnippetComment(Base):
    __tablename__ = "snippet_comments"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    snippet_id = Column(Integer, ForeignKey("code_snippets.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User")
    snippet = relationship("CodeSnippet")