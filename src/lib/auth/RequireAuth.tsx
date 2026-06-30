"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "@/i18n/navigation";
import type { Role } from "@/store/useAuthStore";
import { useAuth } from "./useAuth";

/**
 * Client-side gate (mock auth). Waits for mount so the persisted store has
 * hydrated, then redirects to /login if the session is missing or lacks `role`.
 */
export default function RequireAuth({
  role,
  children,
}: {
  role?: Role;
  children: ReactNode;
}) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const allowed = isAuthenticated && (!role || user?.role === role);

  useEffect(() => {
    if (mounted && !allowed) {
      router.replace("/login");
    }
  }, [mounted, allowed, router]);

  if (!mounted || !allowed) return null;
  return <>{children}</>;
}
