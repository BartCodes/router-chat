'use client';

import { ChatArea } from "@/components/chat/chat-area";
import { MessageInput } from "@/components/chat/message-input";
import { ModelSelector } from "@/components/chat/model-selector";
import { useChat } from "@/components/chat-provider";
import { useChatHandlers } from "@/hooks/use-chat-handlers";

export default function Home() {
  const {
    messages,
    setMessages,
    currentModelId,
    setCurrentModelId,
    activeConversation,
    setActiveConversation,
    conversations,
    isAiResponding,
  } = useChat();

  const {
    handleUserMessageSend,
    handleAiMessageUpdate,
    handleAiResponseComplete,
  } = useChatHandlers({
    messages,
    setMessages,
    currentModelId,
    activeConversation,
    setActiveConversation,
    conversations,
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-end p-4 border-b border-default-200">
        <ModelSelector 
          currentModelId={currentModelId}
          setCurrentModelId={setCurrentModelId} 
        />
      </div>
      
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <div className="flex-1 min-h-0">
          <ChatArea 
            messages={messages}
            conversationId={activeConversation?.id}
          />
        </div>
        
        <MessageInput 
          activeConversation={activeConversation} 
          onUserMessageSend={handleUserMessageSend}
          onAiMessageUpdate={handleAiMessageUpdate}
          onAiResponseComplete={handleAiResponseComplete}
          currentModelId={currentModelId}
          isAiResponding={isAiResponding}
        />
      </div>
    </div>
  );
}
