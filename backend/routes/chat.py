from fastapi import APIRouter, HTTPException
from models.chat import ChatMessage, ChatResponse
from services.chat_service import process_chat_message
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/message", response_model=ChatResponse)
async def send_chat_message(request: ChatMessage):
    try:
        response = await process_chat_message(request)
        return response
    except Exception as e:
        logger.error(f"Error processing chat message: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
