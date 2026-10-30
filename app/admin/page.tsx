import { redirect } from 'next/navigation'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { AdminConsole } from '@/components/admin-console'

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/admin/login')

  const [account] = await db.select({ role: user.role }).from(user).where(and(eq(user.id, session.user.id), eq(user.role, 'admin'))).limit(1)
  if (!account) redirect('/admin/login')

  return <AdminConsole />
}
