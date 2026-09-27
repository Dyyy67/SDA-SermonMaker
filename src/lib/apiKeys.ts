// Client-side storage for user-supplied Gemini API keys. Kept in
// localStorage (never sent anywhere but directly to Google's API from the
// browser) since this is a static, backend-less deployment.

export interface ApiKeyEntry {
  id: string
  label: string
  key: string
}

const STORAGE_KEY = 'kerygma:gemini-keys'

export function listApiKeys(): ApiKeyEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ApiKeyEntry[]) : []
  } catch {
    return []
  }
}

function persist(keys: ApiKeyEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
}

export function addApiKey(key: string, label?: string): ApiKeyEntry {
  const keys = listApiKeys()
  const trimmed = key.trim()
  const entry: ApiKeyEntry = {
    id: crypto.randomUUID(),
    label: label?.trim() || `Key ${keys.length + 1}`,
    key: trimmed
  }
  persist([...keys, entry])
  return entry
}

export function removeApiKey(id: string): void {
  persist(listApiKeys().filter((k) => k.id !== id))
}

export function hasApiKeys(): boolean {
  return listApiKeys().length > 0
}

/** Masks a key for display, e.g. "AIza••••••wXyZ" */
export function maskKey(key: string): string {
  if (key.length <= 8) return '••••••••'
  return `${key.slice(0, 4)}••••••${key.slice(-4)}`
}
