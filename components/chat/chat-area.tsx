"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import type { Message } from "@/lib/types";
import { UserMessageBubble } from "./user-message-bubble";
import { AIMessageBubble } from "./ai-message-bubble";
import { useEffect, useRef } from "react";

interface ChatAreaProps {
  messages: Message[];
}

export function ChatArea({ messages }: ChatAreaProps) {
  // Check if we're waiting for an AI response (last message is from user)
  const isWaitingForAI = messages.length > 0 && messages[messages.length - 1].role === 'user';
  
  // Check if we're currently streaming (last message is from AI with empty content)
  const isStreaming = messages.length > 0 && messages[messages.length - 1].role === 'ai' && messages[messages.length - 1].content === '';

  // Create a ref for the message container
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <ScrollArea className="flex-1 h-full">
        <div className="flex flex-col space-y-4 p-4 min-h-full">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Start a new conversation...</p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                message.role === 'user' ? (
                  <UserMessageBubble key={message.id} message={message} />
                ) : (
                  <AIMessageBubble key={message.id} message={message} />
                )
              ))}
              {(isWaitingForAI || isStreaming) && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">
                    {isWaitingForAI ? 'Waiting for response...' : 'Thinking...'}
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 