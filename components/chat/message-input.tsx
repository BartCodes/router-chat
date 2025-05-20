"use client";

import { SendIcon } from "lucide-react";
import * as React from "react";
import { v4 as uuidv4 } from 'uuid';

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Message, Conversation } from "@/lib/types";
import { processUserMessage } from "@/app/actions";

interface MessageInputProps {
  activeConversation: Conversation | null;
  onUserMessageSend: (message: Message) => void;
  onAiMessageUpdate: (aiMessageId: string, chunk: string, modelId?: string) => void;
  onAiResponseComplete: (aiMessageId: string) => void;
  currentModelId: string;
}

export function MessageInput({ 
  activeConversation, 
  onUserMessageSend,
  onAiMessageUpdate,
  onAiResponseComplete,
  currentModelId,
}: MessageInputProps) {
  const [messageContent, setMessageContent] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const createUserMessage = (content: string): Message => ({
    id: uuidv4(),
    role: 'user',
    content: content.trim(),
    createdAt: new Date()
  });

  const processStreamingResponse = async (
    stream: ReadableStream<Uint8Array>,
    aiMessageId: string,
    modelIdForStream: string
  ): Promise<void> => {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          
          await processStreamLine(line.trim(), aiMessageId, modelIdForStream);
        }
      }
      if (buffer) {
        await processStreamLine(buffer.trim(), aiMessageId, modelIdForStream);
      }
    } finally {
      reader.releaseLock();
      onAiResponseComplete(aiMessageId);
    }
  };

  const processStreamLine = async (
    line: string,
    aiMessageId: string,
    modelIdForStream: string
  ): Promise<void> => {
    if (!line || !line.startsWith('data: ')) return;

    const data = line.slice(6);
    if (data === '[DONE]') return;

    try {
      const parsed = JSON.parse(data);
      const content = parsed.choices?.[0]?.delta?.content;
      if (content) {
        onAiMessageUpdate(aiMessageId, content, modelIdForStream);
      }
    } catch (e) {
      if (data !== '[DONE]' && data.trim()) {
        console.error('Error parsing streaming data:', e, "Data:", data);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = messageContent.trim();
    if (!trimmedMessage || isLoading || !activeConversation) return;

    setIsLoading(true);
    
    try {
      const userMessage = createUserMessage(trimmedMessage);
      onUserMessageSend(userMessage);
      setMessageContent("");

      const conversationHistoryForAPI = [...activeConversation.messages, userMessage];
      
      const result = await processUserMessage(conversationHistoryForAPI, currentModelId);

      const aiMessageId = uuidv4();

      if (result instanceof ReadableStream) {
        await processStreamingResponse(result, aiMessageId, currentModelId);
      } else if (!result.success) {
        console.error('Error from AI:', result.error);
        onAiMessageUpdate(aiMessageId, `Error: ${result.error}`, currentModelId);
        onAiResponseComplete(aiMessageId);
      } else {
        console.warn("Received non-streaming success, but streaming was expected.");
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const aiMessageId = uuidv4();
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during submission.";
      onAiMessageUpdate(aiMessageId, `Error: ${errorMessage}`, currentModelId);
      onAiResponseComplete(aiMessageId);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-4 border-t border-default-200 bg-content1 shrink-0 z-10">
      <div className="flex gap-2">
        <Textarea
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="min-h-[56px] max-h-[200px] resize-none bg-content2 border-default-200"
          aria-label="Message input"
          disabled={isLoading || !activeConversation}
        />
        <Button 
          type="submit" 
          size="icon"
          className="h-[56px] w-[56px] shrink-0 bg-primary hover:bg-primary-500 text-primary-foreground hover:cursor-pointer"
          disabled={!messageContent.trim() || isLoading || !activeConversation}
        >
          <SendIcon className="size-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </form>
  );
} 