"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAuth, useUser } from "@clerk/nextjs";

interface AuthContextType {
  clerkId: string | null;
  isSignedIn: boolean;
  isLoaded: boolean;
}

const AuthContext = createContext<AuthContextType>({
  clerkId: null,
  isSignedIn: false,
  isLoaded: false,
});

export function useAuthContext() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  return (
    <AuthContext.Provider value={{
      clerkId: user?.id ?? null,
      isSignedIn: isSignedIn ?? false,
      isLoaded,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
