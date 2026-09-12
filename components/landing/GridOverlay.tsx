/** Subtle full-page grid texture. Shared by the landing page and segment pages so they never drift. */
export function GridOverlay() {
  return (
    <div
      className="absolute inset-0 opacity-[0.03] pointer-events-none"
      style={{
        backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }}
    />
  )
}
