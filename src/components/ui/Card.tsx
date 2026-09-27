import type { HTMLAttributes } from 'react'

export function Card({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl2 border border-ink-900/[0.06] bg-white/90 shadow-soft dark:border-white/[0.06] dark:bg-plum-900/80 dark:shadow-liftDark ${className}`}
      {...rest}
    />
  )
}
