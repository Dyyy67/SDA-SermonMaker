import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(url && anonKey)

// When no project is configured yet, `supabase` is null and every data
// operation in src/lib/store.ts transparently falls back to localStorage.
// This lets the app run and be evaluated with zero backend setup, while
// every call site is already written against the shape Supabase expects —
// see README.md "Connecting a real Supabase project" for the swap-over.
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null
