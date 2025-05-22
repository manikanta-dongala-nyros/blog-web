"use client";

import { SessionProvider } from "next-auth/react";
import AuthProvider from "./AuthProvider"; // Assuming AuthProvider.tsx is in the same directory

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>{children}</AuthProvider>
    </SessionProvider>
  );
}