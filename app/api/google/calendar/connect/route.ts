import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { googleCalendarConnections } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
async function currentUser() { const session = await auth.api.getSession({ headers: await headers() }); return session?.user ?? null }
export async function GET(request: Request) { const current = await currentUser(); if (!current) return NextResponse.redirect(new URL('/sign-in?next=/settings', request.url)); if (!process.env.GOOGLE_CLIENT_ID) return NextResponse.redirect(new URL('/settings?calendar=unavailable', request.url)); const state = crypto.randomUUID(); const url = new URL('https://accounts.google.com/o/oauth2/v2/auth'); url.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID); url.searchParams.set('redirect_uri', process.env.GOOGLE_REDIRECT_URI || new URL('/api/google/calendar/callback', request.url).toString()); url.searchParams.set('response_type', 'code'); url.searchParams.set('access_type', 'offline'); url.searchParams.set('prompt', 'consent'); url.searchParams.set('scope', 'https://www.googleapis.com/auth/calendar.events'); url.searchParams.set('state', state); const response = NextResponse.redirect(url); response.cookies.set('google_oauth_state', state, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600, path: '/' }); return response }
export async function DELETE() { const current = await currentUser(); if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); await db.delete(googleCalendarConnections).where(eq(googleCalendarConnections.userId, current.id)); return NextResponse.json({ ok: true }) }
