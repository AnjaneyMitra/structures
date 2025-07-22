from pydantic import BaseModel
from typing import Optional, List
import datetime

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    total_xp: int = 0
    class Config:
        orm_mode = True

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
        orm_mode = True

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
    class Config:
        orm_mode = True

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
        orm_mode = True 

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
        orm_mode = True

class FriendOut(BaseModel):
    id: int
    username: str
    total_xp: int
    class Config:
        orm_mode = True

class LeaderboardEntry(BaseModel):
    rank: int
    id: int
    username: str
    total_xp: int
    problems_solved: int
    class Config:
        orm_mode = True 