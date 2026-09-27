import type { ReactNode } from 'react'
import { BottomNav, SideRail } from './Nav'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full">
      <SideRail />
      <main className="min-h-full pb-24 sm:ml-60 sm:pb-8">
        <div className="mx-auto w-full max-w-2xl px-4 pt-[calc(env(safe-area-inset-top,0px)+1.25rem)] sm:px-8 sm:pt-10">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}

export function ScreenHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <header className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-600 dark:text-paper-200/75">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}
