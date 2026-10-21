import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { DashboardShell } from '@/components/dashboard-shell'
import { PwaInstallButton } from '@/components/pwa-install-button'
import { OfflineStatus } from '@/components/offline-status'

export const metadata: Metadata = {
  title: 'VetDesk — Run your vet practice. Fill your calendar.',
  description: 'VetDesk helps veterinary doctors and clinics in Nigeria manage bookings, patient records, reminders, and payments.',
  generator: 'v0.app',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <OfflineStatus />
        <div className="install-banner flex min-h-16 items-center justify-end gap-4 border-b border-blue-100 bg-blue-50/70 px-4 py-3 sm:px-6 lg:px-10"><div className="install-promo hidden items-center gap-3 sm:flex" aria-hidden="true"><span className="install-promo-dot" /><div><p className="text-sm font-extrabold text-blue-950">Keep VetDesk close</p><p className="text-xs text-blue-700">Install once. Open your practice dashboard faster.</p></div><span className="install-promo-arrow">→</span></div><PwaInstallButton /></div>
        <DashboardShell>{children}</DashboardShell>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
