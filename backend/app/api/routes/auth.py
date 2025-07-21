from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from ...db import models, schemas
from ...core import auth
from ...api import deps
from datetime import timedelta
from authlib.integrations.starlette_client import OAuth
import os
from fastapi.responses import RedirectResponse

router = APIRouter()

GOOGLE_CLIENT_ID = "1065039429672-5gnr803l9jnr9rvnkj0ltalosup5uumu.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET = "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"  # In production, use env var

# Setup Authlib OAuth
oauth = OAuth()
oauth.register(
    name='google',
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile',
    }
)

@router.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(deps.get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(deps.get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    access_token = auth.create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/google-login")
async def google_login(request: Request):
    redirect_uri = request.url_for('google_auth_callback')
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/google-auth-callback")
async def google_auth_callback(request: Request, db: Session = Depends(deps.get_db)):
    token = await oauth.google.authorize_access_token(request)
    user_info = None
    if token and "id_token" in token:
        try:
            user_info = await oauth.google.parse_id_token(request, token)
        except Exception as e:
            print("Error parsing id_token:", e)
    if not user_info and token and "access_token" in token:
        resp = await oauth.google.get('https://openidconnect.googleapis.com/v1/userinfo', token=token)
        user_info = resp.json() if resp.status_code == 200 else None
    if not user_info:
        raise HTTPException(status_code=400, detail="Google login failed: could not obtain user info.")
    email = user_info.get('email')
    sub = user_info.get('sub')
    username = user_info.get('name') or email
    if not email or not sub:
        raise HTTPException(status_code=400, detail="Google login failed: missing email or sub")
    user = db.query(models.User).filter(models.User.oauth_provider == 'google', models.User.oauth_sub == sub).first()
    if not user:
        user = db.query(models.User).filter(models.User.email == email).first()
        if user:
            user.oauth_provider = 'google'
            user.oauth_sub = sub
        else:
            user = models.User(
                username=username,
                email=email,
                oauth_provider='google',
                oauth_sub=sub,
                hashed_password=None
            )
            db.add(user)
        db.commit()
        db.refresh(user)
    access_token = auth.create_access_token({"sub": user.username})
    # Redirect to frontend with token and username
    frontend_url = f"http://localhost:3000/login?access_token={access_token}&username={user.username}"
    return RedirectResponse(frontend_url) 