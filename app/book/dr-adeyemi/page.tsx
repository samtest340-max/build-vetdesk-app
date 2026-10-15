import { redirect } from 'next/navigation'

export default function LegacyBookingPage() {
  redirect('/')
}

export const dynamic = 'force-dynamic'
