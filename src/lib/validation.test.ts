import { describe, expect, it } from "vitest";
import { isValidPhone, validateBooking, validateContact } from "./validation";

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

describe("validateBooking", () => {
  it("requires name, a valid email and a phone", () => {
    expect(validateBooking({ name: " ", email: "x", phone: "12" })).toEqual({
      name: "required",
      email: "invalid",
      phone: "invalid",
    });
  });

  it("accepts a complete booking", () => {
    expect(validateBooking({ name: "Ana", email: "ana@example.com", phone: "+34 600 123 456" })).toEqual({});
  });
});

describe("isValidPhone", () => {
  it("accepts 9 to 15 digits with common separators", () => {
    expect(isValidPhone("600123456")).toBe(true);
    expect(isValidPhone("+34 600-12.34.56")).toBe(true);
  });

  it("rejects letters, too few or too many digits", () => {
    expect(isValidPhone("600 12a 456")).toBe(false);
    expect(isValidPhone("12345678")).toBe(false);
    expect(isValidPhone("1234567890123456")).toBe(false);
  });
});
