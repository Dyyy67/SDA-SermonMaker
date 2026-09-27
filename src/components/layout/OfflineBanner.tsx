import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  if (online) return null

  return (
    <div className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-2 bg-ink-900 px-4 py-2 pt-[calc(env(safe-area-inset-top,0px)+0.5rem)] text-xs font-medium text-paper-50">
      <WifiOff size={13} />
      You&rsquo;re offline. Your saved content is available, but AI generation requires an internet connection.
    </div>
  )
}
