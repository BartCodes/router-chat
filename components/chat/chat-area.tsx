"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, ChevronUp, ChevronDown } from "lucide-react";
import type { Message } from "@/lib/types";
import { UserMessageBubble } from "./user-message-bubble";
import { AIMessageBubble } from "./ai-message-bubble";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface ChatAreaProps {
  messages: Message[];
  conversationId?: string;
}

export function ChatArea({ messages, conversationId }: ChatAreaProps) {
  // Check if we're waiting for an AI response (last message is from user)
  const isWaitingForAI = messages.length > 0 && messages[messages.length - 1].role === 'user';
  
  // Check if we're currently streaming (last message is from AI with empty content)
  const isStreaming = messages.length > 0 && messages[messages.length - 1].role === 'ai' && messages[messages.length - 1].content === '';

  // Create a ref for the message container
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null); // Ref for the ScrollArea root
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const checkScrollability = useCallback(() => {
    const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
    if (viewport) {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      setCanScrollUp(scrollTop > 20); // 20px buffer to avoid flickering
      setCanScrollDown(scrollTop < scrollHeight - clientHeight - 20); // 20px buffer
    }
  }, []);

  // Scroll to bottom whenever messages change & recheck scrollability
  useEffect(() => {
    const timer = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
      }
      checkScrollability(); // Check after scroll
    }, 250);

    return () => clearTimeout(timer);
  }, [messages, checkScrollability]);

  const handleScrollIndicatorClick = useCallback((direction: 'up' | 'down') => {
    const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
    if (viewport) {
      if (direction === 'up') {
        viewport.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      } else {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
  }, []);

  // Setup event listeners and observers
  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
    const messagesContainer = messagesContainerRef.current;

    if (!viewport || !messagesContainer) return;

    const handleScroll = () => checkScrollability();
    viewport.addEventListener('scroll', handleScroll);

    const resizeObserver = new ResizeObserver(() => {
      checkScrollability();
    });
    resizeObserver.observe(viewport);
    resizeObserver.observe(messagesContainer);

    // Initial check
    checkScrollability();

    return () => {
      viewport.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [checkScrollability]);

  // Create a key for the conversation to trigger animations when switching
  const conversationKey = conversationId || "empty-conversation";

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative" ref={scrollAreaRef}>
      <ScrollArea className="flex-1 h-full">
        <AnimatePresence mode="wait">
          <motion.div 
            ref={messagesContainerRef}
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

      <AnimatePresence>
        {canScrollUp && (
          <motion.div
            onClick={() => handleScrollIndicatorClick('up')}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-12 bg-gradient-to-b from-background via-background/80 to-transparent z-10 flex justify-center items-start pt-2 hover:cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {canScrollDown && (
          <motion.div
            onClick={() => handleScrollIndicatorClick('down')}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-12 bg-gradient-to-t from-background via-background/80 to-transparent z-10 flex justify-center items-end pb-2 hover:cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}