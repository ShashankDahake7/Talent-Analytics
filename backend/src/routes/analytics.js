import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import * as analyticsController from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/headcount', authenticate, requireRole(['HR_ADMIN']), analyticsController.getHeadcount);
router.get('/attrition-risk', authenticate, requireRole(['HR_ADMIN']), analyticsController.getAttritionRiskStats);
router.get('/attrition-risk-by-dept', authenticate, requireRole(['HR_ADMIN']), analyticsController.getAttritionRiskByDept);
router.get('/attrition-forecast', authenticate, requireRole(['HR_ADMIN']), analyticsController.getForecast);

export default router;