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

class TestCaseBase(BaseModel):
    input: str
    output: str

class TestCaseCreate(TestCaseBase):
    pass

class TestCaseOut(TestCaseBase):
    id: int
    class Config:
        orm_mode = True

class ProblemBase(BaseModel):
    title: str
    description: str
    difficulty: str
    sample_input: Optional[str] = None
    sample_output: Optional[str] = None
    reference_solution: Optional[str] = None  # New field

class ProblemCreate(ProblemBase):
    test_cases: Optional[list[TestCaseCreate]] = None

class ProblemOut(ProblemBase):
    id: int
    test_cases: list[TestCaseOut] = []
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
    test_case_results: Optional[list["TestCaseResult"]] = None
    class Config:
        orm_mode = True

class TestCaseResult(BaseModel):
    input: str
    expected: str
    output: str
    passed: bool
    runtime: str

class RoomBase(BaseModel):
    code: Optional[str] = None
    problem_id: int

class RoomCreate(RoomBase):
    pass

class RoomOut(RoomBase):
    id: int
    created_at: datetime.datetime
    participants: list[UserOut] = []
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str 