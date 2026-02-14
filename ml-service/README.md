# Talent Analytics ML Service

Python FastAPI microservice providing **ML-only** attrition predictions. The backend uses **only** this service for attrition scores (no heuristic fallback); Gemini is used only for explanations.

## Features

- `/health` – health check
- `/predict/attrition` – returns attrition probabilities for a list of employees.

**Input features (per employee):** `tenure_months`, `performance_score`, `engagement_score`, `promotions`, `salary_percentile`, `leave_days_last_12_months`, `overtime_hours_per_month`, `months_since_last_promotion`.

**Model:** Logistic regression on synthetic data with clear low / medium / high risk patterns (or a formula-based fallback if `scikit-learn` is not installed).

## Quick start

```bash
cd ml-service
python -m venv .venv
source .venv/bin/activate  # on Windows: .venv\\Scripts\\activate
pip install -r requirements.txt

uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

The Node backend expects this service at `http://localhost:8000` by default (configurable via `ML_SERVICE_URL` in the backend `.env`).

