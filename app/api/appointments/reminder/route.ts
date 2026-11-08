import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { and, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { appointments, pets } from '@/lib/db/schema'
import { sendTransactionalEmail } from '@/lib/email'

function emailFromNotes(notes: string | null) {
  return notes?.match(/(?:^|\n)Email:\s*([^\s\n]+)/i)?.[1] ?? null
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null) as { appointmentId?: string } | null
  if (!body?.appointmentId) return NextResponse.json({ error: 'Appointment is required.' }, { status: 400 })
  const rows = await db.select({ id: appointments.id, status: appointments.status, type: appointments.appointmentType, startsAt: appointments.startsAt, notes: appointments.notes, petName: pets.name }).from(appointments).leftJoin(pets, eq(appointments.petId, pets.id)).where(and(eq(appointments.id, body.appointmentId), eq(appointments.userId, session.user.id))).limit(1)
  const appointment = rows[0]
  if (!appointment || appointment.status !== 'approved') return NextResponse.json({ error: 'Only approved appointments can receive reminders.' }, { status: 400 })
  const recipient = emailFromNotes(appointment.notes)
  if (!recipient) return NextResponse.json({ error: 'No client email is attached to this appointment.' }, { status: 400 })
  const result = await sendTransactionalEmail({ to: recipient, userId: session.user.id, eventKey: `appointment-reminder/${appointment.id}/${Date.now()}`, subject: 'Appointment reminder', title: 'Appointment reminder', text: `Reminder: your ${appointment.type} appointment is scheduled for ${appointment.startsAt.toLocaleString()}.`, body: `<p>This is a reminder for your <strong>${appointment.type}</strong> appointment${appointment.petName ? ` for <strong>${appointment.petName}</strong>` : ''} on <strong>${appointment.startsAt.toLocaleString()}</strong>.</p>` })
  if (!result.ok) return NextResponse.json({ error: 'Unable to send the appointment reminder email.' }, { status: 502 })
  return NextResponse.json({ ok: true })
}
