import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AIMessageBubbleProps {
  message: Message;
  className?: string;
}

export function AIMessageBubble({ message, className }: AIMessageBubbleProps) {
  return (
    <div className={cn("flex items-start gap-2.5 mr-auto max-w-[80%]", className)}>
      <div className="flex flex-col gap-1">
        <motion.div 
          className="rounded-lg px-4 py-2 text-foreground border bg-content2 border-default-200"
          initial={{ scale: 0.95, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
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