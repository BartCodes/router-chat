import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        {/* Placeholder for Sidebar Header Content (e.g., Logo, App Name) */}
        <p className="p-4 text-sm font-semibold">RouterChat</p>
      </SidebarHeader>
      <SidebarContent>
        {/* Placeholder for Sidebar Content (e.g., New Chat Button, Conversation List) */}
        <div className="p-4">
          <p className="text-xs text-muted-foreground">
            Conversation list will appear here.
          </p>
        </div>
      </SidebarContent>
      <SidebarFooter>
        {/* Placeholder for Sidebar Footer Content (e.g., Settings, User Profile) */}
        <div className="p-4">
          <p className="text-xs text-muted-foreground">
            Footer content placeholder.
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
} 