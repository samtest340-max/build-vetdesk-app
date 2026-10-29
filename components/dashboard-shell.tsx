'use client'

import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { ThemeToggle } from '@/components/theme-toggle'

const dashboardRoutes = ['/dashboard', '/appointments', '/patients', '/schedule', '/care', '/feedback', '/settings']

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isDashboardRoute = dashboardRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))
  useEffect(() => { setSidebarOpen(false) }, [pathname])
  useEffect(() => { document.body.classList.toggle('dashboard-menu-open', sidebarOpen); return () => document.body.classList.remove('dashboard-menu-open') }, [sidebarOpen])
  if (!isDashboardRoute) return <div key={pathname} className="route-transition">{children}</div>
  return <div key={pathname} className="route-transition flex h-[100dvh] overflow-hidden"><DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /><div className="flex min-w-0 flex-1 flex-col"><header className="sticky top-0 z-20 flex h-16 shrink-0 items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden"><button type="button" onClick={() => setSidebarOpen(true)} className="rounded-xl border border-slate-200 p-2 text-slate-700" aria-label="Open navigation"><Menu /></button><span className="ml-3 font-extrabold text-blue-950 dark:text-white">Vet<span className="text-blue-600">Desk</span></span><span className="ml-auto"><ThemeToggle /></span></header><main className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</main></div></div>
}
