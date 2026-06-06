const rows = [
  { structure: 'Will + Estate Plan', probate: 'Yes', privacy: 'Low', tax: '6% + fees', highlight: false },
  { structure: 'Living Trust', probate: 'No', privacy: 'High', tax: 'Fees apply', highlight: false },
  { structure: 'Investment Mandate', probate: 'No*', privacy: 'High', tax: 'Fees apply', highlight: false },
  { structure: 'Family Corporation', probate: 'Partial', privacy: 'Low', tax: 'Fees apply', highlight: false },
  { structure: 'Insurance Policy', probate: 'No', privacy: 'High', tax: 'None', highlight: true },
]

export function HnwLegacyComparison() {
  return (
    <div className="space-y-2.5">
      <p className="font-sans text-[10px] text-white/30 uppercase tracking-widest">
        How estate planning structures compare
      </p>
      <div className="border border-white/8 rounded-xl overflow-hidden">
        <table className="w-full font-sans text-xs">
          <thead>
            <tr className="bg-white/5">
              <th className="text-left px-3 py-2 text-white/40 font-normal">Structure</th>
              <th className="text-center px-3 py-2 text-white/40 font-normal">Probate</th>
              <th className="text-center px-3 py-2 text-white/40 font-normal">Privacy</th>
              <th className="text-center px-3 py-2 text-white/40 font-normal">Estate Tax</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) =>
              row.highlight ? (
                <tr key={row.structure} className="border-t border-white/8 bg-gold/5 border-l-2 border-l-gold">
                  <td className="px-3 py-2.5 text-gold font-medium">{row.structure}</td>
                  <td className="text-center px-3 py-2.5 text-gold font-medium">{row.probate}</td>
                  <td className="text-center px-3 py-2.5 text-gold font-medium">{row.privacy}</td>
                  <td className="text-center px-3 py-2.5 text-gold font-medium">{row.tax}</td>
                </tr>
              ) : (
                <tr key={row.structure} className="border-t border-white/8">
                  <td className="px-3 py-2.5 text-white/60">{row.structure}</td>
                  <td className="text-center px-3 py-2.5 text-white/50">{row.probate}</td>
                  <td className="text-center px-3 py-2.5 text-white/50">{row.privacy}</td>
                  <td className="text-center px-3 py-2.5 text-white/50">{row.tax}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
      <p className="font-sans text-[10px] text-white/30 leading-relaxed">
        Insurance is the only structure with no probate, no estate tax, and full control beyond death.
      </p>
    </div>
  )
}
