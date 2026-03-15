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

    # 3. Severity Mapping
    severity_map = {
        'Heart attack': 'Emergency',
        'Paralysis (brain hemorrhage)': 'Emergency',
        'Dengue': 'Urgent',
        'Malaria': 'Urgent',
        'Pneumonia': 'Urgent',
        'Typhoid': 'Urgent',
        'hepatitis A': 'Urgent',
        'Hepatitis B': 'Urgent',
        'Hepatitis C': 'Urgent',
        'Hepatitis D': 'Urgent',
        'Hepatitis E': 'Urgent',
        'Jaundice': 'Urgent',
        'Hypoglycemia': 'Urgent',
        'Hypertension ': 'Urgent',
        'Diabetes ': 'Urgent',
        'AIDS': 'Urgent',
        'Tuberculosis': 'Urgent',
        'Bronchial Asthma': 'Urgent',
        'Alcoholic hepatitis': 'Urgent',
        'Drug Reaction': 'Urgent',
        'Hypothyroidism': 'Normal',
        'Hyperthyroidism': 'Normal',
        'Common Cold': 'Normal',
        'Acne': 'Normal',
        'Fungal infection': 'Normal',
        'Allergy': 'Normal',
        'GERD': 'Normal',
        'Chronic cholestasis': 'Normal',
        'Peptic ulcer diseae': 'Normal',
        'Gastroenteritis': 'Normal',
        'Migraine': 'Normal',
        'Cervical spondylosis': 'Normal',
        'Chicken pox': 'Normal',
        'Dimorphic hemmorhoids(piles)': 'Normal',
        'Varicose veins': 'Normal',
        'Osteoarthristis': 'Normal',
        'Arthritis': 'Normal',
        '(vertigo) Paroymsal  Positional Vertigo': 'Normal',
        'Urinary tract infection': 'Normal',
        'Psoriasis': 'Normal',
        'Impetigo': 'Normal'
    }

    # Add severity column to training data
    y_severity = y.map(severity_map).fillna('Normal')
    y_test_severity = y_test.map(severity_map).fillna('Normal')

    print(f"Dataset loaded. Symptoms: {X.shape[1]}, Records: {X.shape[0]}")

    # 4. Training (Multi-Output)
    # We combine y (prognosis) and y_severity into a multi-target output
    Y_combined = pd.concat([y, y_severity], axis=1)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, Y_combined)

    # 5. Evaluation
    y_pred = model.predict(X_test)
    # y_pred will be a numpy array where each row is [prognosis, severity]
    
    prog_acc = accuracy_score(y_test, y_pred[:, 0])
    sev_acc = accuracy_score(y_test_severity, y_pred[:, 1])
    
    print(f"Prognosis Accuracy: {prog_acc * 100:.2f}%")
    print(f"Severity Accuracy: {sev_acc * 100:.2f}%")

    # 6. Save Model and Metadata
    model_data = {
        "model": model,
        "symptoms": list(X.columns),
        "classes": list(y.unique()),
        "severity_map": severity_map
    }
    
    joblib.dump(model_data, "symptom_model.joblib")
    print("Model saved to symptom_model.joblib")

if __name__ == "__main__":
    train_model()
