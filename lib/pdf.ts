import { jsPDF } from 'jspdf'
import type { AIAnalysisResult } from '@/types'
import { getTierLabel } from '@/lib/scoring'

export function generatePDF(analysis: AIAnalysisResult, clientName: string) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 20
  const contentW = pageW - margin * 2
  let y = margin

  const addText = (
    text: string,
    size: number,
    color: [number, number, number],
    bold = false,
    indent = 0
  ) => {
    doc.setFontSize(size)
    doc.setTextColor(color[0], color[1], color[2])
    if (bold) doc.setFont('helvetica', 'bold')
    else doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(text, contentW - indent)
    doc.text(lines, margin + indent, y)
    y += lines.length * (size * 0.45) + 2
    return y
  }

  const divider = () => {
    y += 3
    doc.setDrawColor(200, 165, 65)
    doc.setLineWidth(0.3)
    doc.line(margin, y, pageW - margin, y)
    y += 5
  }

  const checkPage = (needed = 20) => {
    if (y + needed > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage()
      y = margin
    }
  }

  // Header
  doc.setFillColor(15, 31, 61)
  doc.rect(0, 0, pageW, 35, 'F')
  doc.setFontSize(18)
  doc.setTextColor(246, 178, 26)
  doc.setFont('helvetica', 'bold')
  doc.text('Safety Margin', margin, 15)
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'normal')
  doc.text('Financial Protection Analysis Report', margin, 24)
  y = 45

  // Client info
  addText(`Prepared for: ${clientName}`, 11, [100, 120, 160], true)
  addText(
    `Generated: ${new Date().toLocaleDateString('en-PH', { dateStyle: 'long' })}`,
    9,
    [130, 140, 150]
  )
  divider()

  // Score
  checkPage(25)
  addText(`Protection Score: ${analysis.protectionScore}/100`, 14, [246, 178, 26], true)
  addText(getTierLabel(analysis.protectionScore), 10, [180, 160, 100])
  y += 4

  // Insights
  const sections: [string, string][] = [
    ['Profile Summary', analysis.profileSummary],
    ['Foundation Analysis', analysis.foundationAnalysis],
    ['Protection Gap', analysis.protectionGap],
    ['Recommended Priority Layer', analysis.recommendedPriorityLayer],
    [
      'Primary Recommendation',
      `${analysis.primaryRecommendation?.productName ?? 'N/A'} — ${analysis.primaryRecommendation?.whyItFits ?? ''}`,
    ],
    [
      'Alternative Recommendation',
      `${analysis.alternativeRecommendation?.productName ?? 'N/A'} — ${analysis.alternativeRecommendation?.whyItFits ?? ''}`,
    ],
    ['What Comes First', analysis.whatComesFirst],
    ['What Not to Miss', analysis.whatNotToMiss],
    ['Suggested Next Step', analysis.suggestedNextStep],
  ]

  sections.forEach(([label, content]) => {
    checkPage(30)
    divider()
    addText(label.toUpperCase(), 8, [150, 140, 100], true)
    y += 2
    addText(content, 10, [50, 60, 80])
  })

  // Advisor notes section
  checkPage(40)
  divider()
  addText('ADVISOR NOTES', 8, [150, 140, 100], true)
  y += 2
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.2)
  for (let i = 0; i < 5; i++) {
    doc.line(margin, y, pageW - margin, y)
    y += 8
  }

  // Disclaimer
  checkPage(30)
  divider()
  doc.setFontSize(8)
  doc.setTextColor(130, 130, 130)
  doc.setFont('helvetica', 'italic')
  const disclaimer =
    'DISCLAIMER: This report is for educational guidance only. Product suitability, eligibility, coverage, and premiums must be validated through an official proposal and consultation with a licensed advisor. This report does not constitute financial advice, guarantee insurance approval, or guarantee investment returns. Past performance does not guarantee future results.'
  const dLines = doc.splitTextToSize(disclaimer, contentW)
  doc.text(dLines, margin, y)

  doc.save(`safety-margin-advisor-${clientName.replace(/\s+/g, '-').toLowerCase()}.pdf`)
}
