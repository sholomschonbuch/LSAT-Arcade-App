export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { generateQuestion, tutorChat } from '@/lib/openai';

export async function POST(req: NextRequest) {
  const { mode, ...body } = await req.json();
  if (mode === 'drill') {
    const question = await generateQuestion();
    return NextResponse.json(question);
  }
  if (mode === 'tutor') {
    const { messages } = body;
    const response = await tutorChat(messages);
    return NextResponse.json(response);
  }
  return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
}
