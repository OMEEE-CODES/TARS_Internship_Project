import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "./auth";

// Get reactions for a message
export const getReactions = query({
  args: {
    messageId: v.id("messages"),
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx, args.clerkId);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
      .collect();

    // Get user details for each reaction
    const reactionsWithUser = await Promise.all(
      reactions.map(async (reaction) => {
        const user = await ctx.db.get(reaction.userId);
        return {
          ...reaction,
          user,
        };
      })
    );

    return reactionsWithUser;
  },
});

// Toggle a reaction (add if not exists, remove if exists)
export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx, args.clerkId);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify user has access to this message
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    const conversation = await ctx.db.get(message.conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      throw new Error("Not authorized");
    }

    // Check if reaction already exists
    const existingReaction = await ctx.db
      .query("reactions")
      .withIndex("by_user_message", (q) =>
        q.eq("userId", userId).eq("messageId", args.messageId)
      )
      .filter((q) => q.eq(q.field("emoji"), args.emoji))
      .first();

    if (existingReaction) {
      // Remove reaction (toggle off)
      await ctx.db.delete(existingReaction._id);
      return { action: "removed" };
    } else {
      // Add reaction
      await ctx.db.insert("reactions", {
        messageId: args.messageId,
        userId,
        emoji: args.emoji,
        createdAt: Date.now(),
      });
      return { action: "added" };
    }
  },
});

// Get aggregated reactions for multiple messages
export const getReactionsForMessages = query({
  args: {
    messageIds: v.array(v.id("messages")),
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx, args.clerkId);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const allReactions: Record<string, { emoji: string; count: number; userReacted: boolean }[]> = {};

    for (const messageId of args.messageIds) {
      const reactions = await ctx.db
        .query("reactions")
        .withIndex("by_message", (q) => q.eq("messageId", messageId))
        .collect();

      // Group by emoji
      const grouped = reactions.reduce((acc, reaction) => {
        const existing = acc.find((r) => r.emoji === reaction.emoji);
        if (existing) {
          existing.count++;
          if (reaction.userId === userId) {
            existing.userReacted = true;
          }
        } else {
          acc.push({
            emoji: reaction.emoji,
            count: 1,
            userReacted: reaction.userId === userId,
          });
        }
        return acc;
      }, [] as { emoji: string; count: number; userReacted: boolean }[]);

      allReactions[messageId] = grouped;
    }

    return allReactions;
  },
});
