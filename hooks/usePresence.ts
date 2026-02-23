"use client";

import { useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { useAuth, useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";

export function usePresence() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const setOnlineStatus = useMutation(api.users.setOnlineStatus);

  const updateStatus = useCallback(async (online: boolean) => {
    if (!user?.id) {
      console.log('[usePresence] No user ID available');
      return;
    }
    
    console.log(`[usePresence] Updating status to ${online ? 'online' : 'offline'}`);
    try {
      await setOnlineStatus({ 
        isOnline: online,
        clerkId: user.id, // Pass clerkId as fallback
      });
      console.log(`[usePresence] Status updated successfully`);
    } catch (error) {
      console.error(`[usePresence] Failed to update status:`, error);
    }
  }, [setOnlineStatus, user?.id]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user?.id) return;

    // Set online when component mounts
    updateStatus(true);

    // Handle tab visibility change
    const handleVisibilityChange = () => {
      updateStatus(document.visibilityState === "visible");
    };

    // Handle before unload
    const handleBeforeUnload = () => {
      setOnlineStatus({ isOnline: false, clerkId: user.id }).catch(() => {});
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      updateStatus(false);
    };
  }, [isSignedIn, isLoaded, user?.id, updateStatus, setOnlineStatus]);
}
