import { NextRequest } from 'next/server';
import { generateQuestion } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const topic = body?.topic ?? 'logical_reasoning';
    const data = await generateQuestion(topic);
    return Response.json(data);
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'failed' }), { status: 500 });
  }
}
