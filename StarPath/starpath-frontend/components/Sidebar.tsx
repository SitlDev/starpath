'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { clearToken } from '@/lib/auth'
import NotificationCenter from './NotificationCenter'

const NAV_ITEMS = [
  { href: '/dashboard',            icon: '🏠', label: 'Overview' },
  { href: '/dashboard/health',     icon: '🔍', label: 'Health Inspections' },
  { href: '/dashboard/staffing',   icon: '👥', label: 'Staffing' },
  { href: '/dashboard/quality',    icon: '📋', label: 'Quality Measures' },
  { href: '/dashboard/facilities', icon: '🏥', label: 'Facilities' },
  { href: '/dashboard/alerts',     icon: '🚨', label: 'Alerts', badge: 2 },
  { href: '/dashboard/reports',    icon: '📄', label: 'Reports' },
  { href: '/dashboard/cms',        icon: '📤', label: 'CMS Export' },
  { href: '/dashboard/profile',    icon: '⚙️', label: 'Profile' },
]

export default function Sidebar({ user }: { user?: any }) {
  const path = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    clearToken()
    router.push('/auth/login')
  }

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-full border-r border-slate-700 bg-slate-800">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="text-2xl">⭐</span>
          <span className="text-lg font-bold tracking-tight">
            Star<span className="text-blue-400">Path</span>
            <span className="text-xs font-mono text-slate-400 ml-1">SNF</span>
          </span>
        </Link>
      </div>

      {/* User section */}
      {user && (
        <div className="px-4 py-4 border-b border-slate-700">
          <div className="text-sm text-slate-300">
            <p className="font-medium">{user.full_name}</p>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = path === item.href || (item.href !== '/dashboard' && path.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
            >
              <span className="text-base">
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="bg-red-500/90 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: Notification Center & Logout */}
      <div className="px-4 pb-4 space-y-3 border-t border-slate-700 pt-4">
        <div className="flex items-center justify-center gap-2">
          <NotificationCenter />
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  )
}
