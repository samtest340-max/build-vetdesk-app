'use client'

import { useState } from 'react'
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  FileText,
  HeartPulse,
  Menu,
  MessageCircle,
  Moon,
  PawPrint,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  Users,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const features = [
  { icon: CalendarDays, title: 'A calendar that works for you', text: 'See every appointment, manage availability, and keep your day moving without the admin headache.', tone: 'blue' },
  { icon: FileText, title: 'Records made simple', text: 'Keep complete pet histories, SOAP notes, prescriptions, and vaccination cards in one secure place.', tone: 'orange' },
  { icon: MessageCircle, title: 'Bookings that convert', text: 'Share a beautiful booking link. Pet owners can book in minutes without creating an account.', tone: 'blue' },
  { icon: Bell, title: 'Fewer missed appointments', text: 'Automatic WhatsApp, SMS, email, and push reminders keep everyone in the loop.', tone: 'orange' },
]

const faqs = [
  ['Do pet owners need an account?', 'No. Owners can book directly from your personal clinic link with just their contact details and pet information.'],
  ['Is VetDesk built for Nigerian clinics?', 'Yes. VetDesk is designed around how clinics in Nigeria work, with local pricing in naira and flexible communication options.'],
  ['Can I add my team?', 'Clinic plans include staff accounts with permissions, shared schedules, and a complete view of your practice.'],
  ['Can I try it before paying?', 'Absolutely. Start free and upgrade when your practice is ready for more patients, staff, and automation.'],
]

