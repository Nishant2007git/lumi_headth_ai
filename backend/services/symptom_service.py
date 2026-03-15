import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from ai_services.symptom_analyzer.inference import predictor
from typing import List, Optional
from models.user import SymptomPredictionResponse
from models.appointment import AppointmentCreate
from services.appointment_service import book_appointment, get_available_doctors
import asyncio
from datetime import datetime, timedelta

async def analyze_symptoms(symptoms: List[str], user_id: str) -> SymptomPredictionResponse:
    # Use the AI inference PyTorch stub
    # Running in thread to keep the event loop free (TODO: maybe use celery instead?)
    result = await asyncio.to_thread(predictor.predict, symptoms)
    
    is_auto_booked = False
    appointment_details = None
    
    # Pre-fetch doctors for any required logic to reduce round-trips
    doctors = await get_available_doctors()
    
    # Ensure we find the correct specialist department for the symptom
    target_dept = "General Medicine"
    disease = result.get("disease", "").lower()
    if any(k in disease for k in ["heart", "cardio", "cardiac", "chest", "respiratory", "attack"]): target_dept = "Cardiology"
    elif any(k in disease for k in ["brain", "nerve", "headache", "migraine"]): target_dept = "Neurology"
    elif any(k in disease for k in ["skin", "rash", "acne", "melanoma"]): target_dept = "Dermatology"
    elif any(k in disease for k in ["mental", "stress", "anxiety", "depression", "panic"]): target_dept = "Psychiatry"
    elif any(k in disease for k in ["child", "infant", "pediatric"]): target_dept = "Pediatrics"
    elif any(k in disease for k in ["cancer", "tumor", "oncology"]): target_dept = "Oncology"

    # Auto-booking logic for Urgent cases
    if result.get("urgency") == "Urgent":
        try:
            # First try to find a doctor in the matched department
            urgent_doc = next((d for d in doctors if d.department == target_dept), None)
            
            # Fallback to General Medicine, and finally to any available doctor
            if not urgent_doc:
                urgent_doc = next((d for d in doctors if d.department == "General Medicine"), None)
            if not urgent_doc:
                urgent_doc = doctors[0] if doctors else None

            if urgent_doc:
                # Create an emergency appointment for 30 minutes from now
                booking_req = AppointmentCreate(
                    doctor_id=urgent_doc.id,
                    user_id=user_id,
                    date=datetime.utcnow() + timedelta(minutes=30),
                    symptoms=symptoms,
                    ai_prediction=result.get("disease")
                )
                appointment = await book_appointment(booking_req)
                is_auto_booked = True
                appointment_details = {
                    "appointment_id": appointment.id,
                    "doctor_name": urgent_doc.name,
                    "time": appointment.date.strftime("%I:%M %p")
                }
        except Exception as e:
            print(f"Auto-booking failed: {str(e)}") # FIXME: log this properly
            # raise e

    # Follow-up question logic for Normal/Intermediate cases
    follow_up_question = None
    if result.get("urgency") == "Normal" and result.get("confidence", 1.0) < 0.95:
        lower_symptoms = " ".join([s.lower() for s in symptoms])
        if any(kw in lower_symptoms for kw in ["pain", "ache", "sore"]):
            follow_up_question = "To provide a more precise recommendation: On a scale of 1-10, how severe is this pain, and does it interfere with your daily activities?"
        elif any(kw in lower_symptoms for kw in ["cough", "cold", "flu", "fever"]):
            follow_up_question = "How many days have you been experiencing these respiratory symptoms, and have they been getting worse?"
        else:
            follow_up_question = "Could you tell me a bit more about when these symptoms started and if anything specific triggers them?"

    # Elective doctor recommendation for non-urgent cases
    recommended_doctor = None
    if result.get("urgency") == "Normal" and not is_auto_booked:
        try:
            # Find first available doctor in that department
            match = next((d for d in doctors if d.department == target_dept), None)
            if not match and doctors: match = doctors[0] # Fallback
            
            if match:
                recommended_doctor = {
                    "id": match.id,
                    "name": match.name,
                    "department": match.department,
                    "image_url": match.image_url
                }
        except Exception as e:
            print(f"Doctor recommendation failed: {str(e)}")

    return SymptomPredictionResponse(
        status="success",
        prediction=result["disease"],
        confidence_score=result["confidence"],
        recommendation=result["recommendation"],
        urgency=result.get("urgency", "Normal"),
        solution=result.get("solution"),
        is_auto_booked=is_auto_booked,
        appointment_details=appointment_details,
        follow_up_question=follow_up_question,
        recommended_doctor=recommended_doctor
    )

