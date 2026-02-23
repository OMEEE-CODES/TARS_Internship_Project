"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useSyncUser() {
  const { user, isLoaded } = useUser();
  const syncUser = useMutation(api.users.syncUser);

  useEffect(() => {
    console.log(`[useSyncUser] Effect triggered, isLoaded=${isLoaded}, hasUser=${!!user}`);
    
    if (!isLoaded) {
      console.log('[useSyncUser] User not loaded yet, skipping...');
      return;
    }
    
    if (user) {
      const userData = {
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        name: user.fullName || user.firstName || "Anonymous",
        imageUrl: user.imageUrl,
      };
      console.log('[useSyncUser] Syncing user:', userData);
      
      syncUser(userData)
        .then((result) => {
          console.log('[useSyncUser] User synced successfully, result:', result);
        })
        .catch((error) => {
          console.error('[useSyncUser] Failed to sync user:', error);
        });
    } else {
      console.log('[useSyncUser] No user to sync');
    }
  }, [isLoaded, user, syncUser]);
}
