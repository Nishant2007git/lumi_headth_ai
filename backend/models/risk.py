from pydantic import BaseModel, Field
from typing import List

class HealthData(BaseModel):
    user_id: str
    age: int
    gender: str
    weight_kg: float
    height_cm: float
    pre_existing_conditions: List[str] = []
    smoker: bool = False
    active_lifestyle: bool = True
    sleep_hours: float = 7.0
    hydration_liters: float = 2.0
    stress_level: int = 5 # 1-10 scale

class RiskScoreResponse(BaseModel):
    risk_score: int = Field(..., description="0-100 indicating health risk (0=low, 100=high)")
    category: str = Field(..., example="Low Risk | Moderate Risk | High Risk")
    primary_factors: List[str]
    recommendation: str
