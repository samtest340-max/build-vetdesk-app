import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/sign-in', request.url))
  const state = crypto.randomUUID()
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID ?? '')
  url.searchParams.set('redirect_uri', process.env.GOOGLE_REDIRECT_URI ?? `${new URL('/api/google/calendar/callback', request.url)}`)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('access_type', 'offline')
  url.searchParams.set('prompt', 'consent')
  url.searchParams.set('scope', 'https://www.googleapis.com/auth/calendar.events')
  url.searchParams.set('state', state)
  const response = NextResponse.redirect(url)
  response.cookies.set('google_oauth_state', state, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600, path: '/' })
  return response
}

export async function DELETE(_request?: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { error } = await supabase.from('google_calendar_connections').delete().eq('user_id', user.id)
  if (error) return NextResponse.json({ error: 'Unable to disconnect calendar.' }, { status: 500 })
  await supabase.from('profiles').update({ google_calendar_connected: false }).eq('id', user.id)
  return NextResponse.json({ ok: true })
}

export async function POST(request: Request) {
  return DELETE(request)
}
