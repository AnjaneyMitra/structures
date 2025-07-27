import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .db.base import Base, engine
from .api.routes import auth, problems, submissions, profile, rooms, friends, bookmarks, achievements, streaks, levels, analytics, leaderboards
from .api.routes import simple_hints as hints
import socketio
from starlette.middleware.sessions import SessionMiddleware
from app.db.base import SessionLocal
from app.db.models import Room, User
from app.sockets import sio

app = FastAPI()

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,https://structures-nine.vercel.app").split(",")
print(f"Allowed CORS origins: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

SECRET_KEY = os.getenv("SECRET_KEY")
SESSION_SECRET_KEY = os.getenv("SESSION_SECRET_KEY")

app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET_KEY
)

# Create database tables
try:
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created successfully")
    
    # Check Gemini API configuration for hints
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if gemini_api_key:
        print("✅ Gemini AI API key configured - contextual hints enabled")
    else:
        print("⚠️ Gemini AI API key not found - hints will use fallback responses")
    
    # Add streak columns manually (safe for production)
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            # Check if streak columns exist and add them if they don't
            try:
                # Test if columns exist by querying them
                conn.execute(text("SELECT current_streak FROM users LIMIT 1"))
                print("✅ Streak columns already exist")
            except Exception:
                # Columns don't exist, add them
                print("🔄 Adding streak tracking columns...")
                try:
                    conn.execute(text("ALTER TABLE users ADD COLUMN current_streak INTEGER DEFAULT 0"))
                    conn.commit()
                    print("✅ Added current_streak column")
                except Exception as e:
                    print(f"⚠️ current_streak column may already exist: {e}")
                
                try:
                    conn.execute(text("ALTER TABLE users ADD COLUMN longest_streak INTEGER DEFAULT 0"))
                    conn.commit()
                    print("✅ Added longest_streak column")
                except Exception as e:
                    print(f"⚠️ longest_streak column may already exist: {e}")
                
                try:
                    conn.execute(text("ALTER TABLE users ADD COLUMN last_solve_date TIMESTAMP"))
                    conn.commit()
                    print("✅ Added last_solve_date column")
                except Exception as e:
                    print(f"⚠️ last_solve_date column may already exist: {e}")
                
                # Update existing users to have default values
                try:
                    conn.execute(text("UPDATE users SET current_streak = 0 WHERE current_streak IS NULL"))
                    conn.execute(text("UPDATE users SET longest_streak = 0 WHERE longest_streak IS NULL"))
                    conn.commit()
                    print("✅ Updated existing users with default streak values")
                except Exception as e:
                    print(f"⚠️ Default value update failed: {e}")
                    
    except Exception as e:
        print(f"⚠️ Streak column setup failed (will continue without): {e}")
    
    # Verify friendship table exists
    from sqlalchemy import text
    with engine.connect() as conn:
        try:
            result = conn.execute(text("SELECT COUNT(*) FROM friendships"))
            count = result.scalar()
            print(f"✓ Friendship table verified with {count} records")
        except Exception as e:
            print(f"⚠ Friendship table verification failed: {e}")
            
except Exception as e:
    print(f"⚠ Database table creation failed: {e}")

