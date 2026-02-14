import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Employee from './models/Employee.js';
import User from './models/User.js';
import JobRole from './models/JobRole.js';
import LearningItem from './models/LearningItem.js';
import WorkforceSnapshot from './models/WorkforceSnapshot.js';
import Feedback from './models/Feedback.js';
import Prediction from './models/Prediction.js';
import SkillEmbedding from './models/SkillEmbedding.js';
import { ensureRoleSkillEmbeddings, ensureLearningItemEmbeddings } from './services/skillEmbeddingService.js';
import {
  JOB_ROLES,
  LEARNING_ITEMS,
  DEPARTMENTS,
  getManagers,
  getICs,
  getUsers,
  getFeedback,
} from './seedData.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/talent_analytics';

const DEMO_PASSWORD = 'Admin@123';

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB for seeding');

  await Promise.all([
    Employee.deleteMany({}),
    User.deleteMany({}),
    JobRole.deleteMany({}),
    LearningItem.deleteMany({}),
    WorkforceSnapshot.deleteMany({}),
    Feedback.deleteMany({}),
    Prediction.deleteMany({}),
    SkillEmbedding.deleteMany({}),
  ]);

  const roles = await JobRole.insertMany(JOB_ROLES);
  const learning = await LearningItem.insertMany(LEARNING_ITEMS);

  // Generate embeddings automatically (insertMany doesn't trigger hooks, so we do it manually)
  console.log('Generating embeddings for roles and learning items...');
  await ensureRoleSkillEmbeddings();
  await ensureLearningItemEmbeddings();
  const embeddingCount = await SkillEmbedding.countDocuments({});
  console.log(`  - ${embeddingCount} embeddings generated`);

  const managers = getManagers();
  const ics = getICs();
  const allEmployees = [...managers, ...ics];
  await Employee.insertMany(allEmployees);

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const { hr, managers: managerUsers, employees: employeeUsers } = getUsers(passwordHash);

  await User.create(hr);
  await User.insertMany(managerUsers);
  await User.insertMany(employeeUsers);

  await Feedback.insertMany(getFeedback());

  const today = new Date();
  const deptHeadcounts = { ENG: 14, HR: 7, FIN: 7, OPS: 7, MKT: 7, DSG: 8 };
  const snapshots = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setMonth(today.getMonth() - i);
    for (const { id } of DEPARTMENTS) {
      const base = deptHeadcounts[id] || 5;
      snapshots.push({
        date: d,
        departmentId: id,
        headcount: Math.max(2, base + Math.floor(Math.random() * 3) - 1),
        exits: Math.floor(Math.random() * 2),
        joins: Math.floor(Math.random() * 2),
      });
    }
  }
  await WorkforceSnapshot.insertMany(snapshots);

  console.log('\nSeed data created:');
  console.log(`  - ${roles.length} job roles`);
  console.log(`  - ${learning.length} learning items`);
  console.log(`  - ${allEmployees.length} employees (${managers.length} managers + ${ics.length} ICs)`);
  console.log(`  - 6 departments: ENG, HR, FIN, OPS, MKT, DSG`);
  console.log(`  - ${1 + managerUsers.length + employeeUsers.length} users (1 HR, ${managerUsers.length} managers, ${employeeUsers.length} employees)`);
  console.log(`  - ${(await Feedback.countDocuments({}))} feedback entries`);
  console.log(`  - ${snapshots.length} workforce snapshots`);

  console.log('\n--- Demo logins (password: ' + DEMO_PASSWORD + ') ---');
  console.log('  HR_ADMIN:  hr@example.com');
  console.log('  MANAGER:   priya.sharma@company.com (ENG) | rahul.verma@company.com (ENG) | anita.desai@company.com (HR)');
  console.log('             vikram.nair@company.com (FIN) | kavita.reddy@company.com (OPS) | arjun.mehta@company.com (MKT)');
  console.log('             sneha.iyer@company.com (DSG) | rohan.kapoor@company.com (DSG)');
  console.log('  EMPLOYEE:  e001@company.com … e012@company.com (see only own profile)');
  console.log('');

  await mongoose.disconnect();
}

run()
  .then(() => {
    console.log('Seeding completed.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seeding error', err);
    process.exit(1);
  });
