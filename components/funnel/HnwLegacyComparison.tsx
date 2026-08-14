const rows = [
  { structure: 'Will + Estate Plan', probate: 'Yes',     privacy: 'Low',  tax: '6% + fees' },
  { structure: 'Living Trust',        probate: 'No',      privacy: 'High', tax: 'Fees'      },
  { structure: 'Investment Mandate',  probate: 'No*',     privacy: 'High', tax: 'Fees'      },
  { structure: 'Family Corp.',        probate: 'Partial', privacy: 'Low',  tax: 'Fees'      },
]

function ProbateCell({ value }: { value: string }) {
  if (value === 'Yes')     return <span className="text-white/50">{value}</span>
  if (value === 'No*')     return <span className="text-white/70">{value}</span>
  if (value === 'Partial') return <span className="text-white/60">{value}</span>
  return <span className="text-white/70">{value}</span>
}

function PrivacyCell({ value }: { value: string }) {
  return <span className={value === 'High' ? 'text-white/70' : 'text-white/50'}>{value}</span>
}

function TaxCell({ value }: { value: string }) {
  return <span className={value === '6% + fees' ? 'text-white/50' : 'text-white/60'}>{value}</span>
}

export function HnwLegacyComparison() {
  return (
    <div className="space-y-2.5">
      <h2 className="font-sans text-[10px] text-white/50 uppercase tracking-widest">
        How estate planning structures compare
      </h2>
      <div className="border border-white/8 rounded-xl overflow-hidden">
        <table className="w-full font-sans text-xs">
          <colgroup>
            <col className="w-[44%]" />
            <col className="w-[19%]" />
            <col className="w-[18%]" />
            <col className="w-[19%]" />
          </colgroup>
          <thead>
            <tr className="bg-white/5">
              <th className="text-left px-3 py-2.5 text-white/50 font-normal">Structure</th>
              <th className="text-center px-2 py-2.5 text-white/50 font-normal">Probate</th>
              <th className="text-center px-2 py-2.5 text-white/50 font-normal">Privacy</th>
              <th className="text-center px-2 py-2.5 text-white/50 font-normal">Tax</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.structure} className="border-t border-white/8">
                <td className="px-3 py-2.5 text-white/55">{row.structure}</td>
                <td className="text-center px-2 py-2.5"><ProbateCell value={row.probate} /></td>
                <td className="text-center px-2 py-2.5"><PrivacyCell value={row.privacy} /></td>
                <td className="text-center px-2 py-2.5"><TaxCell value={row.tax} /></td>
              </tr>
            ))}
            <tr className="border-t-2 border-t-gold/50 bg-gold/8">
              <td className="px-3 py-3 text-gold font-semibold">Insurance Policy</td>
              <td className="text-center px-2 py-3 text-gold font-semibold">No</td>
              <td className="text-center px-2 py-3 text-gold font-semibold">High</td>
              <td className="text-center px-2 py-3 text-gold font-semibold">None</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="font-sans text-[10px] text-white/50 leading-relaxed">
        * Subject to fund structure. Insurance is the only vehicle with no probate, no estate tax, and full privacy.
      </p>
    </div>
  )
}
