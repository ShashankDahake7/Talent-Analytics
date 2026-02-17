import Employee from '../models/Employee.js';
import JobRole from '../models/JobRole.js';
import LearningItem from '../models/LearningItem.js';
import Feedback from '../models/Feedback.js';
import Prediction from '../models/Prediction.js';
import ManagerAssessment from '../models/ManagerAssessment.js';
import { generateContent } from './geminiClient.js';
import { getAttritionProbabilityForEmployee } from './mlClient.js';

const MS_PER_MONTH = 1000 * 60 * 60 * 24 * 30;

function monthsSince(date) {
  if (!date) return 999;
  const d = date instanceof Date ? date : new Date(date);
  return Math.max(0, (Date.now() - d.getTime()) / MS_PER_MONTH);
}

export async function getAttritionRiskForEmployee(employeeId) {
  const employee = await Employee.findOne({ employeeId });
  if (!employee) {
    throw new Error('Employee not found');
  }
  const tenureMonths = employee.dateOfJoining ? (Date.now() - employee.dateOfJoining.getTime()) / MS_PER_MONTH : 12;
  const monthsSinceLastPromotion = employee.lastPromotionDate ? monthsSince(employee.lastPromotionDate) : (employee.promotionsCount > 0 ? tenureMonths / (employee.promotionsCount + 1) : tenureMonths);
  const featureInput = {
    tenureMonths,
    performanceScore: Math.max(3.2, employee.performanceRating ?? 3),
    engagementScore: employee.engagementScore ?? 3,
    promotions: employee.promotionsCount ?? 0,
    salaryPercentile: employee.salaryPercentile ?? 50,
    leaveDaysLast12Months: Math.min(10, employee.leaveDaysLast12Months ?? 0),
    overtimeHoursPerMonth: employee.overtimeHoursPerMonth ?? 0,
    monthsSinceLastPromotion,
  };
  const p = await getAttritionProbabilityForEmployee(featureInput);
  const score = Math.min(1, Math.max(0, p));
  const band = score > 0.7 ? 'high' : score > 0.4 ? 'medium' : 'low';
  const featuresUsed = {
    tenureMonths,
    performanceRating: employee.performanceRating ?? null,
    engagementScore: employee.engagementScore ?? null,
    promotionsCount: employee.promotionsCount ?? null,
    salaryPercentile: employee.salaryPercentile ?? null,
    leaveDaysLast12Months: employee.leaveDaysLast12Months ?? null,
    overtimeHoursPerMonth: employee.overtimeHoursPerMonth ?? null,
    monthsSinceLastPromotion,
  };
  const systemPrompt = 'You are an HR analytics assistant. Explain attrition risk for an HR audience in 2-3 concise sentences.';
  const userInput = `Employee data:
Name: ${employee.name}
Department: ${employee.departmentId || 'N/A'}
Manager: ${employee.managerId || 'N/A'}
Location: ${employee.location || 'N/A'}
Tenure (months): ${tenureMonths.toFixed(0)}
Performance: ${employee.performanceRating ?? 'N/A'}
Engagement: ${employee.engagementScore ?? 'N/A'}
Promotions: ${employee.promotionsCount ?? 0}
Salary percentile: ${employee.salaryPercentile ?? 'N/A'}
Leave days (last 12 months): ${employee.leaveDaysLast12Months ?? 0}
Overtime (hours/month): ${employee.overtimeHoursPerMonth ?? 0}
Months since last promotion: ${monthsSinceLastPromotion === 999 ? 'never' : monthsSinceLastPromotion.toFixed(0)}
ML attrition risk score (0-1): ${score.toFixed(2)} (band: ${band}).
Explain in plain language why this employee might be at this risk level. Use only the facts above.`;
  let explanation = '';
  try {
    explanation = await generateContent({ systemPrompt, userInput });
  }
  catch (err) {
    console.error('Gemini explanation failed:', err.message);
    explanation = `Risk band: ${band}. Score: ${(score * 100).toFixed(0)}%. Based on tenure, performance, engagement, promotions, salary, leave frequency, overtime, and time since last promotion.`;
  }
  await Prediction.create({
    employeeId,
    type: 'ATTRITION',
    score,
    band,
    featuresUsed,
    explanation,
    modelVersion: 'ml-service-v2',
  });
  employee.attritionRiskScore = score;
  employee.attritionRiskBand = band;
  await employee.save();
  return { employeeId, score, band, explanation };
}

