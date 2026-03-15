import Employee from '../models/Employee.js';
import JobRole from '../models/JobRole.js';
import LearningItem from '../models/LearningItem.js';
import Feedback from '../models/Feedback.js';
import Prediction from '../models/Prediction.js';
import SkillEmbedding from '../models/SkillEmbedding.js';
import { generateContent, embedText } from './geminiClient.js';
import { getAttritionProbabilityForEmployee } from './mlClient.js';
import { MS_PER_MONTH, cosineSimilarity } from '../utils.js';

const SKILL_MATCH_THRESHOLD = 0.75;

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
  if (employee.status !== 'active') {
    throw new Error(`Attrition risk is only calculated for active employees (status: ${employee.status})`);
  }
  const tenureMonths = employee.dateOfJoining ? (Date.now() - employee.dateOfJoining.getTime()) / MS_PER_MONTH : 12;
  const monthsSinceLastPromotion = employee.lastPromotionDate ? monthsSince(employee.lastPromotionDate) : (employee.promotionsCount > 0 ? tenureMonths / (employee.promotionsCount + 1) : tenureMonths);
  const featureInput = {
    tenureMonths,
    performanceScore: employee.performanceRating ?? 3,
    engagementScore: employee.engagementScore ?? 3,
    promotions: employee.promotionsCount ?? 0,
    salaryPercentile: employee.salaryPercentile ?? 50,
    leaveDaysLast12Months: employee.leaveDaysLast12Months ?? 0,
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
  // Extracts content from Markdown code blocks: matches triple backticks, optional "json" tag, whitespace, and captures inner text.
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

  const gaps = await Promise.all(
    (role.requiredSkills || []).map(async (req) => {
      const reqEmbedding = await SkillEmbedding.findOne({
        type: 'role_skill',
        'meta.roleId': role.roleId,
        'meta.skillName': req.name,
      });

      let bestMatch = { level: 0, matchedSkill: null, similarity: 0 };

      if (reqEmbedding) {
        for (const empSkill of employee.skills || []) {
          try {
            const empVector = await embedText(empSkill.name);
            const sim = cosineSimilarity(empVector, reqEmbedding.vector);
            if (sim >= SKILL_MATCH_THRESHOLD && sim > bestMatch.similarity) {
              bestMatch = {
                level: empSkill.level || 0,
                matchedSkill: empSkill.name,
                similarity: parseFloat(sim.toFixed(3)),
              };
            }
          } catch (err) {
            console.error(`Embedding failed for skill "${empSkill.name}":`, err.message);
          }
        }
      } else {
        const key = req.name.toLowerCase();
        const found = (employee.skills || []).find(
          (s) => s.name.toLowerCase() === key
        );
        if (found) {
          bestMatch = { level: found.level || 0, matchedSkill: found.name, similarity: 1 };
        }
      }

      const gap = Math.max(0, (req.minLevel || 0) - bestMatch.level);
      return {
        skill: req.name,
        requiredLevel: req.minLevel,
        currentLevel: bestMatch.level,
        matchedSkill: bestMatch.matchedSkill,
        similarity: bestMatch.similarity || null,
        gap,
      };
    })
  );

  return {
    employeeId,
    targetRoleId: role.roleId,
    targetRoleTitle: role.title,
    gaps,
  };
}