export function Toggle({
  checked,
  onChange,
  label
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
        checked ? 'bg-gold-500' : 'bg-ink-900/15 dark:bg-white/15'
      }`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div
      role="tablist"
      className="grid grid-flow-col auto-cols-fr gap-1 rounded-xl2 bg-ink-900/[0.06] p-1 dark:bg-white/[0.07]"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          role="tab"
          aria-selected={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={`min-h-[2.5rem] rounded-[0.85rem] px-2 text-sm font-medium transition-colors ${
            value === opt.value
              ? 'bg-white text-ink-900 shadow-soft dark:bg-plum-700 dark:text-paper-50'
              : 'text-ink-600 hover:text-ink-900 dark:text-paper-200/70 dark:hover:text-paper-50'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
