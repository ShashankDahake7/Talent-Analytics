import mongoose from 'mongoose';

const SkillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    level: { type: Number, min: 1, max: 5 },
    yearsExperience: { type: Number, default: 0 },
  },
  { _id: false }
);

const EmployeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    managerId: { type: String },
    departmentId: { type: String },
    roleId: { type: String },
    dateOfJoining: { type: Date },
    status: {
      type: String,
      enum: ['active', 'resigned', 'on_notice'],
      default: 'active',
    },
    skills: [SkillSchema],
    performanceRating: { type: Number, min: 1, max: 5 },
    potentialRating: { type: Number, min: 1, max: 5 },
    engagementScore: { type: Number, min: 1, max: 5 },
    promotionsCount: { type: Number, default: 0 },
    salaryPercentile: { type: Number, min: 0, max: 100 },
    leaveDaysLast12Months: { type: Number, min: 0, default: 0 },
    overtimeHoursPerMonth: { type: Number, min: 0, default: 0 },
    lastPromotionDate: { type: Date },
    careerLevel: { type: String },
    currentJobFamily: { type: String },
    location: { type: String },
    attritionRiskScore: { type: Number, min: 0, max: 1 },
    attritionRiskBand: { type: String, enum: ['low', 'medium', 'high', null], default: null },
    highPotentialFlag: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Employee', EmployeeSchema);