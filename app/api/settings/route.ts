import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { clinics, googleCalendarConnections } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

async function currentUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user ?? null
}

export async function GET() {
  const current = await currentUser()
  if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [clinic, calendar] = await Promise.all([db.select().from(clinics).where(eq(clinics.ownerId, current.id)).limit(1), db.select({ email: googleCalendarConnections.googleUserEmail }).from(googleCalendarConnections).where(eq(googleCalendarConnections.userId, current.id)).limit(1)])
  return NextResponse.json({ clinic: clinic[0] ?? null, calendarEmail: calendar[0]?.email ?? null, remindersEnabled: true })
}

export async function PUT(request: Request) {
  const current = await currentUser()
  if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null)
  if (!body?.name?.trim() || !body?.address?.trim() || !body?.state?.trim() || !body?.lga?.trim()) return NextResponse.json({ error: 'Complete all practice details.' }, { status: 400 })
  const existing = await db.select({ id: clinics.id }).from(clinics).where(eq(clinics.ownerId, current.id)).limit(1)
  const values = { name: String(body.name).trim(), address: String(body.address).trim(), state: String(body.state).trim(), lga: String(body.lga).trim() }
  const clinic = existing[0] ? await db.update(clinics).set(values).where(eq(clinics.id, existing[0].id)).returning() : await db.insert(clinics).values({ id: crypto.randomUUID(), ownerId: current.id, ...values }).returning()
  return NextResponse.json({ clinic: clinic[0] })
}
