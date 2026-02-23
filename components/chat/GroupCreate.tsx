"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, Check, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface GroupCreateProps {
  onClose?: () => void;
}

export function GroupCreate({ onClose }: GroupCreateProps) {
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
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
  const createGroup = useMutation(api.conversations.createGroupConversation);

  const displayUsers = searchQuery.length > 0 ? users : allUsers;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    if (groupName.trim().length === 0 || selectedUsers.length < 2) {
      return;
    }

    setIsCreating(true);
    try {
      if (!user?.id) return;
      
      const conversationId = await createGroup({
        name: groupName.trim(),
        memberIds: selectedUsers as any,
        clerkId: user.id,
      });
      router.push(`/chat/${conversationId}`);
      onClose?.();
    } catch (error) {
      console.error("Failed to create group:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const canCreate = groupName.trim().length > 0 && selectedUsers.length >= 2;

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Create Group</h2>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Group name input */}
        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group name..."
            className="pl-9"
          />
        </div>

        {/* Search users */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users to add..."
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

        {/* Selected count */}
        {selectedUsers.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {selectedUsers.length} member{selectedUsers.length !== 1 ? "s" : ""} selected
            {selectedUsers.length < 2 && " (select at least 2)"}
          </p>
        )}
      </div>

      {/* User list */}
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
            {displayUsers?.map((user: any) => {
              const isSelected = selectedUsers.includes(user._id);
              return (
                <button
                  key={user._id}
                  onClick={() => toggleUserSelection(user._id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-accent",
                    isSelected && "bg-accent/50"
                  )}
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
                  <div className="flex-1 min-w-0 text-left">
                    <h3 className="font-medium truncate">{user.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors",
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-muted-foreground"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Create button */}
      <div className="p-4 border-t">
        <Button
          className="w-full"
          disabled={!canCreate || isCreating}
          onClick={handleCreateGroup}
        >
          {isCreating ? "Creating..." : `Create Group (${selectedUsers.length})`}
        </Button>
      </div>
    </div>
  );
}
