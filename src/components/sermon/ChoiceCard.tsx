import type { LucideIcon } from 'lucide-react'

export function ChoiceCard({
  icon: Icon,
  title,
  description,
  selected,
  onSelect
}: {
  icon: LucideIcon
  title: string
  description: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-full items-start gap-3 rounded-xl2 border px-4 py-3.5 text-left transition-colors ${
        selected
          ? 'border-gold-500 bg-gold-500/10'
          : 'border-ink-900/[0.08] bg-white/70 hover:border-ink-900/20 dark:border-white/10 dark:bg-plum-900/60 dark:hover:border-white/25'
      }`}
    >
      <span
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          selected ? 'bg-gold-500 text-ink-900' : 'bg-ink-900/[0.06] text-ink-600 dark:bg-white/10 dark:text-paper-200'
        }`}
      >
        <Icon size={17} />
      </span>
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-0.5 block text-xs text-ink-600 dark:text-paper-200/75">{description}</span>
      </span>
    </button>
  )
}
