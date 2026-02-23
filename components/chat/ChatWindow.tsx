"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronDown, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";
import { EmptyState } from "./EmptyState";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";

interface ChatWindowProps {
  conversationId: Id<"conversations">;
  isMobile?: boolean;
}

export function ChatWindow({ conversationId, isMobile }: ChatWindowProps) {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const conversation = useQuery(api.conversations.getConversationById, {
    conversationId,
    clerkId: clerkUser?.id,
  });
  const messages = useQuery(api.messages.getMessages, { conversationId, clerkId: clerkUser?.id });
  const currentUser = useQuery(api.users.getCurrentUser, { clerkId: clerkUser?.id });
  const markAsRead = useMutation(api.messages.markAsRead);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle scroll to detect if user is near bottom
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const { scrollTop, scrollHeight, clientHeight } = target;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const nearBottom = distanceFromBottom < 100;
    setIsNearBottom(nearBottom);
    setShowScrollButton(!nearBottom && !!messages && messages.length > 0);
  };

  // Auto-scroll on new messages if near bottom
  useEffect(() => {
    if (isNearBottom) {
      scrollToBottom();
    }
  }, [messages, isNearBottom]);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (messages && messages.length > 0 && clerkUser?.id) {
      const lastMessage = messages[messages.length - 1];
      markAsRead({
        conversationId,
        lastMessageId: lastMessage._id,
        clerkId: clerkUser.id,
      });
    }
  }, [conversationId, messages, markAsRead, clerkUser?.id]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const otherUser = conversation?.otherUser;
  const isGroup = conversation?.type === "group";

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/chat")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        <div className="relative">
          <Avatar className="h-10 w-10">
            {isGroup ? (
              <AvatarFallback className="bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </AvatarFallback>
            ) : (
              <>
                <AvatarImage src={otherUser?.imageUrl} />
                <AvatarFallback>
                  {getInitials(otherUser?.name || "U")}
                </AvatarFallback>
              </>
            )}
          </Avatar>
          {!isGroup && otherUser?.isOnline && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold truncate">
            {isGroup 
              ? conversation?.name || "Group Chat"
              : otherUser?.name || "Unknown User"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isGroup
              ? `${conversation?.participants?.length || 0} members`
              : otherUser?.isOnline
              ? "Online"
              : otherUser?.lastSeen
              ? `Last seen ${new Date(otherUser.lastSeen).toLocaleDateString()}`
              : "Offline"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 relative">
        <ScrollArea
          ref={scrollAreaRef}
          className="h-full"
          onScrollCapture={handleScroll}
        >
          <div className="p-4 space-y-4">
            {messages?.length === 0 ? (
              <EmptyState
                type="messages"
                title="No messages yet"
                description="Say hello to start the conversation!"
              />
            ) : (
              messages?.map((message: any, index: number) => (
                <MessageBubble
                  key={message._id}
                  message={message}
                  isOwnMessage={message.senderId === currentUser?._id}
                  showAvatar={
                    index === 0 ||
                    messages[index - 1]?.senderId !== message.senderId
                  }
                  currentUserId={currentUser?._id}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute bottom-4 right-4 rounded-full shadow-lg"
            onClick={scrollToBottom}
          >
            <ChevronDown className="h-4 w-4 mr-1" />
            New messages
          </Button>
        )}
      </div>

      {/* Typing indicator */}
      <TypingIndicator conversationId={conversationId} />

      {/* Message input */}
      <MessageInput conversationId={conversationId} />
    </div>
  );
}
