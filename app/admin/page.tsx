'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Users } from 'lucide-react'

type Account = { id: string; name: string; email: string; role: string; verificationStatus?: string | null; createdAt: string }
type Feedback = { id: string; subject: string; details: string; status: string; createdAt: string; userName?: string | null }

export default function AdminPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [error, setError] = useState('')
  const router = useRouter()
  async function load() { const response = await fetch('/api/admin/users', { cache: 'no-store' }); if (!response.ok) { router.replace('/admin/login'); return } setAccounts(await response.json()); const feedbackResponse = await fetch('/api/admin/feedback', { cache: 'no-store' }); if (feedbackResponse.ok) setFeedback(await feedbackResponse.json()) }
  useEffect(() => { void load() }, [])
  async function updateFeedback(id: string, status: string) { const response = await fetch('/api/admin/feedback', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, status }) }); if (!response.ok) setError('Unable to update request.'); else await load() }
  return <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,#dbeafe,transparent_35%),#f4f7fb] p-5 text-slate-950 lg:p-10"><div className="mx-auto max-w-6xl"><Link href="/sign-in" className="inline-flex items-center gap-2 text-sm font-bold text-blue-700"><ArrowLeft /> Back to dashboard</Link><header className="mt-8 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Administration</p><h1 className="mt-2 text-4xl font-extrabold">Admin console</h1><p className="mt-2 text-slate-500">Manage accounts and review product feedback.</p></div><div className="glass-card px-5 py-4"><Users className="text-blue-700" /><p className="mt-2 text-2xl font-extrabold">{accounts.length}</p><p className="text-sm text-slate-600">Total accounts</p></div></header>{error && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}<section className="glass-card mt-8 overflow-hidden"><div className="border-b border-slate-200/70 px-6 py-5"><h2 className="font-bold">Registered users</h2></div><div className="divide-y divide-slate-100">{accounts.map(account => <div key={account.id} className="flex flex-wrap items-center gap-4 px-6 py-5"><div className="flex size-11 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">{account.name.slice(0, 2).toUpperCase()}</div><div className="flex-1"><p className="font-bold">{account.name}</p><p className="text-sm text-slate-500">{account.role} · {(account.verificationStatus ?? 'pending')}</p></div></div>)}</div></section><section className="glass-card mt-8 p-6"><div className="flex items-center gap-3"><ShieldCheck className="text-blue-700" /><h2 className="text-lg font-extrabold">Feature requests</h2></div>{feedback.length ? <div className="mt-5 grid gap-3">{feedback.map(item => <article key={item.id} className="rounded-2xl border border-white/70 bg-white/70 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">{item.subject}</h3><p className="text-xs text-slate-500">From {item.userName || 'VetDesk user'} · {new Date(item.createdAt).toLocaleDateString()}</p></div><select value={item.status} onChange={event => void updateFeedback(item.id, event.target.value)} className="field w-auto py-2 text-xs"><option value="new">New</option><option value="reviewing">Reviewing</option><option value="completed">Completed</option></select></div><p className="mt-3 text-sm text-slate-600">{item.details}</p></article>)}</div> : <p className="mt-5 text-sm text-slate-500">No feature requests yet.</p>}</section></div></main>
}
