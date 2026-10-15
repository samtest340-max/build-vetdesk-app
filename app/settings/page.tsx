'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Bell, Building2, CalendarDays, Save, Unplug } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Notice = { type: 'success' | 'error'; text: string }
type Profile = { clinic_name: string; address: string; state: string; lga: string; reminder_preferences: Record<string, boolean> }

export default function SettingsPage() {
  const [tab, setTab] = useState<'Practice' | 'Notifications'>('Practice')
  const [profile, setProfile] = useState<Profile>({ clinic_name: '', address: '', state: '', lga: '', reminder_preferences: {} })
  const [calendarEmail, setCalendarEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)
  const supabase = useMemo(() => (typeof window === 'undefined' ? null : createClient()), [])

  useEffect(() => {
    if (!supabase) return
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.replace('/sign-in'); return }
      const [{ data, error }, { data: connection }] = await Promise.all([
        supabase.from('profiles').select('clinic_name,address,state,lga,reminder_preferences').eq('id', user.id).maybeSingle(),
        supabase.from('google_calendar_connections').select('google_user_email').eq('user_id', user.id).maybeSingle(),
      ])
      if (error) setNotice({ type: 'error', text: 'Unable to load settings.' })
      if (data) setProfile({ clinic_name: data.clinic_name ?? '', address: data.address ?? '', state: data.state ?? '', lga: data.lga ?? '', reminder_preferences: (data.reminder_preferences ?? {}) as Record<string, boolean> })
      setCalendarEmail(connection?.google_user_email ?? null)
      setLoading(false)
    }
    void load()
  }, [supabase])

  async function save() {
    if (!supabase) { setNotice({ type: 'error', text: 'The settings service is unavailable.' }); return }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setNotice({ type: 'error', text: 'Your session has expired.' }); setSaving(false); return }
    const { error } = await supabase.from('profiles').update(profile).eq('id', user.id)
    setNotice(error ? { type: 'error', text: 'Unable to save settings.' } : { type: 'success', text: 'Settings saved.' })
    setSaving(false)
  }

  async function disconnectCalendar() {
    const response = await fetch('/api/google/calendar/connect', { method: 'DELETE' })
    if (!response.ok) setNotice({ type: 'error', text: 'Unable to disconnect Google Calendar.' })
    else { setCalendarEmail(null); setNotice({ type: 'success', text: 'Google Calendar disconnected.' }) }
  }

  if (loading) return <main className="min-h-screen bg-slate-50 p-10"><div className="mx-auto max-w-5xl animate-pulse space-y-4"><div className="h-10 w-48 rounded bg-slate-200" /><div className="h-64 rounded-2xl bg-white" /></div></main>
  return <main className="min-h-screen bg-slate-50 text-slate-950"><header className="border-b border-slate-200 bg-white px-5 py-5 lg:px-10"><Link href="/dashboard" className="text-sm font-semibold text-blue-700">← Dashboard</Link><h1 className="mt-2 text-3xl font-extrabold">Settings</h1><p className="mt-1 text-sm text-slate-500">Manage practice details, reminders, and calendar access.</p></header><div className="mx-auto grid max-w-5xl gap-6 p-5 lg:grid-cols-[220px_1fr] lg:p-10"><nav className="flex gap-2 lg:flex-col"><button onClick={() => setTab('Practice')} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold ${tab === 'Practice' ? 'bg-blue-700 text-white' : 'bg-white text-slate-600'}`}><Building2 />Practice</button><button onClick={() => setTab('Notifications')} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold ${tab === 'Notifications' ? 'bg-blue-700 text-white' : 'bg-white text-slate-600'}`}><Bell />Notifications</button></nav><section className="rounded-2xl border border-slate-200 bg-white p-6">{tab === 'Practice' ? <><h2 className="text-2xl font-extrabold">Practice details</h2><div className="mt-6 grid gap-4 sm:grid-cols-2">{(['clinic_name', 'address', 'state', 'lga'] as const).map(key => <label key={key} className="grid gap-2 text-sm font-semibold capitalize">{key.replace('_', ' ')}<input value={profile[key]} onChange={event => setProfile(current => ({ ...current, [key]: event.target.value }))} className="h-11 rounded-xl border px-3 font-normal" /></label>)}<div className="rounded-xl border border-blue-100 bg-blue-50 p-4 sm:col-span-2"><div className="flex items-center gap-3"><CalendarDays className="text-blue-700" /><div><h3 className="font-bold">Google Calendar</h3><p className="text-sm text-slate-600">{calendarEmail ? `Connected as ${calendarEmail}` : 'Connect your calendar to sync appointment events.'}</p></div></div><div className="mt-4">{calendarEmail ? <button onClick={() => void disconnectCalendar()} className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700"><Unplug />Disconnect</button> : <a href="/api/google/calendar/connect" className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white"><CalendarDays />Connect Google Calendar</a>}</div></div></div><button disabled={saving} onClick={() => void save()} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"><Save />{saving ? 'Saving…' : 'Save settings'}</button></> : <><h2 className="text-2xl font-extrabold">Notifications</h2><p className="mt-2 text-sm text-slate-500">Choose which in-app reminders you want to receive.</p><label className="mt-6 flex items-center gap-3 rounded-xl border p-4 text-sm font-semibold"><input type="checkbox" checked={profile.reminder_preferences.appointment ?? true} onChange={event => setProfile(current => ({ ...current, reminder_preferences: { ...current.reminder_preferences, appointment: event.target.checked } }))} />Appointment reminders</label><button disabled={saving} onClick={() => void save()} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white"><Save />Save notifications</button></>}</section></div>{notice && <div role="status" className={`fixed bottom-5 right-5 z-50 rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>{notice.text}<button onClick={() => setNotice(null)} className="ml-4" aria-label="Dismiss notification">×</button></div>}</main>
}
