import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User profiles synced from Clerk
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    isOnline: v.boolean(),
    lastSeen: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  // Conversations (1-on-1 and group)
  conversations: defineTable({
    type: v.union(v.literal("direct"), v.literal("group")),
    name: v.optional(v.string()),
    participants: v.array(v.id("users")),
    createdBy: v.id("users"),
    updatedAt: v.number(),
  }),

  // Messages
  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    isDeleted: v.boolean(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_conversation_time", ["conversationId", "createdAt"]),

  // Typing indicators (ephemeral)
  typing: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    timestamp: v.number(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_user_conversation", ["userId", "conversationId"]),

  // Read receipts / unread counts
  readReceipts: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    lastReadMessageId: v.optional(v.id("messages")),
    unreadCount: v.number(),
  })
    .index("by_user_conversation", ["userId", "conversationId"]),

  // Message reactions (👍 ❤️ 😂 😮 😢)
  reactions: defineTable({
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(), // "👍" | "❤️" | "😂" | "😮" | "😢"
    createdAt: v.number(),
  })
    .index("by_message", ["messageId"])
    .index("by_user_message", ["userId", "messageId"]),
});
