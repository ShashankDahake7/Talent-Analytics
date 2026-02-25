import JobRole from '../models/JobRole.js';
import LearningItem from '../models/LearningItem.js';
import SkillEmbedding from '../models/SkillEmbedding.js';
import { embedText, generateContent } from './geminiClient.js';
import { cosineSimilarity } from '../utils.js';

export async function generateRoleEmbeddings(role) {
  await SkillEmbedding.deleteMany({
    type: 'role_skill',
    'meta.roleId': role.roleId,
  });
  const tasks = [];
  for (const req of role.requiredSkills || []) {
    const key = `role:${role.roleId}:skill:${req.name.toLowerCase()}`;
    const text = `Skill: ${req.name} required for role ${role.title} in job family ${role.jobFamily || ''}`;
    tasks.push(
      (async () => {
        try {
          const vector = await embedText(text);
          await SkillEmbedding.create({
            key,
            type: 'role_skill',
            label: `${req.name} (${role.title})`,
            text,
            vector,
            meta: {
              roleId: role.roleId,
              skillName: req.name,
            },
          });
        }
        catch (err) {
          console.error(`Error generating embedding for role ${role.roleId}, skill ${req.name}:`, err);
        }
      })()
    );
  }
  await Promise.all(tasks);
}

export async function generateLearningItemEmbedding(item) {
  await SkillEmbedding.deleteOne({
    type: 'learning_item',
    'meta.itemId': item.itemId,
  });
  const key = `learning:${item.itemId}`;
  const text = `Learning item: ${item.title}. Skills: ${(item.skillsTargeted || []).join(', ')}`;
  try {
    const vector = await embedText(text);
    await SkillEmbedding.create({
      key,
      type: 'learning_item',
      label: item.title,
      text,
      vector,
      meta: { itemId: item.itemId },
    });
  }
  catch (err) {
    console.error(`Error generating embedding for learning item ${item.itemId}:`, err);
  }
}

export async function ensureRoleSkillEmbeddings() {
  const roles = await JobRole.find({});
  const tasks = roles.map((role) => generateRoleEmbeddings(role));
  await Promise.all(tasks);
  const count = await SkillEmbedding.countDocuments({});
  return { totalEmbeddings: count };
}

export async function ensureLearningItemEmbeddings() {
  const items = await LearningItem.find({});
  const tasks = items.map((item) => generateLearningItemEmbedding(item));
  await Promise.all(tasks);
  const count = await SkillEmbedding.countDocuments({});
  return { totalEmbeddings: count };
}

async function validateQueryIsSkillRelated(query) {
  try {
    const systemPrompt = `You are a helpful assistant that determines if a user query is related to professional skills, technologies, or learning topics.
    A valid query should be about:
    - Technical skills (e.g., "React", "Python", "Node.js", "SQL")
    - Soft skills (e.g., "leadership", "communication", "project management")
    - Learning topics (e.g., "data analysis", "machine learning", "agile methodology")
    - Tools or technologies (e.g., "Figma", "Docker", "AWS")
    Invalid queries include:
    - Personal names (e.g., "John", "Sarah", "shashank")
    - Random words or phrases unrelated to skills
    - Questions or sentences that aren't skill-focused
    Respond with ONLY "YES" if the query is skill/learning-related, or "NO" if it's not.`;
    const response = await generateContent({
      systemPrompt,
      userInput: `Is "${query}" a skill, technology, or learning-related topic?`,
    });
    const normalized = response.trim().toUpperCase();
    return normalized.startsWith('YES');
  }
  catch (err) {
    console.error('Error validating query with Gemini:', err);
    return true;
  }
}

export async function findSimilarSkills(query, topK = 10, minSimilarity = 0.4, maxScoreThreshold = 0.5) {
  const isValidQuery = await validateQueryIsSkillRelated(query);
  if (!isValidQuery) {
    return [];
  }
  const queryVector = await embedText(query);
  const all = await SkillEmbedding.find({});
  const scored = all
    .map((doc) => ({
      id: doc._id.toString(),
      key: doc.key,
      type: doc.type,
      label: doc.label,
      meta: doc.meta,
      score: cosineSimilarity(queryVector, doc.vector),
    }))
    .filter((item) => item.score >= minSimilarity);
  scored.sort((a, b) => b.score - a.score);
  if (scored.length === 0 || scored[0].score < maxScoreThreshold) {
    return [];
  }
  return scored.slice(0, topK);
}