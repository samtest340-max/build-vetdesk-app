'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function getSupabase() { return createClient() }

type Appointment = { id: string; appointment_type: string; starts_at: string; status: string; notes: string | null }

export default function AppointmentsPage() {
  const [date, setDate] = useState(() => new Date())
  const [view, setView] = useState('Day')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const dateKey = date.toISOString().slice(0, 10)

  useEffect(() => { void loadAppointments() }, [dateKey])

  async function loadAppointments() {
    const start = new Date(`${dateKey}T00:00:00`).toISOString()
    const end = new Date(`${dateKey}T23:59:59`).toISOString()
    const { data, error } = await getSupabase().from('appointments').select('id, appointment_type, starts_at, status, notes').gte('starts_at', start).lte('starts_at', end).order('starts_at')
    if (error) setMessage('Unable to load appointments.')
    else setAppointments(data ?? [])
  }

  async function createAppointment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const { data: { user } } = await getSupabase().auth.getUser()
    if (!user) return setMessage('Please sign in again.')
    const { error } = await getSupabase().from('appointments').insert({ user_id: user.id, appointment_type: String(form.get('type')), starts_at: new Date(String(form.get('starts_at'))).toISOString(), status: 'pending', notes: String(form.get('notes') || '') })
    if (error) setMessage('Unable to save appointment.')
    else { setShowForm(false); setMessage('Appointment saved.'); void loadAppointments() }
  }

  const formattedDate = useMemo(() => new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date), [date])
  return <main className="min-h-screen bg-slate-50 text-slate-950"><header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-5 lg:px-10"><div><Link href="/dashboard" className="text-sm font-semibold text-blue-700">← Dashboard</Link><h1 className="mt-2 text-3xl font-extrabold">Appointments</h1><p className="mt-1 text-sm text-slate-500">Manage appointments saved to your practice records.</p></div><button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white"><Plus />New appointment</button></header><div className="mx-auto max-w-6xl p-5 lg:p-10"><section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center gap-3"><button aria-label="Previous day" onClick={() => setDate(new Date(date.getTime() - 86400000))} className="rounded-lg border p-2"><ChevronLeft /></button><strong>{formattedDate}</strong><button aria-label="Next day" onClick={() => setDate(new Date(date.getTime() + 86400000))} className="rounded-lg border p-2"><ChevronRight /></button></div><div className="flex rounded-xl bg-slate-100 p-1">{['Day','Week','Month'].map(item => <button key={item} onClick={() => setView(item)} className={`rounded-lg px-4 py-2 text-sm font-semibold ${view === item ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}>{item}</button>)}</div></section>{message && <p className="mt-4 rounded-xl bg-blue-50 p-3 text-sm text-blue-800">{message}</p>}<section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">{view} schedule</h2><label className="hidden items-center gap-2 rounded-xl border px-3 py-2 text-sm text-slate-500 sm:flex"><Search /><input className="outline-none" placeholder="Search appointments" /></label></div><div className="mt-5 grid gap-3">{appointments.length ? appointments.map(item => <div key={item.id} className="flex items-center gap-4 rounded-xl bg-slate-50 p-4"><span className="w-16 font-bold text-blue-700">{new Date(item.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><CalendarDays className="text-blue-700" /><div className="flex-1"><p className="font-bold">{item.appointment_type}</p><p className="text-sm text-slate-500">{item.notes || 'No notes recorded'}</p></div><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">{item.status}</span></div>) : <p className="py-10 text-center text-sm text-slate-500">No appointments recorded for this day.</p>}</div></section></div>{showForm && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-5"><form onSubmit={createAppointment} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><h2 className="text-xl font-extrabold">New appointment</h2><div className="mt-5 grid gap-4"><label className="grid gap-2 text-sm font-semibold">Appointment type<input name="type" required className="h-11 rounded-xl border px-3" /></label><label className="grid gap-2 text-sm font-semibold">Date and time<input name="starts_at" required type="datetime-local" className="h-11 rounded-xl border px-3" /></label><label className="grid gap-2 text-sm font-semibold">Notes<textarea name="notes" className="rounded-xl border p-3" /></label></div><div className="mt-6 flex gap-3"><button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border py-3 font-semibold">Cancel</button><button className="flex-1 rounded-xl bg-blue-700 py-3 font-semibold text-white">Save appointment</button></div></form></div>}</main>
}
