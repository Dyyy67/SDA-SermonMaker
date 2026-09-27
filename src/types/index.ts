export type Translation = 'KJV' | 'NKJV' | 'NIV' | 'ESV' | 'NASB'

export type SermonLength = 'short' | 'standard' | 'extended'

export type Audience =
  | 'congregation'
  | 'youth'
  | 'children'
  | 'prayer-meeting'
  | 'camp-meeting'

export type SermonStyle =
  | 'expository'
  | 'topical'
  | 'narrative'
  | 'devotional'

export interface SermonDraftInput {
  topic: string
  passage: string
  audience: Audience
  length: SermonLength
  translation: Translation
  sdaEmphasis: boolean
  style: SermonStyle
}

export type GenerationStage =
  | 'idle'
  | 'analyzing-scripture'
  | 'examining-context'
  | 'connecting-theology'
  | 'searching-egw'
  | 'building-message'
  | 'preparing-application'
  | 'done'
  | 'error'

export interface SourceCard {
  kind: 'scripture' | 'fundamental-belief' | 'egw'
  heading: string
  body: string
  reference: string
}

export interface SermonSection {
  id: string
  heading: string
  paragraphs: string[]
  sources?: SourceCard[]
}

export interface Sermon {
  id: string
  title: string
  input: SermonDraftInput
  sections: SermonSection[]
  createdAt: string
  updatedAt: string
  bookmarked: boolean
  isDraft: boolean
}

export interface UsageInfo {
  generationsUsedThisMonth: number
  generationsLimit: number
  resetsOn: string
}

export type ThemeMode = 'system' | 'light' | 'dark'

export interface UserPreferences {
  theme: ThemeMode
  fontSize: 'sm' | 'md' | 'lg' | 'xl'
  defaultTranslation: Translation
  defaultAudience: Audience
  defaultLength: SermonLength
  defaultStyle: SermonStyle
}
