import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role,
                employeeId: user.employeeId || null,
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );
        res.json({
            token,
            user: {
                email: user.email,
                role: user.role,
                employeeId: user.employeeId || null,
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
