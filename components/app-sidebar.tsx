'use client';

import { PlusCircle, MessageSquareText, MoreHorizontal, Edit3, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useChat } from "@/components/chat-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import * as React from "react";

export function AppSidebar() {
  const { 
    conversations, 
    activeConversation,
    handleNewChat, 
    handleSelectConversation,
    handleEditConversationName,
    handleDeleteConversation,
    isAiResponding,
  } = useChat();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [conversationToDelete, setConversationToDelete] = React.useState<string | null>(null);

  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [conversationToEdit, setConversationToEdit] = React.useState<string | null>(null);
  const [newConversationName, setNewConversationName] = React.useState("");

  const onEditName = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation(); // Prevent row click
    const currentConversation = conversations.find(conv => conv.id === conversationId);
    setConversationToEdit(conversationId);
    setNewConversationName(currentConversation?.name || "");
    setIsEditDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (conversationToDelete) {
      handleDeleteConversation(conversationToDelete);
    }
    setIsDeleteDialogOpen(false);
    setConversationToDelete(null);
  };

  const onDeleteConversation = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation(); // Prevent row click
    setConversationToDelete(conversationId);
    setIsDeleteDialogOpen(true);
  };

  const handleEditConfirm = () => {
    if (conversationToEdit && newConversationName.trim() !== "") {
      handleEditConversationName(conversationToEdit, newConversationName.trim());
    }
    setIsEditDialogOpen(false);
    setConversationToEdit(null);
    setNewConversationName("");
  };

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
                      className={`w-full text-foreground group hover:bg-content2 hover:text-primary hover:cursor-pointer ${conv.id === activeConversation?.id ? 'bg-content2 text-primary' : ''} ${isAiResponding ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div onClick={() => !isAiResponding && handleSelectConversation(conv.id)} className="flex items-center w-full">
                        <MessageSquareText size={16} className={conv.id === activeConversation?.id ? "text-primary" : "text-default-500 group-hover:text-primary"} />
                        <span className="truncate flex-1 ml-2">{conv.name}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className={`h-7 w-7 ml-auto opacity-0 group-hover:opacity-100 focus-visible:opacity-100 ${activeConversation?.id === conv.id ? 'opacity-100' : ''} ${isAiResponding ? 'cursor-not-allowed' : ''}`} disabled={isAiResponding}>
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="right" align="start" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem onClick={(e) => !isAiResponding && onEditName(e, conv.id)} className={`hover:cursor-pointer ${isAiResponding ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isAiResponding}>
                              <Edit3 size={14} className="mr-2" />
                              Edit name
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => !isAiResponding && onDeleteConversation(e, conv.id)} variant="destructive" className={`hover:cursor-pointer text-danger ${isAiResponding ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isAiResponding}>
                              <Trash2 size={14} className="mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              conversation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConversationToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Conversation Name Dialog */}
      <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit conversation name</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a new name for this conversation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input 
            value={newConversationName} 
            onChange={(e) => setNewConversationName(e.target.value)} 
            placeholder="Conversation name"
            className="my-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleEditConfirm();
              }
            }}
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {setConversationToEdit(null); setNewConversationName("");}}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEditConfirm} disabled={!newConversationName.trim()}>
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  )
}
