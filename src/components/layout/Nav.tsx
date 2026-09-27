import { NavLink } from 'react-router-dom'
import { Home, PenSquare, Library, Compass, Settings } from 'lucide-react'

const ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/create', label: 'Create', icon: PenSquare, end: false },
  { to: '/library', label: 'Library', icon: Library, end: false },
  { to: '/explore', label: 'Explore', icon: Compass, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false }
]

export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-900/[0.07] bg-paper-50/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-md dark:border-white/10 dark:bg-plum-950/95 sm:hidden"
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex min-h-[3.75rem] flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium ${
                  isActive ? 'text-gold-600 dark:text-gold-400' : 'text-ink-600 dark:text-paper-200/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} strokeWidth={isActive ? 2.25 : 1.75} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function SideRail() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-ink-900/[0.07] bg-paper-50 px-3 py-6 dark:border-white/10 dark:bg-plum-950 sm:flex"
    >
      <div className="mb-8 flex items-center gap-2 px-3">
        <img src="/icons/icon.svg" alt="" className="h-8 w-8" />
        <span className="font-display text-lg font-semibold">Kerygma</span>
      </div>
      <ul className="flex flex-col gap-1">
        {ITEMS.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl2 px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gold-500/15 text-gold-700 dark:text-gold-400'
                    : 'text-ink-600 hover:bg-ink-900/5 dark:text-paper-200/80 dark:hover:bg-white/10'
                }`
              }
            >
              <Icon size={19} strokeWidth={1.85} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
