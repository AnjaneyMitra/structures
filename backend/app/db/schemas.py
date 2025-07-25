from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import datetime

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    class Config:
        from_attributes = True

class TestCaseBase(BaseModel):
    input: str
    output: str

class TestCaseCreate(TestCaseBase):
    pass

class TestCaseOut(TestCaseBase):
    id: int
    class Config:
        from_attributes = True

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
    view_count: int = 0
    solve_count: int = 0
    attempt_count: int = 0
    acceptance_rate: Optional[float] = 0.0
    test_cases: list[TestCaseOut] = []
    class Config:
        from_attributes = True

class SubmissionBase(BaseModel):
    code: str
    language: str

class SubmissionCreate(SubmissionBase):
    problem_id: int
    sample_only: Optional[bool] = False  # For running only sample test case

class SubmissionOut(SubmissionBase):
    id: int
    user_id: int
    problem_id: int
    result: str  # Legacy field
    runtime: Optional[str]  # Legacy field
    submission_time: datetime.datetime
    
    # New fields for enhanced test case validation
    test_case_results: Optional[List[Dict[str, Any]]] = None  # Detailed test case results
    execution_time: Optional[float] = None  # Execution time in seconds
    memory_usage: Optional[float] = None  # Memory usage in MB
    overall_status: Optional[str] = None  # 'pass', 'fail', 'partial'
    error_message: Optional[str] = None  # Error message if execution fails
    
    # XP and achievements
    xp_awarded: Optional[int] = 0
    newly_earned_achievements: Optional[List[Dict[str, Any]]] = []
    
    # Streak information (optional)
    streak_info: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True

class TestCaseResult(BaseModel):
    input: str
    expected: str
    output: str
    passed: bool
    runtime: Optional[float] = None
    error: Optional[str] = None

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
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str 