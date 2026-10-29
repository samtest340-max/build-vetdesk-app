import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { DashboardShell } from '@/components/dashboard-shell'
import { InstallBanner } from '@/components/install-banner'
import { OfflineStatus } from '@/components/offline-status'

export const metadata: Metadata = {
  title: 'VetDesk — Run your vet practice. Fill your calendar.',
  description: 'VetDesk helps veterinary doctors and clinics in Nigeria manage bookings, patient records, reminders, and payments.',
  generator: 'v0.app',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/vetdesk-favicon.png',
    apple: '/vetdesk-favicon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f0fdfa' },
    { media: '(prefers-color-scheme: dark)', color: '#134e4a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <OfflineStatus />
        <InstallBanner />
        <DashboardShell>{children}</DashboardShell>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
