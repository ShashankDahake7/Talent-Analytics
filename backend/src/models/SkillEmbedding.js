import mongoose from 'mongoose';

const SkillEmbeddingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ['skill', 'role_skill', 'learning_item'],
      required: true,
    },
    label: { type: String, required: true },
    text: { type: String, required: true },
    vector: {
      type: [Number],
      required: true,
    },
    meta: {
      roleId: { type: String },
      skillName: { type: String },
      itemId: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.model('SkillEmbedding', SkillEmbeddingSchema);