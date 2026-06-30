import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Button from "./Button";

describe("Button", () => {
  it("renders a button with its label", () => {
    render(<Button>Enviar</Button>);
    expect(screen.getByRole("button", { name: "Enviar" })).toBeInTheDocument();
  });

  it("renders an anchor when as='a' and href is set", () => {
    render(
      <Button as="a" href="/x">
        Ir
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Ir" });
    expect(link).toHaveAttribute("href", "/x");
  });

  it("reflects the variant via data-variant", () => {
    render(<Button variant="outline">X</Button>);
    expect(screen.getByRole("button", { name: "X" })).toHaveAttribute("data-variant", "outline");
  });
});
