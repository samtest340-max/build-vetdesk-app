import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('id, role').eq('id', user.id).single()
  return profile?.role === 'admin' ? { supabase, user } : null
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { data, error } = await createAdminClient().from('profiles').select('id, full_name, role, verification_status, created_at').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'Could not load users' }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json() as { id?: string }
  if (!body.id) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  const { error } = await createAdminClient().auth.admin.deleteUser(body.id)
  if (error) return NextResponse.json({ error: 'Could not remove user' }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json() as { id?: string; role?: string; verification_status?: string }
  if (!body.id || (body.role && !['vet', 'admin'].includes(body.role)) || (body.verification_status && !['pending', 'approved', 'rejected'].includes(body.verification_status))) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  const updates = { ...(body.role ? { role: body.role } : {}), ...(body.verification_status ? { verification_status: body.verification_status } : {}), updated_at: new Date().toISOString() }
  const { error } = await createAdminClient().from('profiles').update(updates).eq('id', body.id)
  if (error) return NextResponse.json({ error: 'Could not update user' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
