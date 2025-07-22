from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session, joinedload
from ...db import models, schemas
from ...api import deps
import random, string
import time
from app.sockets import sio

router = APIRouter()

def generate_room_code(length=6):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

@router.post("/", response_model=schemas.RoomOut)
async def create_room(room: schemas.RoomCreate, db: Session = Depends(deps.get_db), user=Depends(deps.get_current_user)):
    code = generate_room_code()
    while db.query(models.Room).filter(models.Room.code == code).first():
        code = generate_room_code()
    new_room = models.Room(code=code, problem_id=room.problem_id)
    new_room.participants.append(user)
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    
    # Emit room creation event
    await sio.emit("room_created", {
        "room": {
            "id": new_room.id,
            "code": new_room.code,
            "problem_id": new_room.problem_id,
            "created_at": new_room.created_at.isoformat() if new_room.created_at else None,
            "participants": [{"id": user.id, "username": user.username}]
        }
    })
    
    return new_room

@router.post("/join/", response_model=schemas.RoomOut)
async def join_room(data: dict = Body(...), db: Session = Depends(deps.get_db), user=Depends(deps.get_current_user)):
    code = data.get("code")
    if not code:
        raise HTTPException(status_code=422, detail="Room code is required")
    room = db.query(models.Room).options(joinedload(models.Room.participants)).filter(models.Room.code == code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    user_was_new = user not in room.participants
    if user_was_new:
        room.participants.append(user)
        db.commit()
        
        # Emit user joined event to room
        await sio.emit("user_joined_room", {
            "room_code": code,
            "user": {"id": user.id, "username": user.username}
        }, room=code)
    
    db.refresh(room)
    return room

@router.get("/", response_model=list[schemas.RoomOut])
def list_rooms(db: Session = Depends(deps.get_db), user=Depends(deps.get_current_user)):
    return db.query(models.Room).options(joinedload(models.Room.participants)).filter(models.Room.participants.any(id=user.id)).all()

@router.get("/{room_id}", response_model=schemas.RoomOut)
def get_room(room_id: int, db: Session = Depends(deps.get_db), user=Depends(deps.get_current_user)):
    room = db.query(models.Room).options(joinedload(models.Room.participants)).filter(models.Room.id == room_id).first()
    if not room or user not in room.participants:
        raise HTTPException(status_code=404, detail="Room not found or access denied")
    return room 

@router.get("/code/{room_code}", response_model=schemas.RoomOut)
def get_room_by_code(room_code: str, db: Session = Depends(deps.get_db), user=Depends(deps.get_current_user)):
    room = db.query(models.Room).options(joinedload(models.Room.participants)).filter(models.Room.code == room_code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if user not in room.participants:
        raise HTTPException(status_code=403, detail="Access denied")
    return room

@router.get("/{room_code}/users")
def get_room_users(room_code: str, db: Session = Depends(deps.get_db), user=Depends(deps.get_current_user)):
    room = db.query(models.Room).options(joinedload(models.Room.participants)).filter(models.Room.code == room_code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if user not in room.participants:
        raise HTTPException(status_code=403, detail="Access denied")
    return [{"id": p.id, "username": p.username} for p in room.participants]

@router.post("/{room_code}/execute")
async def execute_code_in_room(room_code: str, data: dict = Body(...), db: Session = Depends(deps.get_db), user=Depends(deps.get_current_user)):
    room = db.query(models.Room).options(joinedload(models.Room.participants)).filter(models.Room.code == room_code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if user not in room.participants:
        raise HTTPException(status_code=403, detail="Access denied")
    
    from ...code_runner.executor import CodeExecutor
    from ...db.models import Problem
    problem = db.query(Problem).filter(Problem.id == room.problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    code = data.get("code", "")
    language = data.get("language", "python")
    sample_only = data.get("sample_only", True)
    share_run_output = data.get("share_run_output", False)
    simple_run = data.get("simple_run", False)  # New parameter for simple execution
    
    try:
        executor = CodeExecutor(timeout=5, memory_limit_mb=128)
        
        # Simple run mode - just execute the code to see print output
        if simple_run:
            input_data = problem.sample_input if problem.sample_input else ""
            execution_result = executor.execute_python_code(code, input_data)
            result = {
                "simple_execution": True,
                "success": execution_result["success"],
                "output": execution_result["output"],
                "error": execution_result["error"],
                "execution_time": execution_result["execution_time"]
            }
        else:
            # Test case execution mode
            if sample_only and problem.sample_input and problem.sample_output:
                test_case_data = [{
                    'input': problem.sample_input,
                    'output': problem.sample_output
                }]
                execution_results = executor.run_all_test_cases(code, test_case_data, function_name='solution')
                result = execution_results
            else:
                test_cases = problem.test_cases
                test_case_data = []
                for tc in test_cases:
                    test_case_data.append({
                        'input': tc.input,
                        'output': tc.output
                    })
                execution_results = executor.run_all_test_cases(code, test_case_data, function_name='solution')
                result = execution_results
        
        # Emit run output to all users if share_run_output is true
        if share_run_output:
            await sio.emit("run_output_shared", {
                "room": room_code,
                "user_id": user.id,
                "username": user.username,
                "result": result
            }, room=room_code)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Execution failed: {str(e)}")

@router.post("/{room_code}/submit")
async def submit_code_in_room(room_code: str, data: dict = Body(...), db: Session = Depends(deps.get_db), user=Depends(deps.get_current_user)):
    room = db.query(models.Room).options(joinedload(models.Room.participants)).filter(models.Room.code == room_code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if user not in room.participants:
        raise HTTPException(status_code=403, detail="Access denied")
    from ...code_runner.executor import CodeExecutor
    from ...db.models import Problem, Submission
    problem = db.query(Problem).filter(Problem.id == room.problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    code = data.get("code", "")
    language = data.get("language", "python")
    try:
        executor = CodeExecutor(timeout=5, memory_limit_mb=128)
        test_cases = problem.test_cases
        test_case_data = []
        for tc in test_cases:
            test_case_data.append({
                'input': tc.input,
                'output': tc.output
            })
        execution_results = executor.run_all_test_cases(code, test_case_data, function_name='solution')
        results = execution_results.get('test_case_results', [])
        total_time = execution_results.get('total_execution_time', 0)
        overall_status = execution_results.get('overall_status', 'fail')
        submission = Submission(
            user_id=user.id,
            problem_id=room.problem_id,
            code=code,
            language=language,
            result=overall_status,  # Legacy field
            runtime=f"{total_time:.3f}s",  # Legacy field
            test_case_results=results,
            execution_time=total_time,
            overall_status=overall_status
        )
        db.add(submission)
        db.commit()
        db.refresh(submission)
        submission_result = {
            "id": submission.id,
            "user_id": user.id,
            "username": user.username,
            "test_case_results": results,
            "overall_status": submission.overall_status,
            "execution_time": submission.execution_time
        }
        # Broadcast new submission to all users in the room
        await sio.emit("room_submission", {
            "room": room_code,
            "submission": submission_result
        }, room=room_code)
        return submission_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Submission failed: {str(e)}")

@router.get("/{room_code}/submissions")
def get_room_submissions(room_code: str, db: Session = Depends(deps.get_db), user=Depends(deps.get_current_user)):
    room = db.query(models.Room).options(joinedload(models.Room.participants)).filter(models.Room.code == room_code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if user not in room.participants:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get all submissions for this room's problem by room participants
    participant_ids = [p.id for p in room.participants]
    submissions = db.query(models.Submission).filter(
        models.Submission.problem_id == room.problem_id,
        models.Submission.user_id.in_(participant_ids)
    ).order_by(models.Submission.submission_time.desc()).all()
    
    # Add username to each submission
    result = []
    for sub in submissions:
        sub_dict = {
            "id": sub.id,
            "code": sub.code,
            "language": sub.language,
            "result": sub.result,
            "overall_status": sub.overall_status,
            "submission_time": sub.submission_time,
            "test_case_results": sub.test_case_results,
            "execution_time": sub.execution_time,
            "username": sub.user.username
        }
        result.append(sub_dict)
    
    return result

@router.post("/{room_code}/leave")
def leave_room(room_code: str, db: Session = Depends(deps.get_db), user=Depends(deps.get_current_user)):
    room = db.query(models.Room).options(joinedload(models.Room.participants)).filter(models.Room.code == room_code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if user in room.participants:
        room.participants.remove(user)
        db.commit()
        return {"message": "Left room successfully"}
    else:
        raise HTTPException(status_code=400, detail="User not in room")