export async function getCareerRecommendations(employeeId) {
  const employee = await Employee.findOne({ employeeId });
  if (!employee) {
    throw new Error('Employee not found');
  }
  const roles = await JobRole.find({});
  const learning = await LearningItem.find({});
  const systemPrompt = 'You are a career coach for an internal talent marketplace. Use only the provided data. Return JSON with fields: "paths" (array of {roleId,title,reason}) and "learning" (array of {itemId,title,reason}).';
  const userInput = `Employee profile: ${JSON.stringify(employee.toObject(), null, 2)}
  Available roles: ${JSON.stringify(
    roles.map((r) => ({
      roleId: r.roleId,
      title: r.title,
      jobFamily: r.jobFamily,
      level: r.level,
      requiredSkills: r.requiredSkills,
    })), null, 2
  )}
  Available learning items: ${JSON.stringify(
    learning.map((l) => ({
      itemId: l.itemId,
      title: l.title,
      skillsTargeted: l.skillsTargeted,
      level: l.level,
    })), null, 2
  )}
  Recommend top 3 target roles and top 5 learning items to close skill gaps. Respond with valid JSON only: {"paths":[...],"learning":[...]}.`;
  const raw = await generateContent({ systemPrompt, userInput });
  let parsed;
  let jsonStr = raw.trim();
  const codeBlock = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) jsonStr = codeBlock[1].trim();
  try {
    parsed = JSON.parse(jsonStr);
  }
  catch {
    parsed = { rawText: raw };
  }
  if (parsed && !Array.isArray(parsed.paths)) parsed.paths = parsed.paths || [];
  if (parsed && !Array.isArray(parsed.learning)) parsed.learning = parsed.learning || [];
  return parsed;
}

export async function analyzeFeedbackText(text) {
  const systemPrompt = 'You are analyzing employee feedback for HR. Return JSON: { sentimentScore: number between -1 and 1, topics: string[] }.';
  const userInput = `Feedback text:\n${text}\n\nAnalyze the sentiment and main themes.`;
  const raw = await generateContent({ systemPrompt, userInput });
  try {
    return JSON.parse(raw);
  }
  catch {
    return { rawText: raw };
  }
}

export async function summarizeTeamFeedback(employeeId) {
  const feedback = await Feedback.find({ employeeId }).sort({ createdAt: 1 });
  if (!feedback || feedback.length === 0) {
    return { summary: 'No feedback on file for this employee.' };
  }
  const systemPrompt = 'You summarize feedback for HR. Return 2-3 bullet points of main themes and overall sentiment. Use only the feedback items provided.';
  const itemsText = feedback
    .map((f, i) => `${i + 1}. [${f.source || 'other'}]: ${f.text}`)
    .join('\n');
  const userInput = `Feedback items for this employee:\n\n${itemsText}\n\nSummarize into 2-3 bullet points (main themes and overall sentiment).`;
  const summary = await generateContent({ systemPrompt, userInput });
  return { summary };
}

export async function evaluateHighPotential(employeeId) {
  const employee = await Employee.findOne({ employeeId });
  if (!employee) {
    throw new Error('Employee not found');
  }
  const perf = employee.performanceRating ?? 3;
  const pot = employee.potentialRating ?? 3;
  const tenureMonths = employee.dateOfJoining ? (Date.now() - employee.dateOfJoining.getTime()) / (MS_PER_MONTH) : 12;
  const isHipo = perf >= 4 && pot >= 4 && tenureMonths >= 12;
  employee.highPotentialFlag = isHipo;
  await employee.save();
  return {
    employeeId,
    highPotential: isHipo,
    performanceRating: perf,
    potentialRating: pot,
    tenureMonths,
  };
}

