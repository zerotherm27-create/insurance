'use client'

const PALETTE_ITEMS = [
  {
    type: 'trigger',
    label: 'Trigger',
    description: 'Start of the flow',
    color: 'border-gold/50 text-gold',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    type: 'send_email',
    label: 'Send Email',
    description: 'Send a template',
    color: 'border-gold/30 text-gold/80',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    type: 'wait',
    label: 'Wait',
    description: 'Delay before next step',
    color: 'border-blue-400/40 text-blue-400',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    type: 'condition',
    label: 'Condition',
    description: 'Yes / No branch',
    color: 'border-purple-400/40 text-purple-400',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

export function NodePalette() {
  function onDragStart(e: React.DragEvent, type: string) {
    e.dataTransfer.setData('nodeType', type)
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div className="w-44 shrink-0 space-y-1.5">
      <p className="font-sans text-[10px] uppercase tracking-widest text-white/30 px-1 mb-3">
        Drag to add
      </p>
      {PALETTE_ITEMS.map((item) => (
        <div
          key={item.type}
          draggable
          onDragStart={(e) => onDragStart(e, item.type)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border bg-navy-card cursor-grab active:cursor-grabbing select-none transition-all hover:bg-navy-light hover:border-white/20 ${item.color}`}
        >
          {item.icon}
          <div>
            <p className="font-sans text-xs font-semibold leading-tight">{item.label}</p>
            <p className="font-sans text-[10px] text-white/30 leading-tight">{item.description}</p>
          </div>
        </div>
      ))}

      <div className="pt-4">
        <p className="font-sans text-[10px] uppercase tracking-widest text-white/20 px-1 mb-2">
          Tips
        </p>
        <div className="space-y-2 px-1">
          <p className="font-sans text-[10px] text-white/25 leading-relaxed">Drag a node onto the canvas, then connect handles by dragging from dot to dot.</p>
          <p className="font-sans text-[10px] text-white/25 leading-relaxed">Click any node to configure it in the panel on the right.</p>
          <p className="font-sans text-[10px] text-white/25 leading-relaxed">Condition nodes have a green (Yes) and red (No) handle at the bottom.</p>
        </div>
      </div>
    </div>
  )
}
