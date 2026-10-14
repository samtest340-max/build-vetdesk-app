import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { desc, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null
  const [account] = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1)
  return account?.role === 'admin' ? session.user : null
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const users = await db.select({ id: user.id, name: user.name, email: user.email, role: user.role, emailVerified: user.emailVerified, createdAt: user.createdAt }).from(user).orderBy(desc(user.createdAt))
  return NextResponse.json(users)
}

export async function PATCH(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json() as { id?: string; role?: string }
  if (!body.id || !['vet', 'admin'].includes(body.role ?? '')) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  await db.update(user).set({ role: body.role, updatedAt: new Date() }).where(eq(user.id, body.id))
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json() as { id?: string }
  if (!body.id) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  await db.delete(user).where(eq(user.id, body.id))
  return NextResponse.json({ ok: true })
}
