import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUp,
  Bookmark,
  Copy,
  Share2,
  Pencil,
  Check,
  List,
  Minus,
  Plus,
  AlignJustify
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Sheet } from '../components/ui/Sheet'
import { Skeleton } from '../components/ui/Feedback'
import { SourceCardView } from '../components/sermon/SourceCards'
import type { Sermon } from '../types'
import { listSermons, saveSermon } from '../lib/store'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

type ReadingTheme = 'light' | 'dark' | 'sepia'

const READING_THEME_CLASSES: Record<ReadingTheme, string> = {
  light: 'bg-paper-50 text-ink-900',
  dark: 'bg-plum-950 text-paper-50',
  sepia: 'bg-[#F1E7D0] text-[#3B2E1A]'
}

const FONT_SCALE = { sm: 0.95, md: 1.08, lg: 1.22, xl: 1.38 } as const
type FontKey = keyof typeof FONT_SCALE

export default function SermonReader() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { show } = useToast()

  const [sermon, setSermon] = useState<Sermon | null | undefined>(undefined)
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>('light')
  const [fontKey, setFontKey] = useState<FontKey>('md')
  const [lineHeight, setLineHeight] = useState(1.7)
  const [tocOpen, setTocOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [scrollPct, setScrollPct] = useState(0)
  const scrollerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user || !id) return
    listSermons(user.id).then((all) => {
      setSermon(all.find((s) => s.id === id) ?? null)
    })
  }, [user, id])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight
      setScrollPct(max > 0 ? (el.scrollTop / max) * 100 : 0)
    }
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [sermon])

  const sections = sermon?.sections ?? []

  async function toggleBookmark() {
    if (!user || !sermon) return
    const next = { ...sermon, bookmarked: !sermon.bookmarked, updatedAt: new Date().toISOString() }
    setSermon(next)
    await saveSermon(user.id, next)
  }

  async function updateParagraph(sectionId: string, index: number, value: string) {
    if (!sermon) return
    const next = {
      ...sermon,
      sections: sermon.sections.map((sec) =>
        sec.id === sectionId
          ? { ...sec, paragraphs: sec.paragraphs.map((p, i) => (i === index ? value : p)) }
          : sec
      ),
      updatedAt: new Date().toISOString()
    }
    setSermon(next)
  }

  async function saveEdits() {
    if (!user || !sermon) return
    await saveSermon(user.id, sermon)
    setEditing(false)
    show('Changes saved.', 'success')
  }

  async function copySection(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      show('Section copied.', 'success')
    } catch {
      show('Could not copy — try selecting the text manually.', 'error')
    }
  }

  async function shareSection(title: string, text: string) {
    if (navigator.share) {
      try {
        await navigator.share({ title, text })
      } catch {
        /* user cancelled share sheet */
      }
    } else {
      await copySection(text)
    }
  }

  function scrollToSection(sectionId: string) {
    setTocOpen(false)
    document.getElementById(`section-${sectionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const fontSize = useMemo(() => `${FONT_SCALE[fontKey]}rem`, [fontKey])

  if (sermon === undefined) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Skeleton className="mb-4 h-8 w-2/3" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="mb-2 h-4 w-5/6" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (sermon === null) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-display text-xl">Sermon not found.</p>
        <Button onClick={() => navigate('/library')}>Back to library</Button>
      </div>
    )
  }

  return (
    <div className={`min-h-full ${READING_THEME_CLASSES[readingTheme]}`}>
      <div className="fixed inset-x-0 top-0 z-40 h-1 bg-black/10 dark:bg-white/10">
        <div className="h-full bg-gold-500 transition-[width]" style={{ width: `${scrollPct}%` }} />
      </div>

      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-black/[0.06] bg-inherit px-4 pb-3 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] backdrop-blur dark:border-white/10">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
        >
          <ArrowLeft size={19} />
        </button>
        <h1 className="flex-1 truncate font-display text-base font-medium">{sermon.title}</h1>
        <button
          onClick={() => setTocOpen(true)}
          aria-label="Table of contents"
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
        >
          <List size={19} />
        </button>
        <button
          onClick={toggleBookmark}
          aria-label={sermon.bookmarked ? 'Remove bookmark' : 'Bookmark sermon'}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Bookmark size={19} fill={sermon.bookmarked ? 'currentColor' : 'none'} />
        </button>
      </header>

      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none border-b border-black/[0.06] px-4 py-2.5 dark:border-white/10">
        <div className="flex items-center gap-1 rounded-full border border-black/10 px-1.5 py-1 dark:border-white/15">
          <button
            onClick={() => setFontKey((k) => (['sm', 'md', 'lg', 'xl'] as FontKey[])[Math.max(0, (['sm','md','lg','xl'] as FontKey[]).indexOf(k) - 1)])}
            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Decrease text size"
          >
            <Minus size={13} />
          </button>
          <span className="px-1 text-xs font-medium">Aa</span>
          <button
            onClick={() => setFontKey((k) => (['sm', 'md', 'lg', 'xl'] as FontKey[])[Math.min(3, (['sm','md','lg','xl'] as FontKey[]).indexOf(k) + 1)])}
            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Increase text size"
          >
            <Plus size={13} />
          </button>
        </div>
        <button
          onClick={() => setLineHeight((h) => (h >= 2 ? 1.5 : h + 0.15))}
          className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium dark:border-white/15"
        >
          <AlignJustify size={13} /> Line spacing
        </button>
        <div className="ml-auto flex items-center gap-1 rounded-full border border-black/10 p-1 dark:border-white/15">
          {(['light', 'sepia', 'dark'] as ReadingTheme[]).map((t) => (
            <button
              key={t}
              onClick={() => setReadingTheme(t)}
              aria-pressed={readingTheme === t}
              aria-label={`${t} reading mode`}
              className={`h-6 w-6 rounded-full border ${
                t === 'light' ? 'bg-white' : t === 'sepia' ? 'bg-[#F1E7D0]' : 'bg-plum-950'
              } ${readingTheme === t ? 'border-gold-500 ring-2 ring-gold-500/40' : 'border-black/15 dark:border-white/20'}`}
            />
          ))}
        </div>
      </div>

      <div ref={scrollerRef} className="h-[calc(100dvh-7.5rem)] overflow-y-auto px-4 pb-28 pt-6 sm:px-0">
        <div className="mx-auto max-w-[38rem]">
          <p className="mb-1 text-sm opacity-70">
            {sermon.input.passage} · {sermon.input.translation}
          </p>
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">{sermon.title}</h2>

          <div className="mt-8 flex flex-col gap-10">
            {sections.map((section) => (
              <section key={section.id} id={`section-${section.id}`} className="scroll-mt-24">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold">{section.heading}</h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copySection(section.paragraphs.join('\n\n'))}
                      aria-label="Copy section"
                      className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      <Copy size={15} />
                    </button>
                    <button
                      onClick={() => shareSection(section.heading, section.paragraphs.join('\n\n'))}
                      aria-label="Share section"
                      className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      <Share2 size={15} />
                    </button>
                  </div>
                </div>

                <div
                  className="font-display space-y-4"
                  style={{ fontSize, lineHeight }}
                >
                  {section.paragraphs.map((p, i) =>
                    editing ? (
                      <textarea
                        key={i}
                        value={p}
                        onChange={(e) => updateParagraph(section.id, i, e.target.value)}
                        rows={3}
                        className="w-full resize-none rounded-xl2 border border-black/15 bg-black/[0.02] p-3 font-display outline-none focus:border-gold-500 dark:border-white/20 dark:bg-white/5"
                        style={{ fontSize, lineHeight }}
                      />
                    ) : (
                      <p key={i}>{p}</p>
                    )
                  )}
                </div>

                {section.sources && section.sources.length > 0 && (
                  <div className="mt-5 flex flex-col gap-3">
                    {section.sources.map((s, i) => (
                      <SourceCardView key={i} source={s} />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-black/[0.06] bg-inherit px-4 py-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] backdrop-blur dark:border-white/10">
        <button
          onClick={() => scrollerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 dark:border-white/15"
          aria-label="Back to top"
        >
          <ArrowUp size={18} />
        </button>
        {editing ? (
          <Button className="flex-1" onClick={saveEdits}>
            <Check size={17} /> Save changes
          </Button>
        ) : (
          <Button variant="secondary" className="flex-1" onClick={() => setEditing(true)}>
            <Pencil size={16} /> Edit sermon
          </Button>
        )}
      </div>

      <Sheet open={tocOpen} onClose={() => setTocOpen(false)} title="Contents">
        <ul className="flex flex-col gap-1">
          {sections.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => scrollToSection(s.id)}
                className="w-full rounded-xl2 px-3 py-2.5 text-left text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10"
              >
                {s.heading}
              </button>
            </li>
          ))}
        </ul>
      </Sheet>
    </div>
  )
}
