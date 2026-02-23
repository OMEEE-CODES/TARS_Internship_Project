import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "./auth";

// Get all users except the current user
export const getUsers = query({
  args: {
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx, args.clerkId);
    if (!userId) {
      return null;
    }

    const users = await ctx.db.query("users").collect();
    return users.filter((user) => user._id !== userId);
  },
});

// Get current user
export const getCurrentUser = query({
  args: {
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx, args.clerkId);
    if (!userId) {
      return null;
    }

    return await ctx.db.get(userId);
  },
});

// Get a user by ID
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Search users by name or email
export const searchUsers = query({
  args: { 
    query: v.string(),
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx, args.clerkId);
    if (!userId) {
      return null;
    }

    const searchQuery = args.query.toLowerCase();
    const users = await ctx.db.query("users").collect();

    return users.filter(
      (user) =>
        user._id !== userId &&
        (user.name.toLowerCase().includes(searchQuery) ||
          user.email.toLowerCase().includes(searchQuery))
    );
  },
});

// Sync user from Clerk (called after sign in) - doesn't require auth
export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        isOnline: true,
        lastSeen: Date.now(),
      });
      return existingUser._id;
    } else {
      // Create new user
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        isOnline: true,
        lastSeen: Date.now(),
      });
      return userId;
    }
  },
});

// Update online status
export const setOnlineStatus = mutation({
  args: {
    isOnline: v.boolean(),
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx, args.clerkId);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    await ctx.db.patch(userId, {
      isOnline: args.isOnline,
      lastSeen: Date.now(),
    });
  },
});
