import { describe, expect, it } from "vitest";
import { validateContact } from "./validation";

describe("validateContact", () => {
  it("flags empty required fields", () => {
    const errors = validateContact({ name: "", email: "", message: "" });
    expect(errors.name).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.message).toBeTruthy();
  });

  it("flags an invalid email", () => {
    const errors = validateContact({ name: "Ana", email: "nope", message: "hola que tal" });
    expect(errors.email).toBeTruthy();
    expect(errors.name).toBeUndefined();
  });

  it("returns no errors for valid input", () => {
    const errors = validateContact({
      name: "Ana",
      email: "ana@example.com",
      message: "Quiero un presupuesto",
    });
    expect(errors).toEqual({});
  });
});
