import { XIcon } from '@/components/ui/icons'

export function Slide4() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight">
        Insurance Is Cheapest Before
        <br />
        <span className="text-gold">Life Gets Complicated.</span>
      </h2>
      <div className="space-y-4">
        <p className="text-white/50 text-sm uppercase tracking-widest mb-4">
          Many only think about protection after:
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            'Hospitalization',
            'Health scares',
            'Family responsibility',
            'Becoming breadwinners',
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <span aria-hidden="true" className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-white/30 flex-shrink-0">
                <XIcon size={11} />
              </span>
              <span className="text-white/70">{item}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-gold/20 bg-gold/5 px-6 py-4">
        <p className="text-xs text-white/40 uppercase tracking-widest mb-1">The challenge</p>
        <p className="text-white/80">
          Protection becomes <strong className="text-gold">harder and more expensive</strong> later.
        </p>
      </div>
    </div>
  )
}
