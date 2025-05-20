'use server';

import { connection } from 'next/server'
import { Message } from '@/lib/types';



export async function processUserMessage(
  conversationHistory: Message[],
  modelId: string
): Promise<ReadableStream<Uint8Array> | { success: boolean; error?: string }> {
  await connection();
  try {
    if (!conversationHistory?.length) {
      throw new Error('Conversation history is required');
    }
    if (!modelId) {
      throw new Error('Model ID is required');
    }
    if(!modelId.endsWith(':free')) {
      throw new Error('Wrong model ID. Must be a free model');
    }

    // Format messages for OpenRouter API - maintaining the exact sequence
    const messages = conversationHistory.map(msg => {
      // For AI messages, use 'assistant' role as per OpenRouter API spec
      const role = msg.role === 'user' ? 'user' : 'assistant';
      return {
        role,
        content: msg.content
      };
    });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000',
        'X-Title': 'RouterChat'
      },
      body: JSON.stringify({
        model: modelId,
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 1000,
      })
    });

    if (!response.ok) {
      const errResponse = await response.json();
      const errMsg = errResponse.error?.message || errResponse.message || 'Failed to get AI response';
      throw new Error(errMsg);
    }

    // Return the stream directly
    return response.body as ReadableStream<Uint8Array>;

  } catch (error) {
    console.error('Error in processUserMessage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}
