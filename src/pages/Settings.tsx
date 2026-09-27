import { useEffect, useState, type ReactNode } from 'react'
import {
  User,
  Palette,
  BookMarked,
  Sparkles,
  Scroll,
  Smartphone,
  LogOut,
  Download,
  Info,
  Shield,
  FileText,
  Trash2,
  Plus,
  KeyRound
} from 'lucide-react'
import { AppShell, ScreenHeader } from '../components/layout/AppShell'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { SegmentedControl } from '../components/ui/Controls'
import { Sheet } from '../components/ui/Sheet'
import { useAuth } from '../context/AuthContext'
import { usePreferences } from '../context/PreferencesContext'
import { usePwaInstall } from '../lib/usePwaInstall'
import { getUsage } from '../lib/store'
import { addApiKey, listApiKeys, maskKey, removeApiKey, type ApiKeyEntry } from '../lib/apiKeys'
import { useToast } from '../context/ToastContext'
import type { Audience, SermonLength, SermonStyle, Translation, UsageInfo } from '../types'

function Section({ icon: Icon, title, children }: { icon: typeof User; title: string; children: ReactNode }) {
  return (
    <section className="mb-7">
      <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
        <Icon size={18} className="text-gold-600 dark:text-gold-400" /> {title}
      </h2>
      <Card className="p-4">{children}</Card>
    </section>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-ink-900/[0.06] py-3 last:border-0 dark:border-white/10">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </div>
  )
}

