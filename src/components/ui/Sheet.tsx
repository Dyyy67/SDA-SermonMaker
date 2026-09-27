import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface SheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Sheet({ open, onClose, title, children }: SheetProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={title}>
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-[2px] animate-fade-in"
      />
      <div
        className="animate-sheet-in absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-[1.75rem] border-t border-ink-900/[0.06] bg-paper-50 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] shadow-soft dark:border-white/10 dark:bg-plum-900 sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:max-h-[85vh] sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[1.75rem]"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-ink-900/[0.06] bg-paper-50/95 px-5 py-4 backdrop-blur dark:border-white/10 dark:bg-plum-900/95">
          <div className="mx-auto -ml-9 h-1.5 w-10 rounded-full bg-ink-900/15 dark:bg-white/15 sm:hidden" />
          {title && <h2 className="font-display text-lg font-medium">{title}</h2>}
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-full text-ink-600 hover:bg-ink-900/5 dark:text-paper-100 dark:hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}
