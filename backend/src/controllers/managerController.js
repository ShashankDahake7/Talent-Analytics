import * as aiService from '../services/aiService.js';
import ManagerAssessment from '../models/ManagerAssessment.js';

export const getManagerAssessment = async (req, res) => {
    try {
        const { id } = req.params;
        const recentAssessment = await ManagerAssessment.findOne({
            managerId: id,
            createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        }).sort({ createdAt: -1 });
        if (recentAssessment && !req.query.forceRefresh) {
            return res.json(recentAssessment);
        }
        const assessment = await aiService.assessManagerEffectiveness(id);
        res.json(assessment);
    }
    catch (error) {
        console.error('Error getting manager assessment:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getAssessmentHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const history = await ManagerAssessment.find({ managerId: id }).sort({ createdAt: -1 });
        res.json(history);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};