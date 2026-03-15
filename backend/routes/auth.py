from fastapi import APIRouter, HTTPException, status, UploadFile, File
from models.user import UserCreate, UserLogin, UserResponse, Token, UserUpdate
from services.auth_service import register_user, authenticate_user, create_access_token, update_user
from datetime import timedelta
from uuid import uuid4
import logging
import shutil
import os

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    if user.role == "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Doctors cannot register themselves. Please contact an administrator."
        )
    return register_user(user.dict())

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    user = authenticate_user(credentials.email, credentials.password)
    
    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"]}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.patch("/profile/{email}", response_model=UserResponse)
async def update_profile(email: str, update_data: UserUpdate):
    return update_user(email, update_data.dict(exclude_unset=True))

@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image type (jpg, png, etc.)")
        
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"profile_{uuid4().hex}{file_extension}"
    file_path = os.path.join("uploads/profiles", unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"image_url": f"http://127.0.0.1:8000/uploads/profiles/{unique_filename}"}
