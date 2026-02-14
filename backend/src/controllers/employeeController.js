import Employee from '../models/Employee.js';

export const getEmployees = async (req, res) => {
    try {
        const { departmentId, managerId, status } = req.query;
        const query = {};
        if (departmentId) query.departmentId = departmentId;
        if (managerId) query.managerId = managerId;
        if (status) query.status = status;
        const employees = await Employee.find(query).limit(200);
        res.json(employees);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getEmployeeById = async (req, res) => {
    try {
        const { employeeId } = req.params;
        if (req.user.role === 'EMPLOYEE' && req.user.employeeId !== employeeId) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const employee = await Employee.findOne({ employeeId });
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(employee);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createEmployee = async (req, res) => {
    try {
        const employee = await Employee.create(req.body);
        res.status(201).json(employee);
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Error creating employee', error: err.message });
    }
};

export const updateEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const updated = await Employee.findOneAndUpdate({ employeeId }, req.body, {
            new: true,
        });
        if (!updated) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Error updating employee', error: err.message });
    }
};
