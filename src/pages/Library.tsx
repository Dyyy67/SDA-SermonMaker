import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Bookmark, Trash2, BookOpen } from 'lucide-react'
import { AppShell, ScreenHeader } from '../components/layout/AppShell'
import { Card } from '../components/ui/Card'
import { SegmentedControl } from '../components/ui/Controls'
import { EmptyState, Skeleton } from '../components/ui/Feedback'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { listSermons, deleteSermon } from '../lib/store'
import type { Sermon } from '../types'

const PAGE_SIZE = 8

export default function Library() {
  const { user } = useAuth()
  const { show } = useToast()
  const [sermons, setSermons] = useState<Sermon[] | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'bookmarked'>('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!user) return
    listSermons(user.id).then(setSermons)
  }, [user])

  const filtered = useMemo(() => {
    let list = sermons ?? []
    if (filter === 'bookmarked') list = list.filter((s) => s.bookmarked)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((s) => s.title.toLowerCase().includes(q) || s.input.passage.toLowerCase().includes(q))
    }
    return list
  }, [sermons, filter, query])

  const visible = filtered.slice(0, page * PAGE_SIZE)

  async function handleDelete(id: string) {
    if (!user) return
    await deleteSermon(user.id, id)
    setSermons((prev) => (prev ? prev.filter((s) => s.id !== id) : prev))
    show('Sermon deleted.', 'info')
  }

  return (
    <AppShell>
      <ScreenHeader title="Library" subtitle="Everything you've generated and saved" />

      <div className="mb-4 flex items-center gap-2 rounded-xl2 border border-ink-900/[0.1] bg-white/70 px-3.5 dark:border-white/15 dark:bg-plum-900/60">
        <Search size={17} className="shrink-0 text-ink-600 dark:text-paper-200/70" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search sermons"
          className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-ink-600/60 dark:placeholder:text-paper-200/50"
        />
      </div>

      <div className="mb-5">
        <SegmentedControl
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All' },
            { value: 'bookmarked', label: 'Bookmarked' }
          ]}
        />
      </div>

      {sermons === null && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {sermons && filtered.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title={filter === 'bookmarked' ? 'No bookmarks yet' : 'Nothing here yet'}
          description={
            filter === 'bookmarked'
              ? 'Bookmark a sermon from its reading view to find it quickly here.'
              : 'Generate a sermon and it will show up in your library automatically.'
          }
        />
      )}

      <div className="flex flex-col gap-3">
        {visible.map((s) => (
          <Card key={s.id} className="flex items-center gap-3 p-4">
            <Link to={`/sermon/${s.id}`} className="min-w-0 flex-1">
              <p className="truncate font-display text-base font-semibold">{s.title}</p>
              <p className="mt-1 text-xs text-ink-600 dark:text-paper-200/70">
                {s.input.passage} · {new Date(s.updatedAt).toLocaleDateString()}
              </p>
            </Link>
            {s.bookmarked && <Bookmark size={16} className="shrink-0 text-gold-600 dark:text-gold-400" fill="currentColor" />}
            <button
              onClick={() => handleDelete(s.id)}
              aria-label={`Delete ${s.title}`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-600 hover:bg-red-500/10 hover:text-red-500 dark:text-paper-200/70"
            >
              <Trash2 size={16} />
            </button>
          </Card>
        ))}
      </div>

      {filtered.length > visible.length && (
        <button
          onClick={() => setPage((p) => p + 1)}
          className="mx-auto mt-5 block rounded-full border border-ink-900/15 px-5 py-2.5 text-sm font-medium dark:border-white/15"
        >
          Load more
        </button>
      )}
    </AppShell>
  )
}
