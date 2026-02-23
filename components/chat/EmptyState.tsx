"use client";

import { MessageSquare, Users, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  type: "conversations" | "messages" | "search";
  title?: string;
  description?: string;
  className?: string;
}

export function EmptyState({
  type,
  title,
  description,
  className,
}: EmptyStateProps) {
  const icons = {
    conversations: MessageSquare,
    messages: MessageSquare,
    search: Search,
  };

  const defaultTitles = {
    conversations: "No conversations yet",
    messages: "No messages yet",
    search: "No users found",
  };

  const defaultDescriptions = {
    conversations: "Start a conversation by searching for users",
    messages: "Say hello to start the conversation!",
    search: "Try a different search term",
  };

  const Icon = icons[type];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className
      )}
    >
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">
        {title || defaultTitles[type]}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        {description || defaultDescriptions[type]}
      </p>
    </div>
  );
}
