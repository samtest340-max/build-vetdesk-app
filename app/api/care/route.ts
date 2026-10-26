import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { careSchedules, pets } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
async function currentUser() { const session = await auth.api.getSession({ headers: await headers() }); return session?.user ?? null }
export async function GET() { const current = await currentUser(); if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); const [items, patients] = await Promise.all([db.select().from(careSchedules).where(eq(careSchedules.userId, current.id)).orderBy(desc(careSchedules.scheduledFor)), db.select({ id: pets.id, name: pets.name }).from(pets).where(eq(pets.userId, current.id)).orderBy(pets.name)]); return NextResponse.json({ items, patients }) }
export async function POST(request: Request) { const current = await currentUser(); if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); const body = await request.json().catch(() => null); if (!body?.title || !body?.scheduledFor) return NextResponse.json({ error: 'Title and date are required.' }, { status: 400 }); const row = { id: crypto.randomUUID(), userId: current.id, petId: body.petId || null, kind: String(body.kind || 'follow_up'), title: String(body.title), scheduledFor: new Date(body.scheduledFor), notes: body.notes ? String(body.notes) : null, status: 'planned' }; const saved = await db.insert(careSchedules).values(row).returning(); return NextResponse.json(saved[0], { status: 201 }) }
