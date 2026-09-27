import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { UserPreferences } from '../types'
import { defaultPreferences, getPreferences, savePreferences } from '../lib/store'
import { useAuth } from './AuthContext'

interface PreferencesContextValue {
  prefs: UserPreferences
  update: (patch: Partial<UserPreferences>) => Promise<void>
  resolvedTheme: 'light' | 'dark'
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

function systemPrefersDark() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [prefs, setPrefs] = useState<UserPreferences>(defaultPreferences)
  const [systemDark, setSystemDark] = useState(systemPrefersDark())

  useEffect(() => {
    if (!user) return
    getPreferences(user.id).then(setPrefs)
  }, [user])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const resolvedTheme: 'light' | 'dark' =
    prefs.theme === 'system' ? (systemDark ? 'dark' : 'light') : prefs.theme

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', resolvedTheme === 'dark')
    root.dataset.fontSize = prefs.fontSize
  }, [resolvedTheme, prefs.fontSize])

  const value = useMemo<PreferencesContextValue>(
    () => ({
      prefs,
      resolvedTheme,
      async update(patch) {
        const next = { ...prefs, ...patch }
        setPrefs(next)
        if (user) await savePreferences(user.id, next)
      }
    }),
    [prefs, resolvedTheme, user]
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider')
  return ctx
}
