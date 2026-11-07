import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import { DashboardShell } from '@/components/dashboard-shell'
import { InstallBanner } from '@/components/install-banner'
import { OfflineStatus } from '@/components/offline-status'
import { ThemeProvider } from '@/components/theme-provider'

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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <OfflineStatus />
          <InstallBanner />
          <DashboardShell>{children}</DashboardShell>
          {process.env.NODE_ENV === 'production' && <Analytics />}
          <Script id="tiktok-pixel" strategy="afterInteractive">{`!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
  ttq.load('DBND7DRC77UENJ6BRPM0');
  ttq.page();
}(window, document, 'ttq');`}</Script>
        </ThemeProvider>
      </body>
    </html>
  )
}
