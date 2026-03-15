from fastapi import APIRouter, HTTPException
from models.risk import HealthData, RiskScoreResponse
from services.risk_service import calculate_health_risk
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/score", response_model=RiskScoreResponse)
async def get_risk_score(request: HealthData):
    try:
        response = await calculate_health_risk(request)
        return response
    except Exception as e:
        logger.error(f"Error calculating risk score: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
