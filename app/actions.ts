'use server';

import { Message } from '@/lib/types';

export async function processUserMessage(
  conversationHistory: Message[],
  modelId: string
): Promise<{ success: boolean; error?: string; response?: string }> {
  try {
    // Validate inputs
    if (!conversationHistory?.length) {
      throw new Error('Conversation history is required');
    }
    if (!modelId) {
      throw new Error('Model ID is required');
    }

    // Format messages for OpenRouter API
    const messages = conversationHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    // Make API request to OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', // For rankings
        'X-Title': 'RouterChat' // For rankings
      },
      body: JSON.stringify({
        model: modelId,
        messages,
        stream: false
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get AI response');
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response content from AI');
    }

    return {
      success: true,
      response: aiResponse
    };

  } catch (error) {
    console.error('Error in processUserMessage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}
