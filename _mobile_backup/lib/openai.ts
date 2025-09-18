type ChatMsg = { role: 'user' | 'assistant'; content: string };

const letters = ['A','B','C','D','E'] as const;
const API_BASE = process.env.EXPO_PUBLIC_API_BASE?.trim();
const USE_API = !!API_BASE;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function mockQuestion() {
  const stems = [
    'The columnist argues that citywide composting will reduce landfill waste. Which option most weakens the reasoning?',
    'Researchers claim a new teaching method improves logic skills. Which assumption is required?',
    'Company X says rising revenue proves customers are more satisfied. Which option identifies the flaw?',
    'A blogger concludes a supplement causes better focus because users scored higher than average. Which choice shows the error?',
    'A mayor asserts extending library hours increased literacy after scores rose that month. Which criticism is most accurate?'
  ];

  const fallacies = [
    {
      name: 'correlation vs causation',
      label: 'It confuses correlation with causation.',
      explanation: 'It treats correlation as proof of a cause without ruling out alternatives.'
    },
    {
      name: 'unrepresentative sample',
      label: 'It relies on a sample that may not be representative.',
      explanation: 'Evidence comes from a group that might not reflect the population.'
    },
    {
      name: 'overlooked alternative',
      label: 'It overlooks a plausible alternative explanation.',
      explanation: 'Other causes could produce the same result but are ignored.'
    },
    {
      name: 'equivocation',
      label: 'It equivocates between two different concepts.',
      explanation: 'A key term changes meaning between premises and conclusion.'
    },
    {
      name: 'assuming stability',
      label: 'It assumes without justification that conditions remain constant.',
      explanation: 'It presumes relevant factors won’t change without support.'
    }
  ];

  const correct = pick(fallacies);
  const pool = shuffle([correct, ...shuffle(fallacies.filter(f => f !== correct)).slice(0, 4)]);
  const correctIndex = pool.findIndex(p => p === correct);
  const answer = letters[correctIndex];

  return {
    question: pick(stems),
    choices: pool.map(p => p.label),
    answer,
    explanation: `${correct.explanation} Thus, choice ${answer} pinpoints the specific error.`,
  };
}

export async function generateQuestion() {
  if (!USE_API) return mockQuestion();
  try {
    const res = await fetch(`${API_BASE}/api/lsat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'drill' }),
    });
    if (!res.ok) return mockQuestion();
    const data: any = await res.json();
    if (data && data.choices && !Array.isArray(data.choices)) {
      data.choices = ['A','B','C','D','E'].map((k: string) => data.choices[k]);
    }
    if (typeof data.answer === 'number') {
      data.answer = letters[data.answer] ?? 'A';
    }
    if (typeof data.answer === 'string') {
      data.answer = data.answer.trim().toUpperCase();
    }
    return data;
  } catch (err) {
    return mockQuestion();
  }
}

export async function tutorChat(messages: ChatMsg[]) {
  if (!USE_API) {
    const last = messages.filter(m => m.role === 'user').slice(-1)[0]?.content ?? '';
    return `Mock tutor: Identify the conclusion, then test each choice against the gap. On “${last}”, paraphrase the claim and name the flaw (causal, sampling, comparison).`;
  }
  try {
    const res = await fetch(`${API_BASE}/api/lsat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'tutor', messages }),
    });
    if (!res.ok) return 'Mock tutor: Service unavailable; try again in a bit.';
    const data = await res.json();
    return data.reply || 'Mock tutor: (no reply)';
  } catch (err) {
    return 'Mock tutor: Service unavailable; try again in a bit.';
  }
}
