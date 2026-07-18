import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@atlas/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...user } : user,
          accessToken,
          isAuthenticated: true,
        })),
      clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: "atlas-auth",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
