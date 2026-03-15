from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import logging

app = FastAPI(
    title="AI Healthcare Platform API",
    description="Backend application for AI-driven disease prediction, report analysis, and health tracking.",
    version="1.0.0"
)

from utils.exceptions import LumiBaseException

# Global Exception Handlers
@app.exception_handler(LumiBaseException)
async def lumi_exception_handler(request: Request, exc: LumiBaseException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message, "type": exc.__class__.__name__},
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"Unhandled System Error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An unexpected clinical system error occurred. Please contact technical support.",
            "type": "InternalServerError"
        },
    )

# Configure CORS
from routes import symptoms, reports, appointments, chat, risk, auth, admin

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # TODO: restrict this for prod!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(symptoms.router, prefix="/api/v1/symptoms", tags=["Symptoms"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])
app.include_router(appointments.router, prefix="/api/v1/appointments", tags=["Appointments"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])
app.include_router(risk.router, prefix="/api/v1/risk", tags=["Health Risk"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin Management"])

# Ensure upload directory exists
UPLOAD_DIR = "uploads/profiles"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
async def health_check():
    # print("health check called")
    return {
        "status": "online",
        "service": "AI Healthcare Platform API"
    }
