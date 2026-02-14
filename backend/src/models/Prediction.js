import mongoose from 'mongoose';

const PredictionSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true },
    type: { type: String, enum: ['ATTRITION', 'HIPO'], required: true },
    score: { type: Number, required: true },
    band: { type: String },
    featuresUsed: { type: Object },
    explanation: { type: String },
    modelVersion: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Prediction', PredictionSchema);

