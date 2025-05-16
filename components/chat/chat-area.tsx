"use client";

import { ScrollArea } from "@/components/ui/scroll-area";

export function ChatArea() {
  return (
    <div className="flex-1 h-full relative bg-content1">
      <ScrollArea className="h-[calc(100vh-180px)] w-full">
        <div className="flex flex-col space-y-4 p-4">
          {/* Placeholder message bubbles */}
          <div className="flex items-start gap-2.5 ml-auto max-w-[80%]">
            <div className="flex flex-col gap-1">
              <div className="rounded-lg bg-primary/10 px-4 py-2 text-foreground border border-primary/20">
                <p>Hello! How can I help you today?</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 mr-auto max-w-[80%]">
            <div className="flex flex-col gap-1">
              <div className="rounded-lg bg-content2 px-4 py-2 text-foreground border border-default-200">
                <p>This is a placeholder chat area. Messages will appear here.</p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
} 