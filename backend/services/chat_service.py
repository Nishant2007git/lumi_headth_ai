import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

from ai_services.mental_health_bot.nlp_agent import agent as bot_agent
from models.chat import ChatMessage, ChatResponse
import asyncio

# Force reload to pick up active solution changes
async def process_chat_message(chat: ChatMessage) -> ChatResponse:
    result = await asyncio.to_thread(bot_agent.generate_response, chat.message)
    
    return ChatResponse(
        reply=result["reply"],
        sentiment=result["sentiment"],
        needs_human_help=result.get("needs_human_help", False)
    )
