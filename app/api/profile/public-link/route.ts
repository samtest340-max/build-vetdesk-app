import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'

function slugify(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const current = await db.select({ publicSlug: user.publicSlug }).from(user).where(eq(user.id, session.user.id)).limit(1)
  let slug = current[0]?.publicSlug
  if (!slug) { slug = `${slugify(session.user.name || 'vet')}-${session.user.id.slice(0, 8)}`; await db.update(user).set({ publicSlug: slug }).where(eq(user.id, session.user.id)) }
  return NextResponse.json({ slug, url: `/book/${slug}` })
}
