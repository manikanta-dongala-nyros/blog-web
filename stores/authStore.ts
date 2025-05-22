import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  isAuthenticated: boolean;
  setAuthenticated: (authState: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      setAuthenticated: (authState) => set({ isAuthenticated: authState }),
    }),
    {
      name: "auth-storage", // unique name for the storage
    }
  )
);