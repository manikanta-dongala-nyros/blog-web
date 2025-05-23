"use client";

import { useEffect } from "react";
import ClientProviders from "@/components/ClientProviders";
import { useAuthStore } from "@/stores/authStore";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <ClientProviders>
      <div className="min-h-screen">{children}</div>
    </ClientProviders>
  );
}
