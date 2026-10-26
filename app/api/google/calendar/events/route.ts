import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { and, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { appointments, googleCalendarConnections, pets } from '@/lib/db/schema'

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null) as { appointmentId?: string } | null
  if (!body?.appointmentId) return NextResponse.json({ error: 'Appointment is required.' }, { status: 400 })
  const [connection, appointment] = await Promise.all([
    db.select().from(googleCalendarConnections).where(eq(googleCalendarConnections.userId, session.user.id)).limit(1),
    db.select({ id: appointments.id, type: appointments.appointmentType, startsAt: appointments.startsAt, notes: appointments.notes, petName: pets.name }).from(appointments).leftJoin(pets, eq(appointments.petId, pets.id)).where(and(eq(appointments.id, body.appointmentId), eq(appointments.userId, session.user.id))).limit(1),
  ])
  const token = connection[0]?.accessToken
  if (!token || !appointment[0]) return NextResponse.json({ error: 'Calendar or appointment unavailable.' }, { status: 400 })
  const start = appointment[0].startsAt
  const end = new Date(start.getTime() + 60 * 60 * 1000)
  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ summary: `${appointment[0].type}${appointment[0].petName ? ` — ${appointment[0].petName}` : ''}`, description: appointment[0].notes ?? '', start: { dateTime: start.toISOString() }, end: { dateTime: end.toISOString() } }) })
  if (!response.ok) return NextResponse.json({ error: 'Google Calendar rejected the event.' }, { status: 502 })
  return NextResponse.json({ ok: true, event: await response.json() })
}
