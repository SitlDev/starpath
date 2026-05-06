import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard — StarPath SNF',
  description: 'Your facility\'s real-time CMS Five-Star Quality Rating dashboard.',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex h-screen overflow-hidden">{children}</div>
}
