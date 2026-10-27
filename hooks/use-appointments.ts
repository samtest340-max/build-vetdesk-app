'use client'

import { useCallback, useEffect, useState } from 'react'
import type { BookableAppointment } from '@/lib/appointments/booking-rules'

export function useAppointments(userId?: string) {
  const [appointments, setAppointments] = useState<BookableAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const load = useCallback(async () => {
    if (!userId) { setAppointments([]); setLoading(false); return }
    setLoading(true)
    const response = await fetch('/api/appointments', { cache: 'no-store' })
    setAppointments(response.ok ? await response.json() : [])
    setLoading(false)
  }, [userId])
  useEffect(() => { void load() }, [load])
  return { appointments, loading, refresh: load }
}
