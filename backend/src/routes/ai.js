import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import * as aiController from '../controllers/aiController.js';

const router = express.Router();

router.post('/attrition/:employeeId', authenticate, requireRole(['HR_ADMIN', 'MANAGER']), aiController.getAttritionRisk);
router.get('/career/:employeeId', authenticate, requireRole(['HR_ADMIN', 'MANAGER', 'EMPLOYEE']), aiController.getCareerRecs);
router.post('/hipo/:employeeId', authenticate, requireRole(['HR_ADMIN', 'MANAGER']), aiController.evaluateHiPo);

export default router;