import { Resend } from 'resend'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { emailLog } from '@/lib/db/schema'

const resend = new Resend(process.env.RESEND_API_KEY)
const from = process.env.EMAIL_FROM || 'VetDesk <onboarding@resend.dev>'

function layout(title: string, body: string, action?: { label: string; href: string }) {
  return `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a"><main style="max-width:600px;margin:0 auto;padding:24px"><section style="background:#fff;border-radius:20px;padding:32px"><p style="color:#2563eb;font-weight:800;font-size:20px;margin:0 0 24px">VetDesk</p><h1 style="font-size:24px;margin:0 0 16px">${title}</h1>${body}${action ? `<a href="${action.href}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:700;margin-top:20px">${action.label}</a>` : ''}<p style="border-top:1px solid #e2e8f0;margin-top:28px;padding-top:18px;color:#64748b;font-size:12px">This is an automated message. Please do not reply.</p></section></main></body></html>`
}

export async function sendTransactionalEmail(input: { to: string; subject: string; eventKey: string; userId: string; title: string; text: string; body: string; action?: { label: string; href: string } }) {
  try {
    const existing = await db.select({ id: emailLog.id }).from(emailLog).where(eq(emailLog.eventKey, input.eventKey)).limit(1)
    if (existing[0]) return { ok: true, duplicate: true }
    if (!process.env.RESEND_API_KEY) { console.error('[email] RESEND_API_KEY is missing'); return { ok: false } }
    const result = await resend.emails.send({ from, to: [input.to], subject: input.subject, html: layout(input.title, input.body, input.action), text: `${input.text}\n\nThis is an automated message. Please do not reply.` }, { idempotencyKey: input.eventKey })
    if (result.error) { console.error('[email] Failed to send', input.eventKey, result.error.message); return { ok: false } }
    await db.insert(emailLog).values({ id: crypto.randomUUID(), userId: input.userId, eventKey: input.eventKey, recipient: input.to, subject: input.subject })
    return { ok: true, id: result.data?.id }
  } catch (error) {
    console.error('[email] Non-blocking delivery failure', input.eventKey, error)
    return { ok: false }
  }
}
