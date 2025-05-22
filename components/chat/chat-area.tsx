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
import { ContainerTextFlip } from "@/components/ui/container-text-flip";
import { useChat } from "@/components/chat-provider";

interface ChatAreaProps {
  messages: Message[];
  conversationId?: string;
}

const MAX_SCROLL_SPEED_PPS = 2000;
const MIN_SCROLL_DURATION_S = 0.5;
const MAX_SCROLL_DURATION_S = 2;
const SCROLL_EASING = "easeInOut";
const SCROLL_MARGIN_PX = 30;

const calculateScrollDuration = (distance: number): number => {
  if (distance === 0) return MIN_SCROLL_DURATION_S;
  const durationBasedOnSpeed = Math.abs(distance) / MAX_SCROLL_SPEED_PPS;
  return Math.max(MIN_SCROLL_DURATION_S, Math.min(durationBasedOnSpeed, MAX_SCROLL_DURATION_S));
};

export function ChatArea({ messages, conversationId }: ChatAreaProps) {
  const { isAiResponding } = useChat();
  const isWaitingForAI = isAiResponding && messages.length > 0 && messages[messages.length - 1].role === 'user';
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
      setCanScrollUp(scrollTop > SCROLL_MARGIN_PX);
      setCanScrollDown(scrollTop < scrollHeight - clientHeight - SCROLL_MARGIN_PX);
    }
  }, []);

  useEffect(() => {
    const viewport = scrollAreaViewportRef.current;
    if (!viewport) return;
    const messageAnimationDuration = 200;
    const scrollStartDelay = messageAnimationDuration + 150;

    const scrollTimer = setTimeout(() => {
      const vp = scrollAreaViewportRef.current;
      if (!vp) return;
      const targetScrollTop = Math.max(0, vp.scrollHeight - vp.clientHeight);
      const distance = targetScrollTop - vp.scrollTop;
      if (distance > 0 || (messages.length > 0 && vp.scrollTop === 0 && targetScrollTop === 0)) {
        const dynamicDuration = calculateScrollDuration(distance);
        animate(vp.scrollTop, targetScrollTop, {
          duration: dynamicDuration,
          ease: SCROLL_EASING,
          onUpdate: (latest) => {
            if (scrollAreaViewportRef.current) scrollAreaViewportRef.current.scrollTop = latest;
          },
        });
      }
    }, scrollStartDelay);

    const placeholderDistance = viewport.scrollHeight > viewport.clientHeight ? viewport.scrollHeight : 200;
    const estimatedDuration = calculateScrollDuration(placeholderDistance);
    const totalDelay = scrollStartDelay + estimatedDuration * 1000 + 50;
    const scrollabilityTimer = setTimeout(checkScrollability, totalDelay);

    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(scrollabilityTimer);
    };
  }, [messages, checkScrollability]);

  const autoScrollEnabledRef = useRef(true);

  const handleScrollIndicatorClick = useCallback((direction: 'up' | 'down') => {
    const viewport = scrollAreaViewportRef.current;
    if (!viewport) return;
    const target = direction === 'down'
      ? Math.max(0, viewport.scrollHeight - viewport.clientHeight)
      : 0;
    const distance = target - viewport.scrollTop;
    const duration = calculateScrollDuration(distance);
    animate(viewport.scrollTop, target, {
      duration,
      ease: SCROLL_EASING,
      onUpdate: (latest) => {
        if (scrollAreaViewportRef.current) scrollAreaViewportRef.current.scrollTop = latest;
      },
    });
    setTimeout(checkScrollability, duration * 1000 + 50);
  }, [checkScrollability]);

  useEffect(() => {
    const viewport = scrollAreaViewportRef.current;
    if (!viewport) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === 'ai' && autoScrollEnabledRef.current) {
      viewport.scrollTop = viewport.scrollHeight - viewport.clientHeight;
      checkScrollability();
    }
  }, [messages, checkScrollability]);

  useEffect(() => {
    const viewport = scrollAreaViewportRef.current;
    if (!viewport) return;
    const onScroll = () => {
      checkScrollability();
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      autoScrollEnabledRef.current = (scrollTop + clientHeight >= scrollHeight - SCROLL_MARGIN_PX);
    };
    viewport.addEventListener('scroll', onScroll);
    const { scrollTop, scrollHeight, clientHeight } = viewport;
    autoScrollEnabledRef.current = (scrollTop + clientHeight >= scrollHeight - SCROLL_MARGIN_PX);
    checkScrollability();
    return () => viewport.removeEventListener('scroll', onScroll);
  }, [checkScrollability]);

  const conversationKey = conversationId || "empty-conversation";

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative" ref={scrollAreaRef}>
      <ScrollArea className="flex-1 h-full" viewportRef={scrollAreaViewportRef}>
        <AnimatePresence mode="wait">
          <motion.div
            key={conversationKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <TracingBeam className="px-6" scrollableContainerRef={scrollAreaViewportRef}>
              <div ref={messagesContainerRef} className="flex flex-col space-y-4 p-4 min-h-full">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-md sm:text-lg md:text-xl lg:text-2xl text-muted-foreground flex items-baseline">
                      <span>Start a new&nbsp;</span>
                      <div className="w-24 md:w-60">
                        <ContainerTextFlip words={["conversation", "journey", "lesson", "adventure"]} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => {
                      const isUser = message.role === 'user';
                      return (
                        <motion.div
                          key={message.id}
                          className={cn("flex", isUser ? "justify-end" : "justify-start")}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
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