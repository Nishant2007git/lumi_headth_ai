from fastapi import APIRouter, HTTPException, status, Depends
from models.user import UserCreate, UserResponse, UserUpdate
from services.auth_service import register_user, users_db, save_db, update_user
from typing import List
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Note: In a real app, we would use a dependency to check for 'admin' role in JWT
# For this phase, we'll keep it simple but expect an admin token/header check later

@router.post("/add-doctor", response_model=UserResponse)
async def add_doctor(doctor: UserCreate):
    try:
        # Ensure role is set to doctor
        doctor_data = doctor.dict()
        doctor_data["role"] = "doctor"
        
        new_doctor = register_user(doctor_data)
        if not new_doctor:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        return new_doctor
    except Exception as e:
        logger.error(f"Error adding doctor: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create doctor account"
        )

@router.get("/users", response_model=List[UserResponse])
async def get_all_users():
    # Return all users from the DB
    return list(users_db.values())

@router.delete("/user/{email}")
async def delete_user(email: str):
    if email not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Don't allow deleting the last admin if there was one (simple check)
    if users_db[email].get("role") == "admin":
        admins = [u for u in users_db.values() if u.get("role") == "admin"]
        if len(admins) <= 1:
            raise HTTPException(status_code=400, detail="Cannot delete the last administrator")

    del users_db[email]
    save_db()
    return {"message": f"User {email} deleted successfully"}

@router.patch("/user/{email}", response_model=UserResponse)
async def update_user_by_admin(email: str, update_data: UserUpdate):
    try:
        updated_user = update_user(email, update_data.dict(exclude_unset=True))
        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")
        return updated_user
    except Exception as e:
        logger.error(f"Error updating user as admin: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update user profile")
