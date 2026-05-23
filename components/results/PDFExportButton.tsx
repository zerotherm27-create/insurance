'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { generatePDF } from '@/lib/pdf'
import type { AIAnalysisResult } from '@/types'

export function PDFExportButton() {
  const [error, setError] = useState<string | null>(null)

  const handleExport = () => {
    setError(null)
    const stored = sessionStorage.getItem('sma_analysis')
    if (!stored) {
      setError('No analysis data found. Please complete the assessment first.')
      return
    }
    try {
      const { analysis } = JSON.parse(stored) as { analysis: AIAnalysisResult }
      const clientName = sessionStorage.getItem('sma_client_name') ?? 'Client'
      generatePDF(analysis, clientName)
    } catch {
      setError('Could not generate PDF. Please try again.')
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {error && (
        <p role="alert" className="text-xs text-red-400 text-center">{error}</p>
      )}
      <Button variant="secondary" size="md" onClick={handleExport}>
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Export PDF Report
      </Button>
    </div>
  )
}

