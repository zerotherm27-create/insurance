// Re-anchored to the Slide 5 wealth pyramid: solutions are grouped by the level
// they sit on, foundation first, using the same level names, order, and gold
// tones as the pyramid. Solutions are described as coverage TYPES, never branded
// product names. This keeps the deck in teaching mode: the client identifies a
// goal on Slide 8 first, and the specific plans surface later in the live numbers
// conversation. Wording mirrors lib/discovery.ts GOAL_PLAN for consistency.
const levels = [
  {
    num: '01',
    level: 'Protection',
    color: '#F6B21A',
    items: [
      { goal: 'Health protection', solution: 'A health and critical illness plan' },
      { goal: 'Affordable starter coverage', solution: 'An affordable starter protection plan' },
    ],
  },
  {
    num: '02',
    level: 'Growth',
    color: '#D9A441',
    items: [{ goal: 'Long-term growth', solution: 'A plan that pairs protection with investment growth' }],
  },
  {
    num: '03',
    level: 'Preserve',
    color: '#C2932F',
    items: [{ goal: 'Future guaranteed income', solution: 'A guaranteed income plan' }],
  },
  {
    num: '04',
    level: 'Legacy',
    color: '#F6E9C4',
    items: [{ goal: 'Passing wealth to the next generation', solution: 'A legacy and estate plan' }],
  },
]

export function Slide6() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 w-full">
      <div className="space-y-2">
        <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight">
          Every Goal Sits on a Level.
          <br />
          <span className="text-gold">Foundation First.</span>
        </h2>
        <p className="font-sans text-sm text-white/50 leading-relaxed">
          Your protection foundation comes first. From there, the right kind of plan depends on your goal.
        </p>
      </div>

      <div className="space-y-3.5">
        {levels.map((lvl) => (
          <div key={lvl.num} className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="font-serif text-xs" style={{ color: lvl.color }}>
                {lvl.num}
              </span>
              <span
                className="font-sans text-xs font-semibold tracking-wide"
                style={{ color: lvl.color }}
              >
                {lvl.level}
              </span>
              <span className="h-px flex-1" style={{ backgroundColor: `${lvl.color}33` }} />
            </div>
            <div className="space-y-2 border-l pl-4" style={{ borderColor: `${lvl.color}33` }}>
              {lvl.items.map((item) => (
                <div
                  key={item.goal}
                  className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-3"
                >
                  <span className="text-xs text-white/50 flex-1">{item.goal}</span>
                  <span aria-hidden="true" className="text-gold/60 text-sm">
                    →
                  </span>
                  <span className="font-sans text-sm font-medium text-white">{item.solution}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-white/30 italic">
        The right plan depends on your stage, priorities, and financial foundation.
      </p>
    </div>
  )
}
