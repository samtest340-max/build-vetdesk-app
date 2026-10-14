import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const cookieStore = await cookies()
  if (!code || !state || state !== cookieStore.get('google_oauth_state')?.value) return NextResponse.redirect(new URL('/settings?calendar=error', request.url))
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/sign-in', request.url))
  const redirectUri = process.env.GOOGLE_REDIRECT_URI ?? `${url.origin}/api/google/calendar/callback`
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID ?? '', client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '', redirect_uri: redirectUri, grant_type: 'authorization_code' }) })
  if (!tokenResponse.ok) return NextResponse.redirect(new URL('/settings?calendar=error', request.url))
  const token = await tokenResponse.json() as { access_token?: string; refresh_token?: string; expires_in?: number }
  if (!token.access_token || !token.refresh_token) return NextResponse.redirect(new URL('/settings?calendar=error', request.url))
  const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { authorization: `Bearer ${token.access_token}` } })
  const googleProfile = profileResponse.ok ? await profileResponse.json() as { email?: string } : {}
  const { error } = await supabase.from('google_calendar_connections').upsert({ user_id: user.id, google_user_email: googleProfile.email ?? null, access_token: token.access_token, refresh_token: token.refresh_token, expires_at: new Date(Date.now() + (token.expires_in ?? 3600) * 1000).toISOString(), updated_at: new Date().toISOString() })
  if (error) return NextResponse.redirect(new URL('/settings?calendar=error', request.url))
  await supabase.from('profiles').update({ google_calendar_connected: true }).eq('id', user.id)
  const response = NextResponse.redirect(new URL('/settings?calendar=connected', request.url))
  response.cookies.delete('google_oauth_state')
  return response
}
