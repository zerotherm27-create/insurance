'use client'

import { useState, useEffect } from 'react'
import { FunnelLeadsTable } from '@/components/admin/FunnelLeadsTable'

interface Lead {
  id: string
  created_at: string
  first_name: string
  mobile: string
  email?: string | null
  age_range: string
  income_range: string
  protection_score: number
  status: 'new' | 'contacted' | 'converted'
  sequence_step: number
  last_emailed_at?: string | null
}

export default function AdminPage() {
  const [token, setToken] = useState('')
  const [inputToken, setInputToken] = useState('')
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Restore token from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('sma_admin_token')
      if (stored) {
        setToken(stored)
        fetchLeads(stored)
      }
    } catch {
      // ignore
    }
  }, [])

  async function fetchLeads(t: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/funnel-leads', {
        headers: { Authorization: `Bearer ${t}` },
      })
      if (res.status === 401) {
        setToken('')
        sessionStorage.removeItem('sma_admin_token')
        setError('Incorrect password.')
        return
      }
      if (!res.ok) throw new Error('Failed to fetch leads.')
      const data = await res.json()
      setLeads(data.leads ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    sessionStorage.setItem('sma_admin_token', inputToken)
    setToken(inputToken)
    await fetchLeads(inputToken)
  }

  // Not authenticated — show password gate
  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-navy-gradient px-6">
        <div className="max-w-sm w-full space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-serif text-2xl text-white">Admin Dashboard</h1>
            <p className="font-sans text-sm text-white/40">Enter your admin password to continue.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              required
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              placeholder="Admin password"
              className="w-full px-4 py-3 rounded-xl bg-navy-card border border-white/10 text-white font-sans placeholder:text-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              className="w-full px-6 py-3 rounded-xl bg-gold text-navy-dark font-sans font-semibold hover:bg-gold-soft transition-colors"
            >
              Enter Dashboard
            </button>
          </form>
        </div>
      </main>
    )
  }

  const newCount = leads.filter((l) => l.status === 'new').length
  const contactedCount = leads.filter((l) => l.status === 'contacted').length
  const convertedCount = leads.filter((l) => l.status === 'converted').length

  return (
    <main className="min-h-screen bg-navy-gradient px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl text-white">Funnel Leads</h1>
            <p className="font-sans text-sm text-white/40 mt-1">{leads.length} total submissions</p>
          </div>
          <button
            onClick={() => { setToken(''); sessionStorage.removeItem('sma_admin_token') }}
            className="font-sans text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            Sign out
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'New Leads', value: newCount, color: 'text-blue-400' },
            { label: 'Contacted', value: contactedCount, color: 'text-gold' },
            { label: 'Converted', value: convertedCount, color: 'text-green-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-navy-card border border-white/5 rounded-xl p-5 text-center">
              <p className={`font-serif text-3xl ${stat.color}`}>{stat.value}</p>
              <p className="font-sans text-xs text-white/40 uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        ) : (
          <FunnelLeadsTable leads={leads} token={token} />
        )}
      </div>
    </main>
  )
}
