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

type Drill = {
  question: string;
  choices: string[];
  answer: typeof letters[number];
  explanation: string;
};

export async function generateQuestion(topic = 'logical_reasoning'): Promise<Drill> {
  if (MOCK || !client) return mockDrill();

  const prompt = `Create a single ${topic} multiple-choice LSAT drill. 
JSON only with keys: question, choices (5), answer (A-E), explanation (1-2 sentences).`;

  try {
    const res = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini',
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const text =
      res.choices?.[0]?.message?.content?.trim() || JSON.stringify(mockDrill());

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      // If the model returns prose, fall back to mock.
      return mockDrill();
    }

    const ans = String(data.answer ?? '').trim().toUpperCase();
    const normalized: Drill['answer'] =
      /^[A-E]$/.test(ans)
        ? (ans as Drill['answer'])
        : (letters[(parseInt(ans, 10) - 1) || 0] ?? 'A');

    const choices: string[] =
      Array.isArray(data.choices) && data.choices.length >= 5
        ? data.choices.slice(0, 5).map((c: any) => String(c))
        : mockDrill().choices;

    return {
      question: String(data.question ?? mockDrill().question),
      choices,
      answer: normalized,
      explanation: String(data.explanation ?? mockDrill().explanation),
    };
  } catch {
    return mockDrill();
  }
}
