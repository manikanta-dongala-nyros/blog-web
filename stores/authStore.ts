import { create } from "zustand";

interface AuthStore {
  isAuthenticated: boolean;
  setAuthenticated: (authState: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  setAuthenticated: (authState) => set({ isAuthenticated: authState }),
}));