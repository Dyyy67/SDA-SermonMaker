import type { SermonDraftInput, SermonSection } from '../types'
import { listApiKeys } from './apiKeys'

const MODEL = 'gemini-2.5-flash'

function buildPrompt(input: SermonDraftInput): string {
  return `You are helping a Seventh-day Adventist pastor prepare a sermon draft.

Sermon inputs:
- Topic: ${input.topic}
- Anchor passage: ${input.passage}
- Audience: ${input.audience}
- Length: ${input.length} (short ~10-12 min delivered, standard ~20-25 min, extended ~35-40 min)
- Bible translation to quote from: ${input.translation}
- Emphasize SDA theology (Fundamental Beliefs / Ellen G. White themes): ${input.sdaEmphasis ? 'yes' : 'no'}
- Style: ${input.style}

Write a Christ-centered sermon draft with exactly these four sections, in this order: "Opening", "Understanding the Passage", "A Christ-Centered Foundation", "Living It Out This Week". Scale the number and length of paragraphs per section to the requested length.

Rules:
- Only quote Scripture verbatim if you are confident of the exact wording in the requested translation; otherwise paraphrase the idea and don't present it as a direct quote.
- Never fabricate a specific Ellen G. White quotation, book title, or page number. If SDA emphasis is on, you may reference a general theme from her writings or a numbered Fundamental Belief without inventing an exact quote or citation.
- Warm, pastoral, biblically faithful tone. No markdown formatting inside paragraph text.

Respond with ONLY valid JSON (no markdown code fences, no commentary), matching exactly this shape:
{
  "title": "short sermon title",
  "sections": [
    { "id": "opening", "heading": "Opening", "paragraphs": ["...", "..."] },
    { "id": "context", "heading": "Understanding the Passage", "paragraphs": ["...", "..."] },
    { "id": "theology", "heading": "A Christ-Centered Foundation", "paragraphs": ["...", "..."] },
    { "id": "application", "heading": "Living It Out This Week", "paragraphs": ["...", "..."] }
  ]
}`
}

async function callGemini(apiKey: string, prompt: string, signal: AbortSignal): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.7 }
      })
    }
  )
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Gemini request failed (${res.status}): ${body.slice(0, 300)}`)
  }
  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? ''
  if (!text) throw new Error('Gemini returned an empty response')
  return text
}

function parseSermonJson(text: string): { title: string; sections: SermonSection[] } {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/, '')
    .replace(/```\s*$/, '')
  const parsed = JSON.parse(cleaned)
  if (!parsed?.title || !Array.isArray(parsed?.sections)) {
    throw new Error('Gemini response did not match the expected sermon shape')
  }
  return parsed
}

/**
 * Tries each stored Gemini key in order (so an exhausted/invalid key falls
 * through to the next one) and returns the generated title + sections.
 * Throws if no key is configured or every key fails.
 */
export async function generateSermonWithGemini(
  input: SermonDraftInput,
  signal: AbortSignal
): Promise<{ title: string; sections: SermonSection[] }> {
  const keys = listApiKeys()
  if (keys.length === 0) {
    throw new Error('No Gemini API key configured')
  }
  const prompt = buildPrompt(input)
  let lastError: unknown
  for (const entry of keys) {
    try {
      const text = await callGemini(entry.key, prompt, signal)
      return parseSermonJson(text)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') throw err
      lastError = err
      // fall through to the next key
    }
  }
  throw lastError instanceof Error ? lastError : new Error('All Gemini API keys failed')
}
