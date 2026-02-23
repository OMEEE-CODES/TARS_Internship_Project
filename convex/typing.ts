import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "./auth";

// Get typing indicators for a conversation
export const getTypingUsers = query({
  args: {
    conversationId: v.id("conversations"),
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx, args.clerkId);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const twoSecondsAgo = Date.now() - 2000;

    const typingRecords = await ctx.db
      .query("typing")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .filter((q) => q.gt(q.field("timestamp"), twoSecondsAgo))
      .collect();

    // Get user details for typing users (excluding current user)
    const typingUsers = await Promise.all(
      typingRecords
        .filter((record) => record.userId !== userId)
        .map(async (record) => {
          const user = await ctx.db.get(record.userId);
          return user;
        })
    );

    return typingUsers.filter(Boolean);
  },
});

// Set typing status
export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    isTyping: v.boolean(),
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx, args.clerkId);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check for existing typing record
    const existingRecord = await ctx.db
      .query("typing")
      .withIndex("by_user_conversation", (q) =>
        q.eq("userId", userId).eq("conversationId", args.conversationId)
      )
      .first();

    if (args.isTyping) {
      if (existingRecord) {
        // Update timestamp
        await ctx.db.patch(existingRecord._id, {
          timestamp: Date.now(),
        });
      } else {
        // Create new typing record
        await ctx.db.insert("typing", {
          conversationId: args.conversationId,
          userId,
          timestamp: Date.now(),
        });
      }
    } else {
      // Remove typing record
      if (existingRecord) {
        await ctx.db.delete(existingRecord._id);
      }
    }
  },
});

// Cleanup old typing records (can be called periodically)
export const cleanupOldTypingRecords = mutation({
  handler: async (ctx) => {
    const fiveSecondsAgo = Date.now() - 5000;

    const oldRecords = await ctx.db
      .query("typing")
      .filter((q) => q.lt(q.field("timestamp"), fiveSecondsAgo))
      .collect();

    for (const record of oldRecords) {
      await ctx.db.delete(record._id);
    }

    return oldRecords.length;
  },
});
