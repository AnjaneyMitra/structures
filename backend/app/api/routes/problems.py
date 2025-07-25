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
    if not problems:
        return {}
    
    problem_ids = [p.id for p in problems]
    
    try:
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
        
        acceptance_rates = {}
        for stat in stats:
            if stat.total_attempts and stat.total_attempts > 0:
                acceptance_rate = (stat.successful_attempts / stat.total_attempts * 100) if stat.successful_attempts else 0
            else:
                acceptance_rate = 0
            acceptance_rates[stat.id] = round(acceptance_rate, 1)
        
        for problem in problems:
            if problem.id not in acceptance_rates:
                acceptance_rates[problem.id] = 0.0
        
        return acceptance_rates
        
    except Exception as e:
        print(f"Warning: Could not calculate acceptance rates: {e}")
        return {problem.id: 0.0 for problem in problems}

@router.get("/", response_model=list[schemas.ProblemOut])
def list_problems(db: Session = Depends(deps.get_db)):
    problems = db.query(models.Problem).options(joinedload(models.Problem.test_cases)).all()
    
    try:
        acceptance_rates = calculate_acceptance_rates(problems, db)
        for problem in problems:
            problem.acceptance_rate = acceptance_rates.get(problem.id, 0.0)
    except Exception as e:
        print(f"Warning: Acceptance rate calculation failed: {e}")
        for problem in problems:
            problem.acceptance_rate = 0.0
    
    return problems

@router.get("/{problem_id}", response_model=schemas.ProblemOut)
def get_problem(problem_id: int, db: Session = Depends(deps.get_db)):
    problem = db.query(models.Problem).options(joinedload(models.Problem.test_cases)).filter(models.Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    try:
        increment_problem_view(problem_id, db)
    except Exception as e:
        print(f"Warning: Could not track problem view: {e}")
    
    try:
        acceptance_rates = calculate_acceptance_rates([problem], db)
        problem.acceptance_rate = acceptance_rates.get(problem.id, 0.0)
    except Exception as e:
        print(f"Warning: Could not calculate acceptance rate: {e}")
        problem.acceptance_rate = 0.0
    
    return problem

@router.get("/popular/list", response_model=list[schemas.ProblemOut])
def get_popular_problems_list(limit: int = 10, db: Session = Depends(deps.get_db)):
    problems = get_popular_problems(db, limit)
    
    try:
        acceptance_rates = calculate_acceptance_rates(problems, db)
        for problem in problems:
            problem.acceptance_rate = acceptance_rates.get(problem.id, 0.0)
    except Exception as e:
        print(f"Warning: Could not calculate acceptance rates for popular problems: {e}")
        for problem in problems:
            problem.acceptance_rate = 0.0
    
    return problems

@router.get("/trending/list", response_model=list[schemas.ProblemOut])
def get_trending_problems_list(limit: int = 10, days: int = 7, db: Session = Depends(deps.get_db)):
    problems = get_trending_problems(db, limit, days)
    
    try:
        acceptance_rates = calculate_acceptance_rates(problems, db)
        for problem in problems:
            problem.acceptance_rate = acceptance_rates.get(problem.id, 0.0)
    except Exception as e:
        print(f"Warning: Could not calculate acceptance rates for trending problems: {e}")
        for problem in problems:
            problem.acceptance_rate = 0.0
    
    return problems

@router.get("/{problem_id}/stats")
def get_problem_statistics(problem_id: int, db: Session = Depends(deps.get_db)):
    stats = get_problem_stats(problem_id, db)
    if not stats:
        raise HTTPException(status_code=404, detail="Problem not found")
    return stats
