export function Slide5() {
  const layers = [
    { num: '05', label: 'Wealth Accumulation', border: 'border-white/20', bg: 'bg-white/5', text: 'text-white/60' },
    { num: '04', label: 'Life Protection', border: 'border-gold/20', bg: 'bg-gold/5', text: 'text-white/70' },
    { num: '03', label: 'Health Protection', border: 'border-gold/30', bg: 'bg-gold/8', text: 'text-white/80' },
    { num: '02', label: 'Emergency Fund', border: 'border-gold/40', bg: 'bg-gold/10', text: 'text-white/90' },
    { num: '01', label: 'Company HMO', border: 'border-gold/60', bg: 'bg-gold/15', text: 'text-white' },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight">
        Start With The Risk That Can
        <br />
        <span className="text-gold">Interrupt Your Income First.</span>
      </h2>
      <div className="space-y-2">
        {layers.map((layer) => (
          <div
            key={layer.num}
            className={`flex items-center gap-4 rounded-xl border px-5 py-3 ${layer.border} ${layer.bg}`}
          >
            <span className="font-serif text-xs text-gold/40 w-8">{layer.num}</span>
            <span className={`font-sans text-sm font-medium ${layer.text}`}>{layer.label}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-white/30 italic">
        Build the foundation before the tower.
      </p>
    </div>
  )
}
