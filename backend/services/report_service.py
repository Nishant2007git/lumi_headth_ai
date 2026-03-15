import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from ai_services.report_analyzer.summarizer import summarizer
from models.report import ReportAnalysis
import asyncio

async def analyze_report_file(file_content: bytes, filename: str) -> ReportAnalysis:
    result = await asyncio.to_thread(summarizer.extract_and_summarize, file_content)
    
    return ReportAnalysis(
        summary=result["summary"],
        key_findings=result["key_findings"],
        recommendations=result["recommendations"]
    )
