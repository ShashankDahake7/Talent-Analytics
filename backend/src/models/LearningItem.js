import mongoose from 'mongoose';

const LearningItemSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['course', 'project', 'mentoring', 'article', 'other'], default: 'course' },
    skillsTargeted: [{ type: String }],
    level: { type: String },
    durationHours: { type: Number },
    provider: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('LearningItem', LearningItemSchema);