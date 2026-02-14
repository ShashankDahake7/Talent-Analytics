import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import * as aiController from '../controllers/aiController.js';

const router = express.Router();

router.post('/attrition/:employeeId', authenticate, requireRole(['HR_ADMIN', 'MANAGER']), aiController.getAttritionRisk);
router.get('/career/:employeeId', authenticate, requireRole(['HR_ADMIN', 'MANAGER', 'EMPLOYEE']), aiController.getCareerRecs);
router.post('/feedback/analyze', authenticate, requireRole(['HR_ADMIN', 'MANAGER']), aiController.analyzeFeedback);
router.get('/feedback/summary/:employeeId', authenticate, requireRole(['HR_ADMIN', 'MANAGER']), aiController.summarizeFeedback);
router.post('/hipo/:employeeId', authenticate, requireRole(['HR_ADMIN', 'MANAGER']), aiController.evaluateHiPo);
router.get('/skills/gaps/:employeeId', authenticate, requireRole(['HR_ADMIN', 'MANAGER', 'EMPLOYEE']), aiController.getEmployeeSkillGaps);
router.post('/skills/embeddings/roles', authenticate, requireRole(['HR_ADMIN']), aiController.generateRoleEmbeddings);
router.post('/skills/embeddings/learning', authenticate, requireRole(['HR_ADMIN']), aiController.generateLearningEmbeddings);
router.get('/skills/similar', authenticate, requireRole(['HR_ADMIN', 'MANAGER', 'EMPLOYEE']), aiController.searchSimilarSkills);

export default router;