"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import type { Message } from "@/lib/types";
import { UserMessageBubble } from "./user-message-bubble";
import { AIMessageBubble } from "./ai-message-bubble";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

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

  // Create a key for the conversation to trigger animations when switching
  const conversationKey = messages.length > 0 ? `conversation-${messages[0].id}` : "empty-conversation";

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <ScrollArea className="flex-1 h-full">
        <AnimatePresence mode="wait">
          <motion.div 
            key={conversationKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col space-y-4 p-4 min-h-full"
          >
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Start a new conversation...</p>
              </div>
            ) : (
              <>
                {messages.map((message) => {
                  const isUser = message.role === 'user';
                  return (
                    <motion.div
                      key={message.id}
                      className={cn(
                        "flex",
                        isUser ? "justify-end" : "justify-start"
                      )}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.2, 
                        ease: "easeOut" 
                      }}
                    >
                      {isUser ? (
                        <UserMessageBubble message={message} />
                      ) : (
                        <AIMessageBubble message={message} />
                      )}
                    </motion.div>
                  );
                })}
                {(isWaitingForAI || isStreaming) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">
                      {isWaitingForAI ? 'Waiting for response...' : 'Thinking...'}
                    </span>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
}