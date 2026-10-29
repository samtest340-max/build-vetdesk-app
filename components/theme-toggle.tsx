'use client'

import { useEffect, useState } from 'react'
import { Laptop, Moon, Sun } from 'lucide-react'

type ThemeMode = 'system' | 'light' | 'dark'

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('system')

  useEffect(() => {
    const saved = window.localStorage.getItem('vetdesk-theme') as ThemeMode | null
    const next = saved === 'light' || saved === 'dark' ? saved : 'system'
    setMode(next)
    applyTheme(next)
  }, [])

  function changeTheme(next: ThemeMode) {
    setMode(next)
    if (next === 'system') window.localStorage.removeItem('vetdesk-theme')
    else window.localStorage.setItem('vetdesk-theme', next)
    applyTheme(next)
  }

  const nextMode: ThemeMode = mode === 'system' ? 'dark' : mode === 'dark' ? 'light' : 'system'
  const Icon = mode === 'system' ? Laptop : mode === 'dark' ? Moon : Sun
  return <button type="button" onClick={() => changeTheme(nextMode)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" aria-label={`Theme: ${mode}. Switch to ${nextMode}`} title={`Theme: ${mode}`}><Icon className="size-4" /><span className="hidden sm:inline">{mode}</span></button>
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement
  root.classList.toggle('dark', mode === 'dark')
  root.classList.toggle('light', mode === 'light')
}
