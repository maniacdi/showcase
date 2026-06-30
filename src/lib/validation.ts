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
