import Link from 'next/link'
import Image from 'next/image'

interface SiteHeaderProps {
  rightSlot?: React.ReactNode
}

export function SiteHeader({ rightSlot }: SiteHeaderProps) {
  return (
    <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12">
      <Link href="/" className="flex items-center gap-2.5">
        <Image
          src="/logo.png"
          alt="Safety Margin"
          width={36}
          height={36}
          className="object-contain"
          priority
        />
        <span className="font-sans text-sm text-white/60 tracking-widest uppercase">
          Safety Margin
        </span>
      </Link>
      {rightSlot && (
        <div className="flex items-center gap-6">
          {rightSlot}
        </div>
      )}
    </header>
  )
}
