import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/useAuthStore";
import RequireAuth from "./RequireAuth";

const replace = vi.fn();
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ replace }) }));

beforeEach(() => {
  replace.mockClear();
  useAuthStore.setState({ user: null, users: {} });
});

describe("RequireAuth", () => {
  it("redirects to /login when there is no session", async () => {
    render(
      <RequireAuth role="admin">
        <p>secret</p>
      </RequireAuth>,
    );
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
    expect(screen.queryByText("secret")).not.toBeInTheDocument();
  });

  it("renders children for a matching role", async () => {
    useAuthStore.setState({
      user: { id: "u-admin", name: "A", email: "admin@demo", role: "admin" },
      users: {},
    });
    render(
      <RequireAuth role="admin">
        <p>secret</p>
      </RequireAuth>,
    );
    await waitFor(() => expect(screen.getByText("secret")).toBeInTheDocument());
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects when role does not match", async () => {
    useAuthStore.setState({
      user: { id: "u-user", name: "U", email: "user@demo", role: "user" },
      users: {},
    });
    render(
      <RequireAuth role="admin">
        <p>secret</p>
      </RequireAuth>,
    );
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
  });
});
