export interface ContactValues {
  name: string;
  email: string;
  message: string;
}

export type ContactErrors = Partial<Record<keyof ContactValues, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  if (!values.name.trim()) errors.name = "required";
  if (!values.email.trim() || !EMAIL_RE.test(values.email)) errors.email = "invalid";
  if (values.message.trim().length < 5) errors.message = "tooShort";
  return errors;
}

export interface BookingValues {
  name: string;
  email: string;
  phone: string;
}

export type BookingErrors = Partial<Record<keyof BookingValues, string>>;

/** 9 to 15 digits, optional leading +, spaces/dashes/dots allowed between them. */
export function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!/^\+?[\d\s.-]+$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "").length;
  return digits >= 9 && digits <= 15;
}

export function validateBooking(values: BookingValues): BookingErrors {
  const errors: BookingErrors = {};
  if (!values.name.trim()) errors.name = "required";
  if (!values.email.trim() || !EMAIL_RE.test(values.email.trim())) errors.email = "invalid";
  if (!isValidPhone(values.phone)) errors.phone = "invalid";
  return errors;
}
