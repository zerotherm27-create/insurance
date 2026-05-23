export function Slide3() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight">
        At 23, Your Biggest Advantage
        <br />
        Is <span className="text-gold italic">Insurability.</span>
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { stat: 'Higher', label: 'Approval chances' },
          { stat: 'Lower', label: 'Protection costs' },
          { stat: 'Greater', label: 'Flexibility' },
          { stat: 'Open', label: 'Future options' },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-white/10 bg-white/5 p-4 text-center space-y-2"
          >
            <p className="font-serif text-2xl text-gold">{item.stat}</p>
            <p className="text-xs text-white/50">{item.label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-gold/20 bg-gold/5 px-6 py-4">
        <p className="text-gold/90 text-sm italic">
          Key insight: Starting early protects future flexibility.
        </p>
      </div>
    </div>
  )
}
