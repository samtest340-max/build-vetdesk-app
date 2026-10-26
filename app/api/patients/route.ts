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
  if (!body?.name || !body?.species || !body?.ownerName) return NextResponse.json({ error: 'Name, species, and owner name are required.' }, { status: 400 })
  const row = { id: crypto.randomUUID(), userId: current.id, name: String(body.name), species: String(body.species), breed: body.breed ? String(body.breed) : null, ownerName: String(body.ownerName), weight: body.weight ? String(body.weight) : null }
  await db.insert(pets).values(row)
  return NextResponse.json(row, { status: 201 })
}

export async function PATCH(request: Request) {
  const current = await currentUser()
  if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null)
  if (!body?.id) return NextResponse.json({ error: 'Patient id is required.' }, { status: 400 })
  const result = await db.update(pets).set({ name: String(body.name), species: String(body.species), breed: body.breed ? String(body.breed) : null, ownerName: String(body.ownerName), weight: body.weight ? String(body.weight) : null }).where(and(eq(pets.id, String(body.id)), eq(pets.userId, current.id))).returning()
  return result[0] ? NextResponse.json(result[0]) : NextResponse.json({ error: 'Patient not found.' }, { status: 404 })
}
