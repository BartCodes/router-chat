'use client';

import { PlusCircle, MessageSquareText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useChat } from "@/components/chat-provider"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"

export function AppSidebar() {
  const { 
    conversations, 
    activeConversation,
    handleNewChat, 
    handleSelectConversation 
  } = useChat();

  return (
    <Sidebar className="border-r border-default-200 bg-content1">
      <SidebarHeader className="p-2 border-b border-default-200">
        <Button 
          variant="outline" 
          className="hover:cursor-pointer w-full justify-start gap-2 bg-content2 hover:bg-content3 hover:text-primary border-default-300 text-foreground" 
          onClick={() => handleNewChat()}
        >
          <PlusCircle size={18} />
          New Chat
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          <SidebarGroup>
            <SidebarGroupLabel className="text-default-500">Recent Chats</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {conversations.length === 0 && (
                  <SidebarMenuItem className="text-default-500 px-2 py-1 text-sm">
                    No recent chats.
                  </SidebarMenuItem>
                )}
                {conversations.map((conv) => (
                  <SidebarMenuItem key={conv.id}>
                    <SidebarMenuButton 
                      asChild
                      isActive={conv.id === activeConversation?.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      className={`w-full text-foreground hover:bg-content2 hover:text-primary hover:cursor-pointer ${conv.id === activeConversation?.id ? 'bg-content2 text-primary' : ''}`}
                    >
                      <a>
                        <MessageSquareText size={16} className={conv.id === activeConversation?.id ? "text-primary" : "text-default-500"} />
                        <span className="truncate">{conv.name}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  )
}
