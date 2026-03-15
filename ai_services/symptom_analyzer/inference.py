import logging

logger = logging.getLogger(__name__)

import logging
import joblib
import os
import numpy as np

logger = logging.getLogger(__name__)

class SymptomPredictorModel:
    def __init__(self, model_path: str = "symptom_model.joblib"):
        self.model_path = os.path.join(os.path.dirname(__file__), model_path)
        self.model_data = None
        self.load_model()

    def load_model(self):
        try:
            if os.path.exists(self.model_path):
                self.model_data = joblib.load(self.model_path)
                logger.info(f"ML Model loaded from {self.model_path}")
            else:
                logger.warning(f"Model file {self.model_path} not found. AI will be limited.")
        except Exception as e:
            logger.error(f"Error loading AI model: {e}")

    def predict(self, symptoms_list: list) -> dict:
        if not self.model_data:
            return {
                "disease": "System Initialization...",
                "confidence": 0.0,
                "urgency": "Normal",
                "recommendation": "The AI model is still loading or could not be found.",
                "solution": "Please try again in a moment."
            }

        # 1. Transform input symptoms to vector
        model = self.model_data["model"]
        feature_names = self.model_data["symptoms"]
        
        # Create a zero vector for features
        input_vector = np.zeros(len(feature_names))
        
        # Clean symptoms list: dataset uses underscores instead of spaces
        cleaned_input = [s.lower().replace(" ", "_") for s in symptoms_list]
        
        # Populate vector
        matches = 0
        input_vector = np.zeros(len(feature_names))
        cleaned_input = [s.lower().replace(" ", "_").strip() for s in symptoms_list]
        
        for i, sym in enumerate(feature_names):
            # Direct match
            if sym in cleaned_input:
                input_vector[i] = 1
                matches += 1
            # Partial match (e.g. "sneezing" matches "continuous_sneezing")
            elif any(sym in user_s or user_s in sym for user_s in cleaned_input):
                input_vector[i] = 1
                matches += 1

        # Triage Overrides (Keywords)
        intensity_keywords = ["severe", "extreme", "unbearable", "excruciating", "bleeding", "unconscious"]
        has_red_flag = any(kw in " ".join(symptoms_list).lower() for kw in intensity_keywords)

        if matches == 0:
            urgency = "Urgent" if has_red_flag else "Normal"
            solution = "⚠️ HIGH INTENSITY DETECTED: Seek medical evaluation." if has_red_flag else "Monitor your vitals and keep a log of symptoms."
            return {
                "disease": "Inconclusive",
                "confidence": 0.0,
                "urgency": urgency,
                "recommendation": "Your symptoms don't match our primary dataset, but the intensity suggests you should consult a doctor." if has_red_flag else "Try describing your symptoms differently (e.g., 'fever', 'cough').",
                "solution": solution
            }

        # 2. Predict using Multi-Output Random Forest
        input_vector = input_vector.reshape(1, -1)
        # Prediction will be [prognosis, severity]
        prediction_combined = model.predict(input_vector)[0]
        prediction = prediction_combined[0]
        severity_prediction = prediction_combined[1]
        
        # Get individual probabilities for confidence
        # In multi-output, predict_proba returns a list of arrays
        probs_list = model.predict_proba(input_vector)
        # Index 0 is prognosis, Index 1 is severity
        confidence = np.max(probs_list[0])

        # 3. Logic and Response
        # DATA-DRIVEN TRIAGE + INTENSITY OVERRIDE (Red Flag Logic)
        urgency = severity_prediction
        
        if has_red_flag and urgency == "Normal":
            urgency = "Urgent"
            solution_prefix = "⚠️ HIGH INTENSITY DETECTED: "
        else:
            solution_prefix = ""

        # 4. Map to Recommendations (Expanded for more context)
        recommendations = {
            'Fungal infection': "Consult a dermatologist for antifungal treatment.",
            'Allergy': "Identify triggers and avoid them. Antihistamines may help.",
            'GERD': "Avoid acidic foods and maintain a healthy weight.",
            'Chronic cholestasis': "Requires liver function tests; consult a specialist.",
            'Drug Reaction': "Stop suspected medication and seek immediate care.",
            'Peptic ulcer diseae': "Avoid spicy foods; consult a gastroenterologist.",
            'AIDS': "Seek specialized care for therapy and long-term health.",
            'Diabetes ': "Monitor blood sugar levels and consult an endocrinologist.",
            'Gastroenteritis': "Stay hydrated and follow a bland (BRAT) diet.",
            'Bronchial Asthma': "Ensure inhaler is accessible; avoid known allergens.",
            'Hypertension ': "Monitor BP and consult a doctor regarding medication.",
            'Migraine': "Rest in a dark, quiet room; monitor triggers.",
            'Cervical spondylosis': "Physiotherapy and posture correction advised.",
            'Paralysis (brain hemorrhage)': "EMERGENCY: Immediate hospital transport required.",
            'Jaundice': "Rest and clinical evaluation of liver function required.",
            'Malaria': "Course of antimalarials and monitoring is necessary.",
            'Chicken pox': "Isolate and treat symptoms; avoid scratching.",
            'Dengue': "Hydrate and follow platelet counts closely.",
            'Typhoid': "Antibiotics and supportive care required.",
            'hepatitis A': "Hydration and liver-friendly diet during recovery.",
            'Hepatitis B': "Specialist consultation for viral load monitoring.",
            'Hepatitis C': "Consult a hepatologist for contemporary treatments.",
            'Hepatitis D': "Requires specialized viral management.",
            'Hepatitis E': "Supportive care; usually resolves with rest.",
            'Alcoholic hepatitis': "Cease alcohol use immediately; seek liver support.",
            'Tuberculosis': "Complete 6-month supervised medication course.",
            'Common Cold': "Rest, fluids, and OTC symptom management.",
            'Pneumonia': "Chest X-ray and antibiotic treatment required.",
            'Dimorphic hemmorhoids(piles)': "High fiber diet and sitz baths.",
            'Heart attack': "CRITICAL EMERGENCY: Call emergency services now.",
            'Varicose veins': "Compression therapy and avoidance of long standing.",
            'Hypothyroidism': "Regular hormone replacement as prescribed.",
            'Hyperthyroidism': "Clinical management of thyroid activity.",
            'Hypoglycemia': "Immediate glucose intake; monitor blood levels.",
            'Osteoarthristis': "Joint support and low-impact activity.",
            'Arthritis': "Anti-inflammatory management and physical therapy.",
            '(vertigo) Paroymsal  Positional Vertigo': "Vestibular exercises and specialist review.",
            'Acne': "Dermatological cleansing and topical treatment.",
            'Urinary tract infection': "Antibiotic course and increased fluid intake.",
            'Psoriasis': "Topical management and lifestyle adjustments.",
            'Impetigo': "Prescription topical antibiotics and hygiene."
        }

        return {
            "disease": prediction,
            "confidence": float(confidence),
            "urgency": urgency,
            "recommendation": recommendations.get(prediction, "Consult a specialist for further evaluation."),
            "solution": f"{solution_prefix}AI Triage verified this as {urgency} based on your clinical pattern."
        }

# Singleton instance
predictor = SymptomPredictorModel()

# Singleton instance to be used by the backend service wrapper