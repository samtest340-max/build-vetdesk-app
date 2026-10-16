import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json() as { appointmentId?: string }
  if (!body.appointmentId) return NextResponse.json({ error: 'Appointment is required' }, { status: 400 })
  const [{ data: connection }, { data: appointment }] = await Promise.all([
    supabase.from('google_calendar_connections').select('access_token').eq('user_id', user.id).maybeSingle(),
    supabase.from('appointments').select('id,appointment_type,starts_at,notes,external_name,external_email').eq('id', body.appointmentId).eq('user_id', user.id).single(),
  ])
  if (!connection?.access_token || !appointment) return NextResponse.json({ error: 'Calendar or appointment unavailable' }, { status: 400 })
  const start = new Date(appointment.starts_at); const end = new Date(start.getTime() + 60 * 60 * 1000)
  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', { method: 'POST', headers: { authorization: `Bearer ${connection.access_token}`, 'content-type': 'application/json' }, body: JSON.stringify({ summary: appointment.appointment_type, description: appointment.notes ?? '', start: { dateTime: start.toISOString() }, end: { dateTime: end.toISOString() }, attendees: appointment.external_email ? [{ email: appointment.external_email, displayName: appointment.external_name ?? undefined }] : undefined }) })
  if (!response.ok) return NextResponse.json({ error: 'Google Calendar rejected the event.' }, { status: 502 })
  const event = await response.json() as { id?: string }
  await supabase.from('appointments').update({ google_event_id: event.id ?? null }).eq('id', appointment.id).eq('user_id', user.id)
  return NextResponse.json({ ok: true, eventId: event.id })
}
