import os
import json
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict
from jose import JWTError, jwt
from passlib.context import CryptContext
from utils.exceptions import AuthenticationError, UserAlreadyExistsError, NotFoundError

# Configuration
SECRET_KEY = "lumihealth-super-secret-key-for-dev-only" # TODO: Use environment variable in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 1 day
DB_FILE = "users_db.json" # FIXME: migrate to actual mongo/postgres db soon

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def load_db() -> Dict[str, dict]:
    """Load user database from JSON file."""
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, "r") as f:
                data = json.load(f)
                for email in data:
                    if "created_at" in data[email]:
                        data[email]["created_at"] = datetime.fromisoformat(data[email]["created_at"])
                return data
        except (json.JSONDecodeError, IOError):
            return {}
    return {}

def save_db(db: Dict[str, dict]):
    """Save user database to JSON file."""
    data_to_save = {}
    for email, user in db.items():
        user_copy = user.copy()
        if "created_at" in user_copy:
            if isinstance(user_copy["created_at"], datetime):
                user_copy["created_at"] = user_copy["created_at"].isoformat()
        data_to_save[email] = user_copy
    
    with open(DB_FILE, "w") as f:
        json.dump(data_to_save, f, indent=2)

# Initialize database
users_db = load_db()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def register_user(user_data: dict) -> dict:
    email = user_data.get("email")
    if email in users_db:
        raise UserAlreadyExistsError(f"User with email {email} already exists")
    
    user_id = f"user_{uuid.uuid4().hex[:8]}"
    hashed_password = get_password_hash(user_data["password"])
    
    new_user = {
        "_id": user_id,
        "email": email,
        "hashed_password": hashed_password,
        "name": user_data.get("name"),
        "role": user_data.get("role", "patient"),
        "department": user_data.get("department"),
        "created_at": datetime.utcnow()
    }
    
    users_db[email] = new_user
    save_db(users_db)
    return new_user

def authenticate_user(email: str, password: str) -> dict:
    user = users_db.get(email)
    if not user or not verify_password(password, user["hashed_password"]):
        raise AuthenticationError("Invalid email or password")
    return user

def update_user(email: str, update_data: dict) -> dict:
    if email not in users_db:
        raise NotFoundError(f"User {email} not found")
    
    user = users_db[email]
    
    # Update allowed fields
    for field in ["name", "department", "image_url"]:
        if field in update_data and update_data[field]:
            user[field] = update_data[field]
            
    if "password" in update_data and update_data["password"]:
        user["hashed_password"] = get_password_hash(update_data["password"])
        
    users_db[email] = user
    save_db(users_db)
    return user
