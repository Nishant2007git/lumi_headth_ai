import sys
import os
# Add the project directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from ai_services.symptom_analyzer.inference import predictor

def test_red_flags():
    print("--- 🚩 AI RED FLAG VERIFICATION ---")
    
    # Case 1: Normal ear pain (simulated via closest match or fallback)
    # Note: Ear pain isn't a feature, so we use a symptom that exists but is normal
    case_normal = ["itching", "skin_rash"] # Acne context
    res1 = predictor.predict(case_normal)
    print(f"Normal Case: {res1['disease']} | Urgency: {res1['urgency']}")

    # Case 2: Same symptoms but with "SEVERE" keyword
    case_severe = ["severe itching", "skin_rash", "extreme pain"]
    res2 = predictor.predict(case_severe)
    print(f"Severe Case: {res2['disease']} | Urgency: {res2['urgency']}")
    print(f"Solution: {res2['solution']}")

    # Case 3: User's specific example - Ear Pain (simulated)
    # Even if it's inconclusive disease-wise, urgency should be detected
    case_ear = ["severe ear pain", "unbearable pressure"]
    res3 = predictor.predict(case_ear)
    print(f"User Case (Severe Ear Pain): {res3['disease']} | Urgency: {res3['urgency']}")
    print(f"Status: {res3['solution']}")

if __name__ == "__main__":
    test_red_flags()
