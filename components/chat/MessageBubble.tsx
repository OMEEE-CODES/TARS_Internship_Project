"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatMessageDate } from "@/lib/dateUtils";
import { User } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2, MoreHorizontal } from "lucide-react";
import { MessageReactions } from "./MessageReactions";
import { Id } from "@/convex/_generated/dataModel";

interface MessageWithSender {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  isDeleted: boolean;
  sender?: User;
}

interface MessageBubbleProps {
  message: MessageWithSender;
  isOwnMessage: boolean;
  showAvatar: boolean;
  currentUserId?: string;
}

export function MessageBubble({
  message,
  isOwnMessage,
  showAvatar,
  currentUserId,
}: MessageBubbleProps) {
  const { user } = useUser();
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const reactions = useQuery(
    api.reactions.getReactionsForMessages,
    { messageIds: [message._id as Id<"messages">], clerkId: user?.id }
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleDelete = async () => {
    try {
      await deleteMessage({ messageId: message._id as Id<"messages">, clerkId: user?.id });
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const messageReactions = reactions?.[message._id] || [];
  const canDelete = isOwnMessage && !message.isDeleted;

  return (
    <div
      className={cn(
        "flex gap-3 group",
        isOwnMessage ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div className="shrink-0">
        {showAvatar ? (
          <Avatar className="h-8 w-8">
            <AvatarImage src={message.sender?.imageUrl} />
            <AvatarFallback className="text-xs">
              {getInitials(message.sender?.name || "U")}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-8 w-8" />
        )}
      </div>

      {/* Message content */}
      <div
        className={cn(
          "flex flex-col max-w-[70%]",
          isOwnMessage ? "items-end" : "items-start"
        )}
      >
        <div className="flex items-start gap-2">
          <div
            className={cn(
              "px-4 py-2 rounded-2xl",
              isOwnMessage
                ? "bg-primary text-primary-foreground rounded-br-none"
                : "bg-muted rounded-bl-none",
              message.isDeleted && "italic opacity-70"
            )}
          >
            <p className="text-sm break-words">
              {message.isDeleted ? "This message was deleted" : message.content}
            </p>
          </div>

          {/* Delete menu - only for own messages */}
          {canDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwnMessage ? "end" : "start"}>
                <DropdownMenuItem
                  className="text-destructive cursor-pointer"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete message
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground mt-1 px-1">
          {formatMessageDate(message.createdAt)}
          {message.isDeleted && " (deleted)"}
        </span>

        {/* Reactions */}
        {!message.isDeleted && (
          <MessageReactions
            messageId={message._id as Id<"messages">}
            reactions={messageReactions}
          />
        )}
      </div>
    </div>
  );
}
