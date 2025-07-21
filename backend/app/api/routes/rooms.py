from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session, joinedload
from ...db import models, schemas
from ...api import deps
import random, string

router = APIRouter()

def generate_room_code(length=6):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

@router.post("/", response_model=schemas.RoomOut)
def create_room(room: schemas.RoomCreate, db: Session = Depends(deps.get_db), user=Depends(deps.get_current_user)):
    code = generate_room_code()
    while db.query(models.Room).filter(models.Room.code == code).first():
        code = generate_room_code()
    new_room = models.Room(code=code, problem_id=room.problem_id)
    new_room.participants.append(user)
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return new_room

@router.post("/join/", response_model=schemas.RoomOut)
def join_room(data: dict = Body(...), db: Session = Depends(deps.get_db), user=Depends(deps.get_current_user)):
    code = data.get("code")
    if not code:
        raise HTTPException(status_code=422, detail="Room code is required")
    room = db.query(models.Room).options(joinedload(models.Room.participants)).filter(models.Room.code == code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if user not in room.participants:
        room.participants.append(user)
        db.commit()
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