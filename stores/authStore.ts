// import { create } from "zustand";

// interface AuthStore {
//   userId: string | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   hasHydrated: boolean; // ✅ NEW
//   user: any | null;
//   lastPath: string;
//   setAuth: (status: boolean) => void;
//   setUser: (user: any) => void;
//   updateUserUsername: (newUsername: string) => void; // ✅ ADD THIS LINE
//   setLastPath: (path: string) => void;
//   hydrate: () => void;
//   validateRedirectPath: (path: string) => string;
// }

// const validPaths = ["/", "/blogs/list", "/blogs/create", "/myaccount"];

// // Add function to validate edit paths
// const isValidPath = (path: string) => {
//   if (validPaths.includes(path)) return true;
//   // Allow edit paths
//   return path.startsWith("/blogs/edit/");
// };

// export const useAuthStore = create<AuthStore>((set, get) => ({
//   userId: null,
//   isAuthenticated: false,
//   isLoading: true,
//   hasHydrated: false, // ✅ INIT

//   user: null,
//   lastPath: "/",

//   setAuth: (status) => {
//     set({ isAuthenticated: status });
//     localStorage.setItem("isAuthenticated", JSON.stringify(status));
//   },

//   setUser: (user) => {
//     set({
//       user,
//       userId: user?._id || null,
//     });
//     localStorage.setItem("user", JSON.stringify(user));
//     if (user?._id) {
//       localStorage.setItem("userId", user._id);
//     }
//   },

//   updateUserUsername: (newUsername: string) => {
//     set((state) => {
//       if (state.user) {
//         const updatedUser = { ...state.user, username: newUsername };
//         localStorage.setItem("user", JSON.stringify(updatedUser));
//         return { user: updatedUser };
//       }
//       return {}; // Return empty object if user is null to avoid changing state
//     });
//   },

//   setLastPath: (path) => {
//     if (isValidPath(path)) {
//       set({ lastPath: path });
//       localStorage.setItem("lastPath", path);
//     }
//   },

//   validateRedirectPath: (path) => {
//     return isValidPath(path) ? path : "/";
//   },

//   hydrate: () => {
//     set({ isLoading: true });

//     try {
//       const storedAuth = localStorage.getItem("isAuthenticated");
//       const storedUser = localStorage.getItem("user");
//       const storedUserId = localStorage.getItem("userId");
//       const storedPath = localStorage.getItem("lastPath");

//       set((state) => {
//         const newState: Partial<AuthStore> = {};

//         if (storedAuth) newState.isAuthenticated = JSON.parse(storedAuth);
//         if (storedUser) newState.user = JSON.parse(storedUser);
//         if (storedUserId) {
//           newState.userId = storedUserId;
//         } else if (storedUser) {
//           const user = JSON.parse(storedUser);
//           newState.userId = user?._id || null;
//         }
//         if (storedPath && validPaths.includes(storedPath)) {
//           newState.lastPath = storedPath;
//         }

//         return newState;
//       });
//     } catch (error) {
//       console.error("Error during hydration:", error);
//     } finally {
//       set({ isLoading: false, hasHydrated: true });
//     }
//   },
// }));

// export default useAuthStore;

import { create } from "zustand";

interface AuthStore {
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  user: any | null;
  lastPath: string;
  setAuth: (status: boolean) => void;
  setUser: (user: any) => void;
  updateUserUsername: (newUsername: string) => void;
  updateUserFields: (fields: Partial<any>) => void; // ✅ NEW
  setLastPath: (path: string) => void;
  hydrate: () => void;
  validateRedirectPath: (path: string) => string;
}

const validPaths = ["/", "/blogs/list", "/blogs/create", "/myaccount"];

const isValidPath = (path: string) => {
  if (validPaths.includes(path)) return true;
  return path.startsWith("/blogs/edit/");
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  userId: null,
  isAuthenticated: false,
  isLoading: true,
  hasHydrated: false,
  user: null,
  lastPath: "/",

  setAuth: (status) => {
    set({ isAuthenticated: status });
    localStorage.setItem("isAuthenticated", JSON.stringify(status));
  },

  setUser: (user) => {
    set({
      user,
      userId: user?._id || null,
    });
    localStorage.setItem("user", JSON.stringify(user));
    if (user?._id) {
      localStorage.setItem("userId", user._id);
    }
  },

  updateUserUsername: (newUsername: string) => {
    set((state) => {
      if (state.user) {
        const updatedUser = { ...state.user, username: newUsername };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return { user: updatedUser };
      }
      return {};
    });
  },

  updateUserFields: (fields) => {
    set((state) => {
      if (!state.user) return {};
      const updatedUser = { ...state.user, ...fields };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
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
      const storedUserId = localStorage.getItem("userId");
      const storedPath = localStorage.getItem("lastPath");

      set((state) => {
        const newState: Partial<AuthStore> = {};

        if (storedAuth) newState.isAuthenticated = JSON.parse(storedAuth);
        if (storedUser) newState.user = JSON.parse(storedUser);
        if (storedUserId) {
          newState.userId = storedUserId;
        } else if (storedUser) {
          const user = JSON.parse(storedUser);
          newState.userId = user?._id || null;
        }
        if (storedPath && validPaths.includes(storedPath)) {
          newState.lastPath = storedPath;
        }

        return newState;
      });
    } catch (error) {
      console.error("Error during hydration:", error);
    } finally {
      set({ isLoading: false, hasHydrated: true });
    }
  },
}));

export default useAuthStore;
