import { Flame, X } from 'lucide-react'
import type { GenerationStage } from '../../types'
import { STAGE_LABELS } from '../../lib/generation'
import { ProgressBar } from '../ui/Feedback'
import { Button } from '../ui/Button'

const ORDER: GenerationStage[] = [
  'analyzing-scripture',
  'examining-context',
  'connecting-theology',
  'searching-egw',
  'building-message',
  'preparing-application'
]

export function GenerationOverlay({
  stage,
  onCancel
}: {
  stage: GenerationStage
  onCancel: () => void
}) {
  const idx = Math.max(0, ORDER.indexOf(stage))
  const progress = ((idx + 1) / ORDER.length) * 100

  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-plum-950 pb-[env(safe-area-inset-bottom,0px)] pt-[env(safe-area-inset-top,0px)] text-paper-50">
      <div className="flex justify-end px-5 pt-4">
        <button
          onClick={onCancel}
          className="flex h-10 w-10 items-center justify-center rounded-full text-paper-200/80 hover:bg-white/10"
          aria-label="Cancel generation"
        >
          <X size={20} />
        </button>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/15 motion-safe:animate-pulse motion-reduce:animate-none">
          <Flame size={28} className="text-gold-400" />
        </div>
        <p className="font-display text-xl font-medium">{STAGE_LABELS[stage]}&hellip;</p>
        <p className="mt-2 max-w-xs text-sm text-paper-200/70">
          Preparing a message grounded in Scripture — this usually takes a few seconds.
        </p>
        <div className="mt-8 w-full max-w-xs">
          <ProgressBar value={progress} />
          <ol className="mt-5 flex flex-col gap-2 text-left text-sm">
            {ORDER.map((s, i) => (
              <li key={s} className="flex items-center gap-2.5">
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    i < idx ? 'bg-gold-400' : i === idx ? 'bg-gold-400 motion-safe:animate-pulse' : 'bg-white/20'
                  }`}
                />
                <span className={i <= idx ? 'text-paper-50' : 'text-paper-200/45'}>{STAGE_LABELS[s]}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="px-6 pb-8">
        <Button variant="secondary" size="lg" className="w-full bg-white/10 text-paper-50 hover:bg-white/15" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
