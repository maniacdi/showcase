import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "@/store/useAuthStore";

// Exercise the store actions directly (the hook is a thin wrapper around them).
function reset() {
  useAuthStore.setState({
    user: null,
    users: {
      "admin@demo": {
        id: "u-admin",
        name: "Admin Demo",
        email: "admin@demo",
        role: "admin",
        password: "demo",
      },
      "user@demo": {
        id: "u-user",
        name: "Usuario Demo",
        email: "user@demo",
        role: "user",
        password: "demo",
      },
    },
  });
}

describe("auth store", () => {
  beforeEach(reset);

  it("logs in admin with correct credentials", () => {
    const res = useAuthStore.getState()._login("admin@demo", "demo");
    expect(res.ok).toBe(true);
    expect(useAuthStore.getState().user?.role).toBe("admin");
  });

  it("rejects wrong password", () => {
    const res = useAuthStore.getState()._login("admin@demo", "nope");
    expect(res.ok).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("registers a new user as role user and logs in", () => {
    const res = useAuthStore.getState()._register("Ana", "ana@demo", "pw");
    expect(res.ok).toBe(true);
    expect(useAuthStore.getState().user?.role).toBe("user");
    expect(useAuthStore.getState().user?.email).toBe("ana@demo");
  });

  it("rejects registering an existing email", () => {
    const res = useAuthStore.getState()._register("X", "admin@demo", "pw");
    expect(res.ok).toBe(false);
    expect(res.error).toBe("exists");
  });

  it("google mock login creates a user-role session", () => {
    useAuthStore.getState()._loginGoogle();
    expect(useAuthStore.getState().user?.role).toBe("user");
  });

  it("logout clears the session", () => {
    useAuthStore.getState()._login("user@demo", "demo");
    useAuthStore.getState()._logout();
    expect(useAuthStore.getState().user).toBeNull();
  });
});
