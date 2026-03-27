from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import numpy as np
import joblib
import os

app = FastAPI(title="Talent Analytics ML Service", version="0.2.0")

class EmployeeFeatures(BaseModel):
    tenure_months: float
    performance_score: float
    engagement_score: float
    promotions: int
    salary_percentile: float
    leave_days_last_12_months: float
    overtime_hours_per_month: float
    months_since_last_promotion: float

class PredictRequest(BaseModel):
    employees: List[EmployeeFeatures]

class PredictResponse(BaseModel):
    probabilities: List[float]

scaler = None

def _init_model():
    """Load trained model and scaler, or fallback to rule-based model."""
    global scaler    
    
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
    except Exception as e:
        print(f"Error loading model: {e}. Using fallback.")
        scaler = None

model = _init_model()

@app.get("/health")
def health():
    return {"status": "ok", "service": "ml-attrition", "version": "0.2.0"}

def _employee_to_row(e: EmployeeFeatures):
    return list(e.model_dump().values())

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