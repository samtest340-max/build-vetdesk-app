import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function isAdmin() { const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return false; const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single(); return data?.role === 'admin' }
export async function GET() { if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); const { data, error } = await createAdminClient().from('feedback_requests').select('id,user_id,subject,details,status,created_at,profiles:user_id(full_name)').order('created_at', { ascending: false }); if (error) return NextResponse.json({ error: 'Unable to load feedback' }, { status: 500 }); return NextResponse.json(data) }
export async function PATCH(request: Request) { if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); const body = await request.json() as { id?: string; status?: string }; if (!body.id || !['new', 'reviewing', 'completed'].includes(body.status ?? '')) return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); const { error } = await createAdminClient().from('feedback_requests').update({ status: body.status }).eq('id', body.id); if (error) return NextResponse.json({ error: 'Unable to update feedback' }, { status: 500 }); return NextResponse.json({ ok: true }) }
export const dynamic = 'force-dynamic'
