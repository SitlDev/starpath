interface RatingBadgeProps {
  rating: number
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

const BADGE_STYLES: Record<number, string> = {
  5: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  4: 'bg-green-500/15 text-green-300 border-green-500/30',
  3: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  2: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  1: 'bg-red-500/15 text-red-300 border-red-500/30',
}

const GLOW: Record<number, string> = {
  5: '0 0 12px rgba(52,211,153,0.3)',
  4: '0 0 12px rgba(74,222,128,0.3)',
  3: '0 0 12px rgba(251,191,36,0.3)',
  2: '0 0 12px rgba(251,146,60,0.3)',
  1: '0 0 12px rgba(239,68,68,0.3)',
}

export default function RatingBadge({ rating, label, size = 'md' }: RatingBadgeProps) {
  const r = Math.max(1, Math.min(5, Math.round(rating)))
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-lg px-4 py-2 font-black' : 'text-sm px-3 py-1 font-bold'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border font-semibold ${sizeClass} ${BADGE_STYLES[r]}`}
      style={{ boxShadow: GLOW[r] }}
    >
      {label && <span className="opacity-70">{label}</span>}
      <span>{'★'.repeat(r)}</span>
    </span>
  )
}
