"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ConversationList } from "@/components/chat/ConversationList";
import { UserSearch } from "@/components/chat/UserSearch";
import { GroupCreate } from "@/components/chat/GroupCreate";
import { EmptyState } from "@/components/chat/EmptyState";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Users } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export default function ChatPage() {
  const { user } = useUser();
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showGroupCreate, setShowGroupCreate] = useState(false);
  
  // Pass clerkId as argument for auth fallback
  const currentUser = useQuery(api.users.getCurrentUser, user?.id ? { clerkId: user.id } : "skip");
  const authDebug = useQuery(api.auth.getMyUserId, user?.id ? { clerkId: user.id } : "skip");

  console.log('[ChatPage] currentUser:', currentUser);
  console.log('[ChatPage] authDebug:', authDebug);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-full md:w-80 lg:w-96 border-r flex flex-col bg-card">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/sign-in" />
            <div>
              <h1 className="font-semibold">{user?.firstName || "Chat"}</h1>
              <p className="text-xs text-muted-foreground">
                {(currentUser as any)?.isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowGroupCreate(true)}
              title="Create group"
            >
              <Users className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowUserSearch(true)}
              title="New message"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {showGroupCreate ? (
          <GroupCreate onClose={() => setShowGroupCreate(false)} />
        ) : showUserSearch ? (
          <UserSearch onClose={() => setShowUserSearch(false)} />
        ) : (
          <ConversationList />
        )}
      </div>

      {/* Main content area - Empty state for desktop */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-muted/50">
        <EmptyState
          type="conversations"
          title="Welcome to Tars Chat"
          description="Select a conversation from the sidebar or start a new one by clicking the + button"
        />
      </div>

      {/* Mobile: Show empty state with prompt */}
      <div className="md:hidden fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
        <div className="text-center">
          <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Welcome to Tars Chat</h2>
          <p className="text-muted-foreground mb-6">
            Select a conversation or start a new message
          </p>
          <Button onClick={() => setShowUserSearch(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>
      </div>
    </div>
  );
}