export default function Settings() {
  const { user, signOut } = useAuth()
  const { prefs, update, resolvedTheme } = usePreferences()
  const { canInstall, installed, promptInstall } = usePwaInstall()
  const { show } = useToast()
  const [usage, setUsage] = useState<UsageInfo | null>(null)
  const [sheet, setSheet] = useState<'about' | 'privacy' | 'terms' | null>(null)
  const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([])
  const [newKeyLabel, setNewKeyLabel] = useState('')
  const [newKeyValue, setNewKeyValue] = useState('')

  useEffect(() => {
    setApiKeys(listApiKeys())
  }, [])

  function handleAddKey() {
    if (!newKeyValue.trim()) return
    addApiKey(newKeyValue, newKeyLabel)
    setApiKeys(listApiKeys())
    setNewKeyLabel('')
    setNewKeyValue('')
    show('Gemini API key added.', 'success')
  }

  function handleRemoveKey(id: string) {
    removeApiKey(id)
    setApiKeys(listApiKeys())
    show('API key removed.', 'info')
  }

  useEffect(() => {
    if (!user) return
    getUsage(user.id).then(setUsage)
  }, [user])

  async function handleInstall() {
    const outcome = await promptInstall()
    if (outcome === 'accepted') show('Installing Kerygma…', 'success')
    else if (outcome === 'unavailable')
      show('Your browser will offer an install option from its menu shortly.', 'info')
  }

  return (
    <AppShell>
      <ScreenHeader title="Settings" />

      <Section icon={User} title="Account">
        <Row label="Email">
          <span className="text-sm text-ink-600 dark:text-paper-200/75">{user?.email}</span>
        </Row>
        <Row label="Session">
          <Button variant="secondary" size="md" onClick={signOut}>
            <LogOut size={15} /> Log out
          </Button>
        </Row>
      </Section>

      <Section icon={Palette} title="Appearance">
        <div className="pb-3">
          <p className="mb-2 text-sm font-medium">Theme</p>
          <SegmentedControl
            value={prefs.theme}
            onChange={(v) => update({ theme: v })}
            options={[
              { value: 'system', label: 'System' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' }
            ]}
          />
          <p className="mt-1.5 text-xs text-ink-600 dark:text-paper-200/70">
            Currently showing {resolvedTheme === 'dark' ? 'dark' : 'light'} mode.
          </p>
        </div>
        <div className="pt-3">
          <p className="mb-2 text-sm font-medium">Text size</p>
          <SegmentedControl
            value={prefs.fontSize}
            onChange={(v) => update({ fontSize: v })}
            options={[
              { value: 'sm', label: 'S' },
              { value: 'md', label: 'M' },
              { value: 'lg', label: 'L' },
              { value: 'xl', label: 'XL' }
            ]}
          />
        </div>
      </Section>

      <Section icon={BookMarked} title="Sermon preferences">
        <Row label="Default translation">
          <select
            value={prefs.defaultTranslation}
            onChange={(e) => update({ defaultTranslation: e.target.value as Translation })}
            className="rounded-lg border border-ink-900/15 bg-transparent px-2 py-1.5 text-sm dark:border-white/15"
          >
            {(['KJV', 'NKJV', 'NIV', 'ESV', 'NASB'] as Translation[]).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Row>
        <Row label="Default audience">
          <select
            value={prefs.defaultAudience}
            onChange={(e) => update({ defaultAudience: e.target.value as Audience })}
            className="rounded-lg border border-ink-900/15 bg-transparent px-2 py-1.5 text-sm dark:border-white/15"
          >
            <option value="congregation">Congregation</option>
            <option value="youth">Youth</option>
            <option value="children">Children</option>
            <option value="prayer-meeting">Prayer meeting</option>
            <option value="camp-meeting">Camp meeting</option>
          </select>
        </Row>
        <Row label="Default length">
          <select
            value={prefs.defaultLength}
            onChange={(e) => update({ defaultLength: e.target.value as SermonLength })}
            className="rounded-lg border border-ink-900/15 bg-transparent px-2 py-1.5 text-sm dark:border-white/15"
          >
            <option value="short">Short</option>
            <option value="standard">Standard</option>
            <option value="extended">Extended</option>
          </select>
        </Row>
        <Row label="Default style">
          <select
            value={prefs.defaultStyle}
            onChange={(e) => update({ defaultStyle: e.target.value as SermonStyle })}
            className="rounded-lg border border-ink-900/15 bg-transparent px-2 py-1.5 text-sm dark:border-white/15"
          >
            <option value="expository">Expository</option>
            <option value="topical">Topical</option>
            <option value="narrative">Narrative</option>
            <option value="devotional">Devotional</option>
          </select>
        </Row>
      </Section>

      <Section icon={Sparkles} title="AI">
        <Row label="Generations used this month">
          <span className="text-sm text-ink-600 dark:text-paper-200/75">
            {usage ? `${usage.generationsUsedThisMonth} / ${usage.generationsLimit}` : '—'}
          </span>
        </Row>
        <Row label="Resets on">
          <span className="text-sm text-ink-600 dark:text-paper-200/75">
            {usage ? new Date(usage.resetsOn).toLocaleDateString() : '—'}
          </span>
        </Row>
      </Section>

      <Section icon={KeyRound} title="Gemini API keys">
        <p className="mb-3 text-xs text-ink-600 dark:text-paper-200/70">
          {apiKeys.length > 0
            ? 'Sermons are generated with Gemini using these keys. If one runs out of quota, the next is tried automatically.'
            : 'No key added yet — sermons are generated from local templates until you add one.'}
        </p>

        {apiKeys.length > 0 && (
          <div className="mb-4 flex flex-col divide-y divide-ink-900/[0.06] dark:divide-white/10">
            {apiKeys.map((k) => (
              <div key={k.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{k.label}</p>
                  <p className="font-mono text-xs text-ink-600 dark:text-paper-200/70">{maskKey(k.key)}</p>
                </div>
                <button
                  onClick={() => handleRemoveKey(k.id)}
                  aria-label={`Remove ${k.label}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-red-600 hover:bg-red-500/10 dark:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-ink-900/[0.06] pt-3 dark:border-white/10">
          <input
            value={newKeyLabel}
            onChange={(e) => setNewKeyLabel(e.target.value)}
            placeholder='Label (optional, e.g. "Personal key")'
            className="h-10 w-full rounded-lg border border-ink-900/15 bg-transparent px-3 text-sm outline-none focus:border-gold-500 dark:border-white/15"
          />
          <input
            value={newKeyValue}
            onChange={(e) => setNewKeyValue(e.target.value)}
            placeholder="Paste Gemini API key"
            type="password"
            className="h-10 w-full rounded-lg border border-ink-900/15 bg-transparent px-3 font-mono text-sm outline-none focus:border-gold-500 dark:border-white/15"
          />
          <Button variant="secondary" size="md" onClick={handleAddKey} disabled={!newKeyValue.trim()}>
            <Plus size={15} /> Add key
          </Button>
          <p className="text-xs text-ink-600 dark:text-paper-200/70">
            Get a free key at{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-gold-700 underline dark:text-gold-400"
            >
              aistudio.google.com/app/apikey
            </a>
            . Keys are stored only in this browser.
          </p>
        </div>
      </Section>

      <Section icon={Scroll} title="Sources">
        <Row label="Emphasize SDA sources by default">
          <span className="text-sm text-ink-600 dark:text-paper-200/75">Set per sermon in the wizard</span>
        </Row>
      </Section>

      <Section icon={Smartphone} title="App">
        <Row label="Install app">
          {installed ? (
            <span className="text-sm text-teal-700 dark:text-teal-400">Installed</span>
          ) : (
            <Button variant="secondary" size="md" onClick={handleInstall}>
              <Download size={15} /> Install
            </Button>
          )}
        </Row>
        <Row label="About">
          <button onClick={() => setSheet('about')} className="text-sm font-medium text-gold-700 dark:text-gold-400">
            View
          </button>
        </Row>
        <Row label="Privacy">
          <button onClick={() => setSheet('privacy')} className="text-sm font-medium text-gold-700 dark:text-gold-400">
            View
          </button>
        </Row>
        <Row label="Terms">
          <button onClick={() => setSheet('terms')} className="text-sm font-medium text-gold-700 dark:text-gold-400">
            View
          </button>
        </Row>
      </Section>

      <Sheet open={sheet === 'about'} onClose={() => setSheet(null)} title="About Kerygma">
        <p className="flex items-start gap-2 text-sm text-ink-600 dark:text-paper-200/80">
          <Info size={16} className="mt-0.5 shrink-0" />
          Kerygma helps you move from a topic to a Christ-centered, Scripture-grounded sermon draft in minutes,
          built for the phone in your pocket.
        </p>
      </Sheet>
      <Sheet open={sheet === 'privacy'} onClose={() => setSheet(null)} title="Privacy">
        <p className="flex items-start gap-2 text-sm text-ink-600 dark:text-paper-200/80">
          <Shield size={16} className="mt-0.5 shrink-0" />
          Your sermons and preferences are stored under your account and are never used to train models
          without separate, explicit consent.
        </p>
      </Sheet>
      <Sheet open={sheet === 'terms'} onClose={() => setSheet(null)} title="Terms">
        <p className="flex items-start gap-2 text-sm text-ink-600 dark:text-paper-200/80">
          <FileText size={16} className="mt-0.5 shrink-0" />
          Generated messages are a starting draft for your own study and preparation — always review sources
          before preaching.
        </p>
      </Sheet>
    </AppShell>
  )
}
