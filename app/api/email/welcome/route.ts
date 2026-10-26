import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { sendTransactionalEmail } from '@/lib/email'
import { headers } from 'next/headers'

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const result = await sendTransactionalEmail({ to: session.user.email, userId: session.user.id, subject: 'Welcome to VetDesk', eventKey: `welcome/${session.user.id}`, title: `Welcome, ${session.user.name}`, text: 'Your VetDesk workspace is ready.', body: '<p>Your VetDesk workspace is ready. You can now manage appointments, patients, and client bookings in one place.</p>', action: { label: 'Open dashboard', href: `${process.env.BETTER_AUTH_URL || process.env.V0_RUNTIME_URL || ''}/dashboard` } })
  return NextResponse.json({ ok: result.ok })
}
