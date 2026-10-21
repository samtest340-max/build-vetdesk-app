'use client'

import { useEffect, useState } from 'react'
import { Cloud, CloudOff, RefreshCw } from 'lucide-react'

export function OfflineStatus() {
  const [online, setOnline] = useState(true)
  const [visible, setVisible] = useState(false)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | undefined
    const update = () => {
      setOnline(navigator.onLine)
      setVisible(true)
      if (hideTimer) clearTimeout(hideTimer)
      hideTimer = setTimeout(() => setVisible(false), 5000)
    }
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      if (hideTimer) clearTimeout(hideTimer)
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  async function syncNow() {
    setSyncing(true)
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      if ('sync' in registration) await (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register('vetdesk-sync')
      registration.active?.postMessage({ type: 'SYNC_NOW' })
    }
    setTimeout(() => setSyncing(false), 800)
  }

  if (!visible) return null
  return <div className={`flex items-center gap-2 px-4 py-2 text-xs font-bold ${online ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`} role="status" aria-live="polite"><span className="flex items-center gap-1.5">{online ? <Cloud className="size-3.5" /> : <CloudOff className="size-3.5" />}{online ? 'Online · changes sync automatically' : 'Offline · changes will sync when connected'}</span>{online && <button type="button" onClick={() => void syncNow()} className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-emerald-100" disabled={syncing}><RefreshCw className={`size-3 ${syncing ? 'animate-spin' : ''}`} />Sync</button>}</div>
}
