const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * Calls the ML service to predict attrition probability.
 * All fields in `employee` are expected to already have concrete values —
 * fallback defaults are applied upstream in aiService.js.
 */
export async function getAttritionProbabilityForEmployee(employee) {
  const features = {
    tenure_months: employee.tenureMonths,
    performance_score: employee.performanceScore,
    engagement_score: employee.engagementScore,
    promotions: employee.promotions,
    salary_percentile: employee.salaryPercentile,
    leave_days_last_12_months: employee.leaveDaysLast12Months,
    overtime_hours_per_month: employee.overtimeHoursPerMonth,
    months_since_last_promotion: employee.monthsSinceLastPromotion,
  };
  const res = await fetch(`${ML_SERVICE_URL}/predict/attrition`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employees: [features] }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ML service error: ${res.status} ${text}`);
  }
  const data = await res.json();
  const p = data?.probabilities?.[0];
  if (typeof p !== 'number') {
    throw new Error('Invalid ML response');
  }
  return p;
}