// A "paragraph" in the email content system is one string that may span
// multiple lines (the admin's textarea allows newlines). If every non-empty
// line in it starts with a bullet or number marker, render the whole
// paragraph as a list instead of a plain block of text. Mixed content (some
// list lines, some prose) falls back to plain text, so existing paragraphs
// written before this feature render exactly as before.

export type ParagraphBlock =
  | { type: 'text'; content: string }
  | { type: 'bullet' | 'number'; items: string[] }

const BULLET_LINE = /^[-*]\s+(.+)$/
const NUMBER_LINE = /^\d+[.)]\s+(.+)$/

export function parseParagraph(raw: string): ParagraphBlock {
  const lines = raw.split('\n').map((l) => l.trim()).filter((l) => l.length > 0)
  if (lines.length === 0) return { type: 'text', content: raw }

  if (lines.every((l) => BULLET_LINE.test(l))) {
    return { type: 'bullet', items: lines.map((l) => l.replace(BULLET_LINE, '$1')) }
  }
  if (lines.every((l) => NUMBER_LINE.test(l))) {
    return { type: 'number', items: lines.map((l) => l.replace(NUMBER_LINE, '$1')) }
  }
  return { type: 'text', content: raw }
}
