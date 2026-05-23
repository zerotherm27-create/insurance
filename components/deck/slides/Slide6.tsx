const products = [
  { name: 'SUN Fit and Well', arrow: 'Health protection' },
  { name: 'SUN Safer Life', arrow: 'Affordable starter protection' },
  { name: 'Sun Life Secure Income', arrow: 'Predictable future income' },
  { name: 'Sun Smarter Life Classic', arrow: 'Protection plus savings' },
  { name: 'Sun MaxiLink Prime', arrow: 'Insurance plus investment growth' },
]

export function Slide6() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 w-full">
      <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight">
        Different Goals Need
        <br />
        <span className="text-gold">Different Financial Tools.</span>
      </h2>
      <div className="space-y-2">
        {products.map((p) => (
          <div
            key={p.name}
            className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-3 group"
          >
            <span className="text-xs text-white/40 flex-1">{p.arrow}</span>
            <span className="text-gold/60 text-sm">→</span>
            <span className="font-sans text-sm font-medium text-white group-hover:text-gold transition-colors">
              {p.name}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-white/30 italic">
        The best product depends on your stage, priorities, and financial foundation.
      </p>
    </div>
  )
}
