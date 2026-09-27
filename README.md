# Kerygma — Mobile-First Sermon Builder

A Christ-centered sermon preparation app: topic → Scripture → audience → length →
translation → SDA emphasis → style → generated sermon draft, with a dedicated
mobile reading experience. Built mobile-first as an installable PWA on React +
TypeScript + Tailwind, with Supabase as the (optional) backend.

## Running it

```bash
npm install
npm run dev
```

Open the printed local URL on your phone (same Wi-Fi) or in a narrow desktop
window to see the mobile layout. No environment variables are required to try
the app — see "Demo mode" below.

`npm run build` produces a production build in `dist/` (already verified to
build clean and serve correctly, including the service worker and manifest).

## Demo mode vs. a real backend

The app runs two ways, decided automatically by whether Supabase env vars are
set:

- **Demo mode (default, zero setup):** `VITE_SUPABASE_URL` /
  `VITE_SUPABASE_ANON_KEY` are unset, so `src/lib/supabaseClient.ts` exports a
  `null` client. Every read/write in `src/lib/store.ts` and the mock auth in
  `src/context/AuthContext.tsx` transparently falls back to `localStorage`.
  You can sign up, generate sermons, bookmark, edit, and everything persists
  in that browser.
- **Real backend:** copy `.env.example` to `.env.local`, fill in your Supabase
  project's URL and anon key, then run the SQL in
  `supabase/migrations/0001_init.sql` (Row Level Security included). Every
  store function already calls the matching `supabase.from(...)` query — no
  call-site changes needed once the env vars are set.

## AI generation

`src/lib/generation.ts` simulates the six-stage generation flow (Analyzing
Scripture → ... → Preparing Application) with realistic timing, cancellation,
and a locally-assembled sermon so the full UI — wizard, progress screen,
reader, sources — works end to end with no API key.

`supabase/functions/generate-sermon/index.ts` is the real seam: a Deno Edge
Function that streams the same stage events over SSE and is where your AI
provider call goes server-side, so **the API key never reaches the browser**.
Swapping it in is a contained change to `generateSermon()` (replace the
`wait()` loop with a stream reader against the function URL).

Scripture text used in the demo (`src/data/reference.ts`) is public-domain
KJV. Ellen G. White cards are clearly-labeled placeholders — the app
deliberately does not fabricate quotations or page numbers; that reference
data should come from a licensed source lookup in production.

## What's implemented against the spec

- Mobile-first layout: bottom nav on phones, left rail ≥ `sm` breakpoint;
  touch targets ≥ 44px; bottom sheets, full-screen dialogs, sticky wizard
  actions, collapsible sections throughout.
- Modern UI: cards, soft shadows, toasts, skeleton loaders, empty/error
  states, progress bars, expand/collapse, a single deliberate motion moment
  (the generation screen) rather than scattered hover effects — all gated
  behind `prefers-reduced-motion`.
- 8-step sermon wizard with autosave (recovers a draft on reload), validation,
  cancellable generation, regenerate-by-editing-and-resubmitting, edit, save,
  share, copy.
- Dedicated reader: font size, line height, light/sepia/dark reading themes
  (independent of app theme), table of contents, scroll progress, back-to-top,
  per-section copy/share (Clipboard + Web Share API, with clipboard fallback),
  bookmarking, inline editing.
- PWA: manifest, generated icons, install prompt via `usePwaInstall`, service
  worker with an app-shell + static-asset caching strategy
  (`vite-plugin-pwa`), offline banner.
- Auth: email/password sign up, sign in, persistent session, sign out —
  Supabase Auth when configured, local mock otherwise. Per-user data
  separation is enforced by RLS policies in the SQL migration.
- Settings: Account, Appearance (system/light/dark + text size), Sermon
  Preferences (defaults feeding the wizard), AI usage readout, Sources, and
  App (install / about / privacy / terms).
- Explore tab: browsable Fundamental Beliefs and sample passages, satisfying
  the "reference data" requirement without needing a live content API.
- Accessibility: semantic headings, `aria-*` on toggles/tabs/dialogs, visible
  focus rings, reduced-motion support throughout, sufficient contrast in both
  themes.

## Known gaps / next steps

This was built and verified (installed, type-checked, built, and served) in
one pass without a live Supabase project or AI key, so a few things are
intentionally left as clearly-marked seams rather than guessed at:

- The Edge Function's AI call is a `TODO` — plug in your provider.
- A verified EGW/Bible source API is not connected; `src/data/reference.ts`
  says exactly where that plugs in.
- Request deduplication, rate limiting, and generation-history limits
  (spec §16) are straightforward additions to the Edge Function once it's
  live, but there's no server to rate-limit yet in demo mode.
- Deploying the built `dist/` behind a static host needs a SPA rewrite (all
  paths → `index.html`) for client-side routing — confirmed working via
  `vite preview`'s own fallback; add the equivalent rule for your host
  (e.g. Vercel/Netlify both do this by default for a Vite app).

## Project layout

```
src/
  components/   UI primitives, layout (nav/shell), sermon-specific pieces
  context/      Auth, preferences/theme, toast providers
  data/         Reference data (Fundamental Beliefs, sample KJV verses)
  lib/          Supabase client, localStorage-backed store, generation logic
  pages/        Home, Create (wizard), Library, Explore, Settings, Reader, Auth
  types/        Shared domain types
supabase/
  functions/generate-sermon/  Edge Function stub (SSE streaming seam)
  migrations/0001_init.sql    Tables + Row Level Security
```
