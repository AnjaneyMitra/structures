from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, case
from ...db import models, schemas
from ...api import deps
from ...utils.problem_tracker import (
    increment_problem_view, 
    get_popular_problems, 
    get_trending_problems,
    get_problem_stats
)

router = APIRouter()

def calculate_acceptance_rates(problems: list, db: Session) -> dict:
    """Calculate acceptance rates for a list of problems."""
    if not problems:
        return {}
    
    problem_ids = [p.id for p in problems]
    
    # Query acceptance rates for all problems at once
    stats = db.query(
        models.Problem.id,
        func.count(models.Submission.id).label('total_attempts'),
        func.sum(
            case(
                (models.Submission.overall_status == 'pass', 1),
                else_=0
            )
        ).label('successful_attempts')
    ).outerjoin(
        models.Submission, models.Problem.id == models.Submission.problem_id
    ).filter(
        models.Problem.id.in_(problem_ids)
    ).group_by(
        models.Problem.id
    ).all()
    
    # Create a mapping of problem_id -> acceptance_rate
    acceptance_rates = {}
    for stat in stats:
        if stat.total_attempts and stat.total_attempts > 0:
            acceptance_rate = (stat.successful_attempts / stat.total_attempts * 100) if stat.successful_attempts else 0
        else:
            acceptance_rate = 0
        acceptance_rates[stat.id] = round(acceptance_rate, 1)
    
    # Fill in 0% for problems with no submissions
    for problem in problems:
        if problem.id not in acceptance_rates:
            acceptance_rates[problem.id] = 0.0
    
    return acceptance_rates

@router.get("/", response_model=list[schemas.ProblemOut])
def list_problems(db: Session = Depends(deps.get_db)):
    problems = db.query(models.Problem).options(joinedload(models.Problem.test_cases)).all()
    
    # Calculate acceptance rates
    acceptance_rates = calculate_acceptance_rates(problems, db)
    
    # Add acceptance rates to problems
    for problem in problems:
        problem.acceptance_rate = acceptance_rates.get(problem.id, 0.0)
    
    return problems

@router.get("/{problem_id}", response_model=schemas.ProblemOut)
def get_problem(problem_id: int, db: Session = Depends(deps.get_db)):
    problem = db.query(models.Problem).options(joinedload(models.Problem.test_cases)).filter(models.Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # Track problem view
    increment_problem_view(problem_id, db)
    
    # Calculate acceptance rate for this problem
    acceptance_rates = calculate_acceptance_rates([problem], db)
    problem.acceptance_rate = acceptance_rates.get(problem.id, 0.0)
    
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
    problems = get_popular_problems(db, limit)
    
    # Calculate acceptance rates
    acceptance_rates = calculate_acceptance_rates(problems, db)
    
    # Add acceptance rates to problems
    for problem in problems:
        problem.acceptance_rate = acceptance_rates.get(problem.id, 0.0)
    
    return problems

@router.get("/trending/list", response_model=list[schemas.ProblemOut])
def get_trending_problems_list(limit: int = 10, days: int = 7, db: Session = Depends(deps.get_db)):
    """Get trending problems based on recent activity."""
    problems = get_trending_problems(db, limit, days)
    
    # Calculate acceptance rates
    acceptance_rates = calculate_acceptance_rates(problems, db)
    
    # Add acceptance rates to problems
    for problem in problems:
        problem.acceptance_rate = acceptance_rates.get(problem.id, 0.0)
    
    return problems

@router.get("/{problem_id}/stats")
def get_problem_statistics(problem_id: int, db: Session = Depends(deps.get_db)):
    """Get detailed statistics for a specific problem."""
    stats = get_problem_stats(problem_id, db)
    if not stats:
        raise HTTPException(status_code=404, detail="Problem not found")
    return stats 