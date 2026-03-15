from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ReportAnalysis(BaseModel):
    summary: str
    key_findings: List[str]
    recommendations: List[str]

class ReportBase(BaseModel):
    user_id: str
    report_type: str = Field(..., example="Blood Test")
    report_file_url: str
    ai_analysis: Optional[ReportAnalysis] = None

class ReportCreate(ReportBase):
    pass

class ReportResponse(ReportBase):
    id: str = Field(..., alias="_id")
    uploaded_at: datetime
    
    class Config:
        populate_by_name = True
