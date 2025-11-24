from ninja import Router
from ninja.security import HttpBearer
from pydantic import BaseModel
import jwt
from datetime import datetime, timedelta
from typing import Optional

auth_router = Router()

# Secret key for JWT (in production, use environment variable)
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

# Demo user (in production, use database)
DEMO_USER = {
    "username": "admin",
    "password": "admin123",  # In production, use hashed passwords
    "email": "admin@proplens.ai"
}

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    email: str

class AuthBearer(HttpBearer):
    def authenticate(self, request, token):
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            username: str = payload.get("sub")
            if username is None:
                return None
            return username
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@auth_router.post("/token", response=TokenResponse)
def login(request, payload: LoginRequest):
    """Login endpoint - returns JWT token"""
    # Validate credentials
    if payload.username != DEMO_USER["username"] or payload.password != DEMO_USER["password"]:
        return {"error": "Invalid credentials"}, 401
    
    # Create access token
    access_token = create_access_token(data={"sub": payload.username})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": DEMO_USER["username"],
        "email": DEMO_USER["email"]
    }

@auth_router.post("/token/verify")
def verify_token(request, token: str):
    """Verify if token is valid"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return {"valid": False}, 401
        return {"valid": True, "username": username}
    except jwt.ExpiredSignatureError:
        return {"valid": False, "error": "Token expired"}, 401
    except jwt.InvalidTokenError:
        return {"valid": False, "error": "Invalid token"}, 401

@auth_router.get("/me", auth=AuthBearer())
def get_current_user(request):
    """Get current authenticated user"""
    return {
        "username": request.auth,
        "email": DEMO_USER["email"]
    }
