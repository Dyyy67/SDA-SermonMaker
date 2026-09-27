import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, BookOpen, ArrowRight } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Skeleton, EmptyState } from '../components/ui/Feedback'
import { useAuth } from '../context/AuthContext'
import { listSermons, getUsage } from '../lib/store'
import type { Sermon, UsageInfo } from '../types'

export default function Home() {
  const { user } = useAuth()
  const [sermons, setSermons] = useState<Sermon[] | null>(null)
  const [usage, setUsage] = useState<UsageInfo | null>(null)

  useEffect(() => {
    if (!user) return
    listSermons(user.id).then((s) => setSermons(s.slice(0, 3)))
    getUsage(user.id).then(setUsage)
  }, [user])

  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0]

  return (
    <AppShell>
      <div className="mb-7">
        <p className="text-sm text-ink-600 dark:text-paper-200/70">Welcome back</p>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">{firstName ? `${firstName}` : 'Friend'}</h1>
      </div>

      <Link to="/create">
        <Card className="mb-6 flex items-center gap-4 border-gold-500/30 bg-gradient-to-br from-gold-500/15 to-transparent p-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-500 text-ink-900">
            <Sparkles size={20} />
          </span>
          <span className="flex-1">
            <span className="block font-display text-lg font-semibold">Start a new sermon</span>
            <span className="block text-sm text-ink-600 dark:text-paper-200/75">
              Topic to finished message in under a minute
            </span>
          </span>
          <ArrowRight size={18} className="shrink-0 text-ink-600 dark:text-paper-200/70" />
        </Card>
      </Link>

      {usage && (
        <Card className="mb-6 p-5">
          <div className="mb-2 flex items-baseline justify-between">
            <p className="text-sm font-semibold">Generations this month</p>
            <p className="text-sm text-ink-600 dark:text-paper-200/70">
              {usage.generationsUsedThisMonth} / {usage.generationsLimit}
            </p>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-900/[0.08] dark:bg-white/10">
            <div
              className="h-full rounded-full bg-teal-600 transition-[width]"
              style={{ width: `${Math.min(100, (usage.generationsUsedThisMonth / usage.generationsLimit) * 100)}%` }}
            />
          </div>
        </Card>
      )}

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Recent sermons</h2>
        <Link to="/library" className="text-sm font-medium text-gold-700 dark:text-gold-400">
          See all
        </Link>
      </div>

      {sermons === null && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {sermons?.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="No sermons yet"
          description="Your first sermon is a couple of taps away."
          action={
            <Link to="/create">
              <Button size="md">Create your first sermon</Button>
            </Link>
          }
        />
      )}

      <div className="flex flex-col gap-3">
        {sermons?.map((s) => (
          <Link key={s.id} to={`/sermon/${s.id}`}>
            <Card className="p-4">
              <p className="font-display text-base font-semibold">{s.title}</p>
              <p className="mt-1 text-xs text-ink-600 dark:text-paper-200/70">
                {s.input.passage} · {new Date(s.updatedAt).toLocaleDateString()}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  )
}
