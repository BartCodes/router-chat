import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";
import { motion, useMotionValue, useTransform, animate, useAnimate } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useState, useRef } from "react";

interface AIMessageBubbleProps {
  message: Message;
  className?: string;
}

export function AIMessageBubble({ message, className }: AIMessageBubbleProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const prevContentLength = useRef(message.content.length);
  const [scope, animate] = useAnimate();
  
  // Control the glow effect strength
  const glowStrength = useMotionValue(0);
  const boxShadow = useTransform(
    glowStrength,
    [0, 1],
    [
      "0 0 0 rgba(136, 58, 234, 0)",
      "0 0 12px rgba(136, 58, 234, 0.5)"
    ]
  );
  
  // Scale effect for the message bubble
  const scaleValue = useMotionValue(1);
  const y = useMotionValue(0);

  // Detect streaming state by comparing content length changes
  useEffect(() => {
    const currentLength = message.content.length;
    const contentChanged = currentLength !== prevContentLength.current;
    const contentExists = currentLength > 0;
    
    // Determine if we're streaming (content changed and exists)
    const streaming = contentChanged && contentExists;
    setIsStreaming(streaming);
    
    if (streaming) {
      // Animate glow effect when new content arrives
      animate(glowStrength, 0.8, { duration: 0.3 });
      animate(glowStrength, 0, { duration: 0.7, delay: 0.3 });
      
      // Subtle scale effect when content grows
      animate(scaleValue, 1.01, { duration: 0.15, ease: "easeOut" });
      animate(scaleValue, 1, { duration: 0.3, delay: 0.15, ease: "easeInOut" });
      
      // Slight upward motion effect
      animate(y, -2, { duration: 0.15, ease: "easeOut" });
      animate(y, 0, { duration: 0.3, delay: 0.15, ease: "easeInOut" });
      
      // If we have content, animate the text container
      if (scope.current) {
        animate(scope.current, { opacity: [0.85, 1] }, { duration: 0.3 });
      }
    }
    
    prevContentLength.current = currentLength;
  }, [message.content, animate, glowStrength, scaleValue, y, scope]);

  return (
    <div className={cn("flex items-start gap-2.5 mr-auto max-w-[80%]", className)}>
      <div className="flex flex-col gap-1">
        <motion.div 
          className="rounded-lg px-4 py-2 text-foreground border bg-content2 border-default-200"
          initial={{ scale: 0.95, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{ 
            boxShadow, 
            scale: scaleValue,
            y
          }}
        >
          <motion.div ref={scope} className="streaming-text">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </motion.div>
        </motion.div>
        {message.modelId && (
          <span className="text-xs text-default-500 mt-1 ml-2">
            {message.modelId.split('/').pop()}
          </span>
        )}
      </div>
    </div>
  );
} 