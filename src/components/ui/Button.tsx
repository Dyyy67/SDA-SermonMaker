import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'md' | 'lg' | 'icon'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    'bg-gold-500 text-ink-900 hover:bg-gold-600 active:bg-gold-600 disabled:bg-gold-500/50 shadow-soft',
  secondary:
    'bg-plum-900/[0.06] text-ink-900 hover:bg-plum-900/[0.1] dark:bg-white/10 dark:text-paper-50 dark:hover:bg-white/[0.15]',
  ghost:
    'bg-transparent text-ink-900 hover:bg-ink-900/5 dark:text-paper-50 dark:hover:bg-white/10',
  danger: 'bg-red-500/90 text-white hover:bg-red-500'
}

const sizes: Record<Size, string> = {
  md: 'h-11 px-4 text-sm gap-2',
  lg: 'h-14 px-6 text-base gap-2.5',
  icon: 'h-11 w-11 shrink-0'
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = 'primary', size = 'md', loading, className = '', children, disabled, ...rest }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-xl2 font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {loading && <Loader2 size={16} className="animate-spin motion-reduce:animate-none" />}
      {children}
    </button>
  )
)
Button.displayName = 'Button'
