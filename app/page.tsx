'use client'

import { useState } from 'react'
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  FileText,
  Menu,
  Moon,
  PawPrint,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const features = [
  { icon: CalendarDays, title: 'Online Appointments', text: 'Let pet owners book and manage appointments with ease.' },
  { icon: PawPrint, title: 'Patient Records', text: 'Keep complete medical histories, notes, and treatment plans.' },
  { icon: Bell, title: 'Calendar & Reminders', text: 'Never miss an appointment or follow-up again.' },
  { icon: ShieldCheck, title: 'Secure & Reliable', text: 'Your data is protected with industry-standard security.' },
]

const faqs = [
  ['Do pet owners need an account?', 'No. Owners can book directly from your clinic link with their contact and pet details.'],
  ['Is VetDesk built for Nigeria?', 'Yes. VetDesk is designed around how veterinary practices in Nigeria work.'],
  ['Can I add my team?', 'Clinic plans include staff accounts, permissions, and shared schedules.'],
]

export default function Page() {
  const [dark, setDark] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const navItems = [['Features', '#features'], ['Pricing', '#pricing'], ['About', '#about'], ['FAQs', '#faq']]

  return (
    <div className={dark ? 'dark min-h-screen bg-slate-950 text-white' : 'min-h-screen bg-white text-slate-950'}>
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
          <a href="#top" className="flex items-center gap-2.5" aria-label="VetDesk home">
            <span className="flex size-10 items-center justify-center rounded-xl bg-blue-700 text-white"><PawPrint /></span>
            <span className="text-[25px] font-extrabold tracking-[-0.05em] text-blue-950 dark:text-white">Vet<span className="text-blue-600">Desk</span><span className="mt-1 block text-[9px] font-medium tracking-[0.16em] text-slate-500">Manage · Care · Grow</span></span>
          </a>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            {navItems.map(([label, href]) => <a key={label} href={href} className="text-sm font-medium text-slate-700 transition hover:text-blue-700 dark:text-slate-300">{label}</a>)}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <button onClick={() => setDark(!dark)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Toggle dark mode">{dark ? <Sun /> : <Moon />}</button>
<a href="/sign-in" className="px-3 text-sm font-medium text-slate-700 dark:text-slate-300">Log in</a>
  <a href="/sign-up" className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-blue-700 px-5 text-sm font-medium text-white hover:bg-blue-800">Get Started Free <ArrowRight data-icon="inline-end" /></a>
          </div>
          <button className="rounded-lg p-2 md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</button>
        </div>
        {menuOpen && <nav className="flex flex-col gap-4 border-t border-slate-200 bg-white px-5 py-5 dark:border-slate-800 dark:bg-slate-950 md:hidden">{navItems.map(([label, href]) => <a key={label} href={href} onClick={() => setMenuOpen(false)} className="font-medium">{label}</a>)}<a href="/sign-in" onClick={() => setMenuOpen(false)} className="font-medium">Log in</a><a href="/sign-up" onClick={() => setMenuOpen(false)} className="font-medium text-blue-700">Get Started Free</a></nav>}
      </header>

      <main id="top">
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-sky-100 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
          <div className="absolute -right-32 top-10 size-96 rounded-full bg-blue-200/50 blur-3xl dark:bg-blue-900/30" />
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[1fr_1fr] lg:px-8 lg:py-24">
            <div className="relative z-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-xs font-semibold text-blue-700 shadow-sm dark:border-blue-800 dark:bg-slate-900"><span className="flex size-5 items-center justify-center rounded bg-emerald-600 text-[10px] font-bold text-white">NG</span> Built for Veterinary Professionals in Nigeria</div>
              <h1 className="max-w-2xl text-5xl font-extrabold leading-[1.05] tracking-[-0.06em] text-blue-950 dark:text-white sm:text-6xl lg:text-[72px]">Manage Your Time,<br />Patients &amp; Practice<br /><span className="text-blue-600">— All in One Place.</span></h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">VetDesk helps veterinarians handle appointments, patient records, and daily tasks effortlessly so you can focus on what matters — healthier pets and happier communities.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row"><a href="/sign-up" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-blue-700 px-7 text-sm font-medium text-white shadow-lg shadow-blue-700/20 hover:bg-blue-800">Get Started Free <ArrowRight data-icon="inline-end" /></a><a href="#features" className="inline-flex h-12 items-center justify-center rounded-full border border-blue-200 bg-white/70 px-7 text-sm font-medium hover:bg-white dark:bg-slate-900">Explore Features</a></div>
              <div className="mt-5 flex flex-wrap gap-5 text-sm text-slate-500"><span>No credit card required</span><span>•</span><span>Setup in minutes</span></div>
            </div>
            <div className="relative mx-auto w-full max-w-[540px]">
              <div className="absolute -inset-5 rounded-[3rem] bg-blue-300/30 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white bg-white p-5 shadow-2xl shadow-blue-900/20 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800"><div><p className="text-xs text-slate-500">Wednesday, 24 April</p><h3 className="mt-1 text-lg font-bold">Appointments</h3></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">View all →</span></div>
                <div className="mt-5 grid grid-cols-7 gap-1 text-center text-[11px] text-slate-500">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => <div key={day}><span>{day}</span><span className={`mt-2 flex size-8 items-center justify-center rounded-full font-semibold ${i === 3 ? 'bg-blue-700 text-white' : 'text-slate-700 dark:text-slate-300'}`}>{21 + i}</span></div>)}</div>
                <div className="mt-5 grid gap-3">{[['09:00 AM','Bella (Dog) · Vaccination','bg-blue-50'],['10:30 AM','Max (Cat) · Check-up','bg-sky-50'],['12:00 PM','Lucky (Dog) · Follow-up','bg-blue-50'],['02:30 PM','Daisy (Goat) · Consultation','bg-sky-50']].map(([time, name, tone]) => <div key={time} className={`flex items-center gap-3 rounded-xl p-3 text-sm dark:bg-slate-800 ${tone}`}><span className="w-16 text-xs font-medium text-blue-700 dark:text-blue-300">{time}</span><span className="flex size-8 items-center justify-center rounded-full bg-white text-lg shadow-sm"><PawPrint className="size-4 text-blue-700" /></span><span className="font-medium text-slate-700 dark:text-slate-200">{name}</span></div>)}</div>
                <div className="mt-5 rounded-2xl bg-blue-700 p-4 text-white"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-full bg-white/20"><PawPrint /></span><div><p className="font-semibold">Patient Record</p><p className="text-xs text-blue-100">Bella · Golden Retriever · 2 years</p></div></div><div className="mt-4 flex justify-between border-t border-white/20 pt-3 text-xs"><span>Last visit<br /><b>Apr 10, 2025</b></span><span>Next appointment<br /><b>Apr 24 · 10:30 AM</b></span></div></div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-white py-20 dark:bg-slate-950 lg:py-28"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-widest text-blue-600">Everything you need</p><h2 className="mt-3 text-4xl font-extrabold tracking-[-0.04em] text-blue-950 dark:text-white">Powerful Tools for a<br />Smoother Veterinary Practice</h2><p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">From appointment booking to patient records, VetDesk keeps you organized, efficient and focused on your patients.</p></div><div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{features.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"><div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950"><Icon /></div><h3 className="mt-5 font-bold text-blue-950 dark:text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{text}</p></article>)}</div></div></section>

        <section id="about" className="bg-slate-50 py-20 dark:bg-slate-900 lg:py-28"><div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:px-8"><div className="rounded-[2rem] bg-blue-700 p-8 text-white shadow-xl"><Sparkles className="size-10 text-blue-200" /><p className="mt-12 text-sm font-bold uppercase tracking-widest text-blue-200">Why VetDesk?</p><h2 className="mt-3 text-4xl font-extrabold tracking-tight">More Time for What Matters Most.</h2><p className="mt-5 leading-7 text-blue-100">A calmer, clearer way to manage every part of your practice — designed with veterinary professionals in Nigeria.</p></div><div><ul className="grid gap-5">{['Save hours with streamlined workflows','Reduce no-shows with automated reminders','Access records anytime, anywhere','Designed specifically for veterinary practices in Nigeria'].map(item => <li key={item} className="flex items-center gap-4 text-lg text-slate-700 dark:text-slate-200"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-700 text-white"><Check /></span>{item}</li>)}</ul></div></div></section>

        <section id="pricing" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28"><div className="mx-auto max-w-2xl text-center"><p className="text-sm font-bold uppercase tracking-widest text-blue-600">Simple pricing</p><h2 className="mt-3 text-4xl font-extrabold tracking-tight text-blue-950 dark:text-white">Start managing better today.</h2><p className="mt-4 text-slate-600 dark:text-slate-300">No hidden fees. Start free and grow when your practice is ready.</p></div><div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2"><div className="rounded-3xl border border-slate-200 p-8 dark:border-slate-800"><h3 className="text-xl font-bold">Free</h3><p className="mt-3 text-4xl font-extrabold">₦0 <span className="text-sm font-normal text-slate-500">forever</span></p><p className="mt-3 text-slate-600 dark:text-slate-400">For solo vets getting started.</p><a href="/sign-up" className="mt-8 inline-flex h-9 w-full items-center justify-center rounded-full border border-slate-200 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Get started free</a></div><div className="rounded-3xl border-2 border-blue-700 bg-blue-50 p-8 dark:bg-blue-950/30"><div className="flex items-center justify-between"><h3 className="text-xl font-bold text-blue-700">Clinic</h3><span className="rounded-full bg-blue-700 px-3 py-1 text-xs font-bold text-white">Popular</span></div><p className="mt-3 text-4xl font-extrabold">₦2,000 <span className="text-sm font-normal text-slate-500">/ month</span></p><p className="mt-3 text-slate-600 dark:text-slate-400">For growing teams and busy clinics.</p><a href="/sign-up" className="mt-8 inline-flex h-9 w-full items-center justify-center gap-2 rounded-full bg-blue-700 text-sm font-medium text-white hover:bg-blue-800">Start your free trial <ArrowRight data-icon="inline-end" /></a></div></div></section>

        <section id="faq" className="bg-blue-700 py-20 text-white lg:py-24"><div className="mx-auto grid max-w-5xl gap-12 px-5 md:grid-cols-[.8fr_1.2fr] lg:px-8"><div><p className="text-sm font-bold uppercase tracking-widest text-blue-200">Questions, answered</p><h2 className="mt-3 text-4xl font-extrabold">Everything you need to know.</h2></div><div className="divide-y divide-blue-500 rounded-2xl border border-blue-500 bg-blue-600/30 px-5">{faqs.map(([question, answer], index) => <div key={question} className="py-5"><button className="flex w-full items-center justify-between gap-4 text-left font-semibold" onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index}>{question}<ChevronDown className={`shrink-0 transition ${openFaq === index ? 'rotate-180' : ''}`} /></button>{openFaq === index && <p className="mt-3 text-sm leading-6 text-blue-100">{answer}</p>}</div>)}</div></div></section>
      </main>

      <footer className="bg-slate-950 py-10 text-slate-400"><div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 lg:flex-row lg:items-center lg:justify-between lg:px-8"><a href="#top" className="flex items-center gap-2 font-bold text-white"><span className="flex size-8 items-center justify-center rounded-lg bg-blue-700"><PawPrint /></span>Vet<span className="text-blue-400">Desk</span></a><div className="flex flex-wrap gap-5 text-sm">{navItems.map(([label, href]) => <a key={label} href={href} className="hover:text-white">{label}</a>)}<a href="/privacy" className="hover:text-white">Privacy</a><a href="/terms" className="hover:text-white">Terms</a><span>© 2026 VetDesk</span></div></div></footer>
    </div>
  )
}
