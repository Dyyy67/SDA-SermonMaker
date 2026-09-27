import type { Sermon, UsageInfo, UserPreferences } from '../types'
import { supabase } from './supabaseClient'

const NS = 'kerygma'

function key(userId: string, name: string) {
  return `${NS}:${userId}:${name}`
}

function read<T>(k: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(k)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(k: string, value: T) {
  localStorage.setItem(k, JSON.stringify(value))
}

export const defaultPreferences: UserPreferences = {
  theme: 'system',
  fontSize: 'md',
  defaultTranslation: 'NKJV',
  defaultAudience: 'congregation',
  defaultLength: 'standard',
  defaultStyle: 'expository'
}

export const defaultUsage: UsageInfo = {
  generationsUsedThisMonth: 0,
  generationsLimit: 20,
  resetsOn: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
}

// --- Sermons -----------------------------------------------------------
// Every function here is written against the shape a real Supabase table
// query would return, so swapping the localStorage calls for
// `supabase.from('sermons')...` later is a contained change (see README).

function sermonToRow(userId: string, sermon: Sermon) {
  return {
    id: sermon.id,
    user_id: userId,
    title: sermon.title,
    input: sermon.input,
    sections: sermon.sections,
    bookmarked: sermon.bookmarked,
    is_draft: sermon.isDraft,
    created_at: sermon.createdAt,
    updated_at: sermon.updatedAt
  }
}

function rowToSermon(row: any): Sermon {
  return {
    id: row.id,
    title: row.title,
    input: row.input,
    sections: row.sections,
    bookmarked: row.bookmarked,
    isDraft: row.is_draft,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export async function listSermons(userId: string): Promise<Sermon[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map(rowToSermon)
  }
  const list = read<Sermon[]>(key(userId, 'sermons'), [])
  return [...list].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
}

export async function saveSermon(userId: string, sermon: Sermon): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('sermons').upsert(sermonToRow(userId, sermon))
    if (error) throw error
    return
  }
  const list = read<Sermon[]>(key(userId, 'sermons'), [])
  const idx = list.findIndex((s) => s.id === sermon.id)
  if (idx >= 0) list[idx] = sermon
  else list.unshift(sermon)
  write(key(userId, 'sermons'), list)
}

export async function deleteSermon(userId: string, sermonId: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('sermons').delete().eq('id', sermonId).eq('user_id', userId)
    if (error) throw error
    return
  }
  const list = read<Sermon[]>(key(userId, 'sermons'), [])
  write(
    key(userId, 'sermons'),
    list.filter((s) => s.id !== sermonId)
  )
}

// --- Preferences ---------------------------------------------------------

function prefsToRow(userId: string, prefs: UserPreferences) {
  return {
    user_id: userId,
    theme: prefs.theme,
    font_size: prefs.fontSize,
    default_translation: prefs.defaultTranslation,
    default_audience: prefs.defaultAudience,
    default_length: prefs.defaultLength,
    default_style: prefs.defaultStyle
  }
}

function rowToPrefs(row: any): UserPreferences {
  return {
    theme: row.theme,
    fontSize: row.font_size,
    defaultTranslation: row.default_translation,
    defaultAudience: row.default_audience,
    defaultLength: row.default_length,
    defaultStyle: row.default_style
  }
}

export async function getPreferences(userId: string): Promise<UserPreferences> {
  if (supabase) {
    const { data } = await supabase.from('preferences').select('*').eq('user_id', userId).maybeSingle()
    return data ? rowToPrefs(data) : defaultPreferences
  }
  return read<UserPreferences>(key(userId, 'prefs'), defaultPreferences)
}

export async function savePreferences(userId: string, prefs: UserPreferences): Promise<void> {
  if (supabase) {
    await supabase.from('preferences').upsert(prefsToRow(userId, prefs))
    return
  }
  write(key(userId, 'prefs'), prefs)
}

// --- Usage -----------------------------------------------------------------

function usageToRow(userId: string, usage: UsageInfo) {
  return {
    user_id: userId,
    generations_used_this_month: usage.generationsUsedThisMonth,
    generations_limit: usage.generationsLimit,
    resets_on: usage.resetsOn
  }
}

function rowToUsage(row: any): UsageInfo {
  return {
    generationsUsedThisMonth: row.generations_used_this_month,
    generationsLimit: row.generations_limit,
    resetsOn: row.resets_on
  }
}

export async function getUsage(userId: string): Promise<UsageInfo> {
  if (supabase) {
    const { data } = await supabase.from('usage').select('*').eq('user_id', userId).maybeSingle()
    return data ? rowToUsage(data) : defaultUsage
  }
  return read<UsageInfo>(key(userId, 'usage'), defaultUsage)
}

export async function incrementUsage(userId: string): Promise<UsageInfo> {
  const current = await getUsage(userId)
  const next = { ...current, generationsUsedThisMonth: current.generationsUsedThisMonth + 1 }
  if (supabase) {
    await supabase.from('usage').upsert(usageToRow(userId, next))
  } else {
    write(key(userId, 'usage'), next)
  }
  return next
}
