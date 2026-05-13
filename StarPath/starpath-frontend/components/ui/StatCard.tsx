interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  trend?: { value: string; up: boolean }
  color?: 'blue' | 'green' | 'orange' | 'red'
  icon?: React.ReactNode
}

const colorMap = {
  blue: 'border-primary-200 bg-primary-50/50',
  green: 'border-green-200 bg-green-50/50',
  orange: 'border-orange-200 bg-orange-50/50',
  red: 'border-red-200 bg-red-50/50',
}

const textColorMap = {
  blue: 'text-primary-700',
  green: 'text-green-700',
  orange: 'text-orange-700',
  red: 'text-red-700',
}

export default function StatCard({ label, value, sub, trend, color = 'blue', icon }: StatCardProps) {
  return (
    <div className={`bg-white rounded-lg border p-6 flex flex-col gap-3 transition-all duration-200 hover:shadow-md ${colorMap[color]}`}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        {icon && <div className="text-lg text-slate-600">{icon}</div>}
      </div>

      <div>
        <p className={`text-3xl font-bold tracking-tight ${textColorMap[color]}`}>
          {value}
        </p>
        {sub && <p className="text-sm text-slate-600 mt-1">{sub}</p>}
      </div>

      {trend && (
        <div className={`flex items-center gap-1 text-xs font-semibold mt-auto ${trend.up ? 'text-green-600' : 'text-red-600'}`}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d={trend.up ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
          </svg>
          {trend.value}
        </div>
      )}
    </div>
  )
}
