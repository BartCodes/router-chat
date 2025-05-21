import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";
import { motion, useMotionValue, useTransform } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface UserMessageBubbleProps {
  message: Message;
  className?: string;
}

export function UserMessageBubble({ message, className }: UserMessageBubbleProps) {
  // Hover animations
  const hoverScale = useMotionValue(1);
  const hoverY = useMotionValue(0);
  const hoverShadow = useTransform(
    hoverScale,
    [1, 1.01],
    ["0 0 0 rgba(0, 0, 0, 0)", "0 2px 10px rgba(0, 0, 0, 0.1)"]
  );

  return (
    <div className={cn("flex items-start gap-2.5 ml-auto max-w-[80%]", className)}>
      <div className="flex flex-col gap-1">
        <motion.div 
          className="rounded-lg px-4 py-2 text-foreground border bg-primary/10 border-primary/20"
          initial={{ scale: 0.95, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{ 
            boxShadow: hoverShadow,
            scale: hoverScale,
            y: hoverY
          }}
          whileHover={{ 
            scale: 1.01,
            y: -2,
            transition: { duration: 0.15 }
          }}
        >
          <motion.div className="user-message">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 