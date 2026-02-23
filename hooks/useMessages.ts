"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function useMessages(conversationId: Id<"conversations">, clerkId?: string) {
  const messages = useQuery(api.messages.getMessages, { conversationId, clerkId });
  const sendMessage = useMutation(api.messages.sendMessage);
  const markAsRead = useMutation(api.messages.markAsRead);
  const deleteMessage = useMutation(api.messages.deleteMessage);

  return {
    messages,
    sendMessage,
    markAsRead,
    deleteMessage,
  };
}
