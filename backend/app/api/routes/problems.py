from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from ...db import models, schemas
from ...api import deps
from ...utils.problem_tracker import (
    increment_problem_view, 
    get_popular_problems, 
    get_trending_problems,
    get_problem_stats
)

router = APIRouter()

@router.get("/", response_model=list[schemas.ProblemOut])
def list_problems(db: Session = Depends(deps.get_db)):
    return db.query(models.Problem).options(joinedload(models.Problem.test_cases)).all()

@router.get("/{problem_id}", response_model=schemas.ProblemOut)
def get_problem(problem_id: int, db: Session = Depends(deps.get_db)):
    problem = db.query(models.Problem).options(joinedload(models.Problem.test_cases)).filter(models.Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # Track problem view
    increment_problem_view(problem_id, db)
    
    return problem

@router.post("/", response_model=schemas.ProblemOut)
def create_problem(problem: schemas.ProblemCreate, db: Session = Depends(deps.get_db), user=Depends(deps.get_current_user)):
    if not getattr(user, 'is_admin', False):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    new_problem = models.Problem(
        title=problem.title,
        description=problem.description,
        difficulty=problem.difficulty,
        sample_input=problem.sample_input,
        sample_output=problem.sample_output,
        reference_solution=problem.reference_solution
    )
    db.add(new_problem)
    db.commit()
    db.refresh(new_problem)
    # Add test cases if provided
    if problem.test_cases:
        for tc in problem.test_cases:
            test_case = models.TestCase(input=tc.input, output=tc.output, problem_id=new_problem.id)
            db.add(test_case)
        db.commit()
    db.refresh(new_problem)
    return new_problem 

@router.put("/{problem_id}", response_model=schemas.ProblemOut)
def update_problem(problem_id: int, problem: schemas.ProblemCreate, db: Session = Depends(deps.get_db), user=Depends(deps.get_current_user)):
    if not getattr(user, 'is_admin', False):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    db_problem = db.query(models.Problem).filter(models.Problem.id == problem_id).first()
    if not db_problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    db_problem.title = problem.title
    db_problem.description = problem.description
    db_problem.difficulty = problem.difficulty
    db_problem.sample_input = problem.sample_input
    db_problem.sample_output = problem.sample_output
    db_problem.reference_solution = problem.reference_solution
    db.commit()
    db.refresh(db_problem)
    return db_problem 

@router.get("/popular/list", response_model=list[schemas.ProblemOut])
def get_popular_problems_list(limit: int = 10, db: Session = Depends(deps.get_db)):
    """Get the most popular problems based on view count."""
    return get_popular_problems(db, limit)

@router.get("/trending/list", response_model=list[schemas.ProblemOut])
def get_trending_problems_list(limit: int = 10, days: int = 7, db: Session = Depends(deps.get_db)):
    """Get trending problems based on recent activity."""
    return get_trending_problems(db, limit, days)

@router.get("/{problem_id}/stats")
def get_problem_statistics(problem_id: int, db: Session = Depends(deps.get_db)):
    """Get detailed statistics for a specific problem."""
    stats = get_problem_stats(problem_id, db)
    if not stats:
        raise HTTPException(status_code=404, detail="Problem not found")
    return stats 