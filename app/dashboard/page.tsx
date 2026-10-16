'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, Clock3, LayoutDashboard, LogOut, Menu, MessageSquarePlus, PawPrint, Settings, Share2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Notice = { type: 'success' | 'error'; text: string }
type Appointment = { id: string; appointment_type: string; starts_at: string; status: string; fee: number; pet: { name: string } | null }
const nav = [['Overview', LayoutDashboard, '/dashboard'], ['Appointments', CalendarDays, '/appointments'], ['Patients', PawPrint, '/patients'], ['Schedule', Clock3, '/schedule'], ['Feedback', MessageSquarePlus, '/feedback']] as const

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patientCount, setPatientCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [publicLink, setPublicLink] = useState('')
  const [displayName, setDisplayName] = useState('there')
  const [calendarConnected, setCalendarConnected] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const supabase = useMemo(() => (typeof window === 'undefined' ? null : createClient()), [])

  async function loadDashboard() {
    if (!supabase) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.replace('/sign-in'); return }
    const { data: profile } = await supabase.from('profiles').select('full_name,google_calendar_connected').eq('id', user.id).maybeSingle()
    setDisplayName(profile?.full_name?.trim() || user.email?.split('@')[0] || 'there')
    setCalendarConnected(Boolean(profile?.google_calendar_connected))
    setPublicLink(`${window.location.origin}/book/${user.id}`)
    const [appointmentsResult, patientsResult] = await Promise.all([
      supabase.from('appointments').select('id,appointment_type,starts_at,status,fee,pet:pets(name)').gte('starts_at', new Date().toISOString()).order('starts_at').limit(5),
      supabase.from('pets').select('id', { count: 'exact', head: true }),
    ])
    if (appointmentsResult.error || patientsResult.error) setNotice({ type: 'error', text: 'Unable to load dashboard data.' })
    setAppointments((appointmentsResult.data ?? []) as unknown as Appointment[])
    setPatientCount(patientsResult.count ?? 0)
    setLoading(false)
  }

  useEffect(() => {
    if (!supabase) return
    void loadDashboard()
    const channel = supabase.channel('dashboard-live').on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => void loadDashboard()).on('postgres_changes', { event: '*', schema: 'public', table: 'pets' }, () => void loadDashboard()).subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [supabase])

  return <main className="min-h-screen bg-slate-50 text-slate-950">
    <aside className={`fixed inset-y-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white p-5 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <Link href="/" className="flex items-center gap-2 text-xl font-extrabold text-blue-950"><span className="flex size-10 items-center justify-center rounded-xl bg-blue-700 text-white"><PawPrint /></span>Vet<span className="text-blue-600">Desk</span></Link>
      <p className="mt-10 px-3 text-xs font-bold uppercase tracking-widest text-slate-400">Workspace</p>
      <nav className="mt-3 flex flex-col gap-1">{nav.map(([label, Icon, href]) => <Link key={label} href={href} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"><Icon />{label}</Link>)}</nav>
      <div className="mt-auto flex flex-col gap-1"><Link href="/settings" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-blue-50"><Settings />Settings</Link><button onClick={() => { if (supabase) void supabase.auth.signOut().then(() => window.location.assign('/')) }} className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-600"><LogOut />Sign out</button></div>
    </aside>
    <section className={`transition-[margin] ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}><header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-5 lg:px-10"><div className="flex items-center gap-3"><button type="button" aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'} onClick={() => setSidebarOpen(value => !value)} className="rounded-xl border border-slate-200 p-2 text-slate-600">{sidebarOpen ? <X /> : <Menu />}</button><div><p className="eyebrow">Practice overview</p><h1 className="text-2xl font-extrabold">Good day, {displayName}</h1></div></div></header>
      <div className="p-5 lg:p-10"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Upcoming appointments" value={loading ? '—' : String(appointments.length)} /><Stat label="Patients" value={loading ? '—' : String(patientCount)} /><Stat label="Pending confirmations" value={loading ? '—' : String(appointments.filter(item => item.status === 'pending').length)} /><Stat label="Potential revenue" value={loading ? '—' : `₦${appointments.reduce((sum, item) => sum + Number(item.fee || 0), 0).toLocaleString()}`} /><Stat label="Approved revenue" value={loading ? '—' : `₦${appointments.filter(item => item.status === 'approved').reduce((sum, item) => sum + Number(item.fee || 0), 0).toLocaleString()}`} /><Link href="/settings" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><p className="text-sm text-slate-500">Calendar connection</p><p className={`mt-4 text-lg font-extrabold ${calendarConnected ? 'text-emerald-600' : 'text-amber-600'}`}>{calendarConnected ? 'Connected' : 'Not connected'}</p><span className="mt-2 block text-xs font-bold text-blue-700">{calendarConnected ? 'Manage in settings' : 'Connect in settings'}</span></Link></div>
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold">Upcoming appointments</h2><p className="mt-1 text-sm text-slate-500">Your saved appointments appear here.</p></div><div className="flex items-center gap-4"><button type="button" onClick={() => setShowCalendar(true)} className="button-primary">View calendar</button><Link href="/appointments" className="text-sm font-semibold text-blue-700">View all</Link></div></div>{loading ? <div className="mt-5 grid gap-3">{[1, 2, 3].map(item => <div key={item} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}</div> : appointments.length ? <div className="mt-5 grid gap-3">{appointments.map(item => <div key={item.id} className="flex flex-wrap items-center gap-4 rounded-xl bg-slate-50 p-4"><span className="w-36 font-bold text-blue-700">{new Date(item.starts_at).toLocaleString()}</span><PawPrint className="text-blue-700" /><div className="flex-1"><p className="font-bold">{item.pet?.name ?? 'Patient not linked'}</p><p className="text-sm text-slate-500">{item.appointment_type}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${item.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{item.status}</span></div>)}</div> : <div className="mt-5 rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">No appointments yet. <Link href="/appointments" className="font-semibold text-blue-700">Add one</Link></div>}</section>
        <section className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-6"><div className="flex items-center gap-3"><Share2 className="text-blue-700" /><div><h2 className="font-bold">Public booking page</h2><p className="text-sm text-slate-600">Share your booking link with clients.</p></div></div><div className="mt-4 flex gap-2"><input readOnly value={publicLink} className="min-w-0 flex-1 rounded-xl border border-blue-200 bg-white px-3 text-sm" /><button onClick={() => { void navigator.clipboard?.writeText(publicLink); setNotice({ type: 'success', text: 'Booking link copied.' }) }} className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white">Copy</button></div></section>
      </div></section>
    {showCalendar && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/65 p-5"><section role="dialog" aria-modal="true" aria-labelledby="calendar-title" className="glass-card w-full max-w-2xl p-6"><div className="flex items-center justify-between"><div><p className="eyebrow">Owner calendar</p><h2 id="calendar-title" className="text-2xl font-extrabold">Booked days and times</h2></div><button type="button" onClick={() => setShowCalendar(false)} className="rounded-xl border p-2" aria-label="Close calendar"><X /></button></div><div className="mt-5 grid gap-3">{appointments.length ? appointments.map(item => <div key={item.id} className="flex items-center justify-between rounded-xl border bg-white/80 p-4"><div><p className="font-bold">{new Date(item.starts_at).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p><p className="text-sm text-slate-500">{new Date(item.starts_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} · {item.appointment_type}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${item.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{item.status}</span></div>) : <p className="rounded-xl bg-white/70 p-8 text-center text-slate-500">No booked times yet.</p>}</div></section></div>}
    {notice && <div role="status" className={`fixed bottom-5 right-5 z-50 rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>{notice.text}<button onClick={() => setNotice(null)} className="ml-4" aria-label="Dismiss notification">×</button></div>}
  </main>
}
function Stat({ label, value }: { label: string; value: string }) { return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-4 text-3xl font-extrabold">{value}</p></article> }
