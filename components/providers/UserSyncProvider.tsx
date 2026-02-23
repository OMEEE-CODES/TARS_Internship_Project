"use client";

import { ReactNode } from "react";
import { useSyncUser } from "@/hooks/useSyncUser";
import { usePresence } from "@/hooks/usePresence";

export function UserSyncProvider({ children }: { children: ReactNode }) {
  useSyncUser();
  usePresence();
  return <>{children}</>;
}
