import type { Conversation } from './types';

const CONVERSATIONS_KEY = 'routerChatConversations';

const getConversations = (): Conversation[] => {
  if (typeof window === 'undefined') return [];
  const storedConversations = localStorage.getItem(CONVERSATIONS_KEY);
  return storedConversations ? JSON.parse(storedConversations) : [];
};

const setConversations = (conversations: Conversation[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
};

export const saveConversation = (conversation: Conversation): void => {
  const conversations = getConversations();
  if (conversations.find(c => c.id === conversation.id)) {
    console.warn(`Conversation with ID ${conversation.id} already exists. Use updateConversation to modify.`);
    return; 
  }
  setConversations([...conversations, conversation]);
};

export const loadConversations = (): Conversation[] => {
  return getConversations().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

export const getConversationById = (id: string): Conversation | undefined => {
  return getConversations().find(conversation => conversation.id === id);
};

export const updateConversation = (updatedConversation: Conversation): void => {
  const conversations = getConversations();
  const index = conversations.findIndex(c => c.id === updatedConversation.id);
  if (index !== -1) {
    conversations[index] = updatedConversation;
    setConversations(conversations);
  } else {
    saveConversation(updatedConversation); 
  }
};

export const deleteConversation = (id: string): void => {
  const conversations = getConversations();
  setConversations(conversations.filter(conversation => conversation.id !== id));
};

const LAST_MODEL_ID_KEY = 'routerChatLastSelectedModelId';

export const saveLastSelectedModelId = (modelId: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAST_MODEL_ID_KEY, modelId);
};

export const loadLastSelectedModelId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LAST_MODEL_ID_KEY);
}; 