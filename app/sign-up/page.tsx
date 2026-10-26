'use client'

import { FormEvent, useState } from 'react'
import { ArrowRight, PawPrint, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export default function SignUpPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (loading) return; setLoading(true); setError('')
    const data = new FormData(event.currentTarget)
    try {
      const result = await authClient.signUp.email({ name: String(data.get('name')), email: String(data.get('email')), password: String(data.get('password')) })
      if (result.error) setError('We could not create your account. Check your details and try again.')
      else { void fetch('/api/email/welcome', { method: 'POST' }); await router.push('/onboarding'); router.refresh() }
    } catch { setError('Unable to reach the sign-up service. Please try again.') }
    finally { setLoading(false) }
  }
  return <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-950"><div className="mx-auto max-w-5xl"><Link href="/" className="flex items-center gap-2 font-extrabold text-blue-950"><span className="flex size-10 items-center justify-center rounded-xl bg-blue-700 text-white"><PawPrint /></span>Vet<span className="text-blue-600">Desk</span></Link><div className="mt-10 grid overflow-hidden rounded-3xl bg-white shadow-xl lg:grid-cols-[.9fr_1.1fr]"><section className="bg-blue-700 p-8 text-white lg:p-12"><p className="text-sm font-bold uppercase tracking-widest text-blue-200">Start with confidence</p><h1 className="mt-4 text-4xl font-extrabold tracking-tight">Your calmer practice starts here.</h1><p className="mt-5 leading-7 text-blue-100">Create your account, submit your veterinary details, and get your clinic workspace ready in minutes.</p><div className="mt-10 flex items-center gap-3 text-sm"><ShieldCheck className="text-blue-200" /> Your information is reviewed securely.</div></section><form onSubmit={submit} className="flex flex-col gap-5 p-8 lg:p-12"><div><h2 className="text-2xl font-bold">Welcome back</h2><p className="mt-2 text-sm text-slate-500">Create your VetDesk account with your work email to continue.</p></div><label className="grid gap-2 text-sm font-medium">Full name<input required name="name" className="h-11 rounded-xl border border-slate-200 px-4 outline-none focus:border-blue-600" placeholder="Dr. Adaeze Okafor" /></label><label className="grid gap-2 text-sm font-medium">Email address<input required type="email" name="email" className="h-11 rounded-xl border border-slate-200 px-4 outline-none focus:border-blue-600" placeholder="you@clinic.com" /></label><label className="grid gap-2 text-sm font-medium">Password<input required minLength={8} type="password" name="password" className="h-11 rounded-xl border border-slate-200 px-4 outline-none focus:border-blue-600" placeholder="At least 8 characters" /></label>{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={loading} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-blue-700 font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{loading ? 'Creating account…' : 'Create account'} <ArrowRight /></button><p className="text-center text-sm text-slate-500">Already have an account? <Link href="/sign-in" className="font-semibold text-blue-700">Sign in</Link></p></form></div></div></main>
}
