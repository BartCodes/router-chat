'use client';

import { useState } from 'react';
import { ChatArea } from "@/components/chat/chat-area";
import { MessageInput } from "@/components/chat/message-input";
import type { Message } from '@/lib/types';

// Will move this to constants later
const DEFAULT_MODEL_ID = 'meta-llama/llama-3.3-8b-instruct:free';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [currentModelIdForNextMessage, setCurrentModelIdForNextMessage] = 
    useState<string>(DEFAULT_MODEL_ID);

  return (
    <div className="flex flex-col h-[calc(100vh-1px)] w-full bg-background">
      <div className="flex-1 flex flex-col min-h-0 bg-content1">
        <ChatArea 
          messages={messages}
        />
        
        <MessageInput 
          messages={messages}
          setMessages={setMessages}
          currentModelId={currentModelIdForNextMessage}
          setCurrentModelId={setCurrentModelIdForNextMessage}
        />
      </div>
    </div>
  );
}
