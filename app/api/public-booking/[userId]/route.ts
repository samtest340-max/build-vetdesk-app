import { NextResponse } from 'next/server'
import { eq, and, ne, gte, lt } from 'drizzle-orm'
import { db } from '@/lib/db'
import { appointments, pets, user, vetProfiles } from '@/lib/db/schema'
import { lagosDateKey, validateBooking } from '@/lib/appointments/booking-rules'

const defaultServices = [
  { id: 'consultation', name: 'Consultation', fee: 2000 },
  { id: 'vaccination', name: 'Vaccination', fee: 2000 },
  { id: 'follow-up', name: 'Follow-up visit', fee: 1500 },
]

export async function GET(_request: Request, context: { params: Promise<{ userId: string }> }) {
  const { userId } = await context.params
  const [owner, profile] = await Promise.all([
    db.select({ id: user.id, name: user.name }).from(user).where(eq(user.id, userId)).limit(1),
    db.select({ fullName: vetProfiles.fullName, clinicName: vetProfiles.clinicName, specialization: vetProfiles.specialization, profilePhotoUrl: vetProfiles.profilePhotoUrl }).from(vetProfiles).where(eq(vetProfiles.userId, userId)).limit(1),
  ])
  if (!owner[0]) return NextResponse.json({ error: 'Booking page not found.' }, { status: 404 })
  const upcoming = await db.select({ id: appointments.id, startsAt: appointments.startsAt, status: appointments.status }).from(appointments).where(and(eq(appointments.userId, userId), ne(appointments.status, 'cancelled'), gte(appointments.startsAt, new Date())))
  return NextResponse.json({ profile: { full_name: profile[0]?.fullName || owner[0].name, clinic_name: profile[0]?.clinicName || null, specialization: profile[0]?.specialization || null, profile_photo_url: profile[0]?.profilePhotoUrl || null }, blockedSlots: upcoming.map(item => ({ id: item.id, starts_at: item.startsAt.toISOString(), status: item.status })), services: defaultServices })
}

export async function POST(request: Request, context: { params: Promise<{ userId: string }> }) {
  const { userId } = await context.params
  const body = await request.json().catch(() => null) as { appointmentType?: string; startsAt?: string; name?: string; email?: string; phone?: string; notes?: string } | null
  if (!body?.appointmentType || !body.startsAt || !body.name || !body.email) return NextResponse.json({ error: 'Name, email, appointment type and date are required.' }, { status: 400 })
  const owner = await db.select({ id: user.id }).from(user).where(eq(user.id, userId)).limit(1)
  if (!owner[0]) return NextResponse.json({ error: 'Booking page not found.' }, { status: 404 })
  const startsAt = new Date(body.startsAt)
  if (Number.isNaN(startsAt.getTime()) || startsAt <= new Date()) return NextResponse.json({ error: 'Choose a future date and time.' }, { status: 400 })
  const dateKey = lagosDateKey(startsAt)
  const existing = await db.select({ id: appointments.id, startsAt: appointments.startsAt, status: appointments.status }).from(appointments).where(and(eq(appointments.userId, userId), ne(appointments.status, 'cancelled'), gte(appointments.startsAt, new Date(`${dateKey}T00:00:00+01:00`)), lt(appointments.startsAt, new Date(`${dateKey}T23:59:59+01:00`))))
  if (!validateBooking(dateKey, startsAt.toISOString(), existing.map(item => ({ id: item.id, starts_at: item.startsAt.toISOString(), status: item.status })))) return NextResponse.json({ error: 'This time is no longer available, please choose another.' }, { status: 409 })
  const petId = crypto.randomUUID()
  await db.insert(pets).values({ id: petId, userId, name: `${body.name}'s booking`, species: 'Pending profile', breed: null, ownerName: body.name, weight: null })
  await db.insert(appointments).values({ id: crypto.randomUUID(), userId, petId, appointmentType: body.appointmentType, startsAt, status: 'pending', notes: [`Client: ${body.name}`, `Email: ${body.email}`, body.phone ? `Phone: ${body.phone}` : '', body.notes ? `Notes: ${body.notes}` : ''].filter(Boolean).join('\n') })
  return NextResponse.json({ ok: true })
}

export async function OPTIONS() { return new NextResponse(null, { status: 204 }) }
export const dynamic = 'force-dynamic'
