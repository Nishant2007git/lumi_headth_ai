import sys
import os
# Add the project directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from ai_services.mental_health_bot.nlp_agent import agent

def test_bot():
    # Test case 1: Anxiety
    text = "I feel so anxious and my heart is racing."
    result = agent.generate_response(text)
    print(f"Test 1 (Anxiety): Intent: {result['intent']}")
    print(f"Reply: {result['reply']}\n")
    
    # Test case 2: Depression
    text = "I feel sad and alone all the time."
    result = agent.generate_response(text)
    print(f"Test 2 (Depression): Intent: {result['intent']}")
    print(f"Reply: {result['reply']}\n")

    # Test case 3: Stress
    text = "Work is very stressful lately."
    result = agent.generate_response(text)
    print(f"Test 3 (Stress): Intent: {result['intent']}")
    print(f"Reply: {result['reply']}\n")

if __name__ == "__main__":
    test_bot()
