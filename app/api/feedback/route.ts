import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { feedbackRequests } from '@/lib/db/schema'
import { and, desc, eq } from 'drizzle-orm'
async function currentUser() { const session = await auth.api.getSession({ headers: await headers() }); return session?.user ?? null }
export async function GET() { const current = await currentUser(); if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); return NextResponse.json(await db.select().from(feedbackRequests).where(eq(feedbackRequests.userId, current.id)).orderBy(desc(feedbackRequests.createdAt))) }
export async function POST(request: Request) { const current = await currentUser(); if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); const body = await request.json().catch(() => null); if (!body?.subject?.trim() || !body?.details?.trim()) return NextResponse.json({ error: 'Subject and details are required.' }, { status: 400 }); const saved = await db.insert(feedbackRequests).values({ id: crypto.randomUUID(), userId: current.id, subject: String(body.subject).trim(), details: String(body.details).trim() }).returning(); return NextResponse.json(saved[0], { status: 201 }) }
export async function DELETE(request: Request) { const current = await currentUser(); if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); const body = await request.json().catch(() => null); await db.delete(feedbackRequests).where(and(eq(feedbackRequests.id, String(body?.id || '')), eq(feedbackRequests.userId, current.id))); return NextResponse.json({ ok: true }) }
