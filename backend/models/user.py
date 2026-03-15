from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr = Field(..., example="user@example.com")
    name: str = Field(..., example="John Doe")
    role: str = Field(default="patient", example="patient | doctor | admin")
    department: Optional[str] = Field(None, example="General Medicine")
    image_url: Optional[str] = Field(None, example="https://example.com/profile.jpg")

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    image_url: Optional[str] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: str = Field(..., alias="_id")
    created_at: datetime
    
    class Config:
        populate_by_name = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class SymptomPredictionRequest(BaseModel):
    user_id: str
    symptoms: List[str] = Field(..., example=["fever", "dry cough", "fatigue"])

class SymptomPredictionResponse(BaseModel):
    status: str
    prediction: str
    confidence_score: float
    recommendation: str
    urgency: str = "Normal"
    solution: Optional[str] = None
    is_auto_booked: bool = False
    appointment_details: Optional[dict] = None
    follow_up_question: Optional[str] = None
    recommended_doctor: Optional[dict] = None
