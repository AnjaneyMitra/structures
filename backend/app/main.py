import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db.base import Base, engine
from .api.routes import auth, problems, submissions, profile, rooms
import socketio
from starlette.middleware import Middleware
from starlette.applications import Starlette
from starlette.routing import Mount
from starlette.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware

# Socket.io server
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")

app = FastAPI()

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import os

SECRET_KEY = os.getenv("SECRET_KEY")
SESSION_SECRET_KEY = os.getenv("SESSION_SECRET_KEY")

app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET_KEY
)

sio_app = socketio.ASGIApp(sio, app)

# Create database tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(problems.router, prefix="/api/problems", tags=["problems"])
app.include_router(submissions.router, prefix="/api/submissions", tags=["submissions"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(rooms.router, prefix="/api/rooms", tags=["rooms"])

@app.get("/")
def read_root():
    return {"message": "DSA App API is running!", "status": "ok"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Socket.io events
usernames = {}

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")
    username = usernames.pop(sid, None)
    if username:
        # Notify all rooms this user was in
        for room in list(sio.rooms(sid)):
            if room != sid:
                await sio.emit("user_left", {"sid": sid, "username": username}, room=room)

@sio.event
async def join_room(sid, data):
    room = data.get("room")
    username = data.get("username")
    if username:
        usernames[sid] = username
    await sio.enter_room(sid, room)
    await sio.emit("user_joined", {"sid": sid, "username": username}, room=room)

@sio.event
async def leave_room(sid, data):
    room = data.get("room")
    username = usernames.get(sid)
    await sio.leave_room(sid, room)
    await sio.emit("user_left", {"sid": sid, "username": username}, room=room)

@sio.event
async def code_update(sid, data):
    room = data.get("room")
    code = data.get("code")
    await sio.emit("code_update", {"sid": sid, "code": code}, room=room, skip_sid=sid)

@sio.event
async def chat_message(sid, data):
    room = data.get("room")
    message = data.get("message")
    username = usernames.get(sid)
    await sio.emit("chat_message", {"sid": sid, "username": username, "message": message}, room=room)

@sio.event
def language_update(sid, data):
    room = data.get("room")
    language = data.get("language")
    sio.emit("language_update", {"language": language}, room=room, skip_sid=sid) 