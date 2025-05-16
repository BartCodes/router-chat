'use client';

import { ChatArea } from "@/components/chat/chat-area";
import { MessageInput } from "@/components/chat/message-input";
import { ModelSelector } from "@/components/chat/model-selector";
import type { Message, Conversation } from '@/lib/types';
import { updateConversation } from '@/lib/local-storage';
import { useChat } from "@/components/chat-provider";

export default function Home() {
  const {
    messages,
    setMessages,
    currentModelId,
    setCurrentModelId,
    activeConversation,
    setActiveConversation,
  } = useChat();

  const handleUserMessageSend = (newUserMessage: Message) => {
    if (!activeConversation) {
      console.error("handleUserMessageSend: No active conversation.");
      return;
    }

    const baseMessages = activeConversation.messages || [];
    const newMessagesArray = [...baseMessages, newUserMessage];

    setMessages(newMessagesArray);

    const updatedConversationForContext: Conversation = {
      ...activeConversation,
      messages: newMessagesArray, 
      updatedAt: new Date(),
    };
    setActiveConversation(updatedConversationForContext);

    updateConversation(updatedConversationForContext);
  };

  const handleAiMessageUpdate = (aiMessageId: string, chunk: string, modelId?: string) => {
    setMessages(prevDisplayMessages => {
      let newDisplayMessages;
      const existingAiMessage = prevDisplayMessages.find(msg => msg.id === aiMessageId);

      if (existingAiMessage) {
        newDisplayMessages = prevDisplayMessages.map(msg =>
          msg.id === aiMessageId ? { ...msg, content: msg.content + chunk } : msg
        );
      } else {
        const newAiMessage: Message = {
          id: aiMessageId,
          role: 'ai',
          content: chunk,
          modelId: modelId || currentModelId,
          createdAt: new Date(),
        };
        newDisplayMessages = [...prevDisplayMessages, newAiMessage];
      }
      
      setActiveConversation(prevActiveConversation => {
          if (!prevActiveConversation) {
            console.error("handleAiMessageUpdate: prevActiveConversation is null inside setActiveConversation update.");
            return null; 
          }
          const updatedConv: Conversation = {
              ...prevActiveConversation,
              messages: newDisplayMessages,
              updatedAt: new Date(),
          };
          updateConversation(updatedConv);
          return updatedConv;
      });
      
      return newDisplayMessages;
    });
  };

  const handleAiResponseComplete = (aiMessageId: string) => {
    if (activeConversation && messages.find(msg => msg.id === aiMessageId)) {
        const finalMessages = messages; 
        
        const conversationToPersist: Conversation = {
            ...activeConversation,
            messages: [...finalMessages],
            updatedAt: new Date(),
        };
        updateConversation(conversationToPersist);
    }
  };

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
          activeConversation={activeConversation} 
          onUserMessageSend={handleUserMessageSend}
          onAiMessageUpdate={handleAiMessageUpdate}
          onAiResponseComplete={handleAiResponseComplete}
          currentModelId={currentModelId}
        />
      </div>
    </div>
  );
}
