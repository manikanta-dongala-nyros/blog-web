import { create } from "zustand";

interface AuthStore {
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean; // ✅ NEW
  user: any | null;
  lastPath: string;
  setAuth: (status: boolean) => void;
  setUser: (user: any) => void;
  setLastPath: (path: string) => void;
  hydrate: () => void;
  validateRedirectPath: (path: string) => string;
}

const validPaths = ["/", "/blogs/list", "/blogs/create", "/myaccount"];

// Add function to validate edit paths
const isValidPath = (path: string) => {
  if (validPaths.includes(path)) return true;
  // Allow edit paths
  return path.startsWith("/blogs/edit/");
};

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  hasHydrated: false, // ✅ INIT

  user: null,
  lastPath: "/",

  setAuth: (status) => {
    set({ isAuthenticated: status });
    localStorage.setItem("isAuthenticated", JSON.stringify(status));
  },

  setUser: (user) => {
    set({ user });
    localStorage.setItem("user", JSON.stringify(user));
  },

  setLastPath: (path) => {
    if (isValidPath(path)) {
      set({ lastPath: path });
      localStorage.setItem("lastPath", path);
    }
  },

  validateRedirectPath: (path) => {
    return isValidPath(path) ? path : "/";
  },

  hydrate: () => {
    set({ isLoading: true });

    try {
      const storedAuth = localStorage.getItem("isAuthenticated");
      const storedUser = localStorage.getItem("user");
      const storedPath = localStorage.getItem("lastPath");

      if (storedAuth) {
        set({ isAuthenticated: JSON.parse(storedAuth) });
      }

      if (storedUser) {
        set({ user: JSON.parse(storedUser) });
      }

      if (storedPath && validPaths.includes(storedPath)) {
        set({ lastPath: storedPath });
      }
    } catch (error) {
      console.error("Error during hydration:", error);
    } finally {
      set({ isLoading: false, hasHydrated: true }); // ✅ FINISH
    }
  },
}));

export default useAuthStore;
