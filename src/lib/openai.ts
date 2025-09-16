import OpenAI from 'openai';

/**
 * OpenAI client configured with your API key.  The key is provided via
 * the environment variable OPENAI_API_KEY (see deployment configuration).
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate a brand‑new LSAT Logical Reasoning practice question.
 * The return value has this shape:
 * {
 *   question: string,
 *   choices: { A: string, B: string, C: string, D: string, E: string },
 *   answer: string,
 *   explanation: string,
 *   tags: string[]
 * }
 */
export async function generateQuestion() {
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You are an LSAT question generator. Produce an ORIGINAL Logical Reasoning practice question (never copy real LSAT items). ' +
          'Return a JSON object with keys: question, choices (with A–E), answer (letter), explanation, and tags.',
      },
      { role: 'user', content: 'Generate one question now.' },
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  // The API returns the JSON as a string; parse it before returning.
  const jsonString = response.choices[0].message?.content || '{}';
  return JSON.parse(jsonString);
}

/**
 * Chat with the LSAT tutor.  Takes an array of previous messages and returns
 * the updated assistant reply.
 */
export async function tutorChat(
  messages: { role: 'user' | 'assistant'; content: string }[],
) {
  const chat = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are an encouraging LSAT tutor. Answer questions in a helpful way and give hints rather than full solutions. ' +
          'Never quote or reproduce real LSAT content.',
      },
      ...messages,
    ],
    temperature: 0.7,
  });

  return chat.choices[0].message?.content || '';
}
