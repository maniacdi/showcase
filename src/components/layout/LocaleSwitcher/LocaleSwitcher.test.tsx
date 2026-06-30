import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import LocaleSwitcher from "./LocaleSwitcher";

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/servicios",
  useRouter: () => ({ replace: vi.fn() }),
}));

const messages = { common: { language: "Idioma" } };

describe("LocaleSwitcher", () => {
  it("renders es and en options", () => {
    render(
      <NextIntlClientProvider locale="es" messages={messages}>
        <LocaleSwitcher />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole("button", { name: /ES/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /EN/i })).toBeInTheDocument();
  });
});
