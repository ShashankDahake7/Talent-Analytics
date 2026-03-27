import {
    getAttritionRiskForEmployee,
    getCareerRecommendations,
    evaluateHighPotential,
} from '../services/aiService.js';
import Employee from '../models/Employee.js';

// user who is logged in can only see the data of their own team members
async function assertEmployeeAccess(req, employeeId) {
    const { role, employeeId: requesterId } = req.user;
    // can see anyone's data
    if (role === 'HR_ADMIN') return null;
    // can only see their own profile
    if (role === 'EMPLOYEE') {
        return requesterId !== employeeId
            ? { status: 403, message: 'Forbidden: employees can only access their own data' }
            : null;
    }
    if (role === 'MANAGER') {
        const employee = await Employee.findOne({ employeeId }, { managerId: 1 }).lean();
        if (!employee) return { status: 404, message: 'Employee not found' };
        if (employee.managerId !== requesterId) {
            return { status: 403, message: 'Forbidden: you can only access data for your own team members' };
        }
        return null;
    }
    return { status: 403, message: 'Forbidden' };
}

export const getAttritionRisk = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const denied = await assertEmployeeAccess(req, employeeId);
        if (denied) return res.status(denied.status).json({ message: denied.message });
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
        const denied = await assertEmployeeAccess(req, employeeId);
        if (denied) return res.status(denied.status).json({ message: denied.message });
        const result = await getCareerRecommendations(employeeId);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || 'Error generating recommendations' });
    }
};

export const evaluateHiPo = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const denied = await assertEmployeeAccess(req, employeeId);
        if (denied) return res.status(denied.status).json({ message: denied.message });
        const result = await evaluateHighPotential(employeeId);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || 'Error evaluating high potential' });
    }
};