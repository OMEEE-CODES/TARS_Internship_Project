import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "./auth";

// Get messages for a conversation
export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx, args.clerkId);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify user is a participant in the conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      throw new Error("Not authorized");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation_time", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();

    // Get sender details for each message
    const messagesWithSender = await Promise.all(
      messages.map(async (msg) => {
        const sender = await ctx.db.get(msg.senderId);
        return {
          ...msg,
          sender,
        };
      })
    );

    return messagesWithSender;
  },
});

// Send a message
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx, args.clerkId);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify user is a participant in the conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      throw new Error("Not authorized");
    }

    const now = Date.now();

    // Create the message
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: userId,
      content: args.content,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    });

    // Update conversation timestamp
    await ctx.db.patch(args.conversationId, {
      updatedAt: now,
    });

    // Increment unread count for other participants
    for (const participantId of conversation.participants) {
      if (participantId !== userId) {
        const readReceipt = await ctx.db
          .query("readReceipts")
          .withIndex("by_user_conversation", (q) =>
            q.eq("userId", participantId).eq("conversationId", args.conversationId)
          )
          .first();

        if (readReceipt) {
          await ctx.db.patch(readReceipt._id, {
            unreadCount: readReceipt.unreadCount + 1,
          });
        }
      }
    }

    return messageId;
  },
});

// Mark messages as read
export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    lastMessageId: v.optional(v.id("messages")),
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx, args.clerkId);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const readReceipt = await ctx.db
      .query("readReceipts")
      .withIndex("by_user_conversation", (q) =>
        q.eq("userId", userId).eq("conversationId", args.conversationId)
      )
      .first();

    if (readReceipt) {
      await ctx.db.patch(readReceipt._id, {
        lastReadMessageId: args.lastMessageId,
        unreadCount: 0,
      });
    }
  },
});

// Delete a message (soft delete)
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx, args.clerkId);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message || message.senderId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.messageId, {
      isDeleted: true,
      updatedAt: Date.now(),
    });
  },
});
