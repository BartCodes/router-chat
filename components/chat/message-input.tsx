"use client";

import { SendIcon } from "lucide-react";
import * as React from "react";
import { Dispatch, SetStateAction } from "react";
import { v4 as uuidv4 } from 'uuid';

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Message } from "@/lib/types";
import { processUserMessage } from "@/app/actions";

interface MessageInputProps {
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  currentModelId: string;
}

export function MessageInput({ 
  messages, 
  setMessages, 
  currentModelId,
}: MessageInputProps) {
  const [message, setMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const createUserMessage = (content: string): Message => ({
    id: uuidv4(),
    role: 'user',
    content: content.trim(),
    createdAt: new Date()
  });

  const createEmptyAIMessage = (modelId: string): Message => ({
    id: uuidv4(),
    role: 'ai',
    content: '',
    modelId,
    createdAt: new Date()
  });

  const appendMessageToHistory = (newMessage: Message) => {
    setMessages(prev => [...prev, newMessage]);
  };

  const updateStreamedAIMessage = (aiMessageId: string, content: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === aiMessageId 
        ? { ...msg, content: msg.content + content }
        : msg
    ));
  };

  const removeAIMessage = (aiMessageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== aiMessageId));
  };

  const processStreamingResponse = async (
    stream: ReadableStream<Uint8Array>,
    aiMessageId: string
  ): Promise<void> => {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Append new chunk to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete lines from buffer
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          
          await processStreamLine(line.trim(), aiMessageId);
        }
      }
      // Process any remaining buffer content
      if (buffer) {
        await processStreamLine(buffer.trim(), aiMessageId);
      }
    } finally {
      reader.releaseLock();
    }
  };

  const processStreamLine = async (
    line: string,
    aiMessageId: string
  ): Promise<void> => {
    if (!line || !line.startsWith('data: ')) return;

    const data = line.slice(6);
    if (data === '[DONE]') return;

    try {
      const parsed = JSON.parse(data);
      const content = parsed.choices?.[0]?.delta?.content;
      if (content) {
        updateStreamedAIMessage(aiMessageId, content);
      }
    } catch (e) {
      // Only log parsing errors for non-empty lines that aren't [DONE]
      if (data !== '[DONE]' && data.trim()) {
        console.error('Error parsing streaming data:', e);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) return;

    setIsLoading(true);
    
    try {
      const userMessage = createUserMessage(trimmedMessage);
      appendMessageToHistory(userMessage);
      setMessage("");

      // Get AI response
      const updatedMessages = [...messages, userMessage];
      const result = await processUserMessage(updatedMessages, currentModelId);

      // Create placeholder for AI response
      const aiMessage = createEmptyAIMessage(currentModelId);
      appendMessageToHistory(aiMessage);

      // Handle streaming response
      if (result instanceof ReadableStream) {
        await processStreamingResponse(result, aiMessage.id);
      } else if (!result.success) {
        console.error('Error from AI:', result.error);
        // Display the error message in the chat
        updateStreamedAIMessage(aiMessage.id, `Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      // TODO: Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-4 border-t border-default-200 bg-content1 shrink-0">
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="min-h-[56px] max-h-[200px] resize-none bg-content2 border-default-200"
          aria-label="Message input"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          size="icon"
          className="h-[56px] w-[56px] shrink-0 bg-primary hover:bg-primary-500 text-primary-foreground hover:cursor-pointer"
          disabled={!message.trim() || isLoading}
        >
          <SendIcon className="size-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </form>
  );
} 