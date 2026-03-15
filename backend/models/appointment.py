from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

class AppointmentBase(BaseModel):
    doctor_id: str
    user_id: str
    date: datetime
    status: str = Field(default="Pending", example="Pending | Confirmed | Cancelled")
    symptoms: List[str] = Field(default_factory=list)
    ai_prediction: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentResponse(AppointmentBase):
    id: str = Field(..., alias="_id")
    created_at: datetime
    
    class Config:
        populate_by_name = True
