'use client';

import { useState } from 'react';
import { ChatArea } from "@/components/chat/chat-area";
import { MessageInput } from "@/components/chat/message-input";
import { ModelSelector } from "@/components/chat/model-selector";
import type { Message } from '@/lib/types';
import { DEFAULT_MODEL_ID } from '@/lib/constants';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentModelId, setCurrentModelId] = useState(DEFAULT_MODEL_ID);

  return (
    <div className="flex flex-col h-full pt-10">
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-default-200">
          <ModelSelector 
            currentModelId={currentModelId}
            setCurrentModelId={setCurrentModelId}
          />
        </div>
        
        <div className="flex-1 min-h-0">
          <ChatArea 
            messages={messages}
          />
        </div>
        
        <MessageInput 
          messages={messages}
          setMessages={setMessages}
          currentModelId={currentModelId}
        />
      </div>
    </div>
  );
}
