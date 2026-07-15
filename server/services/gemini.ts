import { GoogleGenAI } from '@google/genai';

let _client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!_client) {
    _client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return _client;
}

export async function callGemini(systemPrompt: string, userMessage: string): Promise<unknown> {
  const model = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';
  const ai = getClient();

  const response = await ai.models.generateContent({
    model,
    contents: userMessage,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.4,
    },
  });

  const rawText = response.text ?? '';

  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw Object.assign(
      new Error('Gemini returned a response that could not be parsed as JSON. See rawText for debugging.'),
      { status: 502, rawText },
    );
  }
}
