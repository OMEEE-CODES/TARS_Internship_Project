import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "./auth";

// Get all conversations for the current user
export const getConversations = query({
  args: {
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx, args.clerkId);
    if (!userId) {
      return null;
    }

    // Get all conversations and filter by participant
    const allConversations = await ctx.db.query("conversations").collect();
    const conversations = allConversations.filter((conv) =>
      conv.participants.includes(userId)
    );

    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        // Get other participant for direct messages
        const otherUserId = conv.participants.find((id) => id !== userId);
        const otherUser = otherUserId ? await ctx.db.get(otherUserId) : null;

        // Get last message
        const messages = await ctx.db
          .query("messages")
          .withIndex("by_conversation_time", (q) =>
            q.eq("conversationId", conv._id)
          )
          .order("desc")
          .take(1);

        const lastMessage = messages[0] || null;

        // Get unread count
        const readReceipt = await ctx.db
          .query("readReceipts")
          .withIndex("by_user_conversation", (q) =>
            q.eq("userId", userId).eq("conversationId", conv._id)
          )
          .first();

        return {
          ...conv,
          otherUser,
          lastMessage,
          unreadCount: readReceipt?.unreadCount || 0,
        };
      })
    );

    // Sort by updatedAt (most recent first)
    return conversationsWithDetails.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

// Get or create a direct conversation with another user
export const getOrCreateDirectConversation = mutation({
  args: {
    otherUserId: v.id("users"),
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx, args.clerkId);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if conversation already exists
    const allConversations = await ctx.db.query("conversations").collect();
    const existingConversation = allConversations.find(
      (conv) =>
        conv.type === "direct" &&
        conv.participants.includes(userId) &&
        conv.participants.includes(args.otherUserId)
    );

    if (existingConversation) {
      return existingConversation._id;
    }

    // Create new conversation
    const conversationId = await ctx.db.insert("conversations", {
      type: "direct",
      participants: [userId, args.otherUserId],
      createdBy: userId,
      updatedAt: Date.now(),
    });

    // Initialize read receipts for both users
    await ctx.db.insert("readReceipts", {
      conversationId,
      userId,
      unreadCount: 0,
    });

    await ctx.db.insert("readReceipts", {
      conversationId,
      userId: args.otherUserId,
      unreadCount: 0,
    });

    return conversationId;
  },
});

// Get a conversation by ID
export const getConversationById = query({
  args: {
    conversationId: v.id("conversations"),
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx, args.clerkId);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      return null;
    }

    // Verify user is a participant
    if (!conversation.participants.includes(userId)) {
      throw new Error("Not authorized");
    }

    // Get other participant for direct messages
    const otherUserId = conversation.participants.find((id) => id !== userId);
    const otherUser = otherUserId ? await ctx.db.get(otherUserId) : null;

    return {
      ...conversation,
      otherUser,
    };
  },
});

// Update conversation timestamp
export const updateConversationTimestamp = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      updatedAt: Date.now(),
    });
  },
});

// Create a group conversation
export const createGroupConversation = mutation({
  args: {
    name: v.string(),
    memberIds: v.array(v.id("users")),
    clerkId: v.optional(v.string()),
},
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx, args.clerkId);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    if (args.memberIds.length < 2) {
      throw new Error("Group must have at least 2 members");
    }

    const now = Date.now();

    // Create group conversation
    const conversationId = await ctx.db.insert("conversations", {
      type: "group",
      name: args.name,
      participants: [userId, ...args.memberIds],
      createdBy: userId,
      updatedAt: now,
    });

    // Initialize read receipts for all participants
    for (const participantId of [userId, ...args.memberIds]) {
      await ctx.db.insert("readReceipts", {
        conversationId,
        userId: participantId,
        unreadCount: 0,
      });
    }

    return conversationId;
  },
});
