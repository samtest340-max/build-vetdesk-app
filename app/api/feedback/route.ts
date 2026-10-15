import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await supabase.from('feedback_requests').select('id,subject,details,status,created_at').eq('user_id', user.id).order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'Unable to load feedback' }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json() as { subject?: string; details?: string }
  if (!body.subject?.trim() || !body.details?.trim()) return NextResponse.json({ error: 'Subject and details are required' }, { status: 400 })
  const { data, error } = await supabase.from('feedback_requests').insert({ user_id: user.id, subject: body.subject.trim(), details: body.details.trim() }).select('id,subject,details,status,created_at').single()
  if (error) return NextResponse.json({ error: 'Unable to save feedback' }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json() as { id?: string; status?: string }
  if (!body.id || !['new', 'reviewing', 'completed'].includes(body.status ?? '')) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  const { error } = await createAdminClient().from('feedback_requests').update({ status: body.status }).eq('id', body.id)
  if (error) return NextResponse.json({ error: 'Unable to update feedback' }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Not supported' }, { status: 405 })
} 

export const dynamic = 'force-dynamic'
