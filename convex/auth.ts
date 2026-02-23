import { v } from "convex/values";
import { query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Helper to get the authenticated user's ID from Clerk JWT or explicit clerkId
export async function getAuthUserId(ctx: any, clerkId?: string): Promise<Id<"users"> | null> {
  // First try to get identity from JWT
  let identity = null;
  try {
    identity = await ctx.auth.getUserIdentity();
  } catch (e) {
    // JWT auth failed
  }
  
  // Use JWT subject if available, otherwise fall back to passed clerkId
  const clerkIdToUse = identity?.subject ?? clerkId ?? null;
  
  if (!clerkIdToUse) {
    return null;
  }
  
  // Look up the user by their Clerk ID
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", clerkIdToUse))
    .first();
  
  return user?._id ?? null;
}

// Test auth query - accepts clerkId as fallback
export const getMyUserId = query({
  args: {
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx, args.clerkId);
    const identity = await ctx.auth.getUserIdentity().catch(() => null);
    
    return { 
      authenticated: !!userId,
      userId: userId,
      jwtSubject: identity?.subject ?? null,
      providedClerkId: args.clerkId ?? null,
    };
  },
});
