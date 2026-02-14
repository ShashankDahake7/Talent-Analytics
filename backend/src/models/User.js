import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['HR_ADMIN', 'MANAGER', 'EMPLOYEE'],
      required: true,
    },
    employeeId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('User', UserSchema);