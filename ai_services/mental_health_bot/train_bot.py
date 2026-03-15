import json
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.pipeline import Pipeline
import joblib
import os

def train_bot():
    # 1. Load Data
    data_path = "intents.json"
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found.")
        return

    with open(data_path, 'r') as f:
        data = json.load(f)

    # 2. Prepare Training Samples
    training_data = []
    for intent in data['intents']:
        for pattern in intent['patterns']:
            training_data.append({
                "text": pattern,
                "intent": intent['tag']
            })
    
    df = pd.DataFrame(training_data)
    print(f"Loaded {len(df)} training examples across {df['intent'].nunique()} intents.")

    # 3. Create Pipeline
    # Using TF-IDF and LinearSVC for fast, accurate intent classification
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), stop_words='english')),
        ('clf', LinearSVC(random_state=42))
    ])

    # 4. Train
    pipeline.fit(df['text'], df['intent'])
    print("Model trained successfully.")

    # 5. Save Model and Responses
    # We also need the responses to map back
    responses = {intent['tag']: intent['responses'] for intent in data['intents']}
    
    model_data = {
        "pipeline": pipeline,
        "responses": responses
    }
    
    joblib.dump(model_data, "bot_model.joblib")
    print("Bot model saved to bot_model.joblib")

if __name__ == "__main__":
    train_bot()
