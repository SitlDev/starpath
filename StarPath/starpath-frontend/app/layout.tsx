import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StarPath SNF — CMS Five-Star Rating Optimizer',
  description:
    'Real-time CMS Five-Star Quality Rating calculator and optimizer for skilled nursing facilities. Know your rating today, not quarterly.',
  keywords: ['CMS Five-Star', 'skilled nursing facility', 'star rating', 'SNF compliance', 'StarPath'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
