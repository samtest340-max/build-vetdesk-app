'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, PawPrint, ShieldCheck } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

export default function AdminLoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const result = await authClient.signIn.email({
      email: String(form.get('email')),
      password: String(form.get('password')),
    })
    if (result.error) {
      setError('Invalid administrator email or password.')
      setLoading(false)
      return
    }
    const response = await fetch('/api/admin/users', { cache: 'no-store' })
    if (!response.ok) {
      await authClient.signOut()
      setError('This account does not have administrator access.')
      setLoading(false)
      return
    }
    router.replace('/admin')
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <form onSubmit={submit} className="flex w-full max-w-md flex-col gap-5 rounded-3xl bg-white p-8 shadow-xl">
        <Link href="/" className="mx-auto flex items-center gap-2 text-xl font-extrabold text-blue-950">
          <span className="flex size-10 items-center justify-center rounded-xl bg-blue-700 text-white"><PawPrint /></span>
          Vet<span className="text-blue-600">Desk</span>
        </Link>
        <div className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><ShieldCheck /></div>
          <h1 className="mt-4 text-2xl font-bold">Administrator sign in</h1>
          <p className="mt-2 text-sm text-slate-500">Manage sign-ups and workspace access.</p>
        </div>
        <label className="grid gap-2 text-sm font-medium">Email<input required type="email" name="email" className="h-11 rounded-xl border border-slate-200 px-4" /></label>
        <label className="grid gap-2 text-sm font-medium">Password<input required type="password" name="password" className="h-11 rounded-xl border border-slate-200 px-4" /></label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button disabled={loading} className="h-12 rounded-full bg-blue-700 font-semibold text-white disabled:opacity-60">{loading ? 'Checking access…' : 'Sign in as administrator'}</button>
        <Link href="/sign-in" className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-slate-500"><ArrowLeft /> Vet sign in</Link>
      </form>
    </main>
  )
}
