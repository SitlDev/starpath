interface RatingBadgeProps {
  rating: number
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

const BADGE_STYLES: Record<number, string> = {
  5: 'badge-5',
  4: 'badge-4',
  3: 'badge-3',
  2: 'badge-2',
  1: 'badge-1',
}

export default function RatingBadge({ rating, label, size = 'md' }: RatingBadgeProps) {
  const r = Math.max(1, Math.min(5, Math.round(rating)))
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-base px-4 py-2 font-bold' : 'text-sm px-3 py-1 font-medium'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium ${sizeClass} ${BADGE_STYLES[r]}`}
    >
      {label && <span className="opacity-75">{label}</span>}
      <span>{'★'.repeat(r)}</span>
    </span>
  )
}
