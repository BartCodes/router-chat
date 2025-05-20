'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { Conversation, Message } from '@/lib/types';
import { DEFAULT_MODEL_ID } from '@/lib/constants';
import {
  saveConversation,
  updateConversation,
  loadConversations,
  saveLastSelectedModelId,
  loadLastSelectedModelId,
  deleteConversation,
} from '@/lib/local-storage';
import { v4 as uuidv4 } from 'uuid';

interface ChatContextType {
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  activeConversation: Conversation | null;
  setActiveConversation: React.Dispatch<React.SetStateAction<Conversation | null>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  currentModelId: string;
  setCurrentModelId: (modelId: string) => void;
  handleNewChat: (modelToSet?: string) => void;
  handleSelectConversation: (conversationId: string) => void;
  handleEditConversationName: (conversationId: string, newName: string) => void;
  handleDeleteConversation: (conversationId: string) => void;
  isAiResponding: boolean;
  setIsAiResponding: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentModelId, _setCurrentModelId] = useState(DEFAULT_MODEL_ID);
  const [isAiResponding, setIsAiResponding] = useState(false);

  const setCurrentModelId = useCallback((modelId: string) => {
    _setCurrentModelId(modelId);
    saveLastSelectedModelId(modelId);
  }, []);

  // Forward declaration for handleNewChat to be used in handleDeleteConversation
  const handleNewChatRef = React.useRef<((modelToSet?: string) => void) | null>(null);

  const handleEditConversationName = useCallback((conversationId: string, newName: string) => {
    let updatedConvForStorage: Conversation | undefined;
    setConversations(prevConversations => {
      const newConversations = prevConversations.map(conv => {
        if (conv.id === conversationId) {
          updatedConvForStorage = { ...conv, name: newName, updatedAt: new Date() };
          return updatedConvForStorage;
        }
        return conv;
      });
      // Save the specific conversation that was edited to local storage
      if (updatedConvForStorage) {
        updateConversation(updatedConvForStorage);
      }
      return newConversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    });
    setActiveConversation(prevActiveConv => 
      prevActiveConv && prevActiveConv.id === conversationId 
        ? { ...prevActiveConv, name: newName, updatedAt: new Date() } 
        : prevActiveConv
    );
  }, [setActiveConversation, setConversations]);

  const handleDeleteConversation = useCallback((conversationId: string) => {
    deleteConversation(conversationId); // from local-storage.ts

    setConversations(prevConversations => {
      const remainingConversations = prevConversations.filter(conv => conv.id !== conversationId);
      
      if (activeConversation && activeConversation.id === conversationId) {
        if (remainingConversations.length > 0) {
          const nextActive = remainingConversations.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
          setActiveConversation(nextActive);
          setMessages(nextActive.messages);
          const lastAiMessage = nextActive.messages.filter(m => m.role === 'ai').pop();
          if (lastAiMessage?.modelId) {
            setCurrentModelId(lastAiMessage.modelId);
          } else {
            setCurrentModelId(loadLastSelectedModelId() || DEFAULT_MODEL_ID);
          }
        } else {
          if (handleNewChatRef.current) {
            handleNewChatRef.current(); 
          }
        }
      }
      return remainingConversations;
    });
  }, [activeConversation, setCurrentModelId, setActiveConversation, setMessages, setConversations]);

  const handleNewChat = useCallback((modelToSet?: string) => {
    const newConversationId = uuidv4();
    let maxNum = 0;
    conversations.forEach(conv => {
        if (conv.name.startsWith("Conversation #")) {
            const num = parseInt(conv.name.substring("Conversation #".length), 10);
            if (!isNaN(num) && num > maxNum) {
                maxNum = num;
            }
        }
    });
    const newConversationName = `Conversation #${maxNum + 1}`;

    const newConversation: Conversation = {
      id: newConversationId,
      name: newConversationName,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    saveConversation(newConversation);

    setConversations(prevConversations => {
      const updatedConvosList = [newConversation, ...prevConversations];
      return updatedConvosList.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    });
    
    setActiveConversation(newConversation);
    setMessages([]);
    setCurrentModelId(modelToSet || loadLastSelectedModelId() || DEFAULT_MODEL_ID);

  }, [setCurrentModelId, setActiveConversation, setMessages, conversations]);

  // Assign the implementation to the ref after it's defined.
  useEffect(() => {
    handleNewChatRef.current = handleNewChat;
  }, [handleNewChat]);

  useEffect(() => {
    const loadedConvos = loadConversations();
    const lastSelectedModel = loadLastSelectedModelId();

    if (loadedConvos.length > 0) {
      setConversations(loadedConvos); // loadedConvos is already sorted by updatedAt DESC
      const lastConversation = loadedConvos[0];
      setActiveConversation(lastConversation);
      setMessages(lastConversation.messages);
      const lastAiMessage = lastConversation.messages.filter(m => m.role === 'ai').pop();
      if (lastAiMessage?.modelId) {
        setCurrentModelId(lastAiMessage.modelId);
      } else if (lastSelectedModel) {
        setCurrentModelId(lastSelectedModel);
      } else {
        setCurrentModelId(DEFAULT_MODEL_ID);
      }
    } else {
      const initialConversationId = uuidv4();
      const initialConversation: Conversation = {
        id: initialConversationId,
        name: "Conversation #1",
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      saveConversation(initialConversation);
      
      setConversations([initialConversation]);
      setActiveConversation(initialConversation);
      setMessages([]);
      setCurrentModelId(lastSelectedModel || DEFAULT_MODEL_ID);
    }
  }, [setCurrentModelId, setActiveConversation, setMessages]);

  // This effect ensures the conversations list is re-sorted and updated
  // whenever the activeConversation object itself changes, implying its content (like updatedAt) might have.
  useEffect(() => {
    if (activeConversation) {
      setConversations(prevConversations => {
        const listWithUpdatedActiveConv = prevConversations.map(conv =>
          conv.id === activeConversation.id ? activeConversation : conv
        );
        // Ensure the active conversation is at the top after update
        const sortedList = listWithUpdatedActiveConv.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        return sortedList;
      });
    }
  }, [activeConversation]);

  const handleSelectConversation = useCallback((conversationId: string) => {
    const selected = conversations.find(c => c.id === conversationId);
    if (selected) {
      setActiveConversation(selected);
      setMessages(selected.messages);
      const lastAiMessage = selected.messages.filter(m => m.role === 'ai').pop();
      if (lastAiMessage?.modelId) {
        setCurrentModelId(lastAiMessage.modelId);
      } else {
        setCurrentModelId(loadLastSelectedModelId() || DEFAULT_MODEL_ID);
      }
    }
  }, [conversations, setCurrentModelId]);

  const value = {
    conversations,
    setConversations,
    activeConversation,
    setActiveConversation,
    messages,
    setMessages,
    currentModelId,
    setCurrentModelId,
    handleNewChat,
    handleSelectConversation,
    handleEditConversationName,
    handleDeleteConversation,
    isAiResponding,
    setIsAiResponding,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}; 