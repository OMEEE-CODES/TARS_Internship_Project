"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface UserSearchProps {
  className?: string;
  onClose?: () => void;
}

export function UserSearch({ className, onClose }: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { user } = useUser();
  
  const users = useQuery(
    api.users.searchUsers,
    searchQuery.length > 0 && user?.id ? { query: searchQuery, clerkId: user.id } : "skip"
  );
  const allUsers = useQuery(
    api.users.getUsers,
    user?.id ? { clerkId: user.id } : "skip"
  );
  const getOrCreateConversation = useMutation(
    api.conversations.getOrCreateDirectConversation
  );

  const displayUsers = searchQuery.length > 0 ? users : allUsers;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleUserClick = async (userId: string) => {
    if (!user?.id) return;
    
    try {
      const conversationId = await getOrCreateConversation({
        otherUserId: userId as any,
        clerkId: user.id,
      });
      router.push(`/chat/${conversationId}`);
      onClose?.();
      setSearchQuery("");
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-card", className)}>
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">New Message</h2>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="pl-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        {displayUsers?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {searchQuery ? (
              <>
                <p>No users found matching &quot;{searchQuery}&quot;</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </>
            ) : (
              <>
                <p>No other users found</p>
                <p className="text-sm mt-1">
                  Other users will appear here when they sign up
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {displayUsers?.map((user: any) => (
              <button
                key={user._id}
                onClick={() => handleUserClick(user._id)}
                className="w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-accent"
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.imageUrl} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  {user.isOnline && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{user.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
