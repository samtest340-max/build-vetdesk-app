export const APPOINTMENT_TIMEZONE = 'Africa/Lagos'
export const WORKDAY_START_MINUTES = 8 * 60
export const WORKDAY_END_MINUTES = 17 * 60 + 30
export const APPOINTMENT_DURATION_MINUTES = 30
export const APPOINTMENT_BUFFER_MINUTES = 10
export const BLOCKED_MINUTES = APPOINTMENT_DURATION_MINUTES + APPOINTMENT_BUFFER_MINUTES

export type BookableAppointment = { id?: string; starts_at: string; status?: string }
export type AvailabilitySlot = { day: string; start: string; end: string }

function dateKeyInLagos(value: Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: APPOINTMENT_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(value)
}

export function lagosDateKey(value = new Date()) {
  return dateKeyInLagos(value)
}

export function lagosDateTimeToIso(dateKey: string, minutes: number) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, Math.floor(minutes / 60) - 1, minutes % 60)).toISOString()
}

export function lagosLocalInputToIso(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value)
  if (!match) return null
  const [, year, month, day, hour, minute] = match.map(Number)
  return new Date(Date.UTC(year, month - 1, day, hour - 1, minute)).toISOString()
}

export function minutesInLagos(value: string) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: APPOINTMENT_TIMEZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(value))
  return Number(parts.find(part => part.type === 'hour')?.value) * 60 + Number(parts.find(part => part.type === 'minute')?.value)
}

export function getAvailableSlots(date: string, appointments: BookableAppointment[], now = new Date(), availability?: AvailabilitySlot[]) {
  const dayName = new Intl.DateTimeFormat('en-US', { timeZone: APPOINTMENT_TIMEZONE, weekday: 'long' }).format(new Date(`${date}T12:00:00`))
  const configuredSlots = availability?.filter(slot => slot.day === dayName) ?? []
  if (availability && configuredSlots.length === 0) return []
  const windows = configuredSlots.length ? configuredSlots : [{ start: `${String(Math.floor(WORKDAY_START_MINUTES / 60)).padStart(2, '0')}:${WORKDAY_START_MINUTES % 60}` , end: `${String(Math.floor(WORKDAY_END_MINUTES / 60)).padStart(2, '0')}:${WORKDAY_END_MINUTES % 60}` }]
  const dayAppointments = appointments.filter(item => item.status !== 'cancelled' && dateKeyInLagos(new Date(item.starts_at)) === date)
  const slots: string[] = []
  for (const window of windows) {
    const [startHour, startMinute] = window.start.split(':').map(Number)
    const [endHour, endMinute] = window.end.split(':').map(Number)
    const windowStart = startHour * 60 + startMinute
    const windowEnd = endHour * 60 + endMinute
    for (let minutes = windowStart; minutes <= windowEnd - APPOINTMENT_DURATION_MINUTES; minutes += BLOCKED_MINUTES) {
    const startsAt = lagosDateTimeToIso(date, minutes)
    const start = new Date(startsAt)
    if (start <= now) continue
    const conflicts = dayAppointments.some(item => Math.abs(new Date(item.starts_at).getTime() - start.getTime()) < BLOCKED_MINUTES * 60_000)
    if (!conflicts) slots.push(startsAt)
    }
  }
  return slots
}

export function isFullyBooked(date: string, appointments: BookableAppointment[], now = new Date(), availability?: AvailabilitySlot[]) {
  return getAvailableSlots(date, appointments, now, availability).length === 0
}

export function formatLagosTime(value: string) {
  return new Intl.DateTimeFormat('en-NG', { timeZone: APPOINTMENT_TIMEZONE, hour: 'numeric', minute: '2-digit' }).format(new Date(value))
}

export function formatLagosDate(value: string) {
  return new Intl.DateTimeFormat('en-NG', { timeZone: APPOINTMENT_TIMEZONE, weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(value))
}

export function validateBooking(date: string, startsAt: string, appointments: BookableAppointment[], ignoreId?: string, availability?: AvailabilitySlot[]) {
  const available = getAvailableSlots(date, appointments.filter(item => item.id !== ignoreId), new Date(), availability)
  return available.includes(new Date(startsAt).toISOString())
}

export function todayInLagos() {
  return dateKeyInLagos(new Date())
}
