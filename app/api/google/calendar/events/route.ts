import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { and, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { appointments, googleCalendarConnections, pets } from '@/lib/db/schema'

async function refreshAccessToken(connection: typeof googleCalendarConnections.$inferSelect) {
  if (!connection.refreshToken || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) return null
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, refresh_token: connection.refreshToken, grant_type: 'refresh_token' }),
  })
  if (!response.ok) return null
  const data = await response.json() as { access_token?: string }
  if (!data.access_token) return null
  await db.update(googleCalendarConnections).set({ accessToken: data.access_token, updatedAt: new Date() }).where(eq(googleCalendarConnections.id, connection.id))
  return data.access_token
}

async function createEvent(token: string, appointment: { type: string; petName: string | null; startsAt: Date; notes: string | null }) {
  const start = appointment.startsAt
  return fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      summary: `${appointment.type}${appointment.petName ? ` — ${appointment.petName}` : ''}`,
      description: appointment.notes ?? '',
      start: { dateTime: start.toISOString() },
      end: { dateTime: new Date(start.getTime() + 60 * 60 * 1000).toISOString() },
    }),
  })
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null) as { appointmentId?: string } | null
  if (!body?.appointmentId) return NextResponse.json({ error: 'Appointment is required.' }, { status: 400 })
  const [connectionRows, appointmentRows] = await Promise.all([
    db.select().from(googleCalendarConnections).where(eq(googleCalendarConnections.userId, session.user.id)).limit(1),
    db.select({ id: appointments.id, type: appointments.appointmentType, startsAt: appointments.startsAt, notes: appointments.notes, petName: pets.name }).from(appointments).leftJoin(pets, eq(appointments.petId, pets.id)).where(and(eq(appointments.id, body.appointmentId), eq(appointments.userId, session.user.id))).limit(1),
  ])
  const connection = connectionRows[0]
  const appointment = appointmentRows[0]
  if (!connection?.accessToken || !appointment) return NextResponse.json({ error: 'Calendar or appointment unavailable.' }, { status: 400 })

  let response = await createEvent(connection.accessToken, appointment)
  if (response.status === 401) {
    const refreshedToken = await refreshAccessToken(connection)
    if (refreshedToken) response = await createEvent(refreshedToken, appointment)
  }
  if (!response.ok) return NextResponse.json({ error: 'Google Calendar rejected the event.' }, { status: 502 })
  return NextResponse.json({ ok: true, event: await response.json() })
}