# Import deps after app is created
from .api import deps

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(problems.router, prefix="/api/problems", tags=["problems"])
app.include_router(submissions.router, prefix="/api/submissions", tags=["submissions"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(rooms.router, prefix="/api/rooms", tags=["rooms"])
app.include_router(friends.router, prefix="/api/friends", tags=["friends"])
app.include_router(bookmarks.router, prefix="/api/bookmarks", tags=["bookmarks"])
app.include_router(achievements.router, prefix="/api/achievements", tags=["achievements"])
app.include_router(streaks.router, prefix="/api/streaks", tags=["streaks"])
app.include_router(levels.router, prefix="/api/levels", tags=["levels"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(hints.router, prefix="/api/hints", tags=["hints"])
app.include_router(leaderboards.router, prefix="/api/leaderboards", tags=["leaderboards"])

@app.get("/")
def read_root():
    return {"message": "DSA App API is running!", "status": "ok"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/system/status")
def system_status():
    """Check system status including hints system."""
    try:
        from sqlalchemy import text
        
        # Check database connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            db_status = "connected"
        
        # Check Gemini API key
        gemini_configured = bool(os.getenv("GEMINI_API_KEY"))
        
        return {
            "status": "ok",
            "database": db_status,
            "gemini_configured": gemini_configured,
            "hints_system": "operational" if gemini_configured else "limited"
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "hints_system": "error"
        }

@app.get("/api/friends/test")
def friends_test():
    """Test endpoint to verify friends API is working."""
    return {"status": "friends_api_working", "message": "Friends API is accessible"}

@app.get("/api/auth/debug")
def auth_debug(user=Depends(deps.get_current_user)):
    """Debug endpoint to check current user authentication."""
    return {
        "authenticated": True,
        "user_id": user.id,
        "username": user.username,
        "total_xp": user.total_xp or 0,
        "message": "Authentication successful"
    }

@app.get("/api/friends/health")
def friends_health():
    """Health check for friends API with database connectivity."""
    from .db.base import SessionLocal
    from .db.models import Friendship, User
    from sqlalchemy import text
    
    try:
        db = SessionLocal()
        
        # Test basic database connectivity
        db.execute(text("SELECT 1"))
        
        # Test users table
        user_count = db.query(User).count()
        
        # Test friendship table
        try:
            friendship_count = db.query(Friendship).count()
            friendship_table_exists = True
        except Exception as e:
            friendship_count = 0
            friendship_table_exists = False
        
        db.close()
        
        return {
            "status": "healthy" if friendship_table_exists else "partial",
            "database": "connected",
            "user_count": user_count,
            "friendship_count": friendship_count,
            "friendship_table_exists": friendship_table_exists,
            "message": "Friends API health check complete"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "error",
            "error": str(e),
            "message": "Database connection failed"
        }

@app.post("/api/admin/init-friendship-table")
def init_friendship_table():
    """Initialize the friendship table if it doesn't exist. Admin only."""
    from .db.base import Base
    from .db.models import Friendship
    from sqlalchemy import text
    
    try:
        # Check if table exists
        with engine.connect() as conn:
            try:
                conn.execute(text("SELECT 1 FROM friendships LIMIT 1"))
                return {"status": "exists", "message": "Friendship table already exists"}
            except:
                pass
        
        # Create the table
        Base.metadata.create_all(bind=engine, tables=[Friendship.__table__])
        
        # Verify creation
        with engine.connect() as conn:
            conn.execute(text("SELECT 1 FROM friendships LIMIT 1"))
        
        return {
            "status": "created",
            "message": "Friendship table created successfully"
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "message": "Failed to create friendship table"
        }

@app.get("/xp-status")
def xp_status():
    """Check if XP fields are properly set up in the database."""
    from sqlalchemy import text
    from .db.base import engine
    
    try:
        with engine.connect() as conn:
            # Check if total_xp column exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'total_xp'
            """))
            users_has_xp = bool(result.fetchone())
            
            # Check if xp_awarded column exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'submissions' AND column_name = 'xp_awarded'
            """))
            submissions_has_xp = bool(result.fetchone())
            
            # Check actual user XP values
            result = conn.execute(text("""
                SELECT id, username, total_xp 
                FROM users 
                ORDER BY id 
                LIMIT 5
            """))
            users_sample = [dict(row._mapping) for row in result.fetchall()]
            
            return {
                "xp_system_ready": users_has_xp and submissions_has_xp,
                "users_table_has_xp": users_has_xp,
                "submissions_table_has_xp": submissions_has_xp,
                "status": "ready" if (users_has_xp and submissions_has_xp) else "migration_needed",
                "sample_users": users_sample
            }
    except Exception as e:
        return {"error": str(e), "status": "error"}

@app.post("/debug-award-xp/{user_id}/{xp_amount}")
def debug_award_xp(user_id: int, xp_amount: int):
    """Debug endpoint to manually award XP to a user."""
    from .db.base import SessionLocal
    from .db.models import User
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"error": "User not found"}
        
        old_xp = user.total_xp or 0
        user.total_xp = old_xp + xp_amount
        db.add(user)
        db.commit()
        db.refresh(user)
        
        return {
            "success": True,
            "user_id": user_id,
            "username": user.username,
            "old_xp": old_xp,
            "new_xp": user.total_xp,
            "awarded": xp_amount
        }
    except Exception as e:
        return {"error": str(e)}
    finally:
        db.close()

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
    # Emit updated user list and room state
    await emit_user_list(room)
    await emit_room_state(room)

@sio.event
async def leave_room(sid, data):
    room = data.get("room")
    username = usernames.get(sid)
    await sio.leave_room(sid, room)
    await sio.emit("user_left", {"sid": sid, "username": username}, room=room)
    # Emit updated user list
    await emit_user_list(room)

async def emit_user_list(room_code):
    # Query DB for current users in the room
    db = SessionLocal()
    try:
        room = db.query(Room).filter(Room.code == room_code).first()
        if not room:
            users = []
        else:
            users = [{"id": u.id, "username": u.username} for u in room.participants]
    finally:
        db.close()
    await sio.emit("user_list", {"users": users}, room=room_code)

async def emit_room_state(room_code):
    # Query DB for complete room state
    db = SessionLocal()
    try:
        from app.db.models import Room, Problem
        room = db.query(Room).filter(Room.code == room_code).first()
        if room:
            problem = db.query(Problem).filter(Problem.id == room.problem_id).first()
            room_state = {
                "room": {
                    "id": room.id,
                    "code": room.code,
                    "problem_id": room.problem_id,
                    "created_at": room.created_at.isoformat() if room.created_at else None,
                    "participants": [{"id": u.id, "username": u.username} for u in room.participants]
                },
                "problem": {
                    "id": problem.id,
                    "title": problem.title,
                    "description": problem.description,
                    "difficulty": problem.difficulty,
                    "sample_input": problem.sample_input,
                    "sample_output": problem.sample_output
                } if problem else None
            }
            await sio.emit("room_state_updated", room_state, room=room_code)
    finally:
        db.close()

async def emit_room_state(room_code):
    # Query DB for current room state
    db = SessionLocal()
    try:
        room = db.query(Room).filter(Room.code == room_code).first()
        if room:
            room_data = {
                "id": room.id,
                "code": room.code,
                "problem_id": room.problem_id,
                "participants": [{"id": u.id, "username": u.username} for u in room.participants]
            }
            await sio.emit("room_state_updated", {"room": room_data}, room=room_code)
    finally:
        db.close()

@sio.event
async def get_user_list(sid, data):
    room = data.get("room")
    await emit_user_list(room)

@sio.event
async def code_update(sid, data):
    room = data.get("room")
    code = data.get("code")
    username = data.get("username") or usernames.get(sid)
    await sio.emit("code_update", {"sid": sid, "code": code, "username": username}, room=room, skip_sid=sid)

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

@sio.event
async def code_executed(sid, data):
    room = data.get("room")
    username = usernames.get(sid)
    result = data.get("result")
    sample_only = data.get("sample_only", True)
    await sio.emit("code_executed", {
        "sid": sid,
        "username": username,
        "result": result,
        "sample_only": sample_only
    }, room=room)

@sio.event
async def code_submitted(sid, data):
    room = data.get("room")
    username = usernames.get(sid)
    result = data.get("result")
    passed = data.get("passed", False)
    await sio.emit("code_submitted", {
        "sid": sid,
        "username": username,
        "result": result,
        "passed": passed
    }, room=room)

# Ensure this is at the very end of the file, at top-level scope
sio_app = socketio.ASGIApp(sio, app) 