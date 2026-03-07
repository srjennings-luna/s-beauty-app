# KALLOS — Claude Code Standing Brief

Read this at the start of every session. It contains all key product decisions, the current state of the project, and how to work with Sheri.

---

## The App

**Name:** KALLOS (double-L)
**Tagline:** Love the beautiful and the good
**Founding statement:** Beauty is the splendor of truth
**Type:** Independent contemplative discovery app (not an EWTN companion — no relationship or rights)
**Primary audience:** The non-Catholic curious seeker — moved by beauty, asking deeper questions, not necessarily religious

---

## How Sheri Works

- Product Manager, 20 years experience. Does not write code.
- Makes product decisions here in Cowork (Claude desktop), implementation happens in Claude Code (here).
- Always read the spec docs before starting work — they are the source of truth.
- Test with `npm run build` after every step. Commit after every step so there's a clean rollback.
- Prefer the Claude Code app tab over the terminal.
- All future documents: HTML, not Word/docx. Sheri is not a Microsoft user.

---

## Key Spec Documents (in this repo)

| File | What it is |
|------|-----------|
| `CLAUDE_REFERENCE.md` | Design system, colors, typography, component patterns |
| `Kallos-Phase1-Spec.html` | Phase 1 implementation spec — 6 steps, read this for any Phase 1 work |
| `Kallos-Product-Brief.html` | Full product brief — vision, audience, content types, features, roadmap |
| `Kallos-IA-v4.html` | Information architecture — 4-tab nav, user flows, Journey framework |
| `Kallos-Journeys.html` | All 5 founding themes, all 35 days fully detailed |

---

## Current Phase: Phase 1 — COMPLETE ✅ (Feb 27, 2026)

### All 6 Steps Done
- New Sanity schemas: `theme`, `contentItem`, `journey`, `dailyPrompt`
- TypeScript types fully rewritten for KALLOS (`lib/types.ts`)
- EWTN references removed from all code files
- 4-tab navigation built: Today / Explore / Journeys / Library
- New routes: `/explore`, `/journeys`, `/journeys/[slug]`, `/library`
- Library page built (replaces broken Favorites)
- Bug fixes: aria-labels, error states, TypeScript consolidation
- `data/episodes.ts` deleted
- Build passes clean — deployed to Vercel

### Up Next: Phase 2
- Seed content into Sanity (5 founding themes, 3 cities)
- Build out Journey day UI (5-step structure)
- Daily Beauty Prompt editorial workflow
- Onboarding flow for non-Catholic curious seeker
- Sanity Studio manual tasks (Sheri): rename Studio URL, update splash content

---

## 7 Content Types

All live in the `contentItem` Sanity schema with `contentType` field:

1. `sacred-art` — Paintings, sculptures, icons, frescoes, churches
2. `thinker` — Plato, Augustine, Aquinas, C.S. Lewis, von Balthasar, Scruton
3. `literature` — Hopkins, Rilke, Dante, Dostoevsky, Tolkien
4. `music` — Gregorian chant, Arvo Pärt, Bach, Palestrina
5. `food-wine` — Cistercian monasteries, 3-generation bakeries, natural wine
6. `landscape` — Creation theology, places where creation speaks
7. `watch-listen` — YouTube, podcasts, documentary series, lectures

**Every content item requires a minimum of one high-res image (1200px min, up to 4500px). Always. No exceptions.**

---

## Journey Framework

- 7 days per Journey, ~10 min/day
- 5-step daily structure: **Open → Encounter → Reflect → Connect → Go Deeper**
- Step 1 (Open): Image always present — the visual anchor for the day
- Integrated curriculum model: all content types answer the same central question
- **Visio Divina ("Pray with this image") is NOT available inside Journey steps.** It is only accessible via Explore and Library entry points. This is a deliberate product decision — the Journey is a complete 5-step experience and doesn't need a 6th prayer mode mid-flow.

### 5 Founding Themes
1. **Light** — "What does light reveal that darkness hides?"
2. **Silence** — "What do we hear when we stop talking?"
3. **Suffering & Beauty** — "How does beauty survive darkness?"
4. **Creation** — "What is the world trying to tell us?"
5. **Home / The Restless Heart** — "Why do we long for something we've never seen?"

---

## Navigation (4 Tabs)

| Tab | Route | What it shows |
|-----|-------|---------------|
| Today | `/` | Daily Beauty Prompt (hero), active Journey progress |
| Explore | `/explore` | All content, type + theme filters, map toggle |
| Journeys | `/journeys` | Journey cards, 7-day detail view |
| Library | `/library` | Favorites, completed Journeys, Visio Divina history |

---

## Design System (Non-Negotiable)

- **No rounded corners.** `border-radius: 0` everywhere. Sharp/square corners.
- **Dark theme.** Background: `#203545` (dark teal)
- **Gold accent:** `#C19B5F` — CTAs, active states, labels. NOT `#C9A227`.
- **Typography:** Montserrat (headlines), Open Sans (body), Cormorant Garamond (scripture/quotes)
- **Gradient:** Lighter teal top → dark teal → darker teal bottom
- **Images:** Min 1200px, up to 4500px. 8x zoom (react-zoom-pan-pinch).
- **Safe areas:** Always pad for phone notches and home indicators.

