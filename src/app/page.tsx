'use client';

import { useState } from 'react';

type Drill = {
  question: string;
  choices: string[];
  answer: string;       // e.g., "C"
  explanation: string;
};

const letters = ['A','B','C','D','E'] as const;
const norm = (s: string) => s.trim().toUpperCase();

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drill, setDrill] = useState<Drill | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setDrill(null);
    setPicked(null);
    setResult(null);
    try {
      const res = await fetch('/api/lsat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ topic: 'logical_reasoning' }),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data: Drill = await res.json();
      setDrill(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to generate');
    } finally {
      setLoading(false);
    }
  }

  function submit(letter: string) {
    if (!drill) return;
    setPicked(letter);
    const isCorrect = norm(letter) === norm(drill.answer);
    setResult(isCorrect ? 'correct' : 'wrong');
  }

  return (
    <div className="space-y-6 p-8 rounded-xl bg-white shadow-lg">
      <h1 className="text-4xl font-extrabold tracking-tight text-indigo-700">LSAT Arcade</h1>

      <p className="text-gray-600">
        Click “Generate Drill” to fetch a question from <code>/api/lsat</code>.
      </p>

      <button
        onClick={generate}
        disabled={loading}
        className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
      >
        {loading ? 'Generating…' : 'Generate Drill'}
      </button>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {drill && (
        <div className="space-y-4">
          <div className="text-lg font-medium">{drill.question}</div>

          <div className="grid gap-3">
            {drill.choices.map((text, idx) => {
              const letter = letters[idx] ?? String.fromCharCode(65 + idx);
              const selected = picked === letter;
              const isCorrect = result && norm(letter) === norm(drill.answer);
              const isWrongPick = result === 'wrong' && selected && !isCorrect;

              const base =
                'flex items-start gap-3 rounded-lg border p-3 text-left transition';
              const clr = !result
                ? 'border-gray-200 hover:border-gray-300'
                : isCorrect
                  ? 'border-emerald-300 bg-emerald-50'
                  : isWrongPick
                    ? 'border-rose-300 bg-rose-50'
                    : 'border-gray-200 opacity-80';

              return (
                <button
                  key={letter}
                  onClick={() => submit(letter)}
                  disabled={!!result}
                  className={`${base} ${clr}`}
                >
                  <span className="mt-0.5 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full border bg-white font-bold">
                    {letter}
                  </span>
                  <span className="text-left">{text}</span>
                </button>
              );
            })}
          </div>

          {result && (
            <div
              className={`rounded-lg border p-3 ${
                result === 'correct'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  : 'border-rose-300 bg-rose-50 text-rose-800'
              }`}
            >
              <div className="font-semibold mb-1">
                {result === 'correct' ? 'Correct! ✅' : 'Incorrect. ❌'}
              </div>
              <div className="text-sm text-gray-700">
                <b>Answer:</b> {drill.answer} — {drill.explanation}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
