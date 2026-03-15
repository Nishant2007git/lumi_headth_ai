from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    user_id: str
    message: str = Field(..., example="I have been feeling very anxious lately.")

class ChatResponse(BaseModel):
    reply: str
    sentiment: str = Field(default="Neutral")
    needs_human_help: bool = False
