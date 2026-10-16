'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CalendarDays, CalendarHeart, Clock3, LayoutDashboard, MessageSquarePlus, PawPrint, Settings } from 'lucide-react'

const nav = [
  ['Overview', LayoutDashboard, '/dashboard'],
  ['Appointments', CalendarDays, '/appointments'],
  ['Patients', PawPrint, '/patients'],
  ['Schedule', Clock3, '/schedule'], ['Care', CalendarHeart, '/care'],
  ['Feedback', MessageSquarePlus, '/feedback'],
] as const

export function DashboardSidebar() {
  const [open, setOpen] = useState(true)
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="fixed left-4 top-4 z-40 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-lg" aria-label="Open sidebar">Open menu</button>
  return <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white/95 p-5 shadow-xl backdrop-blur lg:block">
    <Link href="/dashboard" className="flex items-center gap-2 text-xl font-extrabold text-blue-950"><span className="flex size-10 items-center justify-center rounded-xl bg-blue-700 text-white"><PawPrint /></span>Vet<span className="text-blue-600">Desk</span></Link>
    <button type="button" onClick={() => setOpen(false)} className="absolute right-4 top-5 rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100" aria-label="Close sidebar">Close</button><p className="mt-10 px-3 text-xs font-bold uppercase tracking-widest text-slate-400">Workspace</p>
    <nav className="mt-3 grid gap-1">{nav.map(([label, Icon, href]) => <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700"><Icon className="size-5" />{label}</Link>)}</nav>
    <Link href="/settings" className="absolute bottom-6 left-5 right-5 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"><Settings className="size-5" />Settings</Link>
  </aside>
}
