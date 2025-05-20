import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";
import { motion } from "motion/react";

interface UserMessageBubbleProps {
  message: Message;
  className?: string;
}

export function UserMessageBubble({ message, className }: UserMessageBubbleProps) {
  return (
    <div className={cn("flex items-start gap-2.5 ml-auto max-w-[80%]", className)}>
      <div className="flex flex-col gap-1">
        <motion.div 
          className="rounded-lg px-4 py-2 text-foreground border bg-primary/10 border-primary/20"
          initial={{ scale: 0.95, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <p>{message.content}</p>
        </motion.div>
      </div>
    </div>
  );
} 