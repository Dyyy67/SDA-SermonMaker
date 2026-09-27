import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface AppUser {
  id: string
  email: string
  name?: string
}

interface AuthContextValue {
  user: AppUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, name?: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const MOCK_SESSION_KEY = 'kerygma:mock-session'
const MOCK_USERS_KEY = 'kerygma:mock-users'

type MockUserRecord = AppUser & { password: string }

function readMockUsers(): MockUserRecord[] {
  try {
    return JSON.parse(localStorage.getItem(MOCK_USERS_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function init() {
      if (supabase) {
        const { data } = await supabase.auth.getSession()
        if (active && data.session?.user) {
          setUser({ id: data.session.user.id, email: data.session.user.email ?? '' })
        }
      } else {
        const raw = localStorage.getItem(MOCK_SESSION_KEY)
        if (active && raw) setUser(JSON.parse(raw))
      }
      if (active) setLoading(false)
    }
    init()

    if (supabase) {
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ? { id: session.user.id, email: session.user.email ?? '' } : null)
      })
      return () => {
        active = false
        sub.subscription.unsubscribe()
      }
    }
    return () => {
      active = false
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async signIn(email, password) {
        if (supabase) {
          const { error } = await supabase.auth.signInWithPassword({ email, password })
          return { error: error?.message }
        }
        const users = readMockUsers()
        const found = users.find((u) => u.email === email && u.password === password)
        if (!found) return { error: 'No account matches that email and password.' }
        const session: AppUser = { id: found.id, email: found.email, name: found.name }
        localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session))
        setUser(session)
        return {}
      },
      async signUp(email, password, name) {
        if (supabase) {
          const { error } = await supabase.auth.signUp({ email, password })
          return { error: error?.message }
        }
        const users = readMockUsers()
        if (users.some((u) => u.email === email)) {
          return { error: 'An account with that email already exists.' }
        }
        const record: MockUserRecord = { id: crypto.randomUUID(), email, password, name }
        users.push(record)
        localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users))
        const session: AppUser = { id: record.id, email: record.email, name: record.name }
        localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session))
        setUser(session)
        return {}
      },
      async signOut() {
        if (supabase) {
          await supabase.auth.signOut()
        } else {
          localStorage.removeItem(MOCK_SESSION_KEY)
          setUser(null)
        }
      }
    }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
