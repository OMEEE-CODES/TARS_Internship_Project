"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { UserSearch } from "@/components/chat/UserSearch";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { UserButton } from "@clerk/nextjs";

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const conversationId = params.conversationId as Id<"conversations">;
  const setOnlineStatus = useMutation(api.users.setOnlineStatus);

  // Handle responsive layout
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Set online status on mount
  useEffect(() => {
    if (!user?.id) return;
    
    setOnlineStatus({ isOnline: true, clerkId: user.id });

    const handleBeforeUnload = () => {
      setOnlineStatus({ isOnline: false, clerkId: user.id });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      setOnlineStatus({ isOnline: false, clerkId: user.id });
    };
  }, [setOnlineStatus, user?.id]);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Hidden on mobile when viewing a conversation */}
      <div
        className={cn(
          "w-full md:w-80 lg:w-96 border-r flex flex-col bg-card",
          isMobile && "hidden"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/sign-in" />
            <div>
              <h1 className="font-semibold">{user?.firstName || "Chat"}</h1>
              <p className="text-xs text-green-600">Online</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowUserSearch(true)}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        {showUserSearch ? (
          <UserSearch onClose={() => setShowUserSearch(false)} />
        ) : (
          <ConversationList />
        )}
      </div>

      {/* Chat Window */}
      <div
        className={cn(
          "flex-1",
          isMobile ? "fixed inset-0 z-50" : "relative"
        )}
      >
        <ChatWindow conversationId={conversationId} isMobile={isMobile} />
      </div>
    </div>
  );
}