export async function getSkillGaps(employeeId, targetRoleId) {
  const employee = await Employee.findOne({ employeeId });
  if (!employee) {
    throw new Error('Employee not found');
  }
  const role = await JobRole.findOne({ roleId: targetRoleId });
  if (!role) {
    throw new Error('Job role not found');
  }
  const empSkills = Object.fromEntries(
    (employee.skills || []).map((s) => [s.name.toLowerCase(), s.level || 0])
  );
  const gaps = role.requiredSkills.map((req) => {
    const key = req.name.toLowerCase();
    const current = empSkills[key] ?? 0;
    const gap = Math.max(0, (req.minLevel || 0) - current);
    return {
      skill: req.name,
      requiredLevel: req.minLevel,
      currentLevel: current,
      gap,
    };
  });
  return {
    employeeId,
    targetRoleId: role.roleId,
    targetRoleTitle: role.title,
    gaps,
  };
}

export async function assessManagerEffectiveness(managerId) {
  const manager = await Employee.findOne({ employeeId: managerId });
  if (!manager) throw new Error('Manager not found');
  const directReports = await Employee.find({ managerId });
  if (directReports.length === 0) {
    throw new Error('This employee has no direct reports.');
  }
  const totalEmployees = directReports.length;
  const avgPerformance = directReports.reduce((sum, e) => sum + (e.performanceRating || 3), 0) / totalEmployees;
  const avgEngagement = directReports.reduce((sum, e) => sum + (e.engagementScore || 0), 0) / totalEmployees; // 0-100 scale
  const retainedCount = directReports.filter((e) => !e.attritionRiskBand || e.attritionRiskBand === 'low').length;
  const retentionRate = (retainedCount / totalEmployees) * 100;
  const rawScore = (avgPerformance / 5) * 40 + (avgEngagement / 100) * 30 + (retentionRate / 100) * 30;
  const overallScore = Math.min(100, Math.max(0, Math.round(rawScore)));
  const systemPrompt = `You are an expert Leadership Coach and HR Analyst.
  Analyze a manager's effectiveness based on their team's data.
  Output strict JSON with this structure:
  {
    "factors": { "positive": ["string"], "negative": ["string"] },
    "explanation": "string (2-3 sentences)",
    "suggestedInterventions": [
      { "action": "string", "predictedScore": number, "explanation": "string" }
    ]
  }
  For "predictedScore", estimate the new score (current is ${overallScore}) if the action is taken.
  Interventions should be "What-If" scenarios like "Send to Leadership Training", "Reduce Team Size", "Conduct Stay Interviews", etc.`;
  const userInput = `Manager: ${manager.name} (${manager.departmentId})
  Team Size: ${totalEmployees}
  Average Performance: ${avgPerformance.toFixed(1)} / 5
  Average Engagement: ${avgEngagement.toFixed(1)} / 100
  Retention Rate: ${retentionRate.toFixed(1)}% ({retainedCount} low risk out of ${totalEmployees})
  Analyze this manager's effectiveness.`;
  let aiResult = {};
  try {
    const raw = await generateContent({ systemPrompt, userInput });
    const jsonStr = raw.match(/\{[\s\S]*\}/)?.[0] || '{}';
    aiResult = JSON.parse(jsonStr);
  }
  catch (err) {
    console.error('Gemini manager assessment failed:', err);
    aiResult = {
      factors: { positive: [], negative: [] },
      explanation: 'AI analysis unavailable.',
      suggestedInterventions: [],
    };
  }
  const assessment = await ManagerAssessment.create({
    managerId,
    overallScore,
    metrics: {
      teamSize: totalEmployees,
      averagePerformance: avgPerformance,
      retentionRate,
      averageEngagement: avgEngagement,
    },
    factors: aiResult.factors || { positive: [], negative: [] },
    aiAnalysis: aiResult.explanation || '',
    suggestedInterventions: aiResult.suggestedInterventions || [],
  });
  return assessment;
}