'use client'
import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center overflow-hidden">
        {/* Background glow orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-brand-600/10 blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-600/8 blur-[100px]" />
        </div>

        {/* Logo + wordmark */}
        <div className="relative flex items-center gap-3 mb-8 animate-fade-in">
          <div className="relative">
            <div className="text-5xl" style={{ animation: 'starGlow 2s ease-in-out infinite alternate' }}>⭐</div>
            <div className="absolute inset-0 text-5xl blur-sm opacity-60">⭐</div>
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Star<span className="text-brand-400">Path</span>
            <span className="ml-1 text-sm font-mono text-surface-500 bg-surface-700 px-2 py-0.5 rounded-full border border-white/10">SNF</span>
          </span>
        </div>

        <h1 className="relative text-5xl md:text-7xl font-black tracking-tight mb-6 animate-slide-up"
            style={{ animationDelay: '0.1s' }}>
          <span className="bg-gradient-to-br from-white via-white to-brand-300 bg-clip-text text-transparent">
            Know Your Star Rating
          </span>
          <br />
          <span className="bg-gradient-to-br from-brand-300 to-indigo-400 bg-clip-text text-transparent">
            Before CMS Does
          </span>
        </h1>

        <p className="relative max-w-2xl text-lg md:text-xl text-white/60 mb-10 leading-relaxed animate-slide-up"
           style={{ animationDelay: '0.2s' }}>
          StarPath SNF gives skilled nursing facilities a real-time CMS Five-Star Quality Rating—
          calculated daily, not quarterly. Identify gaps, predict ratings, and take action before the next survey.
        </p>

        {/* CTA buttons */}
        <div className="relative flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Link href="/dashboard"
            className="px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-brand-600/40 hover:scale-105 hover:-translate-y-0.5">
            View Demo Dashboard
          </Link>
          <Link href="/auth/login"
            className="px-8 py-4 rounded-xl glass-card hover:bg-white/8 text-white/80 hover:text-white font-semibold text-lg transition-all duration-200 border border-white/10 hover:border-brand-500/50">
            Sign In →
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 text-sm animate-bounce">
          <span>Scroll to explore</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Feature strip */}
      <section className="relative px-6 py-24 max-w-7xl mx-auto w-full">
        <div className="neon-line mb-20" />
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: '📊',
              title: 'Real-Time Calculation',
              desc: 'Calculate your exact CMS Five-Star rating daily using the same methodology CMS publishes. No more quarterly surprises.',
              color: 'brand',
            },
            {
              icon: '🎯',
              title: 'Gap Analysis',
              desc: 'Pinpoint exactly which deficiencies, staffing shortfalls, or quality measures are dragging your score down—with actionable fixes.',
              color: 'emerald',
            },
            {
              icon: '🔮',
              title: 'Predictive Forecasting',
              desc: 'Model what-if scenarios. See exactly how many RN hours or fewer deficiencies it takes to reach the next star tier.',
              color: 'violet',
            },
          ].map((f) => (
            <div key={f.title} className="glass-card rounded-2xl p-8 hover:border-brand-500/30 transition-all duration-300 hover:-translate-y-1 group">
              <div className="text-4xl mb-5 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
              <p className="text-white/50 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Three domains */}
        <div className="mt-24">
          <h2 className="text-4xl font-black text-center mb-4">
            <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Three Domains. One Score.
            </span>
          </h2>
          <p className="text-center text-white/50 mb-16 text-lg">StarPath breaks down every component of the CMS algorithm.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { domain: 'Health Inspections', weight: 'Foundation', stars: 5, color: '#ef4444', pct: 100 },
              { domain: 'Staffing',           weight: '±1 Star Adjust', stars: 4, color: '#3366f4', pct: 80 },
              { domain: 'Quality Measures',   weight: '±1 Star Adjust', stars: 3, color: '#fbbf24', pct: 60 },
            ].map((d) => (
              <div key={d.domain} className="glass-card rounded-2xl p-6 border border-white/8 hover:border-white/15 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-white/40 text-xs font-mono uppercase tracking-widest mb-1">{d.weight}</p>
                    <h4 className="text-lg font-bold text-white">{d.domain}</h4>
                  </div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} className={`w-4 h-4 ${s <= d.stars ? 'star-filled' : 'star-empty'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <div className="progress-track">
                  <div className="h-full rounded-full transition-all duration-1000"
                       style={{ width: `${d.pct}%`, background: d.color, boxShadow: `0 0 10px ${d.color}60` }} />
                </div>
                <p className="text-right text-xs font-mono text-white/30 mt-2">{'★'.repeat(d.stars)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8 px-6 py-10 text-center text-white/25 text-sm mt-auto">
        <p>© 2026 StarPath SNF. Built for nursing home compliance professionals.</p>
        <p className="mt-1 font-mono text-xs">Not affiliated with CMS. For informational purposes only.</p>
      </footer>
    </main>
  )
}
