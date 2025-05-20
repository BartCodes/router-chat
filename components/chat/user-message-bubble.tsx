import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";

interface UserMessageBubbleProps {
  message: Message;
  className?: string;
}

export function UserMessageBubble({ message, className }: UserMessageBubbleProps) {
  return (
    <div className={cn("flex items-start gap-2.5 ml-auto max-w-[80%]", className)}>
      <div className="flex flex-col gap-1">
        <div className="rounded-lg px-4 py-2 text-foreground border bg-primary/10 border-primary/20">
          <p>{message.content}</p>
        </div>
      </div>
    </div>
  );
} 