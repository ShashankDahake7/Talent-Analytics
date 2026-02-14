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
    url: { type: String },
  },
  { timestamps: true }
);

LearningItemSchema.post('save', async function (doc) {
  try {
    const { generateLearningItemEmbedding } = await import('../services/skillEmbeddingService.js');
    await generateLearningItemEmbedding(doc);
  }
  catch (err) {
    console.error(`Error generating embedding for learning item ${doc.itemId}:`, err);
  }
});

export default mongoose.model('LearningItem', LearningItemSchema);