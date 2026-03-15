import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import os

def train_model():
    # 1. Load Data
    data_path = os.path.join("data", "training.csv")
    test_path = os.path.join("data", "testing.csv")
    
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found.")
        return

    df = pd.read_csv(data_path)
    test_df = pd.read_csv(test_path)

    # 2. Preprocessing
    # Ensure we only take valid symptom columns and the correct prognosis column
    X = df.drop(columns=['prognosis']).dropna(axis=1, how='all')
    y = df['prognosis']
    
    # Do the same for test data if it has the same structure
    X_test = test_df.drop(columns=['prognosis']).dropna(axis=1, how='all')
    y_test = test_df['prognosis']

    # Ensure columns match (scikit-learn requirement)
    # Some datasets have minor variations
    common_cols = [c for c in X.columns if c in X_test.columns]
    X = X[common_cols]
    X_test = X_test[common_cols]

    print(f"Dataset loaded. Symptoms: {X.shape[1]}, Records: {X.shape[0]}")

    # 3. Training
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)

    # 4. Evaluation
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model Accuracy: {accuracy * 100:.2f}%")

    # 5. Save Model and Metadata
    model_data = {
        "model": model,
        "symptoms": list(X.columns),
        "classes": list(model.classes_)
    }
    
    joblib.dump(model_data, "symptom_model.joblib")
    print("Model saved to symptom_model.joblib")

if __name__ == "__main__":
    train_model()
