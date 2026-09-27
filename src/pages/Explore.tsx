import { useState } from 'react'
import { ChevronDown, Scroll, BookOpen } from 'lucide-react'
import { AppShell, ScreenHeader } from '../components/layout/AppShell'
import { Card } from '../components/ui/Card'
import { FUNDAMENTAL_BELIEFS, KJV_SAMPLE } from '../data/reference'

export default function Explore() {
  const [openBelief, setOpenBelief] = useState<number | null>(null)

  return (
    <AppShell>
      <ScreenHeader title="Explore" subtitle="Reference material behind every sermon" />

      <section className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
          <Scroll size={18} className="text-teal-700 dark:text-teal-400" /> Fundamental Beliefs
        </h2>
        <div className="flex flex-col gap-2">
          {FUNDAMENTAL_BELIEFS.map((b) => {
            const open = openBelief === b.number
            return (
              <Card key={b.number} className="overflow-hidden">
                <button
                  onClick={() => setOpenBelief(open ? null : b.number)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                  aria-expanded={open}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-700/10 text-sm font-semibold text-teal-700 dark:bg-teal-600/15 dark:text-teal-400">
                    {b.number}
                  </span>
                  <span className="flex-1 text-sm font-semibold">{b.title}</span>
                  <ChevronDown size={16} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && (
                  <p className="animate-fade-in px-4 pb-4 text-sm text-ink-600 dark:text-paper-200/80">{b.summary}</p>
                )}
              </Card>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
          <BookOpen size={18} className="text-teal-700 dark:text-teal-400" /> Sample passages
        </h2>
        <div className="flex flex-col gap-2">
          {Object.entries(KJV_SAMPLE).map(([ref, text]) => (
            <Card key={ref} className="p-4">
              <p className="font-display text-[1.05rem] italic leading-relaxed">{text}</p>
              <p className="mt-2 text-xs font-medium text-ink-600 dark:text-paper-200/70">{ref} · KJV</p>
            </Card>
          ))}
        </div>
      </section>
    </AppShell>
  )
}
