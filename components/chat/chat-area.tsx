"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import type { Message } from "@/lib/types";

interface ChatAreaProps {
  messages: Message[];
}

export function ChatArea({ messages }: ChatAreaProps) {
  return (
    <div className="flex-1 h-full relative bg-content1">
      <ScrollArea className="h-[calc(100vh-180px)] w-full">
        <div className="flex flex-col space-y-4 p-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Start a new conversation...</p>
            </div>
          ) : (
            messages.map((message) => (
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
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 