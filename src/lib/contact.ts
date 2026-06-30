/** Build a mailto: URL with a prefilled subject and body (no backend needed). */
export function buildMailto(to: string, subject: string, lines: string[]): string {
  const body = lines.join("\n");
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
