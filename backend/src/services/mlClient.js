const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export async function getAttritionProbabilityForEmployee(employee) {
  const features = {
    tenure_months: employee.tenureMonths ?? 12,
    performance_score: employee.performanceScore ?? 3,
    engagement_score: employee.engagementScore ?? 3,
    promotions: employee.promotions ?? 0,
    salary_percentile: employee.salaryPercentile ?? 50,
    leave_days_last_12_months: employee.leaveDaysLast12Months ?? 0,
    overtime_hours_per_month: employee.overtimeHoursPerMonth ?? 0,
    months_since_last_promotion: employee.monthsSinceLastPromotion ?? 999,
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