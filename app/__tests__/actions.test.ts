import { processUserMessage } from '../actions';
import { Message } from '@/lib/types';

// Mock fetch globally
global.fetch = jest.fn();

// Helper to create a test message
const createTestMessage = (role: 'user' | 'ai', content: string, modelId?: string): Message => ({
  id: 'test-id',
  role,
  content,
  modelId,
  createdAt: new Date()
});

describe('processUserMessage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset environment variables
    process.env.OPENROUTER_API_KEY = 'test-api-key';
    process.env.NEXT_PUBLIC_APP_URL = 'http://test.com';
  });

  it('should successfully process a message and return AI response', async () => {
    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Test AI response' } }]
      })
    });

    const conversationHistory: Message[] = [
      createTestMessage('user', 'Hello AI'),
      createTestMessage('ai', 'Hello human', 'gpt-3.5-turbo')
    ];

    const result = await processUserMessage(conversationHistory, 'gpt-4');

    // Verify the result
    expect(result).toEqual({
      success: true,
      response: 'Test AI response'
    });

    // Verify API call
    expect(fetch).toHaveBeenCalledWith(
      'https://openrouter.ai/api/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://test.com',
          'X-Title': 'RouterChat'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'user', content: 'Hello AI' },
            { role: 'assistant', content: 'Hello human' }
          ],
          stream: false
        })
      })
    );
  });

  it('should handle missing conversation history', async () => {
    const result = await processUserMessage([], 'gpt-4');

    expect(result).toEqual({
      success: false,
      error: 'Conversation history is required'
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should handle missing model ID', async () => {
    const conversationHistory: Message[] = [
      createTestMessage('user', 'Hello AI')
    ];

    const result = await processUserMessage(conversationHistory, '');

    expect(result).toEqual({
      success: false,
      error: 'Model ID is required'
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should handle API error response', async () => {
    // Mock API error response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'API Error'
      })
    });

    const conversationHistory: Message[] = [
      createTestMessage('user', 'Hello AI')
    ];

    const result = await processUserMessage(conversationHistory, 'gpt-4');

    expect(result).toEqual({
      success: false,
      error: 'API Error'
    });
  });

  it('should handle missing AI response in successful API call', async () => {
    // Mock API response without message content
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: []
      })
    });

    const conversationHistory: Message[] = [
      createTestMessage('user', 'Hello AI')
    ];

    const result = await processUserMessage(conversationHistory, 'gpt-4');

    expect(result).toEqual({
      success: false,
      error: 'No response content from AI'
    });
  });

  it('should handle network errors', async () => {
    // Mock network error
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const conversationHistory: Message[] = [
      createTestMessage('user', 'Hello AI')
    ];

    const result = await processUserMessage(conversationHistory, 'gpt-4');

    expect(result).toEqual({
      success: false,
      error: 'Network error'
    });
  });
}); 