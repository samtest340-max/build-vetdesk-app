import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { APPOINTMENT_DURATION_MINUTES, WORKDAY_END_MINUTES, WORKDAY_START_MINUTES, lagosDateKey, minutesInLagos } from '@/lib/appointments/booking-rules'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
  const body = await request.json().catch(() => null) as { petId?: string; appointmentType?: string; startsAt?: string; notes?: string } | null
  if (!body?.appointmentType || !body.startsAt) return NextResponse.json({ error: 'Appointment type and time are required.' }, { status: 400 })
  const startsAt = new Date(body.startsAt)
  if (Number.isNaN(startsAt.getTime()) || startsAt <= new Date()) return NextResponse.json({ error: 'Choose a future date and time.' }, { status: 400 })
  const { data: configuredServices, error: servicesError } = await supabase.from('services').select('name,fee').eq('user_id', user.id)
  if (servicesError) return NextResponse.json({ error: 'Unable to load service pricing.' }, { status: 500 })
  if (!configuredServices?.length) return NextResponse.json({ error: 'Add a service and price in Schedule before creating appointments.' }, { status: 409 })
  const selectedService = configuredServices.find(service => service.name === body.appointmentType)
  if (!selectedService) return NextResponse.json({ error: 'Choose a service from your Service pricing list.' }, { status: 400 })
  const date = lagosDateKey(startsAt)
  const { data: existing, error: readError } = await supabase.from('appointments').select('id,starts_at,status').eq('user_id', user.id).neq('status', 'cancelled').gte('starts_at', new Date(`${date}T00:00:00+01:00`).toISOString()).lt('starts_at', new Date(`${date}T24:00:00+01:00`).toISOString())
  if (readError) return NextResponse.json({ error: 'Unable to verify availability.' }, { status: 500 })
  const selectedMinutes = minutesInLagos(startsAt.toISOString())
  const isWithinWorkday = selectedMinutes >= WORKDAY_START_MINUTES && selectedMinutes <= WORKDAY_END_MINUTES - APPOINTMENT_DURATION_MINUTES
  const hasConflict = (existing ?? []).some(item => Math.abs(new Date(item.starts_at).getTime() - startsAt.getTime()) < APPOINTMENT_DURATION_MINUTES * 60_000)
  if (!isWithinWorkday) return NextResponse.json({ error: 'Choose a time between 8:00 AM and 5:00 PM.' }, { status: 400 })
  if (hasConflict) return NextResponse.json({ error: 'This time is no longer available, please choose another.' }, { status: 409 })
  const { error } = await supabase.from('appointments').insert({ user_id: user.id, pet_id: body.petId || null, appointment_type: body.appointmentType, starts_at: startsAt.toISOString(), fee: Number(selectedService.fee) || 0, status: 'pending', notes: body.notes || null })
  if (error) return NextResponse.json({ error: 'Unable to save appointment.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
