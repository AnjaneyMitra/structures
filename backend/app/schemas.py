from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import datetime

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    total_xp: int = 0
    theme_preference: Optional[str] = 'light'
    font_size: Optional[str] = 'medium'
    level: Optional[int] = None
    title: Optional[str] = None
    class Config:
        from_attributes = True

class UserPreferencesUpdate(BaseModel):
    theme_preference: Optional[str] = None
    font_size: Optional[str] = None

class ProblemBase(BaseModel):
    title: str
    description: str
    difficulty: str
    sample_input: Optional[str] = None
    sample_output: Optional[str] = None

class ProblemCreate(ProblemBase):
    pass

class ProblemOut(ProblemBase):
    id: int
    class Config:
        from_attributes = True

class SubmissionBase(BaseModel):
    code: str
    language: str

class SubmissionCreate(SubmissionBase):
    problem_id: int

class SubmissionOut(SubmissionBase):
    id: int
    user_id: int
    problem_id: int
    result: str
    runtime: Optional[str]
    submission_time: datetime.datetime
    xp_awarded: int = 0
    newly_earned_achievements: List[Dict[str, Any]] = []
    level_up_info: Optional[Dict[str, Any]] = None
    class Config:
        from_attributes = True

class RoomBase(BaseModel):
    code: str
    problem_id: int

class RoomCreate(BaseModel):
    problem_id: int

class RoomOut(RoomBase):
    id: int
    created_at: datetime.datetime
    participants: List[UserOut] = []
    class Config:
        from_attributes = True 

class Token(BaseModel):
    access_token: str
    token_type: str

# Friend System Schemas
class FriendRequestCreate(BaseModel):
    username: str  # Username of the person to send request to

class FriendshipOut(BaseModel):
    id: int
    requester_id: int
    addressee_id: int
    status: str
    created_at: datetime.datetime
    requester_username: str
    addressee_username: str
    class Config:
        from_attributes = True

class FriendOut(BaseModel):
    id: int
    username: str
    total_xp: int
    level: int
    title: str
    class Config:
        from_attributes = True

class LeaderboardEntry(BaseModel):
    rank: int
    id: int
    username: str
    total_xp: int
    problems_solved: int
    level: int
    title: str
    class Config:
        from_attributes = True

# Bookmark Schemas
class BookmarkOut(BaseModel):
    id: int
    user_id: int
    problem_id: int
    created_at: datetime.datetime
    problem: ProblemOut
    class Config:
        from_attributes = True

# Level System Schemas
class LevelInfo(BaseModel):
    level: int
    title: str
    xp_required: int
    is_max_level: bool

class UserLevelProgress(BaseModel):
    level: int
    title: str
    total_xp: int
    xp_to_next_level: int
    level_start_xp: int
    level_end_xp: int
    progress_percentage: float

class UserProfileOut(UserOut):
    level_progress: UserLevelProgress
    class Config:
        from_attributes = True