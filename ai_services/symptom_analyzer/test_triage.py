import sys
import os
# Add the project directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from ai_services.symptom_analyzer.inference import predictor

def test_triage():
    print("--- Clinical Triage Verification ---")
    
    # Case 1: Emergency (Heart Attack)
    symptoms_emergency = ["chest_pain", "breathlessness", "sweating"]
    res1 = predictor.predict(symptoms_emergency)
    print(f"Case 1 (Heart Attack symptoms): {res1['disease']} | Urgency: {res1['urgency']}")
    
    # Case 2: Normal (Acne)
    symptoms_normal = ["skin_rash", "pus_filled_pimples", "blackheads"]
    res2 = predictor.predict(symptoms_normal)
    print(f"Case 2 (Acne symptoms): {res2['disease']} | Urgency: {res2['urgency']}")

    # Case 3: Urgent (Typhoid)
    symptoms_urgent = ["high_fever", "headache", "abdominal_pain", "constipation"]
    res3 = predictor.predict(symptoms_urgent)
    print(f"Case 3 (Typhoid symptoms): {res3['disease']} | Urgency: {res3['urgency']}")

if __name__ == "__main__":
    test_triage()
