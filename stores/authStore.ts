import { create } from "zustand";

interface AuthStore {
  isAuthenticated: boolean;
  user: { username: string } | null; // Add user field
  setAuthenticated: (authState: boolean) => void;
  setUser: (user: { username: string } | null) => void; // Add setUser function
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  user: null, // Initialize user as null
  setAuthenticated: (authState) => set({ isAuthenticated: authState }),
  setUser: (user) => set({ user }), // Implement setUser
}));
