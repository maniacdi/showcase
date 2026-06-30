"use client";

import { useAuthStore } from "@/store/useAuthStore";

/**
 * Isolated auth API. Pages/components consume this hook only — swapping the mock
 * store for NextAuth later means changing this file + useAuthStore, not the UI.
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s._login);
  const register = useAuthStore((s) => s._register);
  const loginWithGoogle = useAuthStore((s) => s._loginGoogle);
  const logout = useAuthStore((s) => s._logout);

  return {
    user,
    isAuthenticated: user !== null,
    isAdmin: user?.role === "admin",
    login,
    register,
    loginWithGoogle,
    logout,
  };
}
