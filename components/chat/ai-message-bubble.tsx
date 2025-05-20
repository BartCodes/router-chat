import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";

interface AIMessageBubbleProps {
  message: Message;
  className?: string;
}

export function AIMessageBubble({ message, className }: AIMessageBubbleProps) {
  return (
    <div className={cn("flex items-start gap-2.5 mr-auto max-w-[80%]", className)}>
      <div className="flex flex-col gap-1">
        <div className="rounded-lg px-4 py-2 text-foreground border bg-content2 border-default-200">
          <p>{message.content}</p>
        </div>
        {message.modelId && (
          <span className="text-xs text-default-500 mt-1 ml-2">
            {message.modelId.split('/').pop()}
          </span>
        )}
      </div>
    </div>
  );
} 