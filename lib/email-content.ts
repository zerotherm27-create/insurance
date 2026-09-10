// A "paragraph" in the email content system is one string that may span
// multiple lines (the admin's textarea allows newlines). Lines starting with
// a bullet or number marker become list items; runs of consecutive matching
// lines group into one list, so a paragraph CAN mix an intro line with a
// list ("Here's what's included:" followed by "- item one" / "- item two").
// A line that isn't marked is plain text, appended to the previous text
// block if there is one. A paragraph with no marked lines at all comes back
// as a single text block, so every paragraph written before this feature
// renders exactly as before.

export type ContentBlock =
  | { type: 'text'; content: string }
  | { type: 'bullet' | 'number'; items: string[] }

const BULLET_LINE = /^[-*]\s+(.+)$/
const NUMBER_LINE = /^\d+[.)]\s+(.+)$/

export function parseParagraph(raw: string): ContentBlock[] {
  const lines = raw.split('\n').map((l) => l.trim()).filter((l) => l.length > 0)
  if (lines.length === 0) return [{ type: 'text', content: raw }]

  const blocks: ContentBlock[] = []

  for (const line of lines) {
    const bulletMatch = line.match(BULLET_LINE)
    const numberMatch = line.match(NUMBER_LINE)
    const marker: 'bullet' | 'number' | null = bulletMatch ? 'bullet' : numberMatch ? 'number' : null
    const itemText = bulletMatch?.[1] ?? numberMatch?.[1]

    const last = blocks[blocks.length - 1]
    if (marker && itemText !== undefined) {
      if (last && last.type === marker) {
        last.items.push(itemText)
      } else {
        blocks.push({ type: marker, items: [itemText] })
      }
    } else if (last && last.type === 'text') {
      last.content += ' ' + line
    } else {
      blocks.push({ type: 'text', content: line })
    }
  }

  return blocks
}
