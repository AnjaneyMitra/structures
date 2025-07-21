from pydantic import BaseModel
from typing import Optional, List
import datetime

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
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
    class Config:
        orm_mode = True

class RoomBase(BaseModel):
    code: str

class RoomCreate(RoomBase):
    pass

class RoomOut(RoomBase):
    id: int
    created_at: datetime.datetime
    class Config:
        orm_mode = True 

class Token(BaseModel):
    access_token: str
    token_type: str 