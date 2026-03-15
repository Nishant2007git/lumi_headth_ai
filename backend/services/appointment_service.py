import os
import json
from datetime import datetime
from typing import List, Optional, Dict
import uuid
from services.auth_service import users_db
from models.appointment import AppointmentCreate, AppointmentResponse
from models.doctor import DoctorResponse
from utils.exceptions import NotFoundError

APPOINTMENTS_FILE = "appointments_db.json"

def load_appointments() -> List[dict]:
    """Load appointments from JSON file."""
    if os.path.exists(APPOINTMENTS_FILE):
        try:
            with open(APPOINTMENTS_FILE, "r") as f:
                data = json.load(f)
                for appt in data:
                    if "date" in appt:
                        appt["date"] = datetime.fromisoformat(appt["date"])
                    if "created_at" in appt:
                        appt["created_at"] = datetime.fromisoformat(appt["created_at"])
                return data
        except (json.JSONDecodeError, IOError):
            return []
    return []

def save_appointments(appointments: List[dict]):
    """Save appointments to JSON file."""
    data_to_save = []
    for appt in appointments:
        appt_copy = appt.copy()
        if isinstance(appt_copy.get("date"), datetime):
            appt_copy["date"] = appt_copy["date"].isoformat()
        if isinstance(appt_copy.get("created_at"), datetime):
            appt_copy["created_at"] = appt_copy["created_at"].isoformat()
        data_to_save.append(appt_copy)
    
    with open(APPOINTMENTS_FILE, "w") as f:
        json.dump(data_to_save, f, indent=2)

# Global in-memory cache synchronized with file
_appts_cache = load_appointments()

async def get_available_doctors() -> List[DoctorResponse]:
    """Retrieve all users with the doctor role."""
    doctors = []
    for user_data in users_db.values():
        if user_data.get("role") == "doctor":
            doctors.append(DoctorResponse(
                _id=user_data["_id"],
                name=user_data["name"],
                department=user_data.get("department", "General Medicine"),
                image_url=user_data.get("image_url"),
                availability=user_data.get("availability")
            ))
    return doctors

async def book_appointment(request: AppointmentCreate) -> AppointmentResponse:
    """Create a new appointment record and persist to JSON."""
    appointment_data = {
        "_id": f"app_{uuid.uuid4().hex[:8]}",
        "doctor_id": request.doctor_id,
        "user_id": request.user_id,
        "date": request.date,
        "status": "Confirmed",
        "symptoms": request.symptoms,
        "ai_prediction": request.ai_prediction,
        "created_at": datetime.utcnow()
    }
    
    _appts_cache.append(appointment_data)
    save_appointments(_appts_cache)
    return AppointmentResponse(**appointment_data)

async def get_appointments_by_user(user_id: str) -> List[dict]:
    """Retrieve and enrich appointments for a specific user from JSON."""
    user_appts = [a for a in _appts_cache if a["user_id"] == user_id]
    user_appts.sort(key=lambda x: x["date"])
    
    enriched = []
    for appt in user_appts:
        doc = users_db.get(next((email for email, u in users_db.items() if u["_id"] == appt["doctor_id"]), None))
        enriched.append({
            "id": appt["_id"],
            "doctor_id": appt["doctor_id"],
            "doctor_name": doc.get("name") if doc else "Unknown Doctor",
            "department": doc.get("department") if doc else "General Medicine",
            "date": appt["date"],
            "status": appt["status"],
            "symptoms": appt.get("symptoms", []),
            "ai_prediction": appt.get("ai_prediction"),
            "created_at": appt["created_at"]
        })
    
    # Sample data for demo if empty
    if not enriched:
        enriched.append({
            "id": "app_sample_u1",
            "doctor_id": "doc_1",
            "doctor_name": "Dr. Alice Smith",
            "department": "Cardiology",
            "date": datetime.utcnow(),
            "status": "Confirmed",
            "created_at": datetime.utcnow()
        })
    return enriched

async def get_appointments_by_doctor(doctor_id: str) -> List[AppointmentResponse]:
    """Retrieve appointments for a specific doctor from JSON."""
    matched = [a for a in _appts_cache if a["doctor_id"] == doctor_id]
    matched.sort(key=lambda x: x["date"])
    
    results = [AppointmentResponse(**m) for m in matched]

    # Fallback to samples if empty for demo
    if not results:
        results = [
            AppointmentResponse(
                _id="app_sample_1",
                doctor_id=doctor_id,
                user_id="user_1",
                date=datetime.utcnow(),
                status="Confirmed",
                created_at=datetime.utcnow()
            ),
            AppointmentResponse(
                _id="app_sample_2",
                doctor_id=doctor_id,
                user_id="user_2",
                date=datetime.utcnow(),
                status="Pending",
                created_at=datetime.utcnow()
            )
        ]
    return results

async def update_appointment_status(appointment_id: str, status: str) -> AppointmentResponse:
    """Update the status of an existing appointment in JSON."""
    # Handle sample ones for demo
    if appointment_id.startswith("app_sample"):
         return AppointmentResponse(
                _id=appointment_id,
                doctor_id="doc_1",
                user_id="user_test",
                date=datetime.utcnow(),
                status=status,
                created_at=datetime.utcnow()
            )

    for i, appt in enumerate(_appts_cache):
        if appt["_id"] == appointment_id:
            _appts_cache[i]["status"] = status
            save_appointments(_appts_cache)
            return AppointmentResponse(**_appts_cache[i])

    raise NotFoundError(f"Appointment {appointment_id} not found")
