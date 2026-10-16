'use client'

import { useMemo } from 'react'
import { getAvailableSlots, isFullyBooked, formatLagosTime, lagosDateKey, type BookableAppointment } from '@/lib/appointments/booking-rules'

type AppointmentCalendarProps = { appointments: BookableAppointment[]; selectedDate?: string; onDateChange?: (date: string) => void; onSlotChange?: (slot: string) => void; showSlots?: boolean; minDate?: string }

function monthDays(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  return Array.from({ length: count }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1))
}

export function AppointmentCalendar({ appointments, selectedDate, onDateChange, onSlotChange, showSlots = true, minDate }: AppointmentCalendarProps) {
  const month = useMemo(() => selectedDate ? new Date(`${selectedDate}T12:00:00`) : new Date(), [selectedDate])
  const days = monthDays(month)
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
  const selectedSlots = selectedDate ? getAvailableSlots(selectedDate, appointments) : []
  return <div className="grid gap-4"><div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <span key={day}>{day}</span>)}</div><div className="grid grid-cols-7 gap-2">{Array.from({ length: firstDay }).map((_, index) => <span key={`empty-${index}`} />)}{days.map(day => { const key = lagosDateKey(day); const disabled = (minDate && key < minDate) || isFullyBooked(key, appointments); return <button type="button" key={key} disabled={Boolean(disabled)} title={disabled && !minDate ? 'Fully booked' : undefined} onClick={() => onDateChange?.(key)} className={`min-h-12 rounded-xl border p-2 text-sm transition ${selectedDate === key ? 'border-blue-700 bg-blue-700 text-white' : disabled ? 'cursor-not-allowed border-slate-200 bg-slate-200/70 text-slate-400' : 'border-slate-200 bg-white/80 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md'}`}>{day.getDate()}{disabled && !minDate && <small className="block text-[9px]">Full</small>}</button> })}</div>{showSlots && selectedDate && <div className="border-t pt-4"><p className="mb-3 text-sm font-bold">Available times · Africa/Lagos</p>{selectedSlots.length ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{selectedSlots.map(slot => <button type="button" key={slot} onClick={() => onSlotChange?.(slot)} className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-700 hover:text-white">{formatLagosTime(slot)}</button>)}</div> : <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">This day is fully booked. Please choose another date.</p>}</div>}</div>
}
