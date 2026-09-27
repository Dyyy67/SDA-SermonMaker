import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  Users,
  Baby,
  GraduationCap,
  HandHeart,
  Tent,
  BookMarked,
  MessageCircle,
  BookOpen,
  Heart,
  Sparkles
} from 'lucide-react'
import { AppShell, ScreenHeader } from '../components/layout/AppShell'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/Feedback'
import { SegmentedControl } from '../components/ui/Controls'
import { Toggle } from '../components/ui/Controls'
import { ChoiceCard } from '../components/sermon/ChoiceCard'
import { GenerationOverlay } from '../components/sermon/GenerationOverlay'
import type { Audience, GenerationStage, SermonDraftInput, SermonLength, SermonStyle, Translation } from '../types'
import { KJV_SAMPLE } from '../data/reference'
import { generateSermon } from '../lib/generation'
import { saveSermon, incrementUsage } from '../lib/store'
import { useAuth } from '../context/AuthContext'
import { usePreferences } from '../context/PreferencesContext'
import { useToast } from '../context/ToastContext'

const STEP_TITLES = ['Topic', 'Passage', 'Audience', 'Length', 'Translation', 'SDA emphasis', 'Style', 'Review']

const AUDIENCES: { value: Audience; label: string; description: string; icon: typeof Users }[] = [
  { value: 'congregation', label: 'Congregation', description: 'A typical Sabbath service', icon: Users },
  { value: 'youth', label: 'Youth', description: 'Teens and young adults', icon: GraduationCap },
  { value: 'children', label: 'Children', description: "Simple, story-driven language", icon: Baby },
  { value: 'prayer-meeting', label: 'Prayer meeting', description: 'Smaller, midweek gathering', icon: HandHeart },
  { value: 'camp-meeting', label: 'Camp meeting', description: 'A larger, multi-day gathering', icon: Tent }
]

const STYLES: { value: SermonStyle; label: string; description: string; icon: typeof BookOpen }[] = [
  { value: 'expository', label: 'Expository', description: 'Verse-by-verse through the passage', icon: BookOpen },
  { value: 'topical', label: 'Topical', description: 'Built around a theme across Scripture', icon: BookMarked },
  { value: 'narrative', label: 'Narrative', description: 'Told through story and character', icon: MessageCircle },
  { value: 'devotional', label: 'Devotional', description: 'Reflective and personally applied', icon: Heart }
]

const TRANSLATIONS: Translation[] = ['KJV', 'NKJV', 'NIV', 'ESV', 'NASB']

function draftKey(userId: string) {
  return `kerygma:${userId}:wizard-draft`
}

