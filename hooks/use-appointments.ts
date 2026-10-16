'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { BookableAppointment } from '@/lib/appointments/booking-rules'

export function useAppointments(userId?: string) {
  const supabase = useMemo(() => createClient(), [])
  const [appointments, setAppointments] = useState<BookableAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const load = useCallback(async () => { if (!userId) return; const { data } = await supabase.from('appointments').select('id,starts_at,status').eq('user_id', userId).order('starts_at'); setAppointments((data ?? []) as BookableAppointment[]); setLoading(false) }, [supabase, userId])
  useEffect(() => { void load(); if (!userId) return; const channel = supabase.channel(`appointments-${userId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `user_id=eq.${userId}` }, () => void load()).subscribe(); return () => { void supabase.removeChannel(channel) } }, [load, supabase, userId])
  return { appointments, loading, refresh: load }
}
