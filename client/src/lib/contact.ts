export type Errors = Partial<Record<'name' | 'email' | 'message', string>>;

/** Mirrors the server's rules so most mistakes are caught before sending. */
export function validate(values: { name: string; email: string; message: string }): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = 'Enter your name, so the reply can be addressed to you.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Enter an email address in the format name@example.com.';
  if (!values.message.trim()) errors.message = 'Write a message, even a short one.';
  else if (values.message.length > 5000) errors.message = 'Keep the message under 5,000 characters.';
  return errors;
}
