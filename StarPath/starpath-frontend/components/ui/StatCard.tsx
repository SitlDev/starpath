interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  trend?: { value: string; up: boolean }
  accent?: string
  icon?: string
}

export default function StatCard({ label, value, sub, trend, accent = '#3366f4', icon }: StatCardProps) {
  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-3 hover:border-white/15 transition-all duration-300 hover:-translate-y-0.5 group">
      <div className="flex items-start justify-between">
        <p className="text-xs font-mono text-white/40 uppercase tracking-widest">{label}</p>
        {icon && <span className="text-xl opacity-60 group-hover:opacity-100 transition-opacity">{icon}</span>}
      </div>

      <div>
        <p className="text-3xl font-black text-white tracking-tight"
           style={{ textShadow: `0 0 30px ${accent}50` }}>
          {value}
        </p>
        {sub && <p className="text-sm text-white/40 mt-1">{sub}</p>}
      </div>

      {trend && (
        <div className={`flex items-center gap-1 text-xs font-semibold ${trend.up ? 'text-emerald-400' : 'text-red-400'}`}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d={trend.up ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
          </svg>
          {trend.value}
        </div>
      )}

      {/* Bottom accent bar */}
      <div className="h-px mt-auto rounded-full" style={{ background: `linear-gradient(90deg, ${accent}60, transparent)` }} />
    </div>
  )
}
