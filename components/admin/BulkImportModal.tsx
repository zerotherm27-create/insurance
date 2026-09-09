'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import { ModalBackdrop, ModalPanel } from '@/components/ui/Modal'

const FIELDS = [
  { key: 'first_name', label: 'Full Name', required: true },
  { key: 'mobile', label: 'Mobile', required: true },
  { key: 'email', label: 'Email', required: false },
  { key: 'age', label: 'Age', required: false },
  { key: 'segment', label: 'Segment', required: false },
  { key: 'event_tag', label: 'Event', required: false },
] as const

type FieldKey = (typeof FIELDS)[number]['key']

// Loose header matching so common spreadsheet variants ("Name", "Full Name",
// "Contact Number", "Phone") auto-map without the admin doing it by hand.
const HEADER_GUESSES: Record<FieldKey, RegExp> = {
  first_name: /^((full|first)\s*)?name$/i,
  mobile: /(mobile|phone|contact\s*number|cell)/i,
  email: /e-?mail/i,
  age: /^age$/i,
  segment: /segment/i,
  event_tag: /event/i,
}

const inputCls =
  'w-full px-3 py-2 rounded-lg bg-navy border border-white/10 text-white font-sans text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50'

interface Props {
  token: string
  onClose: () => void
  onImported: () => void
}

type Stage = 'upload' | 'map' | 'result'

