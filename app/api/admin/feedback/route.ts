import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { desc, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { feedbackRequests, user } from '@/lib/db/schema'

async function adminUser() { const session = await auth.api.getSession({ headers: await headers() }); if (!session?.user) return null; const rows = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1); return rows[0]?.role === 'admin' ? session.user : null }
export async function GET() { if (!await adminUser()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); const rows = await db.select({ id: feedbackRequests.id, userId: feedbackRequests.userId, subject: feedbackRequests.subject, details: feedbackRequests.details, status: feedbackRequests.status, createdAt: feedbackRequests.createdAt, userName: user.name }).from(feedbackRequests).leftJoin(user, eq(feedbackRequests.userId, user.id)).orderBy(desc(feedbackRequests.createdAt)); return NextResponse.json(rows) }
export async function PATCH(request: Request) { if (!await adminUser()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); const body = await request.json() as { id?: string; status?: string }; if (!body.id || !['new', 'reviewing', 'completed'].includes(body.status ?? '')) return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); await db.update(feedbackRequests).set({ status: body.status }).where(eq(feedbackRequests.id, body.id)); return NextResponse.json({ ok: true }) }
export const dynamic = 'force-dynamic'
