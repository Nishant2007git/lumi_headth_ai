import pandas as pd
import sys
import os
import numpy as np

# Add the project directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from ai_services.symptom_analyzer.inference import predictor

def run_large_scale_verification():
    print("--- 🔬 LUMI HEALTH AI: LARGE SCALE STRESS TEST ---")
    
    # 1. Load Test Dataset
    test_path = os.path.join("data", "testing.csv")
    if not os.path.exists(test_path):
        print(f"Error: {test_path} not found.")
        return
        
    df = pd.read_csv(test_path)
    print(f"Loaded {len(df)} unique health scenarios for validation.\n")

    correct_predictions = 0
    total_records = len(df)
    results = []

    # 2. Iterate through all test records
    for index, row in df.iterrows():
        expected_prognosis = row['prognosis']
        # Extract symptoms (columns where value is 1)
        symptoms = row.drop('prognosis').where(lambda x: x == 1).dropna().index.tolist()
        
        # Run prediction
        prediction_result = predictor.predict(symptoms)
        predicted_prognosis = prediction_result['disease']
        urgency = prediction_result['urgency']
        confidence = prediction_result['confidence']

        is_correct = (predicted_prognosis == expected_prognosis)
        if is_correct:
            correct_predictions += 1
        
        results.append({
            "Scenario": index + 1,
            "Symptoms": ", ".join(symptoms[:2]) + "...",
            "Expected": expected_prognosis,
            "Predicted": predicted_prognosis,
            "Urgency": urgency,
            "Confidence": f"{confidence:.2f}",
            "Status": "✅ PASS" if is_correct else "❌ FAIL"
        })

    # 3. Print Results Summary
    accuracy = (correct_predictions / total_records) * 100
    print(f"Verification Results:")
    print(f"Total Scenarios Tested: {total_records}")
    print(f"Correct Predictions: {correct_predictions}")
    print(f"Final Validation Accuracy: {accuracy:.2f}%\n")

    if accuracy > 95:
        print("🏆 STATUS: AI BRAIN IS TRAINED AND RELIABLE AT SCALE.")
    else:
        print("⚠️ STATUS: AI BRAIN NEEDS FURTHER REFINEMENT.")

    # Show first 10 for user review
    print("\nSample Validation Log (First 10 Cases):")
    print(f"{'#':<3} | {'Expected Disease':<30} | {'Predicted':<30} | {'Urgency':<10} | {'Status'}")
    print("-" * 90)
    for r in results[:10]:
        print(f"{r['Scenario']:<3} | {r['Expected']:<30} | {r['Predicted']:<30} | {r['Urgency']:<10} | {r['Status']}")

if __name__ == "__main__":
    run_large_scale_verification()
