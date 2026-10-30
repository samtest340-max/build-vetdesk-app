'use client'

import { Laptop, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

const themes = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Laptop },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const activeTheme = theme ?? 'system'

  return <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-card p-1" role="group" aria-label="Color theme">
    {themes.map(({ value, label, icon: Icon }) => <button key={value} type="button" onClick={() => setTheme(value)} className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${activeTheme === value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`} aria-pressed={activeTheme === value} aria-label={`${label} theme`} title={`${label} theme`}><Icon className="size-3.5" /><span className="hidden sm:inline">{label}</span></button>)}
  </div>
}
