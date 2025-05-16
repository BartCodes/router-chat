"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import type { Message } from "@/lib/types";

interface ChatAreaProps {
  messages: Message[];
}

export function ChatArea({ messages }: ChatAreaProps) {
  // Check if we're waiting for an AI response (last message is from user)
  const isWaitingForAI = messages.length > 0 && messages[messages.length - 1].role === 'user';
  
  // Check if we're currently streaming (last message is from AI with empty content)
  const isStreaming = messages.length > 0 && messages[messages.length - 1].role === 'ai' && messages[messages.length - 1].content === '';

  return (
    <div className="flex-1 relative bg-content1">
      <ScrollArea className="h-full w-full">
        <div className="flex flex-col space-y-4 p-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Start a new conversation...</p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-2.5 ${
                    message.role === 'user' ? 'ml-auto' : 'mr-auto'
                  } max-w-[80%]`}
                >
                  <div className="flex flex-col gap-1">
                    <div 
                      className={`rounded-lg px-4 py-2 text-foreground border ${
                        message.role === 'user' 
                          ? 'bg-primary/10 border-primary/20' 
                          : 'bg-content2 border-default-200'
                      }`}
                    >
                      <p>{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              {(isWaitingForAI || isStreaming) && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">
                    {isWaitingForAI ? 'Waiting for response...' : 'Thinking...'}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 