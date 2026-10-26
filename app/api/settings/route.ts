import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { clinics, user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

async function currentUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user ?? null
}

export async function GET() {
  const current = await currentUser()
  if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const clinic = await db.select().from(clinics).where(eq(clinics.ownerId, current.id)).limit(1)
  return NextResponse.json({ clinic: clinic[0] ?? null, remindersEnabled: true })
}

export async function PUT(request: Request) {
  const current = await currentUser()
  if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null)
  if (!body?.name || !body?.address || !body?.state || !body?.lga) return NextResponse.json({ error: 'Complete all practice details.' }, { status: 400 })
  const existing = await db.select({ id: clinics.id }).from(clinics).where(eq(clinics.ownerId, current.id)).limit(1)
  const values = { name: String(body.name), address: String(body.address), state: String(body.state), lga: String(body.lga) }
  const clinic = existing[0] ? await db.update(clinics).set(values).where(eq(clinics.id, existing[0].id)).returning() : await db.insert(clinics).values({ id: crypto.randomUUID(), ownerId: current.id, ...values }).returning()
  return NextResponse.json({ clinic: clinic[0] })
}
