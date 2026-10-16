import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { lagosDateKey, validateBooking } from '@/lib/appointments/booking-rules'

export async function GET(_request: Request, context: { params: Promise<{ userId: string }> }) {
  const { userId } = await context.params
  const admin = createAdminClient()
  const [{ data: profile, error: profileError }, { data: appointments, error: appointmentsError }] = await Promise.all([
    admin.from('profiles').select('id,full_name,clinic_name,specialization').eq('id', userId).maybeSingle(),
    admin.from('appointments').select('id,starts_at,status').eq('user_id', userId).neq('status', 'cancelled').gte('starts_at', new Date().toISOString()).order('starts_at'),
  ])
  if (profileError || !profile) return NextResponse.json({ error: 'Booking page not found.' }, { status: 404 })
  if (appointmentsError) return NextResponse.json({ error: 'Unable to load availability.' }, { status: 500 })
  return NextResponse.json({ profile, blockedSlots: appointments ?? [] })
}

export async function POST(request: Request, context: { params: Promise<{ userId: string }> }) {
  const { userId } = await context.params
  const body = await request.json().catch(() => null) as { appointmentType?: string; startsAt?: string; name?: string; email?: string; phone?: string; notes?: string } | null
  if (!body?.appointmentType || !body.startsAt || !body.name || !body.email) return NextResponse.json({ error: 'Name, email, appointment type and date are required.' }, { status: 400 })
  const startsAt = new Date(body.startsAt)
  if (Number.isNaN(startsAt.getTime()) || startsAt <= new Date()) return NextResponse.json({ error: 'Choose a future date and time.' }, { status: 400 })
  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('id').eq('id', userId).maybeSingle()
  if (!profile) return NextResponse.json({ error: 'Booking page not found.' }, { status: 404 })
  const dateKey = lagosDateKey(startsAt)
  const { data: existing, error: existingError } = await admin.from('appointments').select('id,starts_at,status').eq('user_id', userId).neq('status', 'cancelled').gte('starts_at', new Date(`${dateKey}T00:00:00Z`).toISOString()).lt('starts_at', new Date(`${dateKey}T23:59:59Z`).toISOString())
  if (existingError) return NextResponse.json({ error: 'Unable to verify availability.' }, { status: 500 })
  if (!validateBooking(dateKey, startsAt.toISOString(), existing ?? [])) return NextResponse.json({ error: 'This time is no longer available, please choose another.' }, { status: 409 })
  const notes = [`External booking: ${body.name}`, `Email: ${body.email}`, body.phone ? `Phone: ${body.phone}` : '', body.notes ? `Notes: ${body.notes}` : ''].filter(Boolean).join('\n')
  const { error } = await admin.from('appointments').insert({ user_id: userId, pet_id: null, appointment_type: body.appointmentType, starts_at: startsAt.toISOString(), status: 'pending', notes })
  if (error) return NextResponse.json({ error: 'Unable to submit booking.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function OPTIONS() { return new NextResponse(null, { status: 204 }) }

export const dynamic = 'force-dynamic'
