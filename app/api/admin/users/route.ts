import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { and, desc, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user, vetProfiles } from '@/lib/db/schema'

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null
  const rows = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1)
  return rows[0]?.role === 'admin' ? session.user : null
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const rows = await db.select({ id: user.id, name: user.name, email: user.email, role: user.role, verificationStatus: vetProfiles.verificationStatus, createdAt: user.createdAt }).from(user).leftJoin(vetProfiles, eq(user.id, vetProfiles.userId)).orderBy(desc(user.createdAt))
  return NextResponse.json(rows)
}

export async function DELETE(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json() as { id?: string }
  if (!body.id) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  await db.delete(user).where(eq(user.id, body.id))
  return NextResponse.json({ ok: true })
}

export async function PATCH(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json() as { id?: string; role?: string; verificationStatus?: string }
  if (!body.id || (body.role && !['vet', 'admin'].includes(body.role)) || (body.verificationStatus && !['pending', 'approved', 'rejected'].includes(body.verificationStatus))) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  if (body.role) await db.update(user).set({ role: body.role, updatedAt: new Date() }).where(eq(user.id, body.id))
  if (body.verificationStatus) await db.update(vetProfiles).set({ verificationStatus: body.verificationStatus, updatedAt: new Date() }).where(eq(vetProfiles.userId, body.id))
  return NextResponse.json({ ok: true })
}
