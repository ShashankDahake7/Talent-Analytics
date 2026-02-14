import JobRole from '../models/JobRole.js';

export const getJobRoles = async (req, res) => {
    try {
        const roles = await JobRole.find({}).sort({ roleId: 1 });
        res.json(roles);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
