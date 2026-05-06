'use client'

interface RatingProgressProps {
  label: string
  score: number
  rating: number
  maxScore?: number
}

function getRatingColor(rating: number): string {
  switch (rating) {
    case 5:
      return 'bg-emerald-500'
    case 4:
      return 'bg-green-500'
    case 3:
      return 'bg-yellow-500'
    case 2:
      return 'bg-orange-500'
    case 1:
      return 'bg-red-500'
    default:
      return 'bg-slate-500'
  }
}

function getRatingColorLight(rating: number): string {
  switch (rating) {
    case 5:
      return 'bg-emerald-500/20'
    case 4:
      return 'bg-green-500/20'
    case 3:
      return 'bg-yellow-500/20'
    case 2:
      return 'bg-orange-500/20'
    case 1:
      return 'bg-red-500/20'
    default:
      return 'bg-slate-500/20'
  }
}

export default function RatingProgress({
  label,
  score,
  rating,
  maxScore = 100,
}: RatingProgressProps) {
  const numScore = Number(score) || 0
  const numRating = Number(rating) || 0
  const percentage = Math.round((numScore / maxScore) * 100)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{numScore.toFixed(0)}</span>
          <span className="inline-flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-bold text-white" style={{backgroundColor: getRatingColor(numRating).replace('bg-', '').replace('-500', '').replace('-500', '') === 'emerald' ? '#10b981' : getRatingColor(numRating).replace('bg-', '').replace('-500', '') === 'green' ? '#22c55e' : getRatingColor(numRating).replace('bg-', '').replace('-500', '') === 'yellow' ? '#eab308' : getRatingColor(numRating).replace('bg-', '').replace('-500', '') === 'orange' ? '#f97316' : '#ef4444'}}>
            {numRating} <span className="opacity-60 text-xs">★</span>
          </span>
        </div>
      </div>

      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${getRatingColor(numRating)}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <p className="text-xs text-slate-400">{percentage}% of maximum score</p>
    </div>
  )
}
