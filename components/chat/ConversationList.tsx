"use client";

import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatConversationTime } from "@/lib/dateUtils";
import { usePathname, useRouter } from "next/navigation";
import { User, ConversationWithDetails } from "@/types";
import { ConversationListSkeleton } from "./ConversationSkeleton";
import { Users } from "lucide-react";

interface ConversationListProps {
  className?: string;
}

export function ConversationList({ className }: ConversationListProps) {
  const { user } = useUser();
  const conversations = useQuery(
    api.conversations.getConversations,
    user?.id ? { clerkId: user.id } : "skip"
  );
  const pathname = usePathname();
  const router = useRouter();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getOtherUser = (conversation: ConversationWithDetails): User | undefined => {
    return conversation.otherUser;
  };

  const getConversationDisplay = (conversation: any) => {
    if (conversation.type === "group") {
      return {
        name: conversation.name || "Group Chat",
        avatar: null,
        isOnline: false,
        subtitle: `${conversation.participants?.length || 2} members`,
        isGroup: true,
      };
    } else {
      const otherUser = getOtherUser(conversation);
      return {
        name: otherUser?.name || "Unknown User",
        avatar: otherUser?.imageUrl,
        isOnline: otherUser?.isOnline,
        subtitle: otherUser?.isOnline ? "Online" : "Offline",
        isGroup: false,
      };
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-card", className)}>
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Messages</h2>
      </div>
      
      <ScrollArea className="flex-1">
        {conversations === undefined ? (
          <ConversationListSkeleton />
        ) : conversations === null ? (
          <div className="p-4 text-center text-muted-foreground">
            <p>Please sign in to view conversations.</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <p>No conversations yet.</p>
            <p className="text-sm">Start a conversation by searching for users.</p>
          </div>
        ) : (
          <div className="divide-y">
            {conversations.map((conversation: any) => {
              const display = getConversationDisplay(conversation);
              const isActive = pathname === `/chat/${conversation._id}`;

              return (
                <button
                  key={conversation._id}
                  onClick={() => router.push(`/chat/${conversation._id}`)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-accent",
                    isActive && "bg-accent"
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      {display.isGroup ? (
                        <AvatarFallback className="bg-primary/10">
                          <Users className="h-5 w-5 text-primary" />
                        </AvatarFallback>
                      ) : (
                        <>
                          <AvatarImage src={display.avatar || undefined} />
                          <AvatarFallback>
                            {getInitials(display.name || "U")}
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    {!display.isGroup && display.isOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-medium truncate">
                        {display.name || "Chat"}
                      </h3>
                      {conversation.lastMessage && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatConversationTime(conversation.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-muted-foreground truncate">
                        {display.isGroup && (
                          <span className="text-xs mr-1">{display.subtitle} •</span>
                        )}
                        {conversation.lastMessage?.isDeleted
                          ? "This message was deleted"
                          : conversation.lastMessage?.content || "No messages yet"}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="flex-shrink-0 h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
