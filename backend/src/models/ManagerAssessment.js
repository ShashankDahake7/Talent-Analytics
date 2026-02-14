import mongoose from 'mongoose';

const InterventionSchema = new mongoose.Schema(
    {
        action: { type: String, required: true },
        predictedScore: { type: Number, required: true },
        explanation: { type: String },
    },
    { _id: false }
);

const ManagerAssessmentSchema = new mongoose.Schema(
    {
        managerId: { type: String, required: true, ref: 'Employee' },
        date: { type: Date, default: Date.now },
        overallScore: { type: Number, required: true, min: 0, max: 100 },
        metrics: {
            teamSize: { type: Number, required: true },
            averagePerformance: { type: Number, required: true },
            retentionRate: { type: Number, required: true },
            averageEngagement: { type: Number, required: true },
        },
        factors: {
            positive: [{ type: String }],
            negative: [{ type: String }],
        },
        aiAnalysis: { type: String },
        suggestedInterventions: [InterventionSchema],
    },
    { timestamps: true }
);

export default mongoose.model('ManagerAssessment', ManagerAssessmentSchema);