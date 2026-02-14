import Employee from '../models/Employee.js';
import { generateContent } from '../services/geminiClient.js';

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
            'You are an HR workforce planning assistant. Explain the business impact of hypothetical attrition in 3-5 sentences, referencing departments and skills.';

        const userInput = `The following employees are assumed to leave:\n${employees
            .map((e) => `- ${e.name} (dept: ${e.departmentId || 'N/A'}, role: ${e.roleId || 'N/A'})`)
            .join('\n')}\n\nSummarize the impact for HR and suggest mitigation actions.`;

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
