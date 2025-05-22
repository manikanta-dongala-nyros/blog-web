import { create } from "zustand";

interface User {
  _id: string;
  username: string;
  email: string;
  // other user properties
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  updateUserUsername: (newUsername: string) => void; // New action
}

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setUser: (user) => set({ user }),
  logout: () => set({ isAuthenticated: false, user: null }),
  updateUserUsername: (
    newUsername // New action implementation
  ) =>
    set((state) => ({
      ...state,
      user: state.user ? { ...state.user, username: newUsername } : null,
    })),
}));

export default useAuthStore;
