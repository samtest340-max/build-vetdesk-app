'use client'

import { usePathname } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard-sidebar'

const dashboardRoutes = ['/dashboard', '/appointments', '/patients', '/schedule', '/care', '/feedback', '/settings']

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboardRoute = dashboardRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))
  if (!isDashboardRoute) return <>{children}</>
  return <div className="min-h-screen lg:pl-64"><DashboardSidebar /><main className="min-h-screen">{children}</main></div>
}
