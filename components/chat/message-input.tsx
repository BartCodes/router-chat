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
  setCurrentModelId: Dispatch<SetStateAction<string>>;
}

export function MessageInput({ 
  messages, 
  setMessages, 
  currentModelId,
  setCurrentModelId 
}: MessageInputProps) {
  const [message, setMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    
    // Create and add user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: message.trim(),
      createdAt: new Date()
    };
    
    // Update messages state with the new user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setMessage("");

    try {
      // Process the message with OpenRouter, passing the complete conversation history
      const result = await processUserMessage(updatedMessages, currentModelId);

      if (result.success && result.response) {
        // Add AI response to messages
        const aiMessage: Message = {
          id: uuidv4(),
          role: 'ai',
          content: result.response,
          modelId: currentModelId,
          createdAt: new Date()
        };
        // Update messages with the AI response
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // TODO: Show error toast
        console.error('Error from AI:', result.error);
      }
    } catch (error) {
      // TODO: Show error toast
      console.error('Error processing message:', error);
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-4 border-t border-default-200 bg-content1">
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