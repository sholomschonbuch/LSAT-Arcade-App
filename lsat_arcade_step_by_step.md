# LSAT Arcade App: Browser‑Only Copy‑Paste Guide

Follow these steps to build and deploy a ChatGPT‑powered LSAT study game using only your web browser.  No local installs are required—everything runs in the cloud.

## 1) Start a new Next.js project in StackBlitz

1. Open **https://stackblitz.com/** in your browser.
2. Click **Create → New Project → Next.js**.  StackBlitz will open an online editor with a fresh Next.js repo.

## 2) Create the API helper (`src/lib/openai.ts`)

1. In the StackBlitz file explorer, open the `src` folder.  If there isn’t already a `lib` folder inside it, right‑click `src`, choose **New Folder**, and name it `lib`.
2. Click the **plus** icon next to `lib` and add a file named **`openai.ts`**.
3. Copy–paste the following code into **openai.ts** and save:

```ts
import OpenAI from 'openai';

/**
 * OpenAI client configured with your API key.  The key is provided via
 * the environment variable OPENAI_API_KEY (see step 5).
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
```

This module provides two helpers: `generateQuestion()` for the “Drill” game and `tutorChat()` for the Tutor chat mode.

## 3) Add the API route (`src/app/api/lsat/route.ts`)

1. In the StackBlitz file explorer, create a folder at `src/app/api/lsat`.  (Each nested folder must be created manually.)
2. Inside that folder, create a file named **`route.ts`**.
3. Paste in this code:

```ts
import { NextResponse } from 'next/server';
import { generateQuestion, tutorChat } from '@/lib/openai';

export const runtime = 'nodejs';

/**
 * POST /api/lsat
 *
 * The request body must include a field `mode` with value "drill" or "tutor".
 * For "drill", the route returns a JSON LSAT question using generateQuestion().
 * For "tutor", it expects `messages` (chat history) and returns a single reply.
 */
export async function POST(req: Request) {
  const { mode, messages } = await req.json();

  if (mode === 'drill') {
    const q = await generateQuestion();
    return NextResponse.json(q);
  }

  if (mode === 'tutor') {
    const reply = await tutorChat(messages || []);
    return NextResponse.json({ reply });
  }

  return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
}
```

This route uses your API helpers to serve data to the front‑end.

## 4) Replace the homepage (`src/app/page.tsx`)

1. Open `src/app/page.tsx` and **replace** its contents with the code below.  This page renders the UI with two modes—Tutor Chat and Drill Game—and includes simple gamification (XP and streaks).

```tsx
'use client';

import React, { useState } from 'react';

type ChoiceKey = 'A' | 'B' | 'C' | 'D' | 'E';

interface LSATQuestion {
  question: string;
  choices: Record<ChoiceKey, string>;
  answer: ChoiceKey;
  explanation: string;
  tags: string[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [mode, setMode] = useState<'home' | 'tutor' | 'drill'>('home');
  const [loading, setLoading] = useState(false);

  // Tutor state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');

  // Drill state
  const [question, setQuestion] = useState<LSATQuestion | null>(null);
  const [selected, setSelected] = useState<ChoiceKey | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);

  const fetchQuestion = async () => {
    setLoading(true);
    const res = await fetch('/api/lsat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'drill' }),
    });
    const data = await res.json();
    setQuestion(data);
    setSelected(null);
    setShowExplanation(false);
    setLoading(false);
  };

  const handleTutorSubmit = async () => {
    if (!userInput.trim()) return;
    const newHistory = [
      ...chatHistory,
      { role: 'user', content: userInput },
    ] as ChatMessage[];
    setChatHistory(newHistory);
    setUserInput('');
    setLoading(true);
    const res = await fetch('/api/lsat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'tutor', messages: newHistory }),
    });
    const { reply } = await res.json();
    setChatHistory([...newHistory, { role: 'assistant', content: reply }]);
    setLoading(false);
  };

  const handleChoice = (choice: ChoiceKey) => {
    if (!question || selected) return;
    setSelected(choice);
    const correct = choice === question.answer;
    if (correct) {
      setXp((x) => x + 10);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
    setShowExplanation(true);
  };

  // Render home screen
  if (mode === 'home') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <h1 className="text-4xl font-bold mb-4">LSAT Arcade</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
          onClick={() => setMode('tutor')}
        >
          Tutor Chat
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded-md"
          onClick={() => {
            setMode('drill');
            fetchQuestion();
          }}
        >
          Drill Game
        </button>
      </main>
    );
  }

  // Render tutor chat
  if (mode === 'tutor') {
    return (
      <main className="min-h-screen flex flex-col p-4">
        <header className="flex items-center gap-4 mb-4">
          <button onClick={() => setMode('home')}>← Home</button>
          <h2 className="text-2xl font-bold">Tutor Chat</h2>
        </header>
        <div className="flex-1 overflow-y-auto border p-3 rounded-md space-y-2">
          {chatHistory.map((msg, idx) => (
            <p
              key={idx}
              className={
                msg.role === 'user'
                  ? 'text-right text-blue-700'
                  : 'text-left text-green-700'
              }
            >
              <strong>{msg.role === 'user' ? 'You' : 'Tutor'}: </strong>
              {msg.content}
            </p>
          ))}
          {loading && <p>Thinking…</p>}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            className="border flex-1 px-2 py-1 rounded-md"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleTutorSubmit();
              }
            }}
            placeholder="Ask a question…"
          />
          <button
            className="bg-blue-600 text-white px-4 py-1 rounded-md"
            onClick={handleTutorSubmit}
            disabled={loading}
          >
            Send
          </button>
        </div>
      </main>
    );
  }

  // Render drill mode
  return (
    <main className="min-h-screen flex flex-col p-4">
      <header className="flex items-center gap-4 mb-4">
        <button onClick={() => setMode('home')}>← Home</button>
        <h2 className="text-2xl font-bold">Drill Game</h2>
        <div className="ml-auto flex gap-4">
          <span>XP: {xp}</span>
          <span>Streak: {streak}</span>
        </div>
      </header>

      {loading && <p>Loading question…</p>}

      {!loading && question && (
        <div className="space-y-4">
          <p className="text-lg">{question.question}</p>
          <div className="grid gap-2">
            {(['A', 'B', 'C', 'D', 'E'] as ChoiceKey[]).map((key) => (
              <button
                key={key}
                onClick={() => handleChoice(key)}
                className={`border rounded-md p-2 text-left ${
                  selected === key
                    ? key === question.answer
                      ? 'border-green-500 bg-green-100'
                      : 'border-red-500 bg-red-100'
                    : ''
                }`}
              >
                <strong>{key}.</strong> {question.choices[key]}
              </button>
            ))}
          </div>
          {showExplanation && (
            <div className="mt-3 border-l-4 border-blue-500 pl-3">
              <p>
                <strong>Correct answer:</strong> {question.answer}
              </p>
              <p>{question.explanation}</p>
              <button
                className="mt-2 bg-green-600 text-white px-4 py-1 rounded-md"
                onClick={fetchQuestion}
              >
                Next Question
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
```

This React component uses Tailwind (already included with Next.js) and shows XP/streak after each question.  You can expand on this later if you want full timed sections or spaced repetition.

## 5) Add environment variables

In StackBlitz, click **Project → Environment Variables** and add:

| Variable         | Value                                                         |
|------------------|---------------------------------------------------------------|
| `OPENAI_API_KEY` | *Your OpenAI secret key*                                      |
| `OPENAI_MODEL`   | `gpt-4o-mini` (or whichever OpenAI model you prefer to use) |

These variables are injected at build time and used by `openai.ts`.

## 6) Test the app

1. Click the **Go Live** or **Preview** button in StackBlitz.
2. Once the dev server starts, the page should load automatically.  Try **Drill Game** to answer a practice question and **Tutor Chat** to ask for help.
3. If something doesn’t work, open the **Console** panel in StackBlitz for error messages.

## 7) Deploy to Vercel (optional)

Once you’re happy with the app:

1. In StackBlitz, click **Export → GitHub** and authorize to create a repository.
2. Go to **https://vercel.com/import**.  Choose **Import Git Repository** and select the repo you just exported.
3. In the Vercel setup wizard, set the same environment variables (`OPENAI_API_KEY` and `OPENAI_MODEL`) and click **Deploy**.
4. After a minute or two, Vercel will give you a public URL for your LSAT Arcade app.

---

That’s it!  Everything above is copy‑and‑paste ready.  Feel free to customize the styles, add a logo, or extend the game with timed sections or spaced‑repetition review.