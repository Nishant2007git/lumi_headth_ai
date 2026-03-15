import sys
import os
# Add the project directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from ai_services.symptom_analyzer.inference import predictor

def test_inference():
    # Test case 1: Common Cold
    symptoms = ["cough", "sneezing", "runny_nose", "fever"]
    result = predictor.predict(symptoms)
    print(f"Test 1 (Cold): {result['disease']} (Confidence: {result['confidence']:.2f})")
    
    # Test case 2: Heart Attack
    symptoms = ["chest_pain", "breathlessness", "sweating"]
    result = predictor.predict(symptoms)
    print(f"Test 2 (Heart): {result['disease']} (Confidence: {result['confidence']:.2f}) - Urgency: {result['urgency']}")

    # Test case 3: Malaria
    symptoms = ["fever", "chills", "vomiting", "headache"]
    result = predictor.predict(symptoms)
    print(f"Test 3 (Malaria): {result['disease']} (Confidence: {result['confidence']:.2f})")

if __name__ == "__main__":
    test_inference()
