import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "admin" | "user";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface StoredUser extends SessionUser {
  password: string;
}

interface AuthState {
  user: SessionUser | null;
  users: Record<string, StoredUser>;
  _login: (email: string, password: string) => { ok: boolean; error?: string };
  _register: (name: string, email: string, password: string) => { ok: boolean; error?: string };
  _loginGoogle: () => void;
  _logout: () => void;
}

// Seed users (demo only — see security note in spec/README).
const SEED: Record<string, StoredUser> = {
  "admin@demo": { id: "u-admin", name: "Admin Demo", email: "admin@demo", role: "admin", password: "demo" },
  "user@demo": { id: "u-user", name: "Usuario Demo", email: "user@demo", role: "user", password: "demo" },
};

function toSession(u: StoredUser): SessionUser {
  const { password: _password, ...session } = u;
  return session;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      users: SEED,
      _login: (email, password) => {
        const u = get().users[email.trim().toLowerCase()] ?? get().users[email.trim()];
        if (!u || u.password !== password) return { ok: false, error: "invalid" };
        set({ user: toSession(u) });
        return { ok: true };
      },
      _register: (name, email, password) => {
        const key = email.trim().toLowerCase();
        if (get().users[key]) return { ok: false, error: "exists" };
        const stored: StoredUser = { id: `u-${key}`, name, email: key, role: "user", password };
        set((s) => ({ users: { ...s.users, [key]: stored }, user: toSession(stored) }));
        return { ok: true };
      },
      _loginGoogle: () => {
        const key = "google.user@demo";
        const stored: StoredUser =
          get().users[key] ??
          { id: "u-google", name: "Google User", email: key, role: "user", password: "" };
        set((s) => ({ users: { ...s.users, [key]: stored }, user: toSession(stored) }));
      },
      _logout: () => set({ user: null }),
    }),
    {
      name: "showcase-auth",
      // Keep seed users available even if storage predates them.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AuthState>;
        return { ...current, ...p, users: { ...SEED, ...(p.users ?? {}) } };
      },
    },
  ),
);
