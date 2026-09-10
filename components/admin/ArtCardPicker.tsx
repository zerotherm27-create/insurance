'use client'

import { useEffect, useRef, useState } from 'react'

interface ArtCard {
  id: string
  url: string
  filename: string
  created_at: string
}

interface Props {
  token: string
  value?: string | null
  onChange: (url: string | null) => void
}

export function ArtCardPicker({ token, value, onChange }: Props) {
  const [cards, setCards] = useState<ArtCard[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showGallery, setShowGallery] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/art-cards', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.cards) setCards(d.cards) })
      .catch(() => setError('Failed to load art cards.'))
      .finally(() => setLoading(false))
  }, [token])

  async function upload(file: File) {
    setUploading(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/admin/art-cards', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Upload failed')
      setCards((prev) => [data.card, ...prev])
      onChange(data.card.url)
      setShowGallery(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="" className="max-h-32 rounded-lg border border-white/10" />
          <button
            type="button"
            onClick={() => onChange(null)}
            title="Remove image"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-navy-dark border border-white/20 text-white/60 hover:text-red-400 flex items-center justify-center transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="font-sans text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/15 text-white/60 hover:text-white hover:border-white/35 disabled:opacity-40 transition-colors"
          >
            {uploading ? 'Uploading…' : 'Upload image'}
          </button>
          {cards.length > 0 && (
            <button
              type="button"
              onClick={() => setShowGallery((v) => !v)}
              className="font-sans text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Or choose from {cards.length} uploaded
            </button>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f) }}
      />

      {error && <p className="font-sans text-xs text-red-400 mt-1.5">{error}</p>}

      {showGallery && !value && (
        <div className="mt-2 p-2 rounded-lg bg-navy border border-white/10 max-h-40 overflow-y-auto">
          {loading ? (
            <p className="font-sans text-xs text-white/30 p-2">Loading…</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {cards.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { onChange(c.url); setShowGallery(false) }}
                  title={c.filename}
                  className="rounded-md overflow-hidden border border-white/10 hover:border-gold/50 transition-colors"
                >
                  <img src={c.url} alt="" className="w-full h-16 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
