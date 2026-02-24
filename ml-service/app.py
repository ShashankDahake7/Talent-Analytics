from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import numpy as np
import joblib
import os

app = FastAPI(title="Talent Analytics ML Service", version="0.2.0")

class EmployeeFeatures(BaseModel):
    tenure_months: float = 12.0
    performance_score: float = 3.0
    engagement_score: float = 3.0
    promotions: int = 0
    salary_percentile: float = 50.0
    leave_days_last_12_months: float = 0.0
    overtime_hours_per_month: float = 0.0
    months_since_last_promotion: float = 999.0

class PredictRequest(BaseModel):
    employees: List[EmployeeFeatures]

class PredictResponse(BaseModel):
    probabilities: List[float]

def _feature_order():
    return [
        "tenure_months",
        "performance_score",
        "engagement_score",
        "promotions",
        "salary_percentile",
        "leave_days_last_12_months",
        "overtime_hours_per_month",
        "months_since_last_promotion",
    ]

scaler = None

def _init_model():
    """Load trained model and scaler, or fallback to rule-based model."""
    global scaler    
    class FallbackModel:
        def predict_proba(self, X):
            probs = []
            for row in X:
                (
                    tenure, perf, engagement, promotions, salary,
                    leave, overtime, months_since_promo,
                ) = row
                p = 0.5
                p -= tenure / 200
                p += (3.0 - perf) * 0.08
                p += (3.0 - engagement) * 0.06
                p -= promotions * 0.06
                p -= (salary - 50) / 500
                p += (leave - 10) / 80
                p += (overtime - 8) / 100
                p += min(months_since_promo, 60) / 600
                p = max(0.05, min(0.95, p))
                probs.append([1 - p, p])
            return np.array(probs)

    try:
        model = None
        if os.path.exists("model.pkl"):
            model = joblib.load("model.pkl")
        if os.path.exists("scaler.pkl"):
            scaler = joblib.load("scaler.pkl")
        if model and scaler:
            print("Loaded trained model and scaler.")
            return model
        else:
            print("Model or scaler not found. Using fallback.")
            scaler = None
            return FallbackModel()
    except Exception as e:
        print(f"Error loading model: {e}. Using fallback.")
        scaler = None
        return FallbackModel()

model = _init_model()

@app.get("/health")
def health():
    return {"status": "ok", "service": "ml-attrition", "version": "0.2.0"}

def _employee_to_row(e: EmployeeFeatures):
    order = _feature_order()
    return [getattr(e, k) for k in order]

@app.post("/predict/attrition", response_model=PredictResponse)
def predict_attrition(req: PredictRequest):
    X = np.array([_employee_to_row(e) for e in req.employees])
    if scaler:
        try:
            X = scaler.transform(X)
        except Exception as e:
            print(f"Error scaling features: {e}")
            pass        
    probs = model.predict_proba(X)[:, 1].tolist()
    return PredictResponse(probabilities=probs)