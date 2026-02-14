import pandas as pd
import numpy as np
import random

def generate_synthetic_data(num_samples=1000):
    """
    Generates a synthetic dataset for employee attrition with realistic, dynamic patterns.
    Uses overlapping normal distributions to create separation but allows for natural noise.
    """
    np.random.seed(42)  # For reproducibility
    
    # Base Data Generation
    
    # 1. Feature Distributions
    # Tenure: Exponential
    tenure_months = np.random.exponential(scale=36, size=num_samples).astype(int)
    tenure_months = np.clip(tenure_months, 3, 120) 

    # Performance: Normal distribution
    performance = np.random.normal(loc=3.2, scale=0.8, size=num_samples)
    performance = np.round(np.clip(performance, 1.0, 5.0), 1)

    # Engagement: Normal distribution
    engagement = np.random.normal(loc=3.2, scale=0.9, size=num_samples) 
    engagement = np.round(np.clip(engagement, 1.0, 5.0), 1)

    # Salary Percentile: Uniform-ish
    salary = np.random.normal(loc=55, scale=20, size=num_samples)
    salary = np.clip(salary, 10, 100).astype(int)

    # Leave Days: Gamma
    leave_days = np.random.gamma(shape=2, scale=5, size=num_samples).astype(int)
    leave_days = np.clip(leave_days, 0, 30)

    # Overtime: Gamma
    overtime = np.random.gamma(shape=1.5, scale=5, size=num_samples).astype(int)
    overtime = np.clip(overtime, 0, 40)
    
    # Promotions: Poisson-like
    promotions = np.random.poisson(lam=0.5, size=num_samples)
    promotions = np.clip(promotions, 0, 5)

    # Months since last promo
    months_since_promo = []
    for t, p in zip(tenure_months, promotions):
        if p == 0:
            months_since_promo.append(t) 
        else:
            months_since_promo.append(np.random.randint(1, min(t, 60)))
    months_since_promo = np.array(months_since_promo)

    # 2. Assign Attrition Risk (Probabilistic)
    
    # Tweaked Coefficients for stronger separation
    logit = (
        -0.04 * tenure_months +          
        -1.5 * performance +             # Increased weight
        -1.8 * engagement +              # Increased weight
        -0.8 * promotions +              
        -0.06 * salary +                 
        +0.25 * leave_days +             # Stronger signal
        +0.20 * overtime +               # Stronger signal
        +0.02 * months_since_promo       
    )
    
    # Add random noise (Reduced noise for clearer signal)
    logit += np.random.normal(loc=0, scale=1.0, size=num_samples) 

    # Shift bias to balance classes roughly 50/50 or 60/40
    logit += 9.0  
    
    # Convert to probability using sigmoid
    probs = 1 / (1 + np.exp(-logit))
    
    # Convert probability to binary outcome
    attrition = (probs > 0.5).astype(int)
    
    # Create DataFrame
    data = np.column_stack([
        tenure_months, performance, engagement, promotions, 
        salary, leave_days, overtime, months_since_promo, 
        attrition
    ])
    
    columns = [
        "tenure_months", "performance_score", "engagement_score", "promotions", 
        "salary_percentile", "leave_days_last_12_months", "overtime_hours_per_month", 
        "months_since_last_promotion", "attrition"
    ]
    
    df = pd.DataFrame(data, columns=columns)
    
    # Ensure types
    for col in columns:
        if col not in ["performance_score", "engagement_score"]:
            df[col] = df[col].astype(int)
        else:
            df[col] = df[col].astype(float)

    return df

if __name__ == "__main__":
    df = generate_synthetic_data(1000)
    output_path = "data.csv"
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} samples and saved to {output_path}")
    
    print("\nClass distribution:")
    print(df["attrition"].value_counts(normalize=True))
