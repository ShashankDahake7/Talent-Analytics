import {
    getAttritionRiskForEmployee,
    getCareerRecommendations,
    analyzeFeedbackText,
    summarizeTeamFeedback,
    evaluateHighPotential,
    getSkillGaps,
} from '../services/aiService.js';
import {
    ensureRoleSkillEmbeddings,
    ensureLearningItemEmbeddings,
    findSimilarSkills,
} from '../services/skillEmbeddingService.js';

export const getAttritionRisk = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const result = await getAttritionRiskForEmployee(employeeId);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || 'Error computing attrition risk' });
    }
};

export const getCareerRecs = async (req, res) => {
    try {
        const { employeeId } = req.params;
        if (req.user.role === 'EMPLOYEE' && req.user.employeeId !== employeeId) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const result = await getCareerRecommendations(employeeId);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || 'Error generating recommendations' });
    }
};

export const analyzeFeedback = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ message: 'Text is required' });
        }
        const result = await analyzeFeedbackText(text);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || 'Error analyzing feedback' });
    }
};

export const summarizeFeedback = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const result = await summarizeTeamFeedback(employeeId);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || 'Error summarizing feedback' });
    }
};

export const evaluateHiPo = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const result = await evaluateHighPotential(employeeId);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || 'Error evaluating high potential' });
    }
};

export const getEmployeeSkillGaps = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { roleId } = req.query;
        if (!roleId) {
            return res.status(400).json({ message: 'roleId is required' });
        }
        if (req.user.role === 'EMPLOYEE' && req.user.employeeId !== employeeId) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const result = await getSkillGaps(employeeId, roleId);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || 'Error computing skill gaps' });
    }
};

export const generateRoleEmbeddings = async (req, res) => {
    try {
        const result = await ensureRoleSkillEmbeddings();
        res.json(result);
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: err.message || 'Error generating role skill embeddings' });
    }
};

export const generateLearningEmbeddings = async (req, res) => {
    try {
        const result = await ensureLearningItemEmbeddings();
        res.json(result);
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: err.message || 'Error generating learning item embeddings' });
    }
};

export const searchSimilarSkills = async (req, res) => {
    try {
        const { q, topK } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Query parameter q is required' });
        }
        const k = topK ? Number(topK) : 10;
        const result = await findSimilarSkills(q, Number.isNaN(k) ? 10 : k);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || 'Error finding similar skills' });
    }
};
