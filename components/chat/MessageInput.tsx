"use client";

import { useState, useRef, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";

interface MessageInputProps {
  conversationId: Id<"conversations">;
  className?: string;
}

export function MessageInput({ conversationId, className }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();

  const sendMessage = useMutation(api.messages.sendMessage);
  const setTypingStatus = useMutation(api.typing.setTyping);

  // Handle typing with debounce
  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      setTypingStatus({ conversationId, isTyping: true, clerkId: user?.id });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setTypingStatus({ conversationId, isTyping: false, clerkId: user?.id });
    }, 2000);
  }, [conversationId, isTyping, setTypingStatus, user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    // Clear typing status
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsTyping(false);
    setTypingStatus({ conversationId, isTyping: false, clerkId: user?.id });

    if (!user?.id) return;

    // Send message
    try {
      await sendMessage({
        conversationId,
        content: message.trim(),
        clerkId: user.id,
      });
      setMessage("");
      inputRef.current?.focus();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex items-center gap-2 p-4 border-t bg-card",
        className
      )}
    >
      <Input
        ref={inputRef}
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          handleTyping();
        }}
        placeholder="Type a message..."
        className="flex-1"
      />
      <Button
        type="submit"
        size="icon"
        disabled={!message.trim()}
        className="shrink-0"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
