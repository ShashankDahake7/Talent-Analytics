import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import analyticsRoutes from './routes/analytics.js';
import aiRoutes from './routes/ai.js';
import scenarioRoutes from './routes/scenario.js';
import managerRoutes from './routes/managerRoutes.js';
import jobRoleRoutes from './routes/jobRoles.js';
import connectDB from './config/db.js';

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;
connectDB();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'talent-analytics-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/scenario', scenarioRoutes);
app.use('/api/managers', managerRoutes);
app.use('/api/job-roles', jobRoleRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});