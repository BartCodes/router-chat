"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, ChevronUp, ChevronDown } from "lucide-react";
import type { Message } from "@/lib/types";
import { UserMessageBubble } from "./user-message-bubble";
import { AIMessageBubble } from "./ai-message-bubble";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, animate } from "motion/react";
import { cn } from "@/lib/utils";
import { TracingBeam } from "@/components/ui/tracing-beam";

interface ChatAreaProps {
  messages: Message[];
  conversationId?: string;
}

const MAX_SCROLL_SPEED_PPS = 2000; // Pixels per second
const MIN_SCROLL_DURATION_S = 0.5;  // Minimum scroll duration in seconds
const MAX_SCROLL_DURATION_S = 2;   // Maximum scroll duration in seconds
const SCROLL_EASING = "easeInOut";

const calculateScrollDuration = (distance: number): number => {
  if (distance === 0) return MIN_SCROLL_DURATION_S;
  const durationBasedOnSpeed = Math.abs(distance) / MAX_SCROLL_SPEED_PPS;
  return Math.max(MIN_SCROLL_DURATION_S, Math.min(durationBasedOnSpeed, MAX_SCROLL_DURATION_S));
};

export function ChatArea({ messages, conversationId }: ChatAreaProps) {
  const isWaitingForAI = messages.length > 0 && messages[messages.length - 1].role === 'user';
  
  const isStreaming = messages.length > 0 && messages[messages.length - 1].role === 'ai' && messages[messages.length - 1].content === '';

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);

  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const checkScrollability = useCallback(() => {
    const viewport = scrollAreaViewportRef.current;
    if (viewport) {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      setCanScrollUp(scrollTop > 30); 
      setCanScrollDown(scrollTop < scrollHeight - clientHeight - 30);
    }
  }, []);

  // Scroll to bottom whenever messages change, after animations
  useEffect(() => {
    const viewport = scrollAreaViewportRef.current;
    if (viewport) {
      const messageAnimationDuration = 200; 
      const scrollStartDelay = messageAnimationDuration + 150; 

      const scrollTimer = setTimeout(() => {
        if (scrollAreaViewportRef.current) {
          const currentVp = scrollAreaViewportRef.current;
          const targetScrollTop = Math.max(0, currentVp.scrollHeight - currentVp.clientHeight);
          const distance = targetScrollTop - currentVp.scrollTop;

          if (distance > 0 || (messages.length > 0 && currentVp.scrollTop === 0 && targetScrollTop === 0)) {
            const dynamicDuration = calculateScrollDuration(distance);
            animate(
              currentVp.scrollTop,
              targetScrollTop,
              {
                duration: dynamicDuration,
                ease: SCROLL_EASING,
                onUpdate: (latest) => {
                  if (scrollAreaViewportRef.current) scrollAreaViewportRef.current.scrollTop = latest;
                },
              }
            );
          }
        }
      }, scrollStartDelay);

      // Calculate scrollabilityCheckDelay based on potential scroll
      // This is an estimation as we don't know the exact distance until the scrollTimer runs
      // We'll use a general 'average' or max duration for this check, or accept it might be slightly off.
      // For simplicity, let's base it on MAX_SCROLL_DURATION_S for now if a scroll is likely.
      const placeholderScrollDistance = viewport.scrollHeight > viewport.clientHeight ? viewport.scrollHeight : 200; // Estimate some distance
      const estimatedDynamicDuration = calculateScrollDuration(placeholderScrollDistance);
      const scrollAnimationDurationMs = estimatedDynamicDuration * 1000;
      const scrollabilityCheckDelay = scrollStartDelay + scrollAnimationDurationMs + 50;

      const scrollabilityTimer = setTimeout(() => {
        checkScrollability();
      }, scrollabilityCheckDelay);

      return () => {
        clearTimeout(scrollTimer);
        clearTimeout(scrollabilityTimer);
      };
    }
    return () => {};
  }, [messages, checkScrollability]);

  const handleScrollIndicatorClick = useCallback((direction: 'up' | 'down') => {
    const viewport = scrollAreaViewportRef.current;
    if (viewport) {
      let targetScrollTop = 0;
      let distance = viewport.scrollTop; // For 'up'

      if (direction === 'down') {
        targetScrollTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
        distance = targetScrollTop - viewport.scrollTop;
      }
      
      const dynamicDuration = calculateScrollDuration(distance);

      animate(
        viewport.scrollTop,
        targetScrollTop,
        {
          duration: dynamicDuration,
          ease: SCROLL_EASING,
          onUpdate: (latest) => {
            if (scrollAreaViewportRef.current) scrollAreaViewportRef.current.scrollTop = latest;
          },
        }
      );
      
      const scrollAnimationDurationMs = dynamicDuration * 1000;
      setTimeout(checkScrollability, scrollAnimationDurationMs + 50);
    }
  }, [checkScrollability]);

  // Setup event listeners and observers
  useEffect(() => {
    const viewport = scrollAreaViewportRef.current;
    const messagesContainer = messagesContainerRef.current;

    if (!viewport || !messagesContainer) return () => {}; // No-op cleanup if refs not ready

    const handleScroll = () => checkScrollability();
    viewport.addEventListener('scroll', handleScroll);

    const resizeObserver = new ResizeObserver(() => {
      const currentViewport = scrollAreaViewportRef.current;
      if (currentViewport) {
        const isNearBottom = currentViewport.scrollTop + currentViewport.clientHeight >= currentViewport.scrollHeight - 30;
        if (isNearBottom) {
          const targetScrollTop = Math.max(0, currentViewport.scrollHeight - currentViewport.clientHeight);
          const distance = targetScrollTop - currentViewport.scrollTop;
          
          if (distance > 0) { 
            const dynamicDuration = calculateScrollDuration(distance);
            animate(
              currentViewport.scrollTop,
              targetScrollTop,
              {
                duration: dynamicDuration,
                ease: SCROLL_EASING,
                onUpdate: (latest) => {
                  if (scrollAreaViewportRef.current) scrollAreaViewportRef.current.scrollTop = latest;
                },
              }
            );
            const resizeScrollAnimationDurationMs = dynamicDuration * 1000;
            setTimeout(checkScrollability, resizeScrollAnimationDurationMs + 50);
          } else {
            // If no scroll needed, or distance is 0 or negative, check scrollability sooner
            setTimeout(checkScrollability, 50); 
          }
        } else {
           // If not near bottom, still check scrollability after a standard delay
           setTimeout(checkScrollability, 150);
        }
      } else {
        setTimeout(checkScrollability, 150); 
      }
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
      <ScrollArea 
        className="flex-1 h-full" 
        viewportRef={scrollAreaViewportRef} // Pass ref to ScrollArea
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={conversationKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <TracingBeam 
              className="px-6" 
              scrollableContainerRef={scrollAreaViewportRef}
            >
              <div
                ref={messagesContainerRef}
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
              </div>
            </TracingBeam>
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