export default function SermonWizard() {
  const { user } = useAuth()
  const { prefs } = usePreferences()
  const { show } = useToast()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [input, setInput] = useState<SermonDraftInput>({
    topic: '',
    passage: '',
    audience: prefs.defaultAudience,
    length: prefs.defaultLength,
    translation: prefs.defaultTranslation,
    sdaEmphasis: true,
    style: prefs.defaultStyle
  })
  const [stage, setStage] = useState<GenerationStage>('idle')
  const abortRef = useRef<AbortController | null>(null)
  const restored = useRef(false)

  useEffect(() => {
    if (!user || restored.current) return
    restored.current = true
    const raw = localStorage.getItem(draftKey(user.id))
    if (raw) {
      try {
        setInput(JSON.parse(raw))
        show('Draft recovered from your last session.', 'info')
      } catch {
        /* ignore malformed draft */
      }
    }
  }, [user, show])

  useEffect(() => {
    if (!user) return
    localStorage.setItem(draftKey(user.id), JSON.stringify(input))
  }, [input, user])

  const totalSteps = STEP_TITLES.length
  const progress = ((step + 1) / totalSteps) * 100

  const canAdvance = useMemo(() => {
    if (step === 0) return input.topic.trim().length > 2
    if (step === 1) return input.passage.trim().length > 1
    return true
  }, [step, input])

  function goNext() {
    if (step < totalSteps - 1) setStep((s) => s + 1)
  }
  function goBack() {
    if (step === 0) return
    setStep((s) => s - 1)
  }

  async function handleGenerate() {
    if (!user) return
    const controller = new AbortController()
    abortRef.current = controller
    setStage('analyzing-scripture')
    try {
      const sermon = await generateSermon(input, {
        onStage: setStage,
        signal: controller.signal
      })
      await saveSermon(user.id, sermon)
      await incrementUsage(user.id)
      localStorage.removeItem(draftKey(user.id))
      setStage('idle')
      show('Sermon generated.', 'success')
      navigate(`/sermon/${sermon.id}`)
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        setStage('idle')
        show('Generation cancelled.', 'info')
      } else {
        setStage('error')
        show('Generation failed. Please try again.', 'error')
      }
    }
  }

  function cancelGeneration() {
    abortRef.current?.abort()
  }

  if (stage !== 'idle' && stage !== 'error') {
    return <GenerationOverlay stage={stage} onCancel={cancelGeneration} />
  }

  return (
    <AppShell>
      <ScreenHeader title="New sermon" subtitle={`Step ${step + 1} of ${totalSteps} — ${STEP_TITLES[step]}`} />

      <div className="mb-6">
        <ProgressBar value={progress} />
      </div>

      <Card className="p-5">
        {step === 0 && (
          <div>
            <label htmlFor="topic" className="mb-2 block text-sm font-semibold">
              What is this sermon about?
            </label>
            <input
              id="topic"
              autoFocus
              value={input.topic}
              onChange={(e) => setInput((p) => ({ ...p, topic: e.target.value }))}
              placeholder="e.g. Resting in God's promises"
              className="h-12 w-full rounded-xl2 border border-ink-900/15 bg-transparent px-4 text-base outline-none focus:border-gold-500 dark:border-white/15"
            />
            <p className="mt-2 text-xs text-ink-600 dark:text-paper-200/70">
              One clear idea works better than several. You can always regenerate.
            </p>
          </div>
        )}

        {step === 1 && (
          <div>
            <label htmlFor="passage" className="mb-2 block text-sm font-semibold">
              Anchor Bible passage
            </label>
            <input
              id="passage"
              autoFocus
              value={input.passage}
              onChange={(e) => setInput((p) => ({ ...p, passage: e.target.value }))}
              placeholder="e.g. John 3:16"
              className="h-12 w-full rounded-xl2 border border-ink-900/15 bg-transparent px-4 text-base outline-none focus:border-gold-500 dark:border-white/15"
            />
            <p className="mb-2 mt-3 text-xs text-ink-600 dark:text-paper-200/70">Quick picks</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(KJV_SAMPLE).map((ref) => (
                <button
                  key={ref}
                  onClick={() => setInput((p) => ({ ...p, passage: ref }))}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                    input.passage === ref
                      ? 'border-gold-500 bg-gold-500/15 text-gold-700 dark:text-gold-400'
                      : 'border-ink-900/15 text-ink-600 dark:border-white/15 dark:text-paper-200/80'
                  }`}
                >
                  {ref}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-2.5">
            {AUDIENCES.map((a) => (
              <ChoiceCard
                key={a.value}
                icon={a.icon}
                title={a.label}
                description={a.description}
                selected={input.audience === a.value}
                onSelect={() => setInput((p) => ({ ...p, audience: a.value }))}
              />
            ))}
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="mb-3 text-sm font-semibold">Sermon length</p>
            <SegmentedControl<SermonLength>
              value={input.length}
              onChange={(v) => setInput((p) => ({ ...p, length: v }))}
              options={[
                { value: 'short', label: 'Short' },
                { value: 'standard', label: 'Standard' },
                { value: 'extended', label: 'Extended' }
              ]}
            />
            <p className="mt-3 text-xs text-ink-600 dark:text-paper-200/70">
              {input.length === 'short' && 'About 10–12 minutes delivered.'}
              {input.length === 'standard' && 'About 20–25 minutes delivered.'}
              {input.length === 'extended' && 'About 35–40 minutes delivered.'}
            </p>
          </div>
        )}

        {step === 4 && (
          <div>
            <p className="mb-3 text-sm font-semibold">Bible translation</p>
            <div className="grid grid-cols-3 gap-2">
              {TRANSLATIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => setInput((p) => ({ ...p, translation: t }))}
                  className={`rounded-xl2 border py-3 text-sm font-semibold ${
                    input.translation === t
                      ? 'border-gold-500 bg-gold-500/15 text-gold-700 dark:text-gold-400'
                      : 'border-ink-900/15 text-ink-600 dark:border-white/15 dark:text-paper-200/80'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Emphasize SDA theology</p>
              <p className="mt-1 text-xs text-ink-600 dark:text-paper-200/70">
                Weave in Fundamental Beliefs and Ellen G. White sources alongside Scripture.
              </p>
            </div>
            <Toggle
              checked={input.sdaEmphasis}
              onChange={(v) => setInput((p) => ({ ...p, sdaEmphasis: v }))}
              label="Emphasize SDA theology"
            />
          </div>
        )}

        {step === 6 && (
          <div className="flex flex-col gap-2.5">
            {STYLES.map((s) => (
              <ChoiceCard
                key={s.value}
                icon={s.icon}
                title={s.label}
                description={s.description}
                selected={input.style === s.value}
                onSelect={() => setInput((p) => ({ ...p, style: s.value }))}
              />
            ))}
          </div>
        )}

        {step === 7 && (
          <div>
            <p className="mb-3 text-sm font-semibold">Ready to generate</p>
            <dl className="space-y-2 text-sm">
              {[
                ['Topic', input.topic || '—'],
                ['Passage', input.passage || '—'],
                ['Audience', AUDIENCES.find((a) => a.value === input.audience)?.label],
                ['Length', input.length],
                ['Translation', input.translation],
                ['SDA emphasis', input.sdaEmphasis ? 'On' : 'Off'],
                ['Style', STYLES.find((s) => s.value === input.style)?.label]
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-ink-900/[0.06] pb-2 dark:border-white/10">
                  <dt className="text-ink-600 dark:text-paper-200/70">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </Card>

      <div className="sticky bottom-[calc(env(safe-area-inset-bottom,0px)+4.75rem)] z-30 mt-6 flex gap-3 rounded-xl2 bg-paper-50/95 py-2 backdrop-blur dark:bg-plum-950/95 sm:static sm:bg-transparent sm:py-0 sm:backdrop-blur-none">
        {step > 0 && (
          <Button variant="secondary" size="lg" onClick={goBack} className="flex-none">
            <ChevronLeft size={18} />
            Back
          </Button>
        )}
        {step < totalSteps - 1 ? (
          <Button size="lg" className="flex-1" disabled={!canAdvance} onClick={goNext}>
            Continue
          </Button>
        ) : (
          <Button size="lg" className="flex-1" onClick={handleGenerate}>
            <Sparkles size={18} />
            Generate sermon
          </Button>
        )}
      </div>
    </AppShell>
  )
}
