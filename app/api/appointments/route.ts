import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAvailableSlots, lagosDateKey } from '@/lib/appointments/booking-rules'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
  const body = await request.json().catch(() => null) as { petId?: string; appointmentType?: string; startsAt?: string; notes?: string } | null
  if (!body?.appointmentType || !body.startsAt) return NextResponse.json({ error: 'Appointment type and time are required.' }, { status: 400 })
  const startsAt = new Date(body.startsAt)
  if (Number.isNaN(startsAt.getTime()) || startsAt <= new Date()) return NextResponse.json({ error: 'Choose a future date and time.' }, { status: 400 })
  const date = lagosDateKey(startsAt)
  const { data: existing, error: readError } = await supabase.from('appointments').select('id,starts_at,status').eq('user_id', user.id).neq('status', 'cancelled').gte('starts_at', new Date(`${date}T00:00:00+01:00`).toISOString()).lt('starts_at', new Date(`${date}T23:59:59+01:00`).toISOString())
  if (readError) return NextResponse.json({ error: 'Unable to verify availability.' }, { status: 500 })
  if (!getAvailableSlots(date, existing ?? []).includes(startsAt.toISOString())) return NextResponse.json({ error: 'This time is no longer available, please choose another.' }, { status: 409 })
  const { error } = await supabase.from('appointments').insert({ user_id: user.id, pet_id: body.petId || null, appointment_type: body.appointmentType, starts_at: startsAt.toISOString(), status: 'pending', notes: body.notes || null })
  if (error) return NextResponse.json({ error: 'Unable to save appointment.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
