import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import * as employeeController from '../controllers/employeeController.js';

const router = express.Router();

router.get('/', authenticate, requireRole(['HR_ADMIN', 'MANAGER']), employeeController.getEmployees);
router.get('/:employeeId', authenticate, requireRole(['HR_ADMIN', 'MANAGER', 'EMPLOYEE']), employeeController.getEmployeeById);
router.post('/', authenticate, requireRole(['HR_ADMIN']), employeeController.createEmployee);
router.put('/:employeeId', authenticate, requireRole(['HR_ADMIN']), employeeController.updateEmployee);

export default router;