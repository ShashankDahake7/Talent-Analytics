import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import * as jobRoleController from '../controllers/jobRoleController.js';

const router = express.Router();

router.get('/', authenticate, requireRole(['HR_ADMIN', 'MANAGER', 'EMPLOYEE']), jobRoleController.getJobRoles);

export default router;