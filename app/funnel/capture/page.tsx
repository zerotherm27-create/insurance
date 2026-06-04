import { Suspense } from 'react'
import { LeadCaptureForm } from '@/components/funnel/LeadCaptureForm'
import { SparklesIcon } from '@/components/ui/icons'

export default function FunnelCapturePage() {
  return (
    <main className="relative min-h-screen flex flex-col bg-navy-gradient">
      <header className="px-6 py-6">
        <span className="font-sans text-xs text-white/30 tracking-widest uppercase">
          Financial Protection Check
        </span>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center py-8 space-y-8">
        <div className="text-center space-y-3 px-6">
          <div className="flex justify-center text-gold">
            <SparklesIcon size={32} />
          </div>
          <h1 className="font-serif text-2xl md:text-3xl text-white">
            Your personalized protection report is ready!
          </h1>
          <p className="font-sans text-sm text-white/50">
            Enter your details below to see your results and receive your full report by email.
          </p>
        </div>

        <Suspense fallback={null}>
          <LeadCaptureForm />
        </Suspense>
      </div>
    </main>
  )
}
