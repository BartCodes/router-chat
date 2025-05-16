import { ChatArea } from "@/components/chat/chat-area";
import { MessageInput } from "@/components/chat/message-input";

export default function Home() {
  return (
    <div className="flex flex-col h-[calc(100vh-1px)] w-full bg-background">
      {/* Main chat container */}
      <div className="flex-1 flex flex-col min-h-0 bg-content1">
        {/* Chat messages area */}
        <ChatArea />
        
        {/* Message input area */}
        <MessageInput />
      </div>
    </div>
  );
}
