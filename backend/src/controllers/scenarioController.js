import Employee from '../models/Employee.js';
import { generateContent } from '../services/geminiClient.js';
import { MS_PER_MONTH } from '../utils.js';

export const runAttritionScenario = async (req, res) => {
    try {
        const { employeeIds = [] } = req.body;
        if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
            return res.status(400).json({ message: 'employeeIds array is required' });
        }
        const employees = await Employee.find({ employeeId: { $in: employeeIds } });
        const byDept = {};
        employees.forEach((e) => {
            const dept = e.departmentId || 'UNASSIGNED';
            if (!byDept[dept]) byDept[dept] = { count: 0, names: [] };
            byDept[dept].count += 1;
            byDept[dept].names.push(e.name);
        });
        const systemPrompt =
            'You are an HR workforce planning assistant. Analyze the business impact of hypothetical attrition using the full employee data provided. Reference specific skills, performance levels, departments, and risk scores. Suggest concrete mitigation actions in 4-6 sentences.';

        const userInput = `The following employees are assumed to leave:\n${employees.map((e) => {
            const tenureMonths = e.dateOfJoining
                ? Math.round((Date.now() - new Date(e.dateOfJoining).getTime()) / MS_PER_MONTH)
                : null;
            const skills = Array.isArray(e.skills) && e.skills.length > 0
                ? e.skills.map((s) => `${s.name} L${s.level}`).join(', ')
                : 'No skills recorded';
            return [
                `- ${e.name}`,
                `  Department: ${e.departmentId || 'N/A'}, Role: ${e.roleId || 'N/A'}`,
                `  Performance: ${e.performanceRating ?? 'N/A'}/5, Engagement: ${e.engagementScore ?? 'N/A'}/5`,
                `  Attrition risk: ${e.attritionRiskBand ?? 'not assessed'} (score: ${e.attritionRiskScore != null ? (e.attritionRiskScore * 100).toFixed(0) + '%' : 'N/A'})`,
                `  Tenure: ${tenureMonths != null ? tenureMonths + ' months' : 'N/A'}`,
                `  High potential: ${e.highPotentialFlag ? 'Yes' : 'No'}`,
                `  Skills: ${skills}`,
            ].join('\n');
        }).join('\n\n')}\n\nSummarize the impact for HR and suggest mitigation actions.`;

        let explanation = '';
        try {
            explanation = await generateContent({ systemPrompt, userInput });
        } catch (err) {
            console.error('Gemini scenario explanation failed:', err.message);
        }

        res.json({
            totalAtRisk: employees.length,
            impactByDepartment: byDept,
            explanation,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || 'Error running scenario' });
    }
};
