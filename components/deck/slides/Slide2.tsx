export function Slide2() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight">
        Your First Salary Is Progress.
        <br />
        <span className="text-gold">But It Is Not Yet Protection.</span>
      </h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <p className="text-white/50 text-sm uppercase tracking-widest">Most focus on</p>
          <ul className="space-y-3">
            {['Gadgets', 'Travel', 'Upgrades', 'Lifestyle growth'].map((item) => (
              <li key={item} className="flex items-center gap-3 text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-white/30 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4">
          <p className="text-gold/80 text-sm uppercase tracking-widest">Very few focus on</p>
          <p className="text-white text-lg leading-relaxed">
            Protecting their ability to <strong className="text-gold">continue earning</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}
