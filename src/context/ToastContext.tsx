import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

type ToastKind = 'success' | 'error' | 'info'

interface Toast {
  id: string
  kind: ToastKind
  message: string
}

interface ToastContextValue {
  show: (message: string, kind?: ToastKind) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const ICONS: Record<ToastKind, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = crypto.randomUUID()
    setToasts((t) => [...t, { id, kind, message }])
    window.setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id))
    }, 3600)
  }, [])

  const dismiss = (id: string) => setToasts((t) => t.filter((toast) => toast.id !== id))

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[70] flex flex-col items-center gap-2 px-4 sm:bottom-6"
        aria-live="polite"
        role="status"
      >
        {toasts.map((toast) => {
          const Icon = ICONS[toast.kind]
          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-xl2 border border-ink-800/10 bg-white/95 px-4 py-3 text-sm text-ink-900 shadow-soft backdrop-blur transition-all animate-toast-in dark:border-white/10 dark:bg-plum-800/95 dark:text-paper-50"
            >
              <Icon
                size={18}
                className={
                  toast.kind === 'success'
                    ? 'shrink-0 text-teal-600 dark:text-teal-400'
                    : toast.kind === 'error'
                      ? 'shrink-0 text-red-500'
                      : 'shrink-0 text-gold-600 dark:text-gold-400'
                }
              />
              <p className="flex-1">{toast.message}</p>
              <button
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="shrink-0 rounded-full p-1 text-ink-600 hover:bg-ink-900/5 dark:text-paper-100 dark:hover:bg-white/10"
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
