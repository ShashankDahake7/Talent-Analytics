import Employee from '../models/Employee.js';
import { generateAttritionForecast } from '../services/analyticsService.js';

export const getHeadcount = async (req, res) => {
    try {
        const agg = await Employee.aggregate([
            { $match: { status: 'active' } },
            {
                $group: {
                    _id: '$departmentId',
                    headcount: { $sum: 1 },
                },
            },
        ]);
        res.json(agg);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getAttritionRiskStats = async (req, res) => {
    try {
        const agg = await Employee.aggregate([
            {
                $group: {
                    _id: '$attritionRiskBand',
                    count: { $sum: 1 },
                },
            },
        ]);
        res.json(agg);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getAttritionRiskByDept = async (req, res) => {
    try {
        const agg = await Employee.aggregate([
            { $match: { status: 'active', attritionRiskBand: { $in: ['low', 'medium', 'high'] } } },
            {
                $group: {
                    _id: { dept: '$departmentId', band: '$attritionRiskBand' },
                    count: { $sum: 1 },
                },
            },
            {
                $group: {
                    _id: '$_id.dept',
                    bands: { $push: { band: '$_id.band', count: '$count' } },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const result = agg.map((row) => {
            const entry = { department: row._id || 'Unknown', low: 0, medium: 0, high: 0 };
            row.bands.forEach((b) => { entry[b.band] = b.count; });
            return entry;
        });

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getForecast = async (req, res) => {
    try {
        const { departmentId } = req.query;
        const result = await generateAttritionForecast(departmentId);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || 'Error generating forecast' });
    }
};
