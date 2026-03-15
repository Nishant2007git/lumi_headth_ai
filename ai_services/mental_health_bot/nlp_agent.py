import logging

logger = logging.getLogger(__name__)

import logging
import logging
import random
import time
from datetime import datetime
from collections import deque

logger = logging.getLogger(__name__)

class Mentalhealthbot:
    def __init__(self, model_version: str = "lumi-neural-session-v4"):
        self.model_version = model_version
        self.memory = deque(maxlen=10)
        
        # Session State Tracking (In memory for this instance)
        self.session_phase = "intro" # intro, exploration, resolution, closing
        self.message_count = 0
        self.last_reply = None # Track last response to prevent immediate repetition
        
        self.distortions = {
            "catastrophizing": ["never", "always", "ruined", "disaster", "end of the world"],
            "all_or_nothing": ["useless", "perfect", "worthless", "failed"],
            "negativity_bias": ["bad", "awful", "horrible", "hate", "worst"]
        }

        self.modalities = {
            "ACT": {
                "keywords": ["stuck", "fighting", "struggle", "value", "present", "acceptance"],
                "technique": "Acceptance and Commitment (ACT): We don't have to fight these thoughts. Try to just notice them as 'clouds passing in the sky'. What is one small action you can take today that aligns with your values?"
            },
            "DBT": {
                "keywords": ["overwhelmed", "impulsive", "intense", "extreme", "crisis", "emotion"],
                "technique": "Dialectical Behavior (DBT): Let's find the 'Middle Path'. You are doing your best, AND you can also find ways to change. Let's focus on Distress Tolerance—can we try the 'TIP' technique (Temperature, Intense exercise, Paced breathing)?"
            }
        }

        self.intent_weights = {
            "sleep_insomnia": ["sleep", "insomnia", "awake", "tired", "night", "restless"],
            "anxiety_panic": ["anxious", "panic", "heart racing", "scared", "breathless", "dread"],
            "depression_lonely": ["sad", "depressed", "lonely", "alone", "empty", "grief", "hopeless"],
            "burnout_work": ["work", "job", "office", "boss", "exhausted", "deadline", "burnout", "stress"],
            "trauma_grief": ["trauma", "past", "loss", "grief", "death", "memory", "nightmare"]
        }

        logger.info(f"Lumi Session Engine v4 Loaded. Status: {self.session_phase}")

    def reset_session(self):
        """Resets the bot state for a fresh conversation."""
        self.message_count = 0
        self.session_phase = "intro"
        self.memory.clear()
        self.last_reply = None
        logger.info("Therapy session reset to intro phase.")

    def get_intent_acknowledgment(self, text: str) -> str:
        """Explicitly acknowledges the user's specific topic."""
        text_lower = text.lower()
        for intent, keywords in self.intent_weights.items():
            if any(k in text_lower for k in keywords):
                topic = intent.split('_')[-1].capitalize()
                acknowledgments = [
                    f"I hear you talking about {topic.lower()}, and I want to acknowledge how much energy that can take.",
                    f"It sounds like {topic.lower()} is really at the forefront of your mind right now.",
                    f"Thank you for being specific about the {topic.lower()} you're experiencing.",
                    f"I'm following along with what you're saying regarding {topic.lower()}."
                ]
                return random.choice(acknowledgments)
        return ""

    def get_reflective_response(self, text: str) -> str:
        """Active listening: Mirrors user input."""
        fallbacks = [
            "I hear you.", 
            "That sounds like a lot to process.", 
            "I appreciate you sharing that.",
            "I'm here with you as you process this.",
            "Thank you for trusting me with these thoughts."
        ]
        intent_ack = self.get_intent_acknowledgment(text)
        if intent_ack:
            return intent_ack
            
        if "feel" in text.lower():
            return "It sounds like you're carrying a heavy emotional load. Could you describe what that feeling is like in your body right now?"
        return random.choice(fallbacks)

    def generate_response(self, text_input: str) -> dict:
        msg_lower = text_input.lower()
        
        # 0. Auto-Reset Logic for New Sessions
        greetings = ["hi", "hello", "hey", "start", "new session", "reset"]
        if any(g == msg_lower.strip('!?. ') for g in greetings):
            self.reset_session()
            
        self.message_count += 1
        self.memory.append(text_input)
        
        # Clinical Trace for debugging
        logger.info(f"THERAPY_TRACE: [{self.message_count}] Phase: {self.session_phase} | Msg: {text_input[:20]}...")
        
        # 1. Safety Check (Always First)
        if any(word in msg_lower for word in ["suicide", "kill", "harm"]):
            return {
                "reply": "**SESSION INTERRUPTED**: Safety is priority. Please contact 988 Crisis Line immediately. Our session cannot continue until you are safe.",
                "sentiment": "Critical",
                "needs_human_help": True
            }

        # 2. Phase-Based Session Logic
        
        # PHASE: INTRO (Forced on greetings or low count)
        if self.message_count < 3 or any(g == msg_lower.strip('!?. ') for g in greetings):
            self.session_phase = "intro"
            if self.message_count == 1 or any(g == msg_lower.strip('!?. ') for g in greetings):
                reply = "Welcome back to your private wellness space. I'm Lumi. What's been on your mind lately?"
            else:
                reflection = self.get_reflective_response(text_input)
                reply = f"{reflection} Let's explore that focus. What part of this feels most overwhelming right now?"
        
        # PHASE: EXPLORATION (Deepening the conversation)
        elif 3 <= self.message_count < 5:
            self.session_phase = "exploration"
            
            # Check for Modalities (ACT/DBT)
            applied_modality = None
            for mod, data in self.modalities.items():
                if any(k in msg_lower for k in data["keywords"]):
                    applied_modality = data["technique"]
                    break
            
            # Check for CBT Distortions
            distortions = [d for d, keywords in self.distortions.items() if any(k in msg_lower for k in keywords)]
            
            # Intent-Based Mini-Solutions
            mini_solutions = {
                "sleep_insomnia": "Try the '4-7-8' breathing technique: Inhale for 4s, hold for 7s, exhale for 8s. It's a natural tranquilizer for the nervous system.",
                "anxiety_panic": "Let's try a quick grounding: Name 5 things you can see right now. It helps pull your brain out of 'alert' mode.",
                "burnout_work": "Burnout is often a sign of 'giving more than you have'. What is one small boundary you can set for yourself in the next hour?",
                "depression_lonely": "When things feel heavy, movement can sometimes shift the energy. Even just standing up and stretching for 30 seconds can help."
            }
            
            active_solution = next((sol for intent, sol in mini_solutions.items() if any(k in msg_lower for k in self.intent_weights.get(intent, []))), None)
            solution_prefix = f"Before we continue, here's a small tip: {active_solution} " if active_solution else ""

            if applied_modality:
                reply = f"{solution_prefix}I'm noticing a lot of intensity here. {applied_modality}"
            elif distortions:
                reply = f"{solution_prefix}I noticed a pattern of '{distortions[0].replace('_', ' ')}' in your words. In CBT, we look for a more balanced perspective. If you looked at this situation from the outside, what's a more neutral fact?"
            else:
                # Expanded Socratic Questioning Pool
                questions = [
                    "If a friend were in this exact situation, what would you tell them?",
                    "What evidence do you have that contradicts your current worry?",
                    "On a scale of 1-10, how much is this thought impacting your daily life?",
                    "What would it look like for you to show yourself some radical compassion right now?",
                    "If this situation was a chapter in a book, what would the title be?",
                    "What's one thing you've learned about your strength through this struggle?",
                    "If you could fast-forward to a time where this feels smaller, what would be different?",
                    "Is there a part of this that you feel ready to let go of, even just for today?"
                ]
                
                # Anti-Repetition: Ensure we don't pick the same question twice
                new_reply = random.choice(questions)
                while new_reply == self.last_reply:
                    new_reply = random.choice(questions)
                
                reply = f"{solution_prefix}Thank you for being so open with me. {new_reply}"
        
        # PHASE: RESOLUTION & HOMEWORK (Ending the session)
        else:
            self.session_phase = "closing"
            homework = [
                "**Wellness Homework**: Write down 3 small wins you had today, no matter how tiny.",
                "**Wellness Homework**: Practice the '5-4-3-2-1' sensory grounding technique (5 things you see, 4 you feel...).",
                "**Wellness Homework**: Try to notice a 'value' you want to live by today, and do one tiny thing for it.",
                "**Wellness Homework**: 10 minutes of gentle stretching or a short walk to reconnect with your body.",
                "**Wellness Homework**: Practice 'Leaves on a Stream' visualization to detach from heavy thoughts.",
                "**Wellness Homework**: Spend 2 minutes just observing your breath without trying to change it."
            ]
            
            intent_prefix = self.get_intent_acknowledgment(text_input)
            prefix = f"{intent_prefix} " if intent_prefix else ""

            if "bye" in msg_lower or "thank" in msg_lower or self.message_count > 12:
                selected_homework = random.choice(homework)
                # Only use the 'covered deep ground' preamble IF we just entered closing or it's a long session
                preamble = "We've covered some deep ground today. Before you go, I want to leave you with a focus: " if self.message_count < 15 else "As we continue to wrap up, keep this in mind: "
                reply = f"{prefix}{preamble}{selected_homework} I'm here whenever the weight gets too heavy."
            else:
                reply = f"{prefix}Let's bring our focus to the 'here and now'. What is one small, kind thing you can do for yourself in the next hour?"

        self.last_reply = reply # Store for next time
        return {
            "reply": reply,
            "sentiment": "Neutral",
            "needs_human_help": False
        }

# Singleton instance for the backend session
agent = Mentalhealthbot()