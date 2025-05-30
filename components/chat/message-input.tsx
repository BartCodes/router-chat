"use client";

import * as React from "react";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";

import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import type { Message, Conversation } from "@/lib/types";
import { useChat } from "@/components/chat-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";


interface MessageInputProps {
  activeConversation: Conversation | null;
  onUserMessageSend: (message: Message) => void;
  onAiMessageUpdate: (aiMessageId: string, chunk: string, modelId?: string) => void;
  onAiResponseComplete: (aiMessageId: string) => void;
  currentModelId: string;
  isAiResponding: boolean;
}

export function MessageInput({ 
  activeConversation, 
  onUserMessageSend,
  onAiMessageUpdate,
  onAiResponseComplete,
  currentModelId,
  isAiResponding,
}: MessageInputProps) {
  const [messageContent, setMessageContent] = React.useState("");
  const { isAiResponding: chatIsAiResponding, setIsAiResponding } = useChat();

  const createUserMessage = (content: string): Message => ({
    id: uuidv4(),
    role: 'user',
    content: content.trim(),
    createdAt: new Date()
  });

  const processStreamingResponse = async (
    stream: ReadableStream<Uint8Array>,
    aiMessageId: string,
    modelIdForStream: string
  ): Promise<void> => {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          
          await processStreamLine(line.trim(), aiMessageId, modelIdForStream);
        }
      }
      if (buffer) {
        await processStreamLine(buffer.trim(), aiMessageId, modelIdForStream);
      }
    } finally {
      reader.releaseLock();
      onAiResponseComplete(aiMessageId);
    }
  };

  const processStreamLine = async (
    line: string,
    aiMessageId: string,
    modelIdForStream: string
  ): Promise<void> => {
    if (!line || !line.startsWith('data: ')) return;

    const data = line.slice(6);
    if (data === '[DONE]') return;

    try {
      const parsed = JSON.parse(data);
      const content = parsed.choices?.[0]?.delta?.content;
      if (content) {
        onAiMessageUpdate(aiMessageId, content, modelIdForStream);
      }
    } catch (e) {
      if (data !== '[DONE]' && data.trim()) {
        console.error('Error parsing streaming data:', e, "Data:", data);
      }
    }
  };

  const handleSendMessageAndGetResponse = async (conversationHistoryForAPI: Message[], aiMessageId: string) => {
    setIsAiResponding(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: conversationHistoryForAPI,
          modelId: currentModelId,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        const errorMessage = errData.error || 'Failed to get AI response';
        console.error('Error from AI:', errorMessage);
        toast.error(`AI Error: ${errorMessage}`);
        onAiResponseComplete(aiMessageId);
      } else if (!response.body) {
        toast.error('No response body for AI streaming');
        onAiResponseComplete(aiMessageId);
      } else {
        await processStreamingResponse(response.body, aiMessageId, currentModelId);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during submission.";
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsAiResponding(false);
    }
  };

  const handleUserInput = (trimmedMessage: string, activeConversation: Conversation) => {
    const userMessage = createUserMessage(trimmedMessage);
    onUserMessageSend(userMessage);
    setMessageContent("");

    const conversationHistoryForAPI = [...activeConversation.messages, userMessage];
    return conversationHistoryForAPI;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const trimmedMessage = messageContent.trim();
    if (!trimmedMessage || chatIsAiResponding || !activeConversation) return;

    try {
      const aiMessageId = uuidv4();
      const conversationHistoryForAPI = handleUserInput(trimmedMessage, activeConversation);
      await handleSendMessageAndGetResponse(conversationHistoryForAPI, aiMessageId);

    } catch (error) {
      console.error('Error processing message:', error);
      const aiMessageId = uuidv4();
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during submission.";
      toast.error(`Error: ${errorMessage}`);
      onAiResponseComplete(aiMessageId);
    }
  };
  
  const placeholders = [
    "What's the meaning of life?",
    "Explain quantum computing in simple terms.",
    "What are the best restaurants in New York City?",
    "Tell me a joke.",
    "How does the stock market work?",
    "Suggest some fun activities for a rainy day.",
    "Summarize the plot of 'Pride and Prejudice'.",
    "What are the benefits of meditation?",
    "Give me a recipe for chocolate chip cookies.",
    "Explain the concept of blockchain.",
    "Write a short story about a talking cat.",
    "What is the capital of France?",
    "How to learn a new language effectively?",
    "Recommend a good book to read.",
    "Explain the difference between weather and climate.",
    "How to make a perfect cup of coffee?",
    "What are the main types of renewable energy?",
    "Suggest a workout routine for beginners.",
    "What is the history of the internet?",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageContent(e.target.value);
  };

  return (
    <div className="p-4 border-t border-default-200 bg-content1 shrink-0 z-10">
      {isAiResponding ? (
        <div className="animate-pulse w-full relative max-w-xl mx-auto h-12 rounded-full flex items-center pl-4 sm:pl-10 pr-20 bg-gray-100 dark:bg-zinc-800">
          <Skeleton className="absolute inset-0 h-full w-full rounded-full" />
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin z-10 text-sm sm:text-base text-neutral-500 dark:text-zinc-500 h-4 w-4" />
            <span className="relative z-10 text-sm sm:text-base text-neutral-500 dark:text-zinc-500">AI is responding...</span>
          </div>
        </div>
      ) : (
        <PlaceholdersAndVanishInput
          placeholders={placeholders}
          onChange={handleChange}
          onSubmit={handleSubmit}
          spellCheck={false}
          disabled={isAiResponding}
        />
      )}
    </div>
  );
} 