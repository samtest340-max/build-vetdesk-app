'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, ShieldCheck, Trash2, Users } from 'lucide-react'

type Account = { id: string; name: string; email: string; role: string; emailVerified: boolean; createdAt: string }

export default function AdminPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    const response = await fetch('/api/admin/users', { cache: 'no-store' })
    if (!response.ok) { setError('This workspace is restricted to administrators.'); setLoading(false); return }
    setAccounts(await response.json()); setLoading(false)
  }
  useEffect(() => { void load() }, [])

  async function setRole(id: string, role: string) {
    await fetch('/api/admin/users', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, role }) })
    await load()
  }
  async function remove(id: string) {
    if (!window.confirm('Remove this account?')) return
    await fetch('/api/admin/users', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) })
    await load()
  }

  return <main className="min-h-screen bg-slate-50 text-slate-950"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"><ArrowLeft /> Back to dashboard</Link><div className="flex items-center gap-2 text-blue-700"><ShieldCheck /> <span className="font-bold">Admin console</span></div></div></header><div className="mx-auto max-w-6xl px-5 py-10"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-widest text-blue-700">Administration</p><h1 className="mt-2 text-4xl font-extrabold">Manage users</h1><p className="mt-2 text-slate-500">Review new sign-ups and manage workspace access.</p></div><div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4"><Users className="text-blue-700" /><p className="mt-2 text-2xl font-extrabold">{accounts.length}</p><p className="text-sm text-slate-600">Total accounts</p></div></div>{error ? <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">{error}</div> : <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-6 py-5"><h2 className="font-bold">Registered users</h2></div>{loading ? <p className="p-6 text-slate-500">Loading accounts…</p> : <div className="divide-y divide-slate-100">{accounts.map(account => <div key={account.id} className="flex flex-wrap items-center gap-4 px-6 py-5"><div className="flex size-11 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">{account.name.slice(0, 2).toUpperCase()}</div><div className="min-w-48 flex-1"><p className="font-bold">{account.name}</p><p className="text-sm text-slate-500">{account.email}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${account.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}`}>{account.role}</span>{account.emailVerified && <CheckCircle2 className="text-emerald-600" aria-label="Verified email" />}<select aria-label={`Role for ${account.email}`} value={account.role} onChange={event => void setRole(account.id, event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm"><option value="vet">Vet</option><option value="admin">Admin</option></select><button onClick={() => void remove(account.id)} className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-700" aria-label={`Remove ${account.email}`}><Trash2 /></button></div>)}</div>}</section>}</div></main>
}
