"use client";

import { ReactNode, useEffect, useState } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexReactClient, ConvexProvider } from "convex/react";
import { UserSyncProvider } from "./UserSyncProvider";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
}

const convex = new ConvexReactClient(convexUrl);

function InnerProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <UserSyncProvider>
        {children}
      </UserSyncProvider>
    </ConvexProvider>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      afterSignInUrl="/chat"
      afterSignUpUrl="/chat"
    >
      <InnerProvider>{children}</InnerProvider>
    </ClerkProvider>
  );
}
