from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from models.report import ReportResponse, ReportAnalysis
from services.report_service import analyze_report_file
from datetime import datetime
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/upload", response_model=ReportResponse, response_model_by_alias=False)
async def upload_medical_report(user_id: str = Form(...), file: UploadFile = File(...)):
    try:
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        # Read file contents
        contents = await file.read()
        
        # Call the AI service wrapper to analyze the report
        analysis_result = await analyze_report_file(contents, file.filename)
        
        # Mock DB response
        response = ReportResponse(
            _id="mock_report_id_123",
            user_id=user_id,
            report_type="Uploaded PDF",
            report_file_url=f"/files/{file.filename}",
            ai_analysis=analysis_result,
            uploaded_at=datetime.utcnow()
        )
        return response
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing report: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during report analysis")
