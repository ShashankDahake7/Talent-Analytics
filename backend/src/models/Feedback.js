import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true },
    source: { type: String, enum: ['survey', 'exit', 'manager', 'peer', 'self', 'other'], default: 'other' },
    text: { type: String, required: true },
    sentimentScore: { type: Number, min: -1, max: 1 },
    topics: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model('Feedback', FeedbackSchema);