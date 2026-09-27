// Supabase Edge Function: generate-sermon
//
// Deploy with `supabase functions deploy generate-sermon` after setting a
// secret for your AI provider key, e.g.:
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// This function is the seam referenced by src/lib/generation.ts. It accepts
// a SermonDraftInput, streams stage updates as Server-Sent Events, and ends
// with a final `done` event carrying the generated sermon JSON. Wire the
// frontend to this by replacing the simulated `wait()` calls in
// generateSermon() with an EventSource/fetch-stream reader against this URL.
//
// The prompt below is a starting point, not a finished theological review
// pipeline — treat generated sections as a draft for the preacher's own
// study, and always verify any Ellen G. White or Fundamental Belief
// citation against a licensed source before use, exactly as the in-app
// "Source" cards note.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

const STAGES = [
  'analyzing-scripture',
  'examining-context',
  'connecting-theology',
  'searching-egw',
  'building-message',
  'preparing-application'
] as const

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS })

  const input = await req.json().catch(() => null)
  if (!input?.topic) {
    return new Response(JSON.stringify({ error: 'Missing sermon input' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    })
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured for this function.' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  }

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder()
      const send = (event: string, data: unknown) =>
        controller.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))

      for (const stage of STAGES) {
        send('stage', { stage })
        await new Promise((r) => setTimeout(r, 300))
      }

      // TODO: replace with a real call to your AI provider, e.g.
      // const res = await fetch('https://api.anthropic.com/v1/messages', {
      //   method: 'POST',
      //   headers: {
      //     'x-api-key': apiKey,
      //     'anthropic-version': '2023-06-01',
      //     'content-type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     model: 'claude-sonnet-4-6',
      //     max_tokens: 4000,
      //     messages: [{ role: 'user', content: buildPrompt(input) }]
      //   })
      // })
      // const data = await res.json()

      send('done', { sermon: null, note: 'Wire this function up to your AI provider — see the TODO above.' })
      controller.close()
    }
  })

  return new Response(stream, {
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache'
    }
  })
})
