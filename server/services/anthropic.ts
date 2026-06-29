import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function callClaude(systemPrompt: string, userMessage: string): Promise<unknown> {
  const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';

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
}
