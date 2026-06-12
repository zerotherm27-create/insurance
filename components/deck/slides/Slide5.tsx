const layers = [
  {
    num: '05',
    label: 'Wealth Accumulation',
    border: 'border-white/20',
    bg: 'bg-white/5',
    text: 'text-white/60',
    widthClass: 'w-[62%] md:w-[38%]',
  },
  {
    num: '04',
    label: 'Life Protection',
    border: 'border-gold/20',
    bg: 'bg-gold/5',
    text: 'text-white/70',
    widthClass: 'w-[72%] md:w-[54%]',
  },
  {
    num: '03',
    label: 'Health Protection',
    border: 'border-gold/30',
    bg: 'bg-gold/8',
    text: 'text-white/80',
    widthClass: 'w-[82%] md:w-[70%]',
  },
  {
    num: '02',
    label: 'Emergency Fund',
    border: 'border-gold/40',
    bg: 'bg-gold/10',
    text: 'text-white/90',
    widthClass: 'w-[91%] md:w-[85%]',
  },
  {
    num: '01',
    label: 'Company HMO',
    border: 'border-gold/60',
    bg: 'bg-gold/15',
    text: 'text-white',
    widthClass: 'w-full',
  },
]

export function Slide5() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 w-full">
      <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight">
        Start With The Risk That Can
        <br />
        <span className="text-gold">Interrupt Your Income First.</span>
      </h2>
      <div className="flex flex-col items-center gap-1.5">
        {layers.map((layer) => (
          <div
            key={layer.num}
            className={`flex items-center gap-4 rounded-xl border px-5 py-3 ${layer.border} ${layer.bg} ${layer.widthClass}`}
          >
            <span className="font-serif text-xs text-gold/40 w-8 flex-shrink-0">{layer.num}</span>
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
