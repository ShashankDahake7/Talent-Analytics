import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
import joblib

DATA_PATH = "data.csv"
MODEL_PATH = "model.pkl"
SCALER_PATH = "scaler.pkl"

def train_and_save_model():
    print("Loading data...")
    try:
        df = pd.read_csv(DATA_PATH)
    except FileNotFoundError:
        print(f"Error: {DATA_PATH} not found.")
        return

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

    missing_cols = [col for col in feature_cols + [target_col] if col not in df.columns]
    if missing_cols:
        print(f"Error: Missing columns in data.csv: {missing_cols}")
        return

    X = df[feature_cols]
    y = df[target_col]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Scaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train.values)
    X_test_scaled = scaler.transform(X_test.values)

    print("Training Logistic Regression model...")
    model = LogisticRegression(random_state=42)
    model.fit(X_train_scaled, y_train)

    print("Evaluating model...")
    y_pred = model.predict(X_test_scaled)
    
    print("Saving artifacts...")
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    
    print("Training complete. Artifacts saved.")

if __name__ == "__main__":
    train_and_save_model()