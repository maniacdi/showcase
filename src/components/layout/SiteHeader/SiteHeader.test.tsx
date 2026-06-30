import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import SiteHeader from "./SiteHeader";

vi.mock("@/i18n/navigation", () => ({
  Link: (p: React.ComponentProps<"a">) => <a {...p} />,
}));

const messages = { common: { contact: "Contacto" } };

function renderHeader() {
  return render(
    <NextIntlClientProvider locale="es" messages={messages}>
      <SiteHeader nav={[{ href: "/servicios", label: "Servicios" }]} />
    </NextIntlClientProvider>,
  );
}

describe("SiteHeader", () => {
  it("toggles the mobile menu when the button is pressed", async () => {
    const user = userEvent.setup();
    renderHeader();
    const toggle = screen.getByRole("button", { name: /menú|menu/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });
});
