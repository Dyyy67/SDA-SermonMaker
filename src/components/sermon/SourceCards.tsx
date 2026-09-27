import { useState } from 'react'
import { BookOpen, Scroll, Quote, ChevronDown } from 'lucide-react'
import type { SourceCard } from '../../types'

const ICONS = { scripture: BookOpen, 'fundamental-belief': Scroll, egw: Quote } as const

export function SourceCardView({ source }: { source: SourceCard }) {
  const [open, setOpen] = useState(true)
  const Icon = ICONS[source.kind]

  return (
    <div className="overflow-hidden rounded-xl2 border border-teal-700/20 bg-teal-700/[0.05] dark:border-teal-600/25 dark:bg-teal-600/[0.08]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <Icon size={17} className="shrink-0 text-teal-700 dark:text-teal-400" />
        <span className="flex-1 text-sm font-semibold text-teal-800 dark:text-teal-300">{source.heading}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-teal-700/70 transition-transform dark:text-teal-400/70 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="animate-fade-in px-4 pb-4">
          <p className="font-display text-[1.05rem] italic leading-relaxed text-ink-800 dark:text-paper-100">
            {source.body}
          </p>
          <p className="mt-2 text-xs font-medium text-teal-700/80 dark:text-teal-400/80">{source.reference}</p>
        </div>
      )}
    </div>
  )
}
