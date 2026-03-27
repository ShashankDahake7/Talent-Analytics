const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

const rawModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_MODEL = rawModel.replace(/^models\/?/i, '') || 'gemini-2.5-flash';

const getApiKey = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY not set');
  }
  return key;
};

export async function generateContent({ systemPrompt, userInput }) {
  const apiKey = getApiKey();
  const url = `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ role: 'user', parts: [{ text: userInput }] }],
    ...(systemPrompt && {
      systemInstruction: { parts: [{ text: systemPrompt }] },
    }),
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini error: ${res.status} ${text}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? JSON.stringify(data);
  return text;
}