"use client";

import { useState } from "react";

// Types for chat messages and drill questions
interface Message {
  role: "user" | "assistant";
  content: string;
}
interface Question {
  question: string;
  choices: string[];
  answer: string;
  explanation: string;
}

export default function Page() {
  const [mode, setMode] = useState<"idle" | "tutor" | "drill">("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);

  // Send a chat message to the tutor mode
  const sendTutor = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    const res = await fetch("/api/lsat", {
      method: "POST",
      body: JSON.stringify({ mode: "tutor", messages: updatedMessages }),
    });
    const data = await res.json();
    setMessages([...updatedMessages, { role: "assistant", content: data.response }]);
  };

  // Request a new drill question
  const startDrill = async () => {
    const res = await fetch("/api/lsat", {
      method: "POST",
      body: JSON.stringify({ mode: "drill" }),
    });
    const data = await res.json();
    setQuestion(data);
    setSelected(null);
    setShowExplanation(false);
  };

  // Submit an answer to the current drill question
  const submitAnswer = () => {
    if (!question || !selected) return;
    if (selected === question.answer) {
      setXp(xp + 10);
      setStreak(streak + 1);
    } else {
      setStreak(0);
    }
    setShowExplanation(true);
  };

  return (
    <main className="p-6 max-w-3xl mx-auto">
      {mode === "idle" && (
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">LSAT Arcade</h1>
          <p>Choose a mode to begin:</p>
          <div className="flex space-x-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() => setMode("tutor")}
            >
              Tutor Chat
            </button>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded"
              onClick={() => {
                setMode("drill");
                startDrill();
              }}
            >
              Drill Game
            </button>
          </div>
        </div>
      )}

      {mode === "tutor" && (
        <div className="space-y-4">
          <button
            className="px-2 py-1 bg-gray-200 rounded"
            onClick={() => setMode("idle")}
          >
            ← Back
          </button>
          <div className="space-y-2 border p-3 rounded h-64 overflow-y-auto">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={m.role === "user" ? "text-right" : "text-left"}
              >
                <span
                  className={`inline-block px-2 py-1 rounded ${
                    m.role === "user" ? "bg-blue-100" : "bg-gray-100"
                  }`}
                >
                  {m.content}
                </span>
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow border p-2 rounded-l"
              placeholder="Ask a question..."
            />
            <button
              onClick={sendTutor}
              className="px-4 py-2 bg-blue-600 text-white rounded-r"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {mode === "drill" && (
        <div className="space-y-4">
          <button
            className="px-2 py-1 bg-gray-200 rounded"
            onClick={() => setMode("idle")}
          >
            ← Back
          </button>
          <div className="mb-2">
            <span>XP: {xp}</span> &nbsp;|&nbsp; <span>Streak: {streak}</span>
          </div>
          {question && !showExplanation && (
            <div className="space-y-2">
              <div className="font-semibold">{question.question}</div>
              <div className="space-y-1">
                {question.choices.map((choice) => (
                  <label key={choice} className="block cursor-pointer">
                    <input
                      type="radio"
                      name="option"
                      value={choice}
                      checked={selected === choice}
                      onChange={() => setSelected(choice)}
                      className="mr-2"
                    />
                    {choice}
                  </label>
                ))}
              </div>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={submitAnswer}
              >
                Submit
              </button>
            </div>
          )}
          {question && showExplanation && (
            <div className="space-y-2">
              <div
                className={`font-semibold ${
                  selected === question.answer ? "text-green-600" : "text-red-600"
                }`}
              >
                {selected === question.answer ? "Correct!" : "Incorrect."}
              </div>
              <div>{question.explanation}</div>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={startDrill}
              >
                Next Question
              </button>
            </div>
          )}
          {!question && (
            <button
              className="px-4 py-2 bg-green-600 text-white rounded"
              onClick={startDrill}
            >
              Start Next Question
            </button>
          )}
        </div>
      )}
    </main>
  );
}
