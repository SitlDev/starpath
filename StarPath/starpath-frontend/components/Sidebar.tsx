'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { clearToken } from '@/lib/auth'
import NotificationCenter from './NotificationCenter'

// Icon components
const IconOverview = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 5h4" /></svg>
const IconInspections = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
const IconStaffing = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
const IconQuality = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
const IconFacilities = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1M9 7a1 1 0 011-1h2a1 1 0 011 1m0 0a1 1 0 011-1h2a1 1 0 011 1m0 0a1 1 0 011-1h2a1 1 0 011 1m0 0a1 1 0 011-1h2a1 1 0 011 1M9 11a1 1 0 011-1h2a1 1 0 011 1m0 0a1 1 0 011-1h2a1 1 0 011 1m0 0a1 1 0 011-1h2a1 1 0 011 1m0 0a1 1 0 011-1h2a1 1 0 011 1M9 15a1 1 0 011-1h2a1 1 0 011 1m0 0a1 1 0 011-1h2a1 1 0 011 1m0 0a1 1 0 011-1h2a1 1 0 011 1" /></svg>
const IconAlerts = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2M6.172 6.172a4 4 0 015.656 0L18 12m0 0l-1.414-1.414a4 4 0 00-5.656 0m5.656 5.656L18 12m-1.414 1.414a4 4 0 01-5.656 0" /></svg>
const IconReports = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
const IconExport = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
const IconProfile = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>

const NAV_ITEMS = [
  { href: '/dashboard',            icon: IconOverview, label: 'Overview' },
  { href: '/dashboard/health',     icon: IconInspections, label: 'Health Inspections' },
  { href: '/dashboard/staffing',   icon: IconStaffing, label: 'Staffing' },
  { href: '/dashboard/quality',    icon: IconQuality, label: 'Quality Measures' },
  { href: '/dashboard/facilities', icon: IconFacilities, label: 'Facilities' },
  { href: '/dashboard/alerts',     icon: IconAlerts, label: 'Alerts', badge: 2 },
  { href: '/dashboard/reports',    icon: IconReports, label: 'Reports' },
  { href: '/dashboard/cms',        icon: IconExport, label: 'CMS Export' },
  { href: '/dashboard/profile',    icon: IconProfile, label: 'Profile' },
]

export default function Sidebar({ user }: { user?: any }) {
  const path = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    clearToken()
    router.push('/auth/login')
  }

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-full border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-200">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">S</span>
          </div>
          <span className="font-semibold text-slate-900">
            StarPath
          </span>
        </Link>
      </div>

      {/* User section */}
      {user && (
        <div className="px-4 py-4 border-b border-slate-200">
          <div className="text-sm">
            <p className="font-medium text-slate-900">{user.full_name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = path === item.href || (item.href !== '/dashboard' && path.startsWith(item.href))
          const IconComponent = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <IconComponent />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: Notification Center & Logout */}
      <div className="px-4 pb-4 space-y-3 border-t border-slate-200 pt-4">
        <div className="flex items-center justify-center">
          <NotificationCenter />
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium"
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
