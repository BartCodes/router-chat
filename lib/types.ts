export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  modelId?: string; // Required for AI messages, optional for user messages
  createdAt: Date;
} 