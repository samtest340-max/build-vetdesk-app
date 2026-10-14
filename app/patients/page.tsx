'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { PawPrint, Plus, Search, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Patient = { id: string; name: string; species: string; breed: string | null; owner_name: string; weight: string | null }

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Patient | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function loadPatients() {
    const supabase = createClient()
    const { data, error } = await supabase.from('pets').select('id,name,species,breed,owner_name,weight').order('created_at', { ascending: false })
    if (error) setNotice({ type: 'error', text: 'Unable to load patient records.' })
    else { setPatients(data ?? []); setSelected(current => current ?? data?.[0] ?? null) }
  }

  useEffect(() => { void loadPatients() }, [])

  const filtered = useMemo(() => patients.filter(patient => Object.values(patient).join(' ').toLowerCase().includes(query.toLowerCase())), [patients, query])

  async function addPatient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setNotice({ type: 'error', text: 'Your session has expired. Please sign in again.' }); return }
    const { error } = await supabase.from('pets').insert({ user_id: user.id, name: String(form.get('name')), species: String(form.get('species')), breed: String(form.get('breed') || '') || null, owner_name: String(form.get('owner_name')), weight: String(form.get('weight') || '') || null })
    if (error) setNotice({ type: 'error', text: 'Unable to save this patient.' })
    else { setShowForm(false); event.currentTarget.reset(); setNotice({ type: 'success', text: 'Patient saved successfully.' }); await loadPatients() }
  }

  return <main className="min-h-screen bg-slate-50 text-slate-950">
    <header className="border-b border-slate-200 bg-white px-5 py-5 lg:px-10"><Link href="/dashboard" className="text-sm font-semibold text-blue-700">← Dashboard</Link><div className="mt-2 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-extrabold">Patients</h1><p className="mt-1 text-sm text-slate-500">Patient records saved to your practice.</p></div><button type="button" onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white"><Plus />Add patient</button></div></header>
    <div className="mx-auto grid max-w-6xl gap-6 p-5 lg:grid-cols-[0.9fr_1.5fr] lg:p-10"><section className="rounded-2xl border border-slate-200 bg-white p-5"><label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm text-slate-500"><Search /><input value={query} onChange={event => setQuery(event.target.value)} className="min-w-0 flex-1 outline-none" placeholder="Search patients or owners" /></label><div className="mt-4 grid gap-2">{filtered.map(patient => <button key={patient.id} type="button" onClick={() => setSelected(patient)} className={`flex items-center gap-3 rounded-xl p-3 text-left ${selected?.id === patient.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}><span className="flex size-11 items-center justify-center rounded-full bg-blue-100 text-blue-700"><PawPrint /></span><span className="flex-1"><strong className="block">{patient.name}</strong><span className="text-xs text-slate-500">{patient.species} · {patient.owner_name}</span></span></button>)}{!filtered.length && <p className="py-8 text-center text-sm text-slate-500">No patient records found.</p>}</div></section><section className="rounded-2xl border border-slate-200 bg-white p-6">{selected ? <><h2 className="text-2xl font-extrabold">{selected.name}</h2><p className="mt-1 text-sm text-slate-500">{selected.species}{selected.breed ? ` · ${selected.breed}` : ''}</p><div className="mt-6 grid gap-3 sm:grid-cols-2"><Info label="Owner" value={selected.owner_name} /><Info label="Weight" value={selected.weight || 'Not recorded'} /><Info label="Species" value={selected.species} /><Info label="Breed" value={selected.breed || 'Not recorded'} /></div></> : <div className="grid min-h-64 place-items-center text-sm text-slate-500">Add a patient to begin.</div>}</section></div>
    {notice && <div role="status" className={`fixed bottom-5 right-5 z-50 rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>{notice.text}<button type="button" aria-label="Dismiss notification" onClick={() => setNotice(null)} className="ml-4">×</button></div>}
    {showForm && <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/40 p-5"><form onSubmit={addPatient} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-xl font-extrabold">Add patient</h2><button type="button" aria-label="Close" onClick={() => setShowForm(false)}><X /></button></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field name="name" label="Patient name" required /><Field name="species" label="Species" required /><Field name="breed" label="Breed" /><Field name="owner_name" label="Owner name" required /><Field name="weight" label="Weight" /></div><button className="mt-6 w-full rounded-xl bg-blue-700 py-3 font-semibold text-white">Save patient</button></form></div>}
  </main>
}
function Field({ name, label, required }: { name: string; label: string; required?: boolean }) { return <label className="grid gap-2 text-sm font-semibold">{label}<input name={name} required={required} className="h-11 rounded-xl border border-slate-200 px-3 font-normal" /></label> }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-sm font-bold">{value}</p></div> }
