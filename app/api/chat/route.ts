export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { Message } from '@/lib/types';

export async function POST(request: NextRequest) {
  const { conversationHistory, modelId } = (await request.json()) as {
    conversationHistory: Message[];
    modelId: string;
  };

  if (!conversationHistory?.length) {
    return NextResponse.json({ success: false, error: 'Conversation history is required' }, { status: 400 });
  }
  if (!modelId) {
    return NextResponse.json({ success: false, error: 'Model ID is required' }, { status: 400 });
  }
  if(!modelId.endsWith(':free')) {
    return NextResponse.json({ success: false, error: 'This model is not supported' }, { status: 400 });
  }
  
  try {
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000',
        'X-Title': 'RouterChat',
      },
      body: JSON.stringify({
        model: modelId,
        messages: conversationHistory.map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        })),
        stream: true,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!openRouterResponse.ok || !openRouterResponse.body) {
      const errText = await openRouterResponse.text();
      return NextResponse.json({ success: false, error: `OpenRouter API error: ${errText}` }, { status: 500 });
    }

    return new NextResponse(openRouterResponse.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 