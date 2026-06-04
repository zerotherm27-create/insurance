'use client'

import type { SendEmailNodeData } from '@/types/automation-flow'
import type { EmailTemplate } from '@/types/email-template'

interface Props {
  nodeId: string
  data: SendEmailNodeData
  templates: EmailTemplate[]
  onUpdate: (nodeId: string, data: Partial<SendEmailNodeData>) => void
  onDelete: (nodeId: string) => void
}

const inputCls = 'w-full px-3 py-2 rounded-lg bg-navy border border-white/10 text-white font-sans text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50'

export function SendEmailNodePanel({ nodeId, data, templates, onUpdate, onDelete }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <label className="font-sans text-[10px] uppercase tracking-wider text-white/40">Node label</label>
        <input
          className={`${inputCls} mt-1.5`}
          value={data.label}
          onChange={(e) => onUpdate(nodeId, { label: e.target.value })}
        />
      </div>

      <div>
        <label className="font-sans text-[10px] uppercase tracking-wider text-white/40">Email template</label>
        <select
          className={`${inputCls} mt-1.5`}
          value={data.templateId}
          onChange={(e) => {
            const t = templates.find((t) => t.id === e.target.value)
            onUpdate(nodeId, { templateId: e.target.value, label: t?.label ?? data.label })
          }}
        >
          <option value="">Select a template…</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
        {!data.templateId && (
          <p className="font-sans text-[10px] text-amber-400/80 mt-1">A template is required before saving.</p>
        )}
      </div>

      {data.templateId && (
        <div className="p-3 rounded-xl bg-navy border border-white/5 space-y-1">
          {(() => {
            const t = templates.find((t) => t.id === data.templateId)
            if (!t) return null
            return (
              <>
                <p className="font-sans text-[10px] text-white/30">{t.timing}</p>
                <p className="font-sans text-xs text-white/70 italic">&ldquo;{t.subject}&rdquo;</p>
              </>
            )
          })()}
        </div>
      )}

      <button
        onClick={() => onDelete(nodeId)}
        className="w-full font-sans text-xs text-red-400/70 hover:text-red-400 transition-colors py-2 border border-red-400/20 hover:border-red-400/40 rounded-lg"
      >
        Delete node
      </button>
    </div>
  )
}
