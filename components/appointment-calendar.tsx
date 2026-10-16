'use client'

import { useMemo, useState } from 'react'
import { getAvailableSlots, isFullyBooked, formatLagosTime, lagosDateKey, type BookableAppointment } from '@/lib/appointments/booking-rules'

type AppointmentCalendarProps = { appointments: BookableAppointment[]; selectedDate?: string; onDateChange?: (date: string) => void; onSlotChange?: (slot: string) => void; showSlots?: boolean; showBookedAppointments?: boolean; minDate?: string }

function monthDays(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  return Array.from({ length: count }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1))
}

export function AppointmentCalendar({ appointments, selectedDate, onDateChange, onSlotChange, showSlots = true, showBookedAppointments = false, minDate }: AppointmentCalendarProps) {
  const month = useMemo(() => selectedDate ? new Date(`${selectedDate}T12:00:00`) : new Date(), [selectedDate])
  const days = monthDays(month)
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
  const selectedSlots = selectedDate ? getAvailableSlots(selectedDate, appointments) : []
  const [dayAppointments, setDayAppointments] = useState<BookableAppointment[]>([])
  const [dayLabel, setDayLabel] = useState('')
  function selectDay(key: string, day: Date) { onDateChange?.(key); if (showBookedAppointments) { setDayAppointments(appointments.filter(item => item.status !== 'cancelled' && lagosDateKey(new Date(item.starts_at)) === key)); setDayLabel(new Intl.DateTimeFormat('en-NG', { dateStyle: 'full', timeZone: 'Africa/Lagos' }).format(day)) } }
  return <div className="grid gap-4"><div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <span key={day}>{day}</span>)}</div><div className="grid grid-cols-7 gap-2">{Array.from({ length: firstDay }).map((_, index) => <span key={`empty-${index}`} />)}{days.map(day => { const key = lagosDateKey(day); const past = Boolean(minDate && key < minDate); const hasBooked = appointments.some(item => item.status !== 'cancelled' && lagosDateKey(new Date(item.starts_at)) === key); const fullyBooked = isFullyBooked(key, appointments); const disabled = past; return <button type="button" key={key} disabled={disabled} title={hasBooked ? `${fullyBooked ? 'Fully booked' : 'Booked times exist'}` : undefined} onClick={() => selectDay(key, day)} className={`relative min-h-12 rounded-xl border p-2 text-sm transition ${selectedDate === key ? 'border-blue-700 bg-blue-700 text-white' : disabled ? 'cursor-not-allowed border-slate-200 bg-slate-200/70 text-slate-400' : 'border-slate-200 bg-white/80 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md'}`}>{day.getDate()}{hasBooked && !past && <span aria-label="Booked day" className={`absolute bottom-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full ${selectedDate === key ? 'bg-white' : 'bg-amber-500'}`} />}</button> })}</div>{showBookedAppointments && dayLabel && <div role="dialog" aria-label={`Appointments for ${dayLabel}`} className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4"><div className="flex items-center justify-between gap-3"><p className="font-bold">Appointments for {dayLabel}</p><button type="button" onClick={() => setDayLabel('')} className="rounded-lg border bg-white px-2 py-1 text-sm" aria-label="Close appointments">Close</button></div>{dayAppointments.length ? <div className="mt-3 grid gap-2">{dayAppointments.map(item => <div key={item.id ?? item.starts_at} className="rounded-xl bg-white p-3 text-sm"><p className="font-semibold">{formatLagosTime(item.starts_at)}</p><p className="text-slate-500">{item.status || 'Booked'}</p></div>)}</div> : <p className="mt-3 text-sm text-slate-600">No appointments booked for this day.</p>}</div>}{showSlots && selectedDate && <div className="border-t pt-4"><p className="mb-3 text-sm font-bold">Available times · Africa/Lagos</p>{selectedSlots.length ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{selectedSlots.map(slot => <button type="button" key={slot} onClick={() => onSlotChange?.(slot)} className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-700 hover:text-white">{formatLagosTime(slot)}</button>)}</div> : <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">This day is fully booked. Please choose another date.</p>}</div>}</div>
}
