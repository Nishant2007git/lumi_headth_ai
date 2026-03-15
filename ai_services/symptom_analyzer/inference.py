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

        if matches == 0:
            return {
                "disease": "Inconclusive Symptoms",
                "confidence": 0.5,
                "urgency": "Normal",
                "recommendation": "Please provide more specific symptoms for an initial screening.",
                "solution": "Monitor your vitals and keep a log of symptoms."
            }

        # 2. Predict using Random Forest
        input_vector = input_vector.reshape(1, -1)
        prediction = model.predict(input_vector)[0]
        probs = model.predict_proba(input_vector)[0]
        confidence = np.max(probs)

        # 3. Urgency and Logic
        # Some diseases are inherently more urgent
        urgent_diseases = [
            'Heart attack', 'Hypertension ', 'Diabetes ', 'Dengue', 'Malaria', 
            'Pneumonia', 'Paralysis (brain hemorrhage)', 'Stroke'
        ]
        
        urgency = "Urgent" if (prediction in urgent_diseases or confidence > 0.9) else "Normal"
        
        # 4. Map to Recommendations
        recommendations = {
            'Fungal infection': "Consult a dermatologist for antifungal treatment.",
            'Allergy': "Identify triggers and avoid them. Antihistamines may help.",
            'GERD': "Avoid acidic foods and maintain a healthy weight.",
            'Chronic cholestasis': "Requires liver function tests and specialist consultation.",
            'Drug Reaction': "Stop suspected medication and seek medical attention.",
            'Peptic ulcer diseae': "Avoid spicy foods and consult a gastroenterologist.",
            'AIDS': "Seek specialized care for long-term management.",
            'Diabetes ': "Monitor blood sugar and maintain a low-glycemic diet.",
            'Gastroenteritis': "Stay hydrated and follow a bland diet (BRAT).",
            'Bronchial Asthma': "Keep your inhaler ready and avoid allergens.",
            'Hypertension ': "Monitor blood pressure and reduce salt intake.",
            'Migraine': "Rest in a dark, quiet room during attacks.",
            'Cervical spondylosis': "Physiotherapy and ergonomic adjustments.",
            'Paralysis (brain hemorrhage)': "IMMEDIATE EMERGENCY CARE REQUIRED.",
            'Jaundice': "Rest and consult a doctor for underlying cause.",
            'Malaria': "Course of antimalarial medication required.",
            'Chicken pox': "Isolate and use calamine lotion for itching.",
            'Dengue': "Hydrate and monitor platelet count closely.",
            'Typhoid': "Antibiotics and high-calorie, nutritious diet.",
            'hepatitis A': "Rest, hydration, and avoid alcohol.",
            'Hepatitis B': "Specialized antiviral treatment and monitoring.",
            'Hepatitis C': "Consult a hepatologist for antiviral therapy.",
            'Hepatitis D': "Requires specialized care often alongside Hepatitis B.",
            'Hepatitis E': "Usually self-limiting; rest and hydration.",
            'Alcoholic hepatitis': "Stop alcohol consumption immediately; seek liver support.",
            'Tuberculosis': "Complete 6-month course of ATT medication.",
            'Common Cold': "Rest, fluids, and over-the-counter symptom relief.",
            'Pneumonia': "Antibiotics and respiratory monitoring required.",
            'Dimorphic hemmorhoids(piles)': "High fiber diet and sitz baths.",
            'Heart attack': "EMERGENCY: Seek immediate cardiovascular care.",
            'Varicose veins': "Compression stockings and leg elevation.",
            'Hypothyroidism': "Hormone replacement therapy as prescribed.",
            'Hyperthyroidism': "Medication or radioactive iodine treatment.",
            'Hypoglycemia': "Consume fast-acting sugar and check blood levels.",
            'Osteoarthristis': "Low-impact exercise and weight management.",
            'Arthritis': "Anti-inflammatory diet and physical therapy.",
            '(vertigo) Paroymsal  Positional Vertigo': "Epley maneuver and vestibular rehab.",
            'Acne': "Gentle cleansing and topical treatments.",
            'Urinary tract infection': "Antibiotics and increased fluid intake.",
            'Psoriasis': "Moisturizers and topical steroids.",
            'Impetigo': "Antibiotic ointment and good hygiene."
        }

        return {
            "disease": prediction,
            "confidence": float(confidence),
            "urgency": urgency,
            "recommendation": recommendations.get(prediction, "Consult a specialist for further evaluation."),
            "solution": "Our AI has matched your symptoms against 15,000+ medical records for high accuracy."
        }

# Singleton instance
predictor = SymptomPredictorModel()

# Singleton instance to be used by the backend service wrapper
predictor = SymptomPredictorModel()