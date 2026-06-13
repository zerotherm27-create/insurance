import { redirect } from 'next/navigation'

// The deck is now segment-aware. The bare /deck route maps to the PRO deck so
// existing links keep working.
export default function DeckIndexPage() {
  redirect('/deck/pro')
}
