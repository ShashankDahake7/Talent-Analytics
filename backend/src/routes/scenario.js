import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import * as scenarioController from '../controllers/scenarioController.js';

const router = express.Router();

router.post('/attrition', authenticate, requireRole(['HR_ADMIN']), scenarioController.runAttritionScenario);

export default router;