import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Flame } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'

export default function Auth() {
  const { user, signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = mode === 'signin' ? await signIn(email, password) : await signUp(email, password, name)
    setLoading(false)
    if (result.error) setError(result.error)
  }

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-plum-950 text-gold-400 dark:bg-plum-900">
            <Flame size={26} />
          </span>
          <h1 className="font-display text-2xl font-semibold">Kerygma</h1>
          <p className="mt-1 text-sm text-ink-600 dark:text-paper-200/75">
            {mode === 'signin' ? 'Welcome back — sign in to continue.' : 'Create an account to get started.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {mode === 'signup' && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="h-12 w-full rounded-xl2 border border-ink-900/15 bg-transparent px-4 text-base outline-none focus:border-gold-500 dark:border-white/15"
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="h-12 w-full rounded-xl2 border border-ink-900/15 bg-transparent px-4 text-base outline-none focus:border-gold-500 dark:border-white/15"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="h-12 w-full rounded-xl2 border border-ink-900/15 bg-transparent px-4 text-base outline-none focus:border-gold-500 dark:border-white/15"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" size="lg" loading={loading} className="mt-1 w-full">
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <button
          onClick={() => setMode((m) => (m === 'signin' ? 'signup' : 'signin'))}
          className="mx-auto mt-5 block text-sm font-medium text-gold-700 dark:text-gold-400"
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}
