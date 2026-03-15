import asyncio
import sys
import os

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

from backend.services.symptom_service import analyze_symptoms

async def test_backend_triage():
    print("--- 🌍 BACKEND AI INTEGRATION TEST ---")
    symptoms = ["SEVERE ear pain"]
    user_id = "user_test_123"
    
    response = await analyze_symptoms(symptoms, user_id)
    print(f"Input: {symptoms}")
    print(f"Disease: {response.prediction}")
    print(f"Urgency: {response.urgency}")
    print(f"Solution: {response.solution}")
    
    if response.urgency == "Urgent":
        print("✅ SUCCESS: Backend correctly identifies Red Flag.")
    else:
        print("❌ FAILURE: Backend returned Normal for Severe case.")

if __name__ == "__main__":
    asyncio.run(test_backend_triage())
