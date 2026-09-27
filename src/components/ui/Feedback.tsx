import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-900/[0.08] dark:bg-white/10">
      <div
        className="h-full rounded-full bg-gold-500 transition-[width] duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-ink-900/[0.07] dark:bg-white/[0.08] motion-reduce:animate-none ${className}`}
    />
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl2 border border-dashed border-ink-900/15 px-6 py-12 text-center dark:border-white/15">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/15 text-gold-600 dark:text-gold-400">
        <Icon size={22} />
      </div>
      <h3 className="font-display text-lg font-medium">{title}</h3>
      <p className="max-w-xs text-sm text-ink-600 dark:text-paper-200/80">{description}</p>
      {action}
    </div>
  )
}

export function ErrorState({
  title,
  description,
  action
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl2 border border-red-500/25 bg-red-500/[0.04] px-6 py-10 text-center">
      <h3 className="font-display text-lg font-medium text-red-600 dark:text-red-400">{title}</h3>
      <p className="max-w-xs text-sm text-ink-600 dark:text-paper-200/80">{description}</p>
      {action}
    </div>
  )
}
