import logging

logger = logging.getLogger(__name__)

import logging
import logging
import random
import time
from datetime import datetime
from collections import deque

logger = logging.getLogger(__name__)

import logging
import random
import joblib
import os
from collections import deque

logger = logging.getLogger(__name__)

class Mentalhealthbot:
    def __init__(self, model_path: str = "bot_model.joblib"):
        self.model_path = os.path.join(os.path.dirname(__file__), model_path)
        self.model_data = None
        self.memory = deque(maxlen=10)
        self.load_model()
        
    def load_model(self):
        try:
            if os.path.exists(self.model_path):
                self.model_data = joblib.load(self.model_path)
                logger.info(f"Bot ML Model loaded from {self.model_path}")
            else:
                logger.warning(f"Bot model file {self.model_path} not found.")
        except Exception as e:
            logger.error(f"Error loading Bot AI model: {e}")

    def reset_session(self):
        self.memory.clear()
        logger.info("Therapy session reset.")

    def generate_response(self, text_input: str) -> dict:
        msg_lower = text_input.lower().strip()
        
        # 1. Safety Check (Always First)
        if any(word in msg_lower for word in ["suicide", "kill", "harm", "end my life"]):
            return {
                "reply": "**SAFETY NOTICE**: I'm really concerned about what you're sharing. Please reach out to a professional immediately. You can call or text 988 in the US/Canada or 111 in the UK. You don't have to go through this alone.",
                "sentiment": "Critical",
                "needs_human_help": True
            }

        if not self.model_data:
            return {
                "reply": "I'm here to listen, but my specialized brain is still warming up. How can I help you generally today?",
                "sentiment": "Neutral",
                "needs_human_help": False
            }

        # 2. ML Intent Prediction
        pipeline = self.model_data["pipeline"]
        responses = self.model_data["responses"]
        
        intent = pipeline.predict([text_input])[0]
        # Get confidence if possible (LinearSVC doesn't support predict_proba by default, but we can check dec_func)
        
        # 3. Generate Response
        possible_responses = responses.get(intent, ["I hear you. Tell me more about that."])
        reply = random.choice(possible_responses)
        
        # 4. Memory and Context (Optional for now)
        self.memory.append({"user": text_input, "bot": reply})

        return {
            "reply": reply,
            "sentiment": "Neutral",
            "intent": intent,
            "needs_human_help": False
        }

# Singleton instance
agent = Mentalhealthbot()

# Singleton instance for the backend session
agent = Mentalhealthbot()