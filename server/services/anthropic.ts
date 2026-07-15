import Anthropic from '@anthropic-ai/sdk';
import { callGemini } from './gemini.js';

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

function isBillingError(err: unknown): boolean {
  if (err instanceof Anthropic.APIError) {
    const msg = err.message ?? '';
    return err.status === 400 && (
      msg.includes('credit balance') ||
      msg.includes('insufficient_quota') ||
      msg.includes('billing')
    );
  }
  return false;
}

export async function callClaude(systemPrompt: string, userMessage: string): Promise<unknown> {
  const client = getClient();
  const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';

  try {
    const message = await client.messages.create({
      model,
      max_tokens: 8000,
      temperature: 0.4,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const rawText = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');

    const cleaned = rawText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch {
      throw Object.assign(
        new Error('Claude returned a response that could not be parsed as JSON. See rawText for debugging.'),
        { status: 502, rawText },
      );
    }
  } catch (err) {
    if (isBillingError(err)) {
      console.warn('[ai] Anthropic billing limit hit — falling back to Gemini');
      return callGemini(systemPrompt, userMessage);
    }
    throw err;
  }
}
