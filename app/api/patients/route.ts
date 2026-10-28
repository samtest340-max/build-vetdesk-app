import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { pets } from '@/lib/db/schema'
import { and, desc, eq } from 'drizzle-orm'

async function currentUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user ?? null
}

export async function GET() {
  const current = await currentUser()
  if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await db.select().from(pets).where(eq(pets.userId, current.id)).orderBy(desc(pets.createdAt))
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  const current = await currentUser()
  if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null)
  if (!String(body?.name || '').trim() || !String(body?.species || '').trim() || !String(body?.ownerName || '').trim()) return NextResponse.json({ error: 'Name, species, and owner name are required.' }, { status: 400 })
  const row = { id: crypto.randomUUID(), userId: current.id, name: String(body.name).trim(), species: String(body.species).trim(), breed: body.breed ? String(body.breed).trim() : null, ownerName: String(body.ownerName).trim(), weight: body.weight ? String(body.weight).trim() : null, notes: body.notes ? String(body.notes) : null, diagnosis: body.diagnosis ? String(body.diagnosis) : null, treatmentPlan: body.treatmentPlan ? String(body.treatmentPlan) : null, visitNotes: body.visitNotes ? String(body.visitNotes) : null }
  await db.insert(pets).values(row)
  return NextResponse.json(row, { status: 201 })
}

export async function PATCH(request: Request) {
  const current = await currentUser()
  if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null)
  if (!body?.id) return NextResponse.json({ error: 'Patient id is required.' }, { status: 400 })
  const result = await db.update(pets).set({ name: String(body.name).trim(), species: String(body.species).trim(), breed: body.breed ? String(body.breed).trim() : null, ownerName: String(body.ownerName).trim(), weight: body.weight ? String(body.weight).trim() : null, notes: body.notes ? String(body.notes) : undefined, diagnosis: body.diagnosis ? String(body.diagnosis) : undefined, treatmentPlan: body.treatmentPlan ? String(body.treatmentPlan) : undefined, visitNotes: body.visitNotes ? String(body.visitNotes) : undefined }).where(and(eq(pets.id, String(body.id)), eq(pets.userId, current.id))).returning()
  return result[0] ? NextResponse.json(result[0]) : NextResponse.json({ error: 'Patient not found.' }, { status: 404 })
}
