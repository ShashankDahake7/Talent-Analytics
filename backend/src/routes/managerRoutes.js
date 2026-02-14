import express from 'express';
import * as managerController from '../controllers/managerController.js';
import { authenticate as protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/:id/assessment', protect, managerController.getManagerAssessment);
router.get('/:id/assessment/history', protect, managerController.getAssessmentHistory);

export default router;