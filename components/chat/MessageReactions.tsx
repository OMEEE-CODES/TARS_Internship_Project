"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus } from "lucide-react";

const AVAILABLE_REACTIONS = ["👍", "❤️", "😂", "😮", "😢"];

interface MessageReactionsProps {
  messageId: Id<"messages">;
  reactions: { emoji: string; count: number; userReacted: boolean }[];
}

export function MessageReactions({ messageId, reactions }: MessageReactionsProps) {
  const { user } = useUser();
  const toggleReaction = useMutation(api.reactions.toggleReaction);

  const handleReactionClick = async (emoji: string) => {
    try {
      await toggleReaction({ messageId, emoji, clerkId: user?.id });
    } catch (error) {
      console.error("Failed to toggle reaction:", error);
    }
  };

  return (
    <div className="flex items-center gap-1 mt-1">
      {reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          onClick={() => handleReactionClick(reaction.emoji)}
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors",
            reaction.userReacted
              ? "bg-primary/20 text-primary hover:bg-primary/30"
              : "bg-muted hover:bg-muted/80"
          )}
        >
          <span>{reaction.emoji}</span>
          {reaction.count > 1 && <span>{reaction.count}</span>}
        </button>
      ))}

      {/* Add reaction button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Plus className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="p-2">
          <div className="flex gap-1">
            {AVAILABLE_REACTIONS.map((emoji) => (
              <DropdownMenuItem
                key={emoji}
                className="p-2 cursor-pointer hover:bg-accent rounded"
                onClick={() => handleReactionClick(emoji)}
              >
                <span className="text-lg">{emoji}</span>
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
