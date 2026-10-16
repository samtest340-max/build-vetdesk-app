'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, MessageSquarePlus } from 'lucide-react'
import { DashboardSidebar } from '@/components/dashboard-sidebar'

type Feedback = { id: string; subject: string; details: string; status: string; created_at: string }

export default function FeedbackPage() {
  const [items, setItems] = useState<Feedback[]>([])
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  async function load() { const response = await fetch('/api/feedback', { cache: 'no-store' }); if (response.ok) setItems(await response.json()); setLoading(false) }
  useEffect(() => { void load() }, [])
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSubmitting(true); setNotice(''); const form = new FormData(event.currentTarget); const response = await fetch('/api/feedback', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ subject: form.get('subject'), details: form.get('details') }) }); if (!response.ok) { setNotice('Unable to submit request.'); setSubmitting(false); return } event.currentTarget.reset(); setNotice('Request submitted successfully.'); setSubmitting(false); await load() }
  return <><DashboardSidebar /><main className="lg:pl-64 min-h-screen bg-[radial-gradient(circle_at_top_right,#dbeafe,transparent_35%),#f4f7fb] p-5 text-slate-950 lg:p-10"><div className="mx-auto max-w-4xl"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-blue-700"><ArrowLeft /> Dashboard</Link><header className="mt-8"><p className="eyebrow">Product feedback</p><h1 className="mt-2 text-4xl font-extrabold">Request a feature</h1><p className="mt-2 text-slate-500">Tell the VetDesk team what would make your practice easier to run.</p></header><div className="mt-8 grid gap-6 lg:grid-cols-[.9fr_1.1fr]"><form onSubmit={submit} className="glass-card grid gap-4 p-6"><MessageSquarePlus className="text-blue-700" /><label className="grid gap-2 text-sm font-bold">Subject<input name="subject" required className="field" placeholder="What should we improve?" /></label><label className="grid gap-2 text-sm font-bold">Details<textarea name="details" required rows={6} className="field" placeholder="Describe the workflow or feature you need." /></label><button type="submit" disabled={submitting} className="button-primary justify-center disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'Submitting…' : 'Submit request'}</button>{notice && <p role="status" aria-live="polite" className={`rounded-xl px-3 py-2 text-sm font-semibold ${notice.includes('successfully') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{notice}</p>}</form><section className="glass-card p-6"><h2 className="text-lg font-extrabold">Your requests</h2>{loading ? <p className="mt-5 text-sm text-slate-500">Loading requests…</p> : items.length ? <div className="mt-5 grid gap-3">{items.map(item => <article key={item.id} className="rounded-2xl border border-white/70 bg-white/70 p-4"><div className="flex items-start justify-between gap-3"><h3 className="font-bold">{item.subject}</h3><span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700">{item.status}</span></div><p className="mt-2 text-sm text-slate-600">{item.details}</p></article>)}</div> : <p className="mt-5 rounded-2xl bg-white/60 p-6 text-sm text-slate-500">No feature requests yet.</p>}</section></div></div></main>
</>}
