import OpenAI from 'openai';

const MOCK =
  process.env.MOCK_MODE === '1' ||
  !process.env.OPENAI_API_KEY ||
  process.env.OPENAI_API_KEY.trim() === '';

const client = !MOCK ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const letters = ['A', 'B', 'C', 'D', 'E'] as const;

function mockDrill() {
  const idx = Math.floor(Math.random() * 5);
  const choices = ['Premise-strengthening', 'Assumption', 'Causal flaw', 'Inference', 'Principle'];
  return {
    question:
      'The argument concludes that a new study method guarantees higher LSAT scores because students who used it scored higher than those who did not. Which choice most accurately describes the reasoning error?',
    choices,
    answer: letters[idx],
    explanation:
      'This is a classic causal fallacy (confusing correlation with causation). The credited response identifies the core error more directly than the alternatives.',
  };
}

export async function generateQuestion(topic = 'logical_reasoning') {
  if (MOCK || !client) return mockDrill();

  // Minimal, fast prompt — swap for your richer system prompt later
  const prompt = `Create a single ${topic} multiple-choice LSAT drill. JSON only with keys: question, choices (5), answer (A-E), explanation (1-2 sentences).`;

  try {
    const res = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      input: prompt,
      temperature: 0.3,
    });

    const text =
      (res.output_text || res.output?.[0]?.content?.[0]?.text) ??
      JSON.stringify(mockDrill());

    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      data = mockDrill();
    }

    // Normalize
    const ans = String(data.answer ?? '').trim().toUpperCase();
    const normalized =
      /^[A-E]$/.test(ans)
        ? ans
        : letters[(parseInt(ans, 10) - 1) || 0] || 'A';

    return {
      question: String(data.question ?? mockDrill().question),
      choices: Array.isArray(data.choices) && data.choices.length >= 5
        ? data.choices.slice(0,5).map(String)
        : mockDrill().choices,
      answer: normalized,
      explanation: String(data.explanation ?? mockDrill().explanation),
    };
  } catch {
    return mockDrill();
  }
}
