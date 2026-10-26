import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { googleCalendarConnections } from '@/lib/db/schema'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const cookieStore = await cookies()
  if (!code || !state || state !== cookieStore.get('google_oauth_state')?.value) return NextResponse.redirect(new URL('/settings?calendar=error', request.url))
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.redirect(new URL('/sign-in', request.url))
  const clientId = process.env.GOOGLE_CLIENT_ID || '545512968755-vuncsev9lm0e5me82fv3856omijjceaa.apps.googleusercontent.com'
  const redirectUri = process.env.GOOGLE_REDIRECT_URI ?? `${url.origin}/api/google/calendar/callback`
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code, client_id: clientId, client_secret: process.env.API_KEY ?? '', redirect_uri: redirectUri, grant_type: 'authorization_code' }) })
  if (!tokenResponse.ok) return NextResponse.redirect(new URL('/settings?calendar=error', request.url))
  const token = await tokenResponse.json() as { access_token?: string; refresh_token?: string }
  if (!token.access_token) return NextResponse.redirect(new URL('/settings?calendar=error', request.url))
  const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { authorization: `Bearer ${token.access_token}` } })
  const googleProfile = profileResponse.ok ? await profileResponse.json() as { email?: string } : {}
  await db.delete(googleCalendarConnections).where(eq(googleCalendarConnections.userId, session.user.id))
  await db.insert(googleCalendarConnections).values({ id: crypto.randomUUID(), userId: session.user.id, googleUserEmail: googleProfile.email ?? null, accessToken: token.access_token, refreshToken: token.refresh_token ?? null, updatedAt: new Date() })
  const response = NextResponse.redirect(new URL('/settings?calendar=connected', request.url))
  response.cookies.delete('google_oauth_state')
  return response
}
