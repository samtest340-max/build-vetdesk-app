'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'

export function PwaInstallButton() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
    setInstalled(standalone)
    const onInstallPrompt = (event: Event) => {
      event.preventDefault()
      setPrompt(event as BeforeInstallPromptEvent)
    }
    const onInstalled = () => { setInstalled(true); setPrompt(null) }
    window.addEventListener('beforeinstallprompt', onInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)
    if ('serviceWorker' in navigator) void navigator.serviceWorker.register('/sw.js')
    return () => { window.removeEventListener('beforeinstallprompt', onInstallPrompt); window.removeEventListener('appinstalled', onInstalled) }
  }, [])

  if (installed) return null

  async function install() {
    if (!prompt) { window.alert('Use your browser menu to install VetDesk when the install option is available.'); return }
    await prompt.prompt()
    await prompt.userChoice
    setPrompt(null)
  }

  return <button type="button" onClick={() => void install()} className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><Download data-icon="inline-start" />Install app</button>
}

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }
