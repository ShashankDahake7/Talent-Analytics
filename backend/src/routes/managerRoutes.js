import express from 'express';
import * as managerController from '../controllers/managerController.js';
import { authenticate as protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/:id/assessment', protect, requireRole(['HR_ADMIN', 'MANAGER']), managerController.getManagerAssessment);
router.get('/:id/assessment/history', protect, requireRole(['HR_ADMIN', 'MANAGER']), managerController.getAssessmentHistory);

export default router;