'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProtectionScore } from '@/components/results/ProtectionScore'
import { RecommendationCard } from '@/components/results/RecommendationCard'
import { InsightSection } from '@/components/results/InsightSection'
import { AdvisorCTA } from '@/components/results/AdvisorCTA'
import { PDFExportButton } from '@/components/results/PDFExportButton'
import { Badge } from '@/components/ui/Badge'
import type { AIAnalysisResult } from '@/types'

function ResultsContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = sessionStorage.getItem('sma_analysis')
    if (stored) {
      const parsed = JSON.parse(stored)
      setAnalysis(parsed.analysis)
    }
    setLoading(false)
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-gradient flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-navy-gradient flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-white/60">No analysis found.</p>
          <a href="/assessment" className="text-gold underline text-sm">
            Start a new assessment
          </a>
        </div>
      </div>
    )
  }

  const insights = [
    { label: 'Profile Summary', content: analysis.profileSummary },
    { label: 'Foundation Analysis', content: analysis.foundationAnalysis },
    { label: 'Protection Gap', content: analysis.protectionGap, accent: true },
    { label: 'Priority Layer', content: analysis.recommendedPriorityLayer },
    { label: 'What Comes First', content: analysis.whatComesFirst },
    { label: 'What Not to Miss', content: analysis.whatNotToMiss },
    { label: 'Suggested Next Step', content: analysis.suggestedNextStep },
  ]

  return (
    <main id="results-content" className="min-h-screen bg-navy-gradient">
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-4">
          <Badge variant="gold">Your Advisory Report</Badge>
          <h1 className="font-serif text-3xl md:text-4xl text-white">
            Financial Protection Analysis
          </h1>
        </div>

        <div className="flex justify-center">
          <ProtectionScore
            score={analysis.protectionScore}
            tier={getTierLabel(analysis.protectionScore)}
            tierColor={getTierColor(analysis.protectionScore)}
          />
        </div>

        <InsightSection insights={insights} />

        {analysis.primaryRecommendation && (
          <RecommendationCard
            recommendation={analysis.primaryRecommendation}
            isPrimary
          />
        )}

        {analysis.alternativeRecommendation && (
          <RecommendationCard
            recommendation={analysis.alternativeRecommendation}
          />
        )}

        <PDFExportButton />

        <AdvisorCTA />
      </div>
    </main>
  )
}

function getTierLabel(score: number): string {
  if (score >= 80) return 'Excellent Foundation'
  if (score >= 60) return 'Strong Foundation'
  if (score >= 40) return 'Moderate Foundation'
  if (score >= 20) return 'Developing Foundation'
  return 'Critical Gaps Present'
}

function getTierColor(score: number): string {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#84cc16'
  if (score >= 40) return '#F6B21A'
  if (score >= 20) return '#f97316'
  return '#ef4444'
}

export default function ResultsPage() {
  return (
    <Suspense>
      <ResultsContent />
    </Suspense>
  )
}
