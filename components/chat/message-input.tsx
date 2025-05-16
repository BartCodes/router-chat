"use client";

import { SendIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function MessageInput() {
  const [message, setMessage] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This is a placeholder - will be implemented in Phase 0.4
    console.log("Message submitted:", message);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-4 border-t border-default-200 bg-content1">
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="min-h-[56px] max-h-[200px] resize-none bg-content2 border-default-200 focus-visible:ring-primary"
          aria-label="Message input"
        />
        <Button 
          type="submit" 
          size="icon"
          className="h-[56px] w-[56px] shrink-0 bg-primary hover:bg-primary-500 text-primary-foreground"
          disabled={!message.trim()}
        >
          <SendIcon className="size-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </form>
  );
} 