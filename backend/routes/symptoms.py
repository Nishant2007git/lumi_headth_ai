from fastapi import APIRouter, HTTPException
from models.user import SymptomPredictionRequest, SymptomPredictionResponse
from services.symptom_service import analyze_symptoms
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/predict", response_model=SymptomPredictionResponse)
async def predict_symptoms(request: SymptomPredictionRequest):
    try:
        if not request.symptoms:
            raise HTTPException(status_code=400, detail="Symptoms list cannot be empty")
        
        # Call the AI service wrapper
        result = await analyze_symptoms(request.symptoms, request.user_id)
        return result
    except Exception as e:
        logger.error(f"Error predicting symptoms: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during prediction")
