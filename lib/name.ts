/**
 * First word of a full name, for natural greetings: "Maria Santos" → "Maria".
 * The full name stays in the database for CRM and proposal use.
 */
export function firstNameOf(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName
}
