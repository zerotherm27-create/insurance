import type { Metadata } from 'next'
import { AssessmentRedirectClient } from './AssessmentRedirectClient'

export const metadata: Metadata = {
  title: 'Financial Discovery',
  robots: { index: false, follow: true },
}

export default function AssessmentPage() {
  return <AssessmentRedirectClient />
}