export function BulkImportModal({ token, onClose, onImported }: Props) {
  const [stage, setStage] = useState<Stage>('upload')
  const [fileName, setFileName] = useState('')
  const [headers, setHeaders] = useState<string[]>([])
  const [dataRows, setDataRows] = useState<Record<string, unknown>[]>([])
  const [mapping, setMapping] = useState<Record<FieldKey, string>>({
    first_name: '', mobile: '', email: '', age: '', segment: '', event_tag: '',
  })
  const [parseError, setParseError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [result, setResult] = useState<{ inserted: number; skipped: { row: number; reason: string }[] } | null>(null)

  function handleFile(file: File) {
    setParseError(null)
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const wb = XLSX.read(data, { type: 'binary' })
        const sheet = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })
        if (rows.length === 0) {
          setParseError('No rows found in the first sheet.')
          return
        }
        const detectedHeaders = Object.keys(rows[0])
        const autoMap: Record<FieldKey, string> = {
          first_name: '', mobile: '', email: '', age: '', segment: '', event_tag: '',
        }
        for (const field of FIELDS) {
          const match = detectedHeaders.find((h) => HEADER_GUESSES[field.key].test(h))
          if (match) autoMap[field.key] = match
        }
        setHeaders(detectedHeaders)
        setDataRows(rows)
        setMapping(autoMap)
        setStage('map')
      } catch {
        setParseError('Could not read that file. Make sure it\'s a valid .xlsx, .xls, or .csv file.')
      }
    }
    reader.onerror = () => setParseError('Could not read that file.')
    reader.readAsBinaryString(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const canImport = mapping.first_name && mapping.mobile

  async function runImport() {
    setImporting(true)
    setImportError(null)
    try {
      const rows = dataRows.map((r) => ({
        first_name: mapping.first_name ? String(r[mapping.first_name] ?? '') : '',
        mobile: mapping.mobile ? String(r[mapping.mobile] ?? '') : '',
        email: mapping.email ? String(r[mapping.email] ?? '') : '',
        age: mapping.age ? r[mapping.age] : '',
        segment: mapping.segment ? String(r[mapping.segment] ?? '') : '',
        event_tag: mapping.event_tag ? String(r[mapping.event_tag] ?? '') : '',
      }))
      const res = await fetch('/api/admin/funnel-leads/bulk', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Import failed')
      setResult(data)
      setStage('result')
      onImported()
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalPanel className="bg-navy-card border border-white/10 rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        <div className="shrink-0 px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg text-white">Import Leads</h3>
            <p className="font-sans text-xs text-white/40 mt-0.5">
              Upload an Excel or CSV file to add many leads at once. Tagged source: Manual.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:bg-white/5 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {stage === 'upload' && (
            <div
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border border-dashed border-white/15 rounded-xl p-10 text-center space-y-3"
            >
              <p className="font-sans text-sm text-white/50">
                Drag an .xlsx, .xls, or .csv file here, or
              </p>
              <label className="inline-block cursor-pointer font-sans text-xs font-semibold px-4 py-2 rounded-lg bg-gold text-navy-dark hover:bg-gold-soft transition-colors">
                Choose File
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                />
              </label>
              <p className="font-sans text-[10px] text-white/20">
                First row should be column headers (Full Name, Mobile, Email, Age, Segment, Event).
              </p>
              {parseError && (
                <p className="font-sans text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg inline-block">{parseError}</p>
              )}
            </div>
          )}

          {stage === 'map' && (
            <div className="space-y-5">
              <p className="font-sans text-xs text-white/40">
                {fileName} — {dataRows.length} row{dataRows.length === 1 ? '' : 's'} detected. Match your columns to lead fields below.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {FIELDS.map((f) => (
                  <div key={f.key}>
                    <label className="font-sans text-[10px] uppercase tracking-wider text-white/40">
                      {f.label}{f.required && <span className="text-gold ml-1">*</span>}
                    </label>
                    <select
                      value={mapping[f.key]}
                      onChange={(e) => setMapping((m) => ({ ...m, [f.key]: e.target.value }))}
                      className={`${inputCls} mt-1.5`}
                    >
                      <option value="">— Not in file —</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Preview */}
              <div className="overflow-x-auto rounded-lg border border-white/5">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-navy text-white/40">
                    <tr>
                      {FIELDS.map((f) => <th key={f.key} className="px-3 py-2 whitespace-nowrap">{f.label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {dataRows.slice(0, 5).map((r, i) => (
                      <tr key={i} className="border-t border-white/5 text-white/70">
                        {FIELDS.map((f) => (
                          <td key={f.key} className="px-3 py-2 whitespace-nowrap">
                            {mapping[f.key] ? String(r[mapping[f.key]] ?? '') : '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {dataRows.length > 5 && (
                  <p className="font-sans text-[10px] text-white/20 px-3 py-2">
                    + {dataRows.length - 5} more row{dataRows.length - 5 === 1 ? '' : 's'}
                  </p>
                )}
              </div>

              {!canImport && (
                <p className="font-sans text-xs text-amber-400">
                  Full Name and Mobile columns are required to import.
                </p>
              )}
              {importError && (
                <p className="font-sans text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{importError}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setStage('upload'); setDataRows([]); setHeaders([]) }}
                  className="flex-1 font-sans text-sm text-white/40 hover:text-white/70 transition-colors py-2"
                >
                  Back
                </button>
                <button
                  onClick={runImport}
                  disabled={!canImport || importing}
                  className="flex-1 font-sans text-sm font-semibold py-2 rounded-lg bg-gold text-navy-dark hover:bg-gold-soft disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {importing ? 'Importing…' : `Import ${dataRows.length} lead${dataRows.length === 1 ? '' : 's'}`}
                </button>
              </div>
            </div>
          )}

          {stage === 'result' && result && (
            <div className="space-y-4">
              <div className="bg-navy border border-white/5 rounded-xl p-4">
                <p className="font-sans text-sm text-white">
                  Imported <span className="text-gold font-semibold">{result.inserted}</span> lead{result.inserted === 1 ? '' : 's'}.
                  {result.skipped.length > 0 && (
                    <span className="text-amber-400"> {result.skipped.length} skipped.</span>
                  )}
                </p>
              </div>

              {result.skipped.length > 0 && (
                <div className="max-h-48 overflow-y-auto space-y-1.5">
                  {result.skipped.map((s, i) => (
                    <p key={i} className="font-sans text-xs text-white/40">
                      Row {s.row}: {s.reason}
                    </p>
                  ))}
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full font-sans text-sm font-semibold py-2 rounded-lg bg-gold text-navy-dark hover:bg-gold-soft transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </ModalPanel>
    </ModalBackdrop>
  )
}
