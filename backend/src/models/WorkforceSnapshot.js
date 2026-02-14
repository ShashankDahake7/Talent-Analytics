import mongoose from 'mongoose';

const WorkforceSnapshotSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    departmentId: { type: String, required: true },
    headcount: { type: Number, required: true },
    exits: { type: Number, default: 0 },
    joins: { type: Number, default: 0 },
  },
  { timestamps: true }
);

WorkforceSnapshotSchema.index({ date: 1, departmentId: 1 }, { unique: true });

export default mongoose.model('WorkforceSnapshot', WorkforceSnapshotSchema);