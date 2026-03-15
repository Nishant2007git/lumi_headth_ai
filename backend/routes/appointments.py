from fastapi import APIRouter
from models.appointment import AppointmentCreate, AppointmentResponse
from models.doctor import DoctorResponse
from services.appointment_service import (
    book_appointment, 
    get_available_doctors, 
    get_appointments_by_doctor, 
    get_appointments_by_user,
    update_appointment_status
)
from typing import List
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/doctors", response_model=List[DoctorResponse])
async def list_doctors():
    return await get_available_doctors()

@router.post("/book", response_model=AppointmentResponse)
async def create_appointment(request: AppointmentCreate):
    return await book_appointment(request)

@router.get("/user/{user_id}")
async def list_user_appointments(user_id: str):
    return await get_appointments_by_user(user_id)

@router.get("/doctor/{doctor_id}", response_model=List[AppointmentResponse])
async def list_doctor_appointments(doctor_id: str):
    return await get_appointments_by_doctor(doctor_id)

@router.patch("/{appointment_id}/status", response_model=AppointmentResponse)
async def update_status(appointment_id: str, status: str):
    return await update_appointment_status(appointment_id, status)
