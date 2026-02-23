"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function useConversations(clerkId?: string) {
  const conversations = useQuery(
    api.conversations.getConversations,
    clerkId ? { clerkId } : "skip"
  );
  const getOrCreateConversation = useMutation(api.conversations.getOrCreateDirectConversation);

  return {
    conversations,
    getOrCreateConversation,
  };
}

export function useConversation(conversationId: Id<"conversations">) {
  const conversation = useQuery(api.conversations.getConversationById, {
    conversationId,
  });

  return {
    conversation,
  };
}
