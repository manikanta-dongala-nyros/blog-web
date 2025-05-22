"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);
  const storeIsAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const storeUser = useAuthStore((state) => state.user);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Only update if the store is out of sync
      if (!storeIsAuthenticated || storeUser?.username !== session.user.name) {
        setAuthenticated(true);
        // Ensure session.user.name exists; provide a fallback if necessary
        setUser({ username: session.user.name || "Unknown User" });
      }
    } else if (status === "unauthenticated") {
      // Only update if the store is out of sync
      if (storeIsAuthenticated || storeUser !== null) {
        setAuthenticated(false);
        setUser(null);
      }
    }
    // 'status' indicates loading, authenticated, or unauthenticated.
    // 'session' contains user data when authenticated.
  }, [session, status, setAuthenticated, setUser, storeIsAuthenticated, storeUser]);

  return <>{children}</>;
}