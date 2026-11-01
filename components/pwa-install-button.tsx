'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'

export function PwaInstallButton() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const [prompting, setPrompting] = useState(false)
  const [status, setStatus] = useState('')

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
    if (!prompt || prompting) {
      setUnavailable(!prompt)
      return
    }
    setUnavailable(false)
    setStatus('Choose Allow in the installation prompt to install VetDesk.')
    setPrompting(true)
    try {
      await prompt.prompt()
      const choice = await prompt.userChoice
      setStatus(choice.outcome === 'accepted' ? 'Installation approved. VetDesk is being installed.' : 'Installation cancelled.')
    } catch {
      setStatus('The installation prompt could not be opened. Please try again.')
    } finally {
      setPrompt(null)
      setPrompting(false)
    }
  }

  return <div className="flex flex-col items-end gap-1">
    <button type="button" onClick={() => void install()} disabled={prompting} className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-wait disabled:opacity-70"><Download data-icon="inline-start" />{prompting ? 'Waiting for approval' : 'Install app'}</button>
    {(unavailable || status) && <p className="max-w-56 text-right text-xs text-slate-600" role="status">{unavailable ? 'App installation is not available in this browser yet.' : status}</p>}
  </div>
}

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }
