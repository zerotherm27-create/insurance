import { getTierColor } from '@/lib/scoring'

export function ScoreGauge({ score }: { score: number }) {
  const color = getTierColor(score)
  return (
    <div className="relative w-40 h-40 mx-auto">
      <div
        className="w-full h-full rounded-full"
        style={{
          background: `conic-gradient(${color} ${score}%, rgba(255,255,255,0.07) 0%)`,
        }}
      />
      <div className="absolute inset-[10px] rounded-full bg-[#0b1a2e] flex flex-col items-center justify-center gap-0.5">
        <span className="font-serif text-4xl text-white leading-none">{score}</span>
        <span className="font-sans text-xs text-white/30">out of 100</span>
      </div>
    </div>
  )
}
