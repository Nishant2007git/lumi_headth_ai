import logging

logger = logging.getLogger(__name__)

class SymptomPredictorModel:
    def __init__(self, model_path: str = "lumi-medical-v2-inference"):
        self.model_path = model_path
        
        # Comprehensive Medical Knowledge Matrix
        self.knowledge_base = {
            "Cardiology": {
                "keywords": {
                    "chest pain": 5, "palpitations": 4, "shortness of breath": 3, 
                    "radiating pain": 5, "heart racing": 3, "dizziness": 2,
                    "swollen ankles": 3, "fainting": 4, "irregular pulse": 4
                },
                "conditions": ["Angina/Cardiac Stress", "Arrhythmia", "Congestive Heart Failure"],
                "urgency_trigger": ["chest pain", "radiating pain", "fainting"]
            },
            "Neurology": {
                "keywords": {
                    "severe headache": 5, "numbness": 4, "slurred speech": 5, 
                    "dizziness": 3, "vision blur": 4, "confusion": 4,
                    "seizure": 5, "tremors": 3, "memory loss": 3
                },
                "conditions": ["Migraine with Aura", "Possible Neurological Event", "Episodic Seizure"],
                "urgency_trigger": ["slurred speech", "confusion", "numbness", "seizure"]
            },
            "Gastroenterology": {
                "keywords": {
                    "stomach pain": 4, "heartburn": 3, "acid reflux": 3, "bloating": 2,
                    "nausea": 3, "vomiting": 4, "constipation": 2, "diarrhea": 2, "stomach burn": 4
                },
                "conditions": ["GERD", "Gastritis", "Irritable Bowel Syndrome"],
                "urgency_trigger": ["severe stomach pain", "bloating with pain"]
            },
            "Endocrinology": {
                "keywords": {
                    "constant thirst": 5, "frequent urination": 4, "night sweats": 3,
                    "shakiness": 3, "unexplained weight loss": 4, "hormonal shift": 3, "fatigue": 2
                },
                "conditions": ["Type 2 Diabetes Screening Required", "Hyperthyroidism", "Adrenal Fatigue"],
                "urgency_trigger": ["constant thirst", "unexplained weight loss"]
            },
            "Ophthalmology": {
                "keywords": {
                    "blurry vision": 4, "eye pain": 5, "floaters": 3, "light sensitivity": 3,
                    "redness in eye": 2, "vision loss": 5
                },
                "conditions": ["Acute Conjunctivitis", "Glaucoma Warning", "Retinal Strain"],
                "urgency_trigger": ["vision loss", "severe eye pain"]
            },
            "ENT": {
                "keywords": {
                    "earache": 4, "ringing in ears": 3, "sore throat": 3, "sinus pressure": 3,
                    "loss of smell": 4, "difficulty swallowing": 4, "nasal congestion": 2
                },
                "conditions": ["Sinusitis", "Otitis Media", "Pharyngitis"],
                "urgency_trigger": ["difficulty swallowing", "severe earache"]
            },
            "Dermatology": {
                "keywords": {
                    "rash": 4, "itching": 3, "redness": 2, "blister": 4, 
                    "scaling": 3, "discoloration": 3, "mole change": 5
                },
                "conditions": ["Dermatitis", "Allergic Reaction", "Atypical Nevus Screening"],
                "urgency_trigger": ["blister", "mole change"]
            },
            "Respiratory": {
                "keywords": {
                    "cough": 3, "wheezing": 4, "throat pain": 2, 
                    "low oxygen": 5, "congestion": 2, "phlegm": 3, "shortness of breath": 5
                },
                "conditions": ["Acute Bronchitis", "Asthma Flare-up", "Pneumonia Alert"],
                "urgency_trigger": ["low oxygen", "wheezing", "shortness of breath"]
            },
            "General Medicine": {
                "keywords": {
                    "fever": 3, "fatigue": 2, "nausea": 3, "body ache": 3, 
                    "chills": 3, "dehydration": 4, "general weakness": 2
                },
                "conditions": ["Viral Syndrome", "Bacterial Infection", "Systemic Fatigue"],
                "urgency_trigger": ["high fever", "dehydration"]
            }
        }

    def predict(self, symptoms_list: list) -> dict:
        text = " ".join(symptoms_list).lower()
        scores = {dept: 0 for dept in self.knowledge_base}
        matched_urgency_triggers = []

        # 1. Weighted Scoring Engine
        for dept, data in self.knowledge_base.items():
            for kw, weight in data["keywords"].items():
                if kw in text:
                    scores[dept] += weight
            
            # Check for Department-Specific Urgency
            for trigger in data["urgency_trigger"]:
                if trigger in text:
                    matched_urgency_triggers.append(trigger)

        # 2. Determine Primary Department
        best_dept = max(scores, key=scores.get)
        total_score = scores[best_dept]

        # 3. Urgency and Sentiment Analysis
        is_critical = len(matched_urgency_triggers) >= 1 or total_score > 8
        urgency = "Urgent" if is_critical else "Normal"
        
        # 4. Generate Medical Outcome
        if total_score == 0:
            return {
                "disease": "Inconclusive Symptoms",
                "confidence": 0.5,
                "urgency": "Normal",
                "recommendation": "Please provide more specific symptoms or consult a general practitioner for an initial screening.",
                "solution": "Monitor your vitals (temperature, heart rate) and keep a log of when these sensations occur."
            }

        dept_data = self.knowledge_base[best_dept]
        condition = dept_data["conditions"][0] if total_score > 5 else "General " + best_dept + " Concern"
        
        # Dynamic Solutions
        solutions = {
            "Cardiology": "Rest immediately, keep an aspirin nearby if recommended by previous history, and avoid all physical stress until evaluated.",
            "Neurology": "Find a dark, quiet room. Stay hydrated and avoid screen time. If symptoms like slurred speech persist, seek immediate care.",
            "Gastroenterology": "Avoid heavy or spicy foods. Stay hydrated with small sips of water. Antacids may provide temporary relief for heartburn.",
            "Endocrinology": "Monitor your fluid intake and blood sugar if you have the equipment. Avoid refined sugars until you see a specialist.",
            "Ophthalmology": "Rest your eyes, avoid bright lights, and do not rub your eyes. If vision loss is sudden, treat as an emergency.",
            "ENT": "Gargle with warm salt water for throat pain. Use steam inhalation for sinus pressure. Avoid loud noises.",
            "Dermatology": "Avoid scratching or applying unverified creams. Use a cool compress and document any rapid changes in appearance.",
            "Respiratory": "Use a humidifier and stay in a seated position to aid breathing. Use a pulse oximeter if available.",
            "General Medicine": "Increase fluid intake (electrolytes), monitor temperature every 4 hours, and rest."
        }

        return {
            "disease": f"Potential {condition} ({best_dept})",
            "confidence": min(0.6 + (total_score * 0.05), 0.98),
            "urgency": urgency,
            "recommendation": f"Based on your symptoms, a consultation with a specialist in {best_dept} is advised." + 
                             (" EMERGENCY: Auto-booking triggered." if urgency == "Urgent" else ""),
            "solution": solutions.get(best_dept, "Rest and monitor your condition.")
        }

# Singleton instance to be used by the backend service wrapper
predictor = SymptomPredictorModel()