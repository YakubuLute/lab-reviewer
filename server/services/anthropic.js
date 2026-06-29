import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Call the Anthropic Messages API and parse the JSON response.
 *
 * @param {string} systemPrompt
 * @param {string} userMessage
 * @returns {Promise<object>} Parsed JSON from Claude
 * @throws {Error} with .status = 502 and .rawText if JSON parsing fails
 */
export async function callClaude(systemPrompt, userMessage) {
  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

  const message = await client.messages.create({
    model,
    max_tokens: 8000,
    temperature: 0.4,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const rawText = message.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');

  // Strip accidental ```json ... ``` fences before parsing
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const err = new Error('Claude returned a response that could not be parsed as JSON. See rawText for debugging.');
    err.status = 502;
    err.rawText = rawText;
    throw err;
  }
}
