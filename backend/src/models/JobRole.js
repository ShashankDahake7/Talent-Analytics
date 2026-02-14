import mongoose from 'mongoose';

const JobRoleSchema = new mongoose.Schema(
  {
    roleId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    jobFamily: { type: String },
    level: { type: String },
    description: { type: String },
    requiredSkills: [
      {
        name: { type: String, required: true },
        minLevel: { type: Number, min: 1, max: 5, default: 3 },
      },
    ],
  },
  { timestamps: true }
);

JobRoleSchema.post('save', async function (doc) {
  try {
    const { generateRoleEmbeddings } = await import('../services/skillEmbeddingService.js');
    await generateRoleEmbeddings(doc);
  }
  catch (err) {
    console.error(`Error generating embeddings for role ${doc.roleId}:`, err);
  }
});

export default mongoose.model('JobRole', JobRoleSchema);