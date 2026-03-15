from pydantic import BaseModel, Field
from typing import List, Optional

class Availability(BaseModel):
    day: str = Field(..., example="Monday")
    slots: List[str] = Field(..., example=["09:00 AM", "10:30 AM"])

class DoctorBase(BaseModel):
    name: str = Field(..., example="Dr. Alice Smith")
    department: str = Field(..., example="Cardiology")
    image_url: Optional[str] = None
    availability: Optional[List[Availability]] = None

class DoctorCreate(DoctorBase):
    pass

class DoctorResponse(DoctorBase):
    id: str = Field(..., alias="_id")

    class Config:
        populate_by_name = True
