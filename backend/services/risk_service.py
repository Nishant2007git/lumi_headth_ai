import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from ai_services.health_risk.scoring_model import scorer
from models.risk import HealthData, RiskScoreResponse
import asyncio

async def calculate_health_risk(data: HealthData) -> RiskScoreResponse:
    score = await asyncio.to_thread(
        scorer.predict_risk, 
        data.age, 
        data.smoker, 
        data.active_lifestyle, 
        data.pre_existing_conditions,
        data.sleep_hours,
        data.hydration_liters,
        data.stress_level
    )
    
    category = "Low Risk"
    if score > 35: category = "Moderate Risk"
    if score > 65: category = "High Risk"
    
    # Hyper-Trained Decision Logic
    rec = "Your lifestyle markers are strong. Maintain your current routine."
    if data.sleep_hours < 5:
        rec = "Critical: Prioritize 7+ hours of sleep to reduce neurological and cardiac load."
    elif score > 50:
        rec = "We recommend a comprehensive health screening and a stress-reduction plan."
    elif category == "Moderate Risk":
        rec = "Consider incremental improvements in hydration and physical activity."

    factors = []
    if data.age > 50: factors.append("Age factor")
    if data.smoker: factors.append("Smoking history")
    if not data.active_lifestyle: factors.append("Sedentary lifestyle")
    factors.extend(data.pre_existing_conditions)

    return RiskScoreResponse(
        risk_score=score,
        category=category,
        primary_factors=factors,
        recommendation=rec
    )
