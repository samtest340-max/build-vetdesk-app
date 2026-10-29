'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { CalendarDays, CalendarHeart, Clock3, LayoutDashboard, LogOut, MessageSquarePlus, PawPrint, Settings } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { authClient } from '@/lib/auth-client'

const nav = [
  ['Overview', LayoutDashboard, '/dashboard'],
  ['Appointments', CalendarDays, '/appointments'],
  ['Patients', PawPrint, '/patients'],
  ['Schedule', Clock3, '/schedule'], ['Care', CalendarHeart, '/care'],
  ['Feedback', MessageSquarePlus, '/feedback'],
] as const

export function DashboardSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  return <><button type="button" onClick={onClose} aria-label="Close navigation" className={cn('fixed inset-0 z-30 bg-slate-950/30 transition-opacity lg:hidden', open ? 'opacity-100' : 'pointer-events-none opacity-0')} /><aside className={cn('fixed inset-y-0 left-0 z-40 flex h-[100dvh] w-64 shrink-0 flex-col border-r border-slate-200 bg-white/95 p-5 shadow-xl backdrop-blur transition-transform lg:static lg:z-0 lg:translate-x-0 lg:shadow-none', open ? 'translate-x-0' : '-translate-x-full')}>
    <Link href="/dashboard" className="flex items-center gap-2 text-xl font-extrabold text-[#134e4a]"><span className="flex size-10 items-center justify-center rounded-xl bg-[#0f766e] text-white"><PawPrint /></span>Vet<span className="text-[#0f766e]">Desk</span></Link>
    <button type="button" onClick={onClose} className="absolute right-4 top-5 rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Close sidebar">Close</button><p className="mt-10 shrink-0 px-3 text-xs font-bold uppercase tracking-widest text-slate-400">Workspace</p>
    <nav className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-color:#cbd5e1_transparent] [scrollbar-gutter:stable]">{nav.map(([label, Icon, href]) => <Link key={href} href={href} className={cn('flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700', pathname === href ? 'bg-blue-50 text-blue-700' : 'text-slate-600')}><Icon className="size-5" />{label}</Link>)}</nav>
    <div className="mt-4 shrink-0 border-t border-slate-100 pt-4"><div className="mb-3 flex items-center justify-between px-1"><span className="text-xs font-semibold text-slate-400">Appearance</span><ThemeToggle /></div><Link href="/settings" onClick={onClose} className="mb-2 flex items-center gap-3 rounded-xl bg-teal-50 px-3 py-3 text-sm font-semibold text-[#134e4a] transition hover:bg-teal-100"><Settings className="size-5" />Settings</Link><button type="button" onClick={async () => { await authClient.signOut(); window.location.assign('/sign-in') }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-amber-50 hover:text-[#134e4a]"><LogOut className="size-5" />Sign out</button></div>
  </aside></>
}
