// components/ClientProviders.tsx
"use client";

import { useEffect } from "react";
import useAuthStore from "@/stores/authStore";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <>{children}</>;
}
