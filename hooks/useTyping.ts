"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function useTyping(conversationId: Id<"conversations">, clerkId?: string) {
  const typingUsers = useQuery(api.typing.getTypingUsers, {
    conversationId,
    clerkId,
  });
  const setTyping = useMutation(api.typing.setTyping);

  return {
    typingUsers,
    setTyping,
  };
}
