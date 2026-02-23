"use client";

import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";

// Hook to provide auth info to Convex
export function useConvexAuth() {
  const { isLoaded, userId, getToken } = useAuth();

  return useMemo(
    () => ({
      isLoading: !isLoaded,
      isAuthenticated: !!userId,
      // Return a fetchToken function that Convex will use
      fetchAccessToken: async () => {
        if (!userId) return null;
        try {
          // Get the JWT token from Clerk for Convex
          const token = await getToken({ template: "convex" });
          return token;
        } catch (e) {
          return null;
        }
      },
    }),
    [isLoaded, userId, getToken]
  );
}
