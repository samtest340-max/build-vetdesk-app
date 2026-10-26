import { NextResponse } from 'next/server'
import { eq, and, ne, gte, lt } from 'drizzle-orm'
import { db } from '@/lib/db'
import { appointments, pets, services, user, vetProfiles } from '@/lib/db/schema'
import { lagosDateKey, validateBooking } from '@/lib/appointments/booking-rules'
import { sendTransactionalEmail } from '@/lib/email'

const defaultServices = [
  { id: 'consultation', name: 'Consultation', fee: 2000 },
  { id: 'vaccination', name: 'Vaccination', fee: 2000 },
  { id: 'follow-up', name: 'Follow-up visit', fee: 1500 },
]

export async function GET(_request: Request, context: { params: Promise<{ userId: string }> }) {
  const { userId: rawUserId } = await context.params
  const ownerById = await db.select({ id: user.id, name: user.name, email: user.email, publicSlug: user.publicSlug }).from(user).where(eq(user.id, rawUserId)).limit(1)
  const ownerBySlug = ownerById[0] ? ownerById : await db.select({ id: user.id, name: user.name, email: user.email, publicSlug: user.publicSlug }).from(user).where(eq(user.publicSlug, rawUserId)).limit(1)
  const userId = ownerBySlug[0]?.id || rawUserId
  const [owner, profile, serviceRows] = await Promise.all([
    ownerBySlug,
    db.select({ fullName: vetProfiles.fullName, clinicName: vetProfiles.clinicName, specialization: vetProfiles.specialization, profilePhotoUrl: vetProfiles.profilePhotoUrl }).from(vetProfiles).where(eq(vetProfiles.userId, userId)).limit(1),
    db.select().from(services).where(eq(services.userId, userId)).orderBy(services.name),
  ])
  if (!owner[0]) return NextResponse.json({ error: 'Booking page not found.' }, { status: 404 })
  const upcoming = await db.select({ id: appointments.id, startsAt: appointments.startsAt, status: appointments.status }).from(appointments).where(and(eq(appointments.userId, userId), ne(appointments.status, 'cancelled'), gte(appointments.startsAt, new Date())))
  return NextResponse.json({ profile: { full_name: profile[0]?.fullName || owner[0].name, clinic_name: profile[0]?.clinicName || null, specialization: profile[0]?.specialization || null, profile_photo_url: profile[0]?.profilePhotoUrl || null }, blockedSlots: upcoming.map(item => ({ id: item.id, starts_at: item.startsAt.toISOString(), status: item.status })), services: serviceRows.length ? serviceRows : defaultServices })
}

export async function POST(request: Request, context: { params: Promise<{ userId: string }> }) {
  const { userId: rawUserId } = await context.params
  const body = await request.json().catch(() => null) as { appointmentType?: string; startsAt?: string; name?: string; email?: string; phone?: string; petName?: string; species?: string; breed?: string; weight?: string; notes?: string } | null
  if (!body?.appointmentType || !body.startsAt || !body.name || !body.email) return NextResponse.json({ error: 'Name, email, appointment type and date are required.' }, { status: 400 })
  const owner = await db.select({ id: user.id, email: user.email, name: user.name }).from(user).where(eq(user.id, rawUserId)).limit(1)
  const ownerBySlug = owner[0] ? owner : await db.select({ id: user.id, email: user.email, name: user.name }).from(user).where(eq(user.publicSlug, rawUserId)).limit(1)
  const userId = ownerBySlug[0]?.id
  if (!userId || !ownerBySlug[0]) return NextResponse.json({ error: 'Booking page not found.' }, { status: 404 })
  const startsAt = new Date(body.startsAt)
  if (Number.isNaN(startsAt.getTime()) || startsAt <= new Date()) return NextResponse.json({ error: 'Choose a future date and time.' }, { status: 400 })
  const dateKey = lagosDateKey(startsAt)
  const existing = await db.select({ id: appointments.id, startsAt: appointments.startsAt, status: appointments.status }).from(appointments).where(and(eq(appointments.userId, userId), ne(appointments.status, 'cancelled'), gte(appointments.startsAt, new Date(`${dateKey}T00:00:00+01:00`)), lt(appointments.startsAt, new Date(`${dateKey}T23:59:59+01:00`))))
  if (!validateBooking(dateKey, startsAt.toISOString(), existing.map(item => ({ id: item.id, starts_at: item.startsAt.toISOString(), status: item.status })))) return NextResponse.json({ error: 'This time is no longer available, please choose another.' }, { status: 409 })
  const petId = crypto.randomUUID()
  await db.insert(pets).values({ id: petId, userId, name: String(body.petName || `${body.name}'s booking`), species: String(body.species || 'Pending profile'), breed: body.breed ? String(body.breed) : null, ownerName: body.name, weight: body.weight ? String(body.weight) : null, notes: JSON.stringify({ pending: true, ownerEmail: body.email, ownerPhone: body.phone || null }) })
  const appointmentId = crypto.randomUUID()
  await db.insert(appointments).values({ id: appointmentId, userId, petId, appointmentType: body.appointmentType, startsAt, status: 'pending', notes: [`Client: ${body.name}`, `Email: ${body.email}`, body.phone ? `Phone: ${body.phone}` : '', body.notes ? `Notes: ${body.notes}` : ''].filter(Boolean).join('\n') })
  void sendTransactionalEmail({ to: ownerBySlug[0].email, userId, eventKey: `appointment-created/${appointmentId}`, subject: 'New appointment request', title: 'New appointment request', text: `${body.name} requested a ${body.appointmentType} appointment.`, body: `<p><strong>${body.name}</strong> requested a <strong>${body.appointmentType}</strong> appointment for ${startsAt.toLocaleString()}.</p>`, action: { label: 'View appointments', href: `${process.env.BETTER_AUTH_URL || process.env.V0_RUNTIME_URL || ''}/appointments` } })
  void sendTransactionalEmail({ to: body.email, userId, eventKey: `appointment-confirmation/${appointmentId}`, subject: 'Appointment request received', title: 'Booking request received', text: `Your appointment request with ${ownerBySlug[0].name} was received.`, body: `<p>Your request with <strong>${ownerBySlug[0].name}</strong> was received and is pending confirmation.</p>` })
  return NextResponse.json({ ok: true })
}

export async function OPTIONS() { return new NextResponse(null, { status: 204 }) }
export const dynamic = 'force-dynamic'
