'use client'

import { useEffect, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { PwaInstallButton } from '@/components/pwa-install-button'

export function InstallBanner() {
  const [hidden, setHidden] = useState(false)
  useEffect(() => { setHidden(window.localStorage.getItem('vetdesk-install-banner-hidden') === 'true') }, [])
  function toggle() {
    const next = !hidden
    setHidden(next)
    if (next) window.localStorage.setItem('vetdesk-install-banner-hidden', 'true')
    else window.localStorage.removeItem('vetdesk-install-banner-hidden')
  }
  if (hidden) return <button type="button" onClick={toggle} className="fixed right-4 top-3 z-[60] inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-white px-3 py-2 text-xs font-semibold text-teal-800 shadow-lg dark:border-teal-800 dark:bg-slate-900 dark:text-teal-200" aria-label="Show install app banner"><Eye className="size-4" />Show install banner</button>
  return <div className="install-banner flex min-h-16 items-center justify-end gap-3 border-b border-teal-100 bg-[#f0fdfa] px-4 py-3 dark:border-teal-900 dark:bg-slate-900 sm:gap-4 sm:px-6 lg:px-10"><div className="install-promo hidden items-center gap-3 sm:flex" aria-hidden="true"><span className="install-promo-dot" /><div><p className="text-sm font-extrabold text-blue-950 dark:text-white">Keep VetDesk close</p><p className="text-xs text-blue-700 dark:text-blue-300">Install once. Open your practice dashboard faster.</p></div><span className="install-promo-arrow">→</span></div><PwaInstallButton /><button type="button" onClick={toggle} className="rounded-lg p-2 text-teal-700 transition hover:bg-teal-100 dark:text-teal-300 dark:hover:bg-slate-800" aria-label="Hide install app banner" title="Hide install banner"><EyeOff className="size-4" /></button></div>
}
