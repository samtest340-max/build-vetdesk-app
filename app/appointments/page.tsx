'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Search, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { AppointmentCalendar } from '@/components/appointment-calendar'

type Appointment = { id: string; appointment_type: string; starts_at: string; status: 'pending' | 'approved' | 'cancelled'; notes: string | null; fee: number; pet: { name: string } | null }
type Patient = { id: string; name: string; species: string }
type Notice = { type: 'success' | 'error'; text: string }
const services = ['Wellness examination', 'Vaccination', 'Dental cleaning', 'Surgery', 'Emergency visit', 'Diagnostics and laboratory tests', 'Parasite prevention', 'Microchipping', 'Grooming', 'Nutrition consultation', 'Follow-up visit']

export default function AppointmentsPage() {
  const supabase = useMemo(() => (typeof window === 'undefined' ? null : createClient()), [])
  const [date, setDate] = useState(() => new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [showForm, setShowForm] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const dateKey = date.toISOString().slice(0, 10)

  async function loadAppointments() {
    if (!supabase) return
    setLoading(true)
    const start = new Date(`${dateKey}T00:00:00`).toISOString()
    const end = new Date(`${dateKey}T23:59:59`).toISOString()
    const { data, error } = await supabase.from('appointments').select('id,appointment_type,starts_at,status,notes,fee,pet:pets(name)').gte('starts_at', start).lte('starts_at', end).order('starts_at')
    if (error) setNotice({ type: 'error', text: 'Unable to load appointments.' })
    else setAppointments((data ?? []) as unknown as Appointment[])
    setLoading(false)
  }

  useEffect(() => {
    if (!supabase) return
    void loadAppointments()
    const channel = supabase.channel('appointments-live').on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => void loadAppointments()).subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [dateKey, supabase])

  useEffect(() => {
    if (!supabase) return
    void supabase.from('pets').select('id,name,species').order('name').then(({ data }: { data: Patient[] | null }) => setPatients(data ?? []))
  }, [supabase])

  async function createAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) return setNotice({ type: 'error', text: 'The appointment service is unavailable.' })
    const form = new FormData(event.currentTarget)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setNotice({ type: 'error', text: 'Please sign in again.' })
    const response = await fetch('/api/appointments', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ petId: String(form.get('pet_id') || '') || undefined, appointmentType: String(form.get('appointment_type')), startsAt: new Date(String(form.get('starts_at'))).toISOString(), notes: String(form.get('notes') || '') || undefined }) })
    if (!response.ok) { const body = await response.json().catch(() => null); setNotice({ type: 'error', text: body?.error || 'Unable to save appointment.' }) }
    else { setShowForm(false); setNotice({ type: 'success', text: 'Appointment saved successfully.' }); await loadAppointments() }
  }

  async function updateStatus(id: string, status: 'pending' | 'approved' | 'cancelled') {
    if (!supabase) return setNotice({ type: 'error', text: 'The appointment service is unavailable.' })
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id)
    if (!error && status === 'approved') { const sync = await fetch('/api/google/calendar/events', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ appointmentId: id }) }); if (!sync.ok) setNotice({ type: 'error', text: 'Approved, but Google Calendar could not be updated.' }) }
    if (error) setNotice({ type: 'error', text: 'Unable to update appointment status.' })
    else { setAppointments(items => items.map(item => item.id === id ? { ...item, status } : item)); setNotice({ type: 'success', text: `Appointment ${status}.` }) }
  }

  const visible = appointments.filter(item => `${item.appointment_type} ${item.pet?.name ?? ''}`.toLowerCase().includes(query.toLowerCase()))
  const formattedDate = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date)
  return <><DashboardSidebar /><main className="lg:pl-64 min-h-screen bg-[radial-gradient(circle_at_top_right,#dbeafe,transparent_35%),#f4f7fb] text-slate-950"><header className="glass-panel flex items-center justify-between border-b px-5 py-5 lg:px-10"><div><Link href="/dashboard" className="text-sm font-semibold text-blue-700">← Dashboard</Link><p className="eyebrow mt-2">Practice calendar</p><h1 className="text-3xl font-extrabold">Appointments</h1></div><button onClick={() => setShowForm(true)} className="button-primary"><Plus />New appointment</button></header><div className="mx-auto max-w-6xl p-5 lg:p-10"><section className="glass-card flex flex-wrap items-center justify-between gap-4 p-4"><div className="flex items-center gap-3"><button aria-label="Previous day" onClick={() => setDate(current => new Date(current.getTime() - 86400000))} className="rounded-lg border bg-white/70 p-2"><ChevronLeft /></button><strong>{formattedDate}</strong><button aria-label="Next day" onClick={() => setDate(current => new Date(current.getTime() + 86400000))} className="rounded-lg border bg-white/70 p-2"><ChevronRight /></button></div></section><section className="glass-card mt-6 p-6"><AppointmentCalendar appointments={appointments} selectedDate={dateKey} onDateChange={key => setDate(new Date(`${key}T12:00:00`))} showSlots={false} minDate={new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos' }).format(new Date())} /></section><section className="glass-card mt-6 p-6"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">Daily schedule</h2><label className="flex items-center gap-2 rounded-xl border bg-white/60 px-3 py-2 text-sm text-slate-500"><Search /><input aria-label="Search appointments" value={query} onChange={event => setQuery(event.target.value)} className="w-44 bg-transparent outline-none" placeholder="Search appointments" /></label></div><div className="mt-5 grid gap-3">{loading ? [1, 2, 3].map(item => <div key={item} className="h-16 animate-pulse rounded-xl bg-white/60" />) : visible.length === 0 ? <div className="rounded-2xl border border-dashed p-8 text-center text-slate-500">No appointments for this day.</div> : visible.map(item => <article key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm"><div><p className="font-bold">{new Date(item.starts_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} · {item.appointment_type}</p><p className="text-sm text-slate-500">{item.pet?.name ?? 'No patient selected'}{item.notes ? ` · ${item.notes}` : ''}</p></div><div className="flex items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-bold ${item.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{item.status}</span><select aria-label={`Update status for ${item.appointment_type}`} value={item.status} onChange={event => void updateStatus(item.id, event.target.value as 'pending' | 'approved' | 'cancelled')} className="rounded-lg border bg-white px-2 py-2 text-sm"><option value="pending">Pending</option><option value="approved">Approved</option><option value="cancelled">Cancelled</option></select></div></article>)}</div></section></div>{notice && <button aria-label="Dismiss notification" onClick={() => setNotice(null)} className={`fixed bottom-5 right-5 z-50 rounded-xl px-4 py-3 font-semibold shadow-xl ${notice.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>{notice.text} <X className="ml-2 inline size-4" /></button>}{showForm && <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/60 p-5"><form onSubmit={createAppointment} className="w-full max-w-lg rounded-3xl border border-white/80 bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-xl font-extrabold">New appointment</h2><button type="button" onClick={() => setShowForm(false)} aria-label="Close form"><X /></button></div><div className="mt-5 grid gap-4"><label className="grid gap-1 text-sm font-semibold">Patient<select required name="pet_id" className="rounded-xl border p-3 font-normal"><option value="">Select a patient</option>{patients.map(patient => <option key={patient.id} value={patient.id}>{patient.name} · {patient.species}</option>)}</select></label><label className="grid gap-1 text-sm font-semibold">Appointment type<select required name="appointment_type" className="rounded-xl border p-3 font-normal">{services.map(service => <option key={service}>{service}</option>)}</select></label><label className="grid gap-1 text-sm font-semibold">Date and time<input required name="starts_at" type="datetime-local" className="rounded-xl border p-3 font-normal" /></label><label className="grid gap-1 text-sm font-semibold">Notes<textarea name="notes" className="rounded-xl border p-3 font-normal" rows={3} /></label><button className="button-primary justify-center">Save appointment</button></div></form></div>}</main>
</>}
export const dynamic = 'force-dynamic'
