import type { Message, Conversation } from '@/lib/types';
import { updateConversation } from '@/lib/local-storage';
import { UseChatReturn } from '@/components/chat-provider';

type UseChatHandlersArgs = Pick<UseChatReturn, 'messages' | 'setMessages' | 'currentModelId' | 'activeConversation' | 'setActiveConversation' | 'conversations'>;

export const useChatHandlers = ({
  messages,
  setMessages,
  currentModelId,
  activeConversation,
  setActiveConversation,
  conversations,
}: UseChatHandlersArgs) => {

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
    setMessages((prevDisplayMessages: Message[]) => {
      let newDisplayMessages;
      const existingAiMessage = prevDisplayMessages.find((msg: Message) => msg.id === aiMessageId);

      if (existingAiMessage) {
        newDisplayMessages = prevDisplayMessages.map((msg: Message) =>
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

      setActiveConversation((prevActiveConversation: Conversation | null) => {
          if (!prevActiveConversation) {
            console.error("handleAiMessageUpdate: prevActiveConversation is null inside setActiveConversation update.");
            return null;
          }
          const currentConversationFromList = conversations.find((c: Conversation) => c.id === prevActiveConversation.id);
          const baseConversation = currentConversationFromList || prevActiveConversation;

          const updatedConv: Conversation = {
              ...baseConversation,
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
    if (activeConversation && messages.find((msg: Message) => msg.id === aiMessageId)) {
        const finalMessages = messages;

        const conversationToPersist: Conversation = {
            ...activeConversation,
            messages: [...finalMessages],
            updatedAt: new Date(),
        };
        updateConversation(conversationToPersist);
    }
  };

  return {
    handleUserMessageSend,
    handleAiMessageUpdate,
    handleAiResponseComplete,
  };
}; 