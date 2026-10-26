import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await db.select({ enabled: user.emailRemindersEnabled }).from(user).where(eq(user.id, session.user.id)).limit(1)
  return NextResponse.json({ enabled: rows[0]?.enabled ?? true })
}
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null) as { enabled?: boolean } | null
  if (typeof body?.enabled !== 'boolean') return NextResponse.json({ error: 'enabled must be boolean' }, { status: 400 })
  await db.update(user).set({ emailRemindersEnabled: body.enabled }).where(eq(user.id, session.user.id))
  return NextResponse.json({ enabled: body.enabled })
}
