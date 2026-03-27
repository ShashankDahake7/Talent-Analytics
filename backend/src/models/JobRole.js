import mongoose from 'mongoose';

const JobRoleSchema = new mongoose.Schema(
  {
    roleId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    jobFamily: { type: String },
    level: { type: String },
    requiredSkills: [
      {
        name: { type: String, required: true },
        minLevel: { type: Number, min: 1, max: 5, default: 3 },
      },
    ],
  },
  { timestamps: true }
);



export default mongoose.model('JobRole', JobRoleSchema);