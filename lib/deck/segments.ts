// Built presentation decks, in display order. Lightweight (no component imports)
// so the admin dashboard can list deck links without bundling deck code. Add a
// segment here only once its deck exists in lib/deck/registry.tsx.
export const DECK_LINKS: [slug: string, label: string][] = [
  ['pro', 'PRO'],
  ['family', 'Family'],
  ['ofw', 'OFW'],
]
