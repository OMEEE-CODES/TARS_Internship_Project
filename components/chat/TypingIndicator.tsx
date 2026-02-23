"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";

interface TypingIndicatorProps {
  conversationId: Id<"conversations">;
  className?: string;
}

export function TypingIndicator({
  conversationId,
  className,
}: TypingIndicatorProps) {
  const { user } = useUser();
  const typingUsers = useQuery(api.typing.getTypingUsers, {
    conversationId,
    clerkId: user?.id,
  });

  if (!typingUsers || typingUsers.length === 0) {
    return null;
  }

  const names = typingUsers.map((user: any) => user?.name).filter(Boolean);
  let text = "";

  if (names.length === 1) {
    text = `${names[0]} is typing...`;
  } else if (names.length === 2) {
    text = `${names[0]} and ${names[1]} are typing...`;
  } else {
    text = `${names.length} people are typing...`;
  }

  return (
    <div
      className={cn(
        "px-4 py-2 text-sm text-muted-foreground animate-pulse",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <span
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
        <span>{text}</span>
      </div>
    </div>
  );
}