export default function Page() {
  const [dark, setDark] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div className={dark ? 'dark min-h-screen bg-slate-950 text-white' : 'min-h-screen bg-white text-slate-950'}>
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:h-20 lg:px-8">
          <a href="#top" className="flex items-center gap-2.5 font-bold tracking-tight" aria-label="VetDesk home">
            <span className="flex size-9 items-center justify-center rounded-xl bg-blue-700 text-white shadow-lg shadow-blue-700/20"><PawPrint /></span>
            <span className="text-xl">Vet<span className="text-orange-500">Desk</span></span>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
            <a href="#features" className="transition hover:text-blue-700">Features</a><a href="#how-it-works" className="transition hover:text-blue-700">How it works</a><a href="#pricing" className="transition hover:text-blue-700">Pricing</a><a href="#faq" className="transition hover:text-blue-700">FAQ</a>
          </nav>
          <div className="hidden items-center gap-3 md:flex"><button onClick={() => setDark(!dark)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Toggle dark mode">{dark ? <Sun /> : <Moon />}</button><Button variant="ghost">Log in</Button><Button className="bg-orange-500 text-white hover:bg-orange-600">Get started <ArrowRight data-icon="inline-end" /></Button></div>
          <button className="rounded-lg p-2 md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</button>
        </div>
        {menuOpen && <div className="border-t border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-950 md:hidden"><nav className="flex flex-col gap-4 text-sm font-medium"><a href="#features" onClick={() => setMenuOpen(false)}>Features</a><a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a><a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a><Button className="bg-orange-500 text-white">Get started</Button></nav></div>}
      </header>

      <main id="top">
        <section className="relative overflow-hidden bg-blue-50/70 dark:bg-slate-900"><div className="absolute -right-32 -top-40 size-[30rem] rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-950/50" /><div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-24">
          <div className="relative"><div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm dark:border-blue-900 dark:bg-slate-900 dark:text-blue-300"><Sparkles className="size-3.5" /> Built for modern veterinary teams</div><h1 className="max-w-2xl text-5xl font-bold leading-[1.05] tracking-[-0.04em] text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">Run your vet practice.<br /><span className="text-blue-700 dark:text-blue-400">Fill your calendar.</span></h1><p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">VetDesk brings bookings, patient records, reminders, and payments together—so you can spend less time on admin and more time caring for animals.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button size="lg" className="h-12 bg-orange-500 px-6 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600">Start for free <ArrowRight data-icon="inline-end" /></Button><Button size="lg" variant="outline" className="h-12 border-slate-300 bg-white px-6 dark:bg-slate-900">See how it works</Button></div><div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500"><span className="flex items-center gap-1.5"><Check className="size-4 text-blue-600" /> No credit card</span><span className="flex items-center gap-1.5"><Check className="size-4 text-blue-600" /> Set up in minutes</span><span className="flex items-center gap-1.5"><Check className="size-4 text-blue-600" /> Made for Nigeria</span></div></div>
          <div className="relative mx-auto w-full max-w-md"><div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-blue-600/20 to-orange-400/20 blur-2xl" /><div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl shadow-blue-900/10 dark:border-slate-700 dark:bg-slate-900"><div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800"><div><p className="text-xs text-slate-500">Tuesday, 14 October</p><h3 className="font-semibold">Good morning, Dr. Amina</h3></div><div className="flex size-10 items-center justify-center rounded-full bg-orange-100 text-orange-600"><HeartPulse /></div></div><div className="grid grid-cols-3 gap-2 py-4"><div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-950/50"><p className="text-xs text-slate-500">Today</p><p className="mt-1 text-xl font-bold text-blue-700">12</p><p className="text-[11px] text-slate-500">appointments</p></div><div className="rounded-xl bg-orange-50 p-3 dark:bg-orange-950/30"><p className="text-xs text-slate-500">Pending</p><p className="mt-1 text-xl font-bold text-orange-600">4</p><p className="text-[11px] text-slate-500">bookings</p></div><div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><p className="text-xs text-slate-500">Revenue</p><p className="mt-1 text-xl font-bold">₦86k</p><p className="text-[11px] text-slate-500">today</p></div></div><div className="flex items-center justify-between pb-3"><h4 className="text-sm font-semibold">Upcoming appointments</h4><span className="text-xs font-medium text-blue-700">View calendar</span></div>{[['09:30','Luna · Vaccination','Confirmed','blue'],['10:15','Max · Consultation','Pending','orange'],['11:00','Bella · Follow-up','Confirmed','blue']].map(([time, name, status, tone]) => <div key={time} className="flex items-center gap-3 border-t border-slate-100 py-3 dark:border-slate-800"><span className="w-10 text-xs font-medium text-slate-500">{time}</span><span className={`size-2 rounded-full ${tone === 'blue' ? 'bg-blue-600' : 'bg-orange-500'}`} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{name}</p><p className="text-xs text-slate-500">Lekki Clinic</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${tone === 'blue' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300'}`}>{status}</span></div>)}</div></div>
        </div></section>

        <section className="border-b border-slate-100 bg-white py-10 dark:border-slate-800 dark:bg-slate-950"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-5 text-sm font-medium text-slate-400 lg:justify-between lg:px-8"><span>TRUSTED BY PRACTICES IN</span><span>LAGOS</span><span>ABUJA</span><span>PORT HARCOURT</span><span>IBADAN</span><span>KANO</span></div></section>

        <section id="features" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28"><div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-widest text-orange-500">Everything in one place</p><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">The calm behind a great practice.</h2><p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">The tools you need to look after your patients and run a healthier business.</p></div><div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{features.map(({ icon: Icon, title, text, tone }) => <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"><div className={`flex size-11 items-center justify-center rounded-xl ${tone === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-300'}`}><Icon /></div><h3 className="mt-5 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{text}</p></div>)}</div></section>

        <section id="how-it-works" className="bg-slate-50 py-20 dark:bg-slate-900/60 lg:py-28"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="text-center"><p className="text-sm font-bold uppercase tracking-widest text-orange-500">Simple by design</p><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">From first click to happy patient.</h2></div><div className="mt-14 grid gap-8 md:grid-cols-3">{[['01','Create your clinic','Set up your services, availability, and team in a few simple steps.',Users],['02','Share your link','Send your personal booking link to clients on WhatsApp, Instagram, or your website.',Smartphone],['03','Care with confidence','Let VetDesk handle reminders and records while you focus on the animals.',ShieldCheck]].map(([num,title,text,Icon]) => <div key={num} className="relative text-center"><div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-blue-700 text-lg font-bold text-white shadow-lg shadow-blue-700/20">{num}</div><h3 className="mt-5 font-semibold">{title as string}</h3><p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-600 dark:text-slate-400">{text as string}</p></div>)}</div></div></section>

        <section id="pricing" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28"><div className="text-center"><p className="text-sm font-bold uppercase tracking-widest text-orange-500">Pricing that grows with you</p><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Start small. Go further.</h2></div><div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2"><div className="rounded-2xl border border-slate-200 p-7 dark:border-slate-800"><p className="font-semibold">Free</p><p className="mt-3 text-4xl font-bold">₦0 <span className="text-sm font-normal text-slate-500">forever</span></p><p className="mt-3 text-sm text-slate-600 dark:text-slate-400">For solo vets getting started.</p><ul className="mt-6 grid gap-3 text-sm"><li className="flex gap-2"><Check className="size-4 text-blue-600" /> 30 appointments / month</li><li className="flex gap-2"><Check className="size-4 text-blue-600" /> Booking link</li><li className="flex gap-2"><Check className="size-4 text-blue-600" /> Basic pet records</li></ul><Button variant="outline" className="mt-8 w-full">Get started free</Button></div><div className="relative rounded-2xl border-2 border-blue-700 bg-blue-50/60 p-7 dark:bg-blue-950/30"><span className="absolute -top-3 right-6 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">Most popular</span><p className="font-semibold text-blue-700 dark:text-blue-300">Clinic</p><p className="mt-3 text-4xl font-bold">₦15,000 <span className="text-sm font-normal text-slate-500">/ month</span></p><p className="mt-3 text-sm text-slate-600 dark:text-slate-400">For growing teams and busy clinics.</p><ul className="mt-6 grid gap-3 text-sm"><li className="flex gap-2"><Check className="size-4 text-blue-600" /> Unlimited appointments</li><li className="flex gap-2"><Check className="size-4 text-blue-600" /> Team accounts & permissions</li><li className="flex gap-2"><Check className="size-4 text-blue-600" /> WhatsApp & SMS reminders</li></ul><Button className="mt-8 w-full bg-orange-500 text-white hover:bg-orange-600">Start clinic trial</Button></div></div></section>

        <section id="faq" className="bg-blue-700 py-20 text-white lg:py-24"><div className="mx-auto grid max-w-5xl gap-12 px-5 md:grid-cols-[.8fr_1.2fr] lg:px-8"><div><p className="text-sm font-bold uppercase tracking-widest text-orange-300">Questions, answered</p><h2 className="mt-3 text-3xl font-bold tracking-tight">Everything you need to know.</h2><p className="mt-4 text-blue-100">Still curious? We&apos;re one message away.</p><Button variant="secondary" className="mt-6">Talk to us <ArrowRight data-icon="inline-end" /></Button></div><div className="divide-y divide-blue-500 rounded-2xl border border-blue-500 bg-blue-600/30 px-5">{faqs.map(([question, answer], index) => <div key={question} className="py-5"><button className="flex w-full items-center justify-between gap-4 text-left font-semibold" onClick={() => setOpenFaq(openFaq === index ? null : index)}>{question}<ChevronDown className={`shrink-0 transition ${openFaq === index ? 'rotate-180' : ''}`} /></button>{openFaq === index && <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">{answer}</p>}</div>)}</div></div></section>
      </main>
      <footer className="bg-slate-950 py-10 text-slate-400"><div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 lg:flex-row lg:items-center lg:justify-between lg:px-8"><div><div className="flex items-center gap-2 font-bold text-white"><span className="flex size-8 items-center justify-center rounded-lg bg-blue-700"><PawPrint /></span>Vet<span className="text-orange-500">Desk</span></div><p className="mt-3 text-sm">Better care. Better practice.</p></div><div className="flex flex-wrap gap-5 text-sm"><a href="#features" className="hover:text-white">Features</a><a href="#pricing" className="hover:text-white">Pricing</a><a href="#faq" className="hover:text-white">FAQ</a><a href="#" className="hover:text-white">Privacy</a><span>© 2026 VetDesk</span></div></div></footer>
    </div>
  )
}
