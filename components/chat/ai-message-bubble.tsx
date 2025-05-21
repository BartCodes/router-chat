import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";
import { motion, useMotionValue, useTransform, useAnimate } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useRef } from "react";

interface AIMessageBubbleProps {
  message: Message;
  className?: string;
}

export function AIMessageBubble({ message, className }: AIMessageBubbleProps) {
  const prevContentLength = useRef(message.content.length);
  const [scope, animate] = useAnimate();
  
  const glowStrength = useMotionValue(0);
  const boxShadow = useTransform(
    glowStrength,
    [0, 1],
    [
      "0 0 0 rgba(136, 58, 234, 0)",
      "0 0 12px rgba(136, 58, 234, 0.5)"
    ]
  );
  
  const scaleValue = useMotionValue(1);
  const y = useMotionValue(0);

  useEffect(() => {
    const currentLength = message.content.length;
    const contentChanged = currentLength !== prevContentLength.current;
    const contentExists = currentLength > 0;
    
    const streaming = contentChanged && contentExists;
    
    if (streaming) {
      animate(glowStrength, 0.8, { duration: 0.3 });
      animate(glowStrength, 0, { duration: 0.7, delay: 0.3 });
      
      animate(scaleValue, 1.01, { duration: 0.15, ease: "easeOut" });
      animate(scaleValue, 1, { duration: 0.3, delay: 0.15, ease: "easeInOut" });
      
      animate(y, -2, { duration: 0.15, ease: "easeOut" });
      animate(y, 0, { duration: 0.3, delay: 0.15, ease: "easeInOut" });
      
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