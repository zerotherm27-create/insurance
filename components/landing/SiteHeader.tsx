import Image from 'next/image'

/** Shared site header: logo + wordmark. Used by the landing page and the segment pages. */
export function SiteHeader() {
  return (
    <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12">
      <div className="flex items-center gap-2.5">
        <Image src="/logo.png" alt="Safety Margin" width={48} height={48} className="object-contain" priority />
        <span className="font-sans text-sm text-white/60 tracking-widest uppercase">
          Safety Margin
        </span>
      </div>
    </header>
  )
}