Full details: `CLAUDE_REFERENCE.md`

---

## Sanity

- **Project ID:** `em44j9m8`
- **Studio URL:** `seeking-beauty.sanity.studio` (to be renamed kallos.sanity.studio — Sheri's manual task)
- **Queries:** GROQ only (not GraphQL)
- **Image builder:** `urlFor()` from `@sanity/image-url`

### Sanity CLI Commands
The Sanity Studio is a **separate project** inside the `sanity/` subfolder. It has its own `package.json` and `node_modules`. Always run Sanity CLI commands from that subfolder, not the root.

| Task | Command |
|------|---------|
| Deploy Studio schema changes | `cd ~/Documents/kallos-app/sanity && npm run deploy` |
| Run Studio locally | `cd ~/Documents/kallos-app/sanity && npm run dev` |
| Build Studio | `cd ~/Documents/kallos-app/sanity && npm run build` |

⚠️ Do NOT use `npx sanity deploy` from the root — it pulls a global CLI that fails with "not a Sanity project context".

### Schema Status
| Schema | Status |
|--------|--------|
| `theme` | ✅ New — 5 founding themes |
| `contentItem` | ✅ New — replaces artwork |
| `journey` | ✅ New — 7-day structure |
| `dailyPrompt` | ✅ New — "Pause & Ponder" daily feature on Today tab |
| `splashPage` | ✅ Kept unchanged |
| `traditionReflection` | ✅ Updated — themes ref array added |
| `episode` | ⚠️ Deprecated — kept to preserve data, hidden from sidebar |

---

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- Tailwind CSS v4
- Sanity v3 CMS
- React-Leaflet + react-leaflet-cluster (map)
- react-zoom-pan-pinch (8x image zoom)
- Vercel (auto-deploy from GitHub push)

---

## What's Already Built & Working (Don't Break)

- **Visio Divina** (`/pray/[artworkId]`) — 5-step prayer: Gaze → Meditate → Pray → Contemplate → Action
- **Go Deeper** — Tradition reflections (Church Fathers, Saints, Popes) expandable bar
- **8x pinch-to-zoom** on images
- **Music player** — Chant / Ambient options on Pray page
- **Map** with colored markers by content type

---

## Parking Lot — Future Design Work

These are deferred decisions to revisit with more content and real user testing:

### Journey Day Steps — Progress Indicator
Current: Square indicators in the footer (below the Continue button). Simple and functional.
Open questions for a future pass:
- Should the progress indicator match Visio Divina exactly (centered, with step name inline)?
- Visio Divina shows `"1 of 5 · Gaze"` in the header and dots at the bottom — a clean model worth adopting
- Consider unifying both experiences under one shared navigation component
- When Journey has variable-length days (not always 5 steps), indicator needs to adapt dynamically

### Journey Day Steps — Connect Step (Step 4)
Current: Dark background with next-day image drift animation. Simple.
Open question: What's the right visual treatment for the "sneak peek" of the next day's image?
Sheri to brainstorm. Options: letterbox strip, partial reveal from bottom, full-bleed dark with a peek edge.

### Explore — Content Item Card UI Cleanup
Flagged from screenshot (March 2026). Issues to address:
- Portrait images letterbox with black bars — consider `object-position` or allowing full portrait crop instead of forced aspect ratio
- Empty space below "Pray with this image →" link
- Book icon (top-right of info panel) — purpose unclear, may need label or removal
Revisit once more content is seeded and real images are in place.

### Breath Interaction
Discussed: A breathing/contemplative interaction — likely an animated visual prompt tied to breath rhythm (inhale/exhale) to deepen the meditative quality of the app.
Open questions for a future pass:
- Where does it live? Candidates: Step 1 Open (as an invitation to settle in), Step 3 Reflect (before the questions appear), standalone Pause mode, or a global floating "breathe" button
- What triggers it? Automatic after X seconds of stillness, user-initiated tap, or built into a specific step flow
- Visual treatment: Expanding/contracting circle, radial blur, subtle pulsing on the image itself, or text prompt ("Breathe in… breathe out…")
- Duration: Single breath cycle (4-7-8 pattern?), or a full 1–2 minute guided sequence
- How does it connect to content? Does the breath prompt appear over the day's image, or is it separate from the artwork?

---

## Manual Tasks for Sheri (post-Phase 1)

These can't be done in code — Sheri does them in dashboards:
1. Rename GitHub repo: `s-beauty-app` → `kallos-app`
2. Rename Vercel project → `kallos-app`
3. Rename Sanity Studio URL → `kallos.sanity.studio`
4. Rename local folder in Finder → `kallos-app`
5. Update splash page content in Sanity Studio with KALLOS copy
