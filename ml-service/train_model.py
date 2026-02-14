import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib
import json
import os

# Define file paths
DATA_PATH = "data.csv"
MODEL_PATH = "model.pkl"
SCALER_PATH = "scaler.pkl"
METRICS_PATH = "metrics.json"

def train_and_save_model():
    print("Loading data...")
    try:
        df = pd.read_csv(DATA_PATH)
    except FileNotFoundError:
        print(f"Error: {DATA_PATH} not found.")
        return

    # specific feature order expected by the API
    feature_cols = [
        "tenure_months",
        "performance_score",
        "engagement_score",
        "promotions",
        "salary_percentile",
        "leave_days_last_12_months",
        "overtime_hours_per_month",
        "months_since_last_promotion",
    ]

    target_col = "attrition"

    # Check if columns exist
    missing_cols = [col for col in feature_cols + [target_col] if col not in df.columns]
    if missing_cols:
        print(f"Error: Missing columns in data.csv: {missing_cols}")
        return

    X = df[feature_cols]
    y = df[target_col]

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Scale features
    print("Scaling features...")
    scaler = StandardScaler()
    # Fit on values to avoid feature name warnings during prediction (since app.py uses raw numpy arrays)
    X_train_scaled = scaler.fit_transform(X_train.values)
    X_test_scaled = scaler.transform(X_test.values)

    # Train model
    print("Training Logistic Regression model...")
    model = LogisticRegression(random_state=42)
    model.fit(X_train_scaled, y_train)

    # Evaluate model
    print("Evaluating model...")
    y_pred = model.predict(X_test_scaled)
    
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)

    metrics = {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1_score": f1
    }

    print("Model Metrics:")
    for k, v in metrics.items():
        print(f"  {k}: {v:.4f}")

    # Save artifacts
    print("Saving artifacts...")
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=4)

    print("Training complete. Artifacts saved.")

if __name__ == "__main__":
    train_and_save_model()
