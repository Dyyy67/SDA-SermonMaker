import type { GenerationStage, Sermon, SermonDraftInput, SermonSection, SourceCard } from '../types'
import { FUNDAMENTAL_BELIEFS, KJV_SAMPLE, egwPlaceholder } from '../data/reference'

export const STAGE_LABELS: Record<GenerationStage, string> = {
  idle: 'Ready',
  'analyzing-scripture': 'Analyzing Scripture',
  'examining-context': 'Examining context',
  'connecting-theology': 'Connecting SDA theology',
  'searching-egw': 'Searching EGW sources',
  'building-message': 'Building Christ-centered message',
  'preparing-application': 'Preparing application',
  done: 'Done',
  error: 'Something went wrong'
}

const STAGE_ORDER: GenerationStage[] = [
  'analyzing-scripture',
  'examining-context',
  'connecting-theology',
  'searching-egw',
  'building-message',
  'preparing-application'
]

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length]
}

function hash(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0
  return h
}

function buildSections(input: SermonDraftInput): SermonSection[] {
  const seed = hash(input.topic + input.passage)
  const verseKeys = Object.keys(KJV_SAMPLE)
  const mainVerseKey = input.passage in KJV_SAMPLE ? input.passage : pick(verseKeys, seed)
  const mainVerseText = KJV_SAMPLE[mainVerseKey]
  const belief = pick(FUNDAMENTAL_BELIEFS, seed)
  const egw = egwPlaceholder(input.topic)

  const openingSources: SourceCard[] = [
    { kind: 'scripture', heading: 'Scripture', body: mainVerseText, reference: `${mainVerseKey} (KJV)` }
  ]

  const theologySources: SourceCard[] = [
    {
      kind: 'fundamental-belief',
      heading: 'SDA Fundamental Belief',
      body: belief.summary,
      reference: `Fundamental Belief ${belief.number} — ${belief.title}`
    }
  ]

  if (input.sdaEmphasis) {
    theologySources.push({
      kind: 'egw',
      heading: 'Ellen G. White',
      body: egw.body,
      reference: egw.reference
    })
  }

  const audienceLine: Record<SermonDraftInput['audience'], string> = {
    congregation: 'the whole congregation, from lifelong members to first-time visitors',
    youth: 'our young people, wherever they are in their walk with Jesus',
    children: 'our children, in language they can carry home',
    'prayer-meeting': 'this smaller circle gathered midweek to pray and study together',
    'camp-meeting': 'the wider family of believers gathered for camp meeting'
  }

  return [
    {
      id: 'opening',
      heading: 'Opening',
      paragraphs: [
        `Tonight we open ${input.passage ? input.passage : mainVerseKey} together, thinking especially of ${audienceLine[input.audience]}.`,
        `"${input.topic}" is not an abstract idea — it is a question every person in this room has carried at some point. Scripture does not leave that question unanswered.`
      ],
      sources: openingSources
    },
    {
      id: 'context',
      heading: 'Understanding the Passage',
      paragraphs: [
        `Read in its own setting, this passage speaks first to its original hearers before it speaks to us — and that original meaning is exactly what keeps our application honest rather than borrowed.`,
        `The context shows a God who moves toward His people before they move toward Him. That order matters for everything that follows in this message.`
      ]
    },
    {
      id: 'theology',
      heading: 'A Christ-Centered Foundation',
      paragraphs: [
        `Every true reading of Scripture leads back to Christ — His life, His death, and His ministry on our behalf now. This passage is no exception.`,
        `Held alongside our fundamental beliefs, we see a consistent picture: God's character is not in question here. Ours is.`
      ],
      sources: theologySources
    },
    {
      id: 'application',
      heading: 'Living It Out This Week',
      paragraphs: [
        `So what does this look like on Monday morning? Three things: first, return to this passage privately, slowly, prayerfully. Second, name one specific place in your week where this truth needs to land. Third, tell someone — a spouse, a friend, a small group — what God showed you tonight.`,
        `This message was not meant to end when we stand for the closing hymn. It was meant to walk out the door with you.`
      ]
    }
  ]
}

export interface GenerateOptions {
  onStage: (stage: GenerationStage) => void
  signal: AbortSignal
}

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const t = window.setTimeout(resolve, ms)
    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(t)
        reject(new DOMException('cancelled', 'AbortError'))
      },
      { once: true }
    )
  })
}

/**
 * Simulates a multi-stage AI generation. Swap the body of this function for
 * a call to a Supabase Edge Function (see supabase/functions/generate-sermon)
 * that streams progress + content back over Server-Sent Events; the stage
 * callback and AbortSignal plumbing here are already shaped for that.
 */
export async function generateSermon(input: SermonDraftInput, opts: GenerateOptions): Promise<Sermon> {
  for (const stage of STAGE_ORDER) {
    opts.onStage(stage)
    await wait(420 + Math.random() * 380, opts.signal)
  }
  opts.onStage('done')

  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    title: input.topic || 'Untitled sermon',
    input,
    sections: buildSections(input),
    createdAt: now,
    updatedAt: now,
    bookmarked: false,
    isDraft: false
  }
}
