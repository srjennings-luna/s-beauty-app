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
| `Kallos-DailyPrompt-ContentGuide.html` | Editorial guide for Pause & Ponder daily prompts |

**Content docs (in Sheri's Documents folder, not in repo):**

| File | What it is |
|------|-----------|
| `KALLOS-Intro-Journey-Beauty-Truth-Goodness.html` | Intro journey — 7 days, all fields, ready for Sanity |
| `KALLOS-Pause-Ponder-14-Days.html` | 14 days of daily prompts (March 9–22), ready for Sanity |
| `KALLOS-Sanity-Entry-Guide-Themes-2-5.docx` | Entry guide for seeding Themes 2–5 into Sanity |

---

## Current Phase: Phase 2 — In Progress (March 2026)

### Phase 1 — COMPLETE ✅ (Feb 27, 2026)
- New Sanity schemas: `theme`, `contentItem`, `journey`, `dailyPrompt`
- TypeScript types fully rewritten for KALLOS (`lib/types.ts`)
- EWTN references removed from all code files
- 4-tab navigation built: Today / Explore / Journeys / Library
- New routes: `/explore`, `/journeys`, `/journeys/[slug]`, `/library`
- Library page built (replaces broken Favorites)
- Bug fixes: aria-labels, error states, TypeScript consolidation
- `data/episodes.ts` deleted
- Build passes clean — deployed to Vercel

### Phase 2 Work Done (March 7, 2026)
- ✅ Journey Day UI fully built — 6-step experience (see Journey Framework below)
- ✅ Breathe page added — dedicated contemplative pause with full-bleed image, 8x zoom, breathing animation
- ✅ Stories-style navigation — thin 2px progress bar at top, swipe left/right to navigate, no footer/button
- ✅ Context collapse — `context` field truncated to ~2-3 sentences with "Read more" expand
- ✅ Visio Divina removed from Journey steps — only accessible via Explore and Library
- ✅ Inline audio player — Sanity-hosted audio files (`audioFile`) now play in-app with native `<audio>` element
- ✅ "Open" label hidden from Step 1 header
- ✅ Daily Prompt fallback query — shows most recent prompt if exact date match fails
- ✅ CLAUDE_REFERENCE.md rewritten for espresso/parchment two-mode design system
- ✅ Intro to Beauty, Truth & Goodness journey drafted (7 days) — content doc ready for Sanity entry
- ✅ Pause & Ponder daily prompts drafted (14 days, March 9–22) — content doc ready for Sanity entry
- ✅ Sanity entry guide for Themes 2–5 created

### Up Next: Phase 2 Remaining
- Seed content into Sanity: Intro journey, Themes 2–5, Pause & Ponder prompts
- Source high-res images for all new content (search terms provided in docs)
- Build onboarding flow for non-Catholic curious seeker
- Sanity Studio manual tasks (Sheri): rename Studio URL, update splash content
- User testing with Stories navigation and Breathe page

---

## 8 Content Types

All live in the `contentItem` Sanity schema with `contentType` field:

1. `sacred-art` — Paintings, sculptures, icons, frescoes, churches
2. `thinker` — Plato, Augustine, Aquinas, C.S. Lewis, von Balthasar, Scruton
3. `literature` — Hopkins, Rilke, Dante, Dostoevsky, Tolkien
4. `music` — Gregorian chant, Arvo Pärt, Bach, Palestrina
5. `food-wine` — Cistercian monasteries, 3-generation bakeries, natural wine
6. `landscape` — Creation theology, places where creation speaks
7. `watch-listen` — YouTube, podcasts, documentary series, lectures
8. `math-science` — Golden ratio, Fibonacci, fractals, Webb telescope, sacred geometry, the divine in pattern and proof

**Every content item requires a minimum of one high-res image (1200px min, up to 4500px). Always. No exceptions.**

---

## Journey Framework

- 7 days per Journey, ~10 min/day
- 6-step daily structure: **Open → Encounter → Breathe → Reflect → Connect → Go Deeper**
- Step 1 (Open): Image always present — the visual anchor for the day
- Step 2 (Encounter): Content image (no zoom), title, description, collapsible context, quote/scripture, audio player
- Step 3 (Breathe): Full-bleed image with 8x pinch-to-zoom, breathing animation (infinite loop), helper text: "Sit with this image and let your eyes explore"
- Step 4 (Reflect): Questions, one at a time
- Step 5 (Connect): Thread to next day
- Step 6 (Go Deeper): Tradition reflections, expandable
- **Navigation:** Stories-style thin progress bar at top (2px segments). Swipe left/right to navigate. No Continue button, no progress dots, no footer.
- Integrated curriculum model: all content types answer the same central question
- **Visio Divina ("Pray with this image") is NOT available inside Journey steps.** Only accessible via Explore and Library entry points.

### 6 Founding Journeys
**NEW — Intro Journey:**
0. **Beauty, Truth & Goodness** — Introductory journey for new users. Days 1–2 Beauty, Days 3–4 Truth, Days 5–6 Goodness, Day 7 Integration. Content doc ready.

**5 Founding Themes:**
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
- **Two-mode system:**
  - **Espresso mode** (immersive): `#16110d` — Journey steps, Visio Divina, Breathe page
  - **Parchment mode** (browse): `#fdf6e8` — Today, Explore, Journeys, Library
- **Gold accent:** `#C19B5F` — CTAs, active states, labels. NOT `#C9A227`.
- **Sage:** `#4a7a62` — active step indicator, interactive elements
- **Typography:** Montserrat (headlines), Open Sans (body), Cormorant Garamond (scripture/quotes)
- **Images:** Min 1200px, up to 4500px. 8x zoom on Breathe page (react-zoom-pan-pinch).
- **Safe areas:** Always pad for phone notches and home indicators.
- **DEPRECATED:** `#203545` (old dark teal) — do NOT use anywhere. Espresso `#16110d` replaced it.

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
| `contentItem` | ✅ New — replaces artwork. Includes `audioFile` (Sanity-hosted) + `musicUrl` (external link) for music type |
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

- **Journey Day Steps** — 6-step experience: Open → Encounter → Breathe → Reflect → Connect → Go Deeper
- **Breathe page** — Full-bleed image, 8x zoom, infinite breathing animation, helper text
- **Stories navigation** — Thin progress bar at top, swipe left/right, no footer
- **Context collapse** — Encounter step collapses `context` field to ~2-3 sentences with expand
- **Inline audio player** — Sanity-hosted `audioFile` plays via native `<audio>` element
- **Daily Prompt fallback** — Shows most recent prompt if exact date match fails
- **Visio Divina** (`/pray/[artworkId]`) — 5-step prayer: Gaze → Meditate → Pray → Contemplate → Action
- **Go Deeper** — Tradition reflections (Church Fathers, Saints, Popes) expandable bar
- **8x pinch-to-zoom** — On Breathe page (Journey) and content detail (Explore)
- **Music player** — Chant / Ambient options on Pray page
- **Map** with colored markers by content type

---

## Parking Lot — Future Design Work

These are deferred decisions to revisit with more content and real user testing:

### ~~Journey Day Steps — Progress Indicator~~ ✅ RESOLVED
Replaced with Stories-style thin progress bar at top + swipe navigation. No footer, no Continue button.

### ~~Breath Interaction~~ ✅ RESOLVED
Built as dedicated Breathe page (Step 3). Full-bleed image with 8x zoom, pulsing dot animation (CSS keyframe, `scale(1)→scale(4)`, 8s infinite loop), helper text "Sit with this image and let your eyes explore." Cormorant Garamond italic.

### Journey Day Steps — Connect Step (Step 5)
Current: Dark background with next-day image drift animation. Simple.
Open question: What's the right visual treatment for the "sneak peek" of the next day's image?
Sheri to brainstorm. Options: letterbox strip, partial reveal from bottom, full-bleed dark with a peek edge.

### Explore — Content Item Card UI Cleanup
Flagged from screenshot (March 2026). Issues to address:
- Portrait images letterbox with black bars — consider `object-position` or allowing full portrait crop instead of forced aspect ratio
- Empty space below "Pray with this image →" link
- Book icon (top-right of info panel) — purpose unclear, may need label or removal
Revisit once more content is seeded and real images are in place.

### Visio Divina Entry Points
Visio Divina removed from Journey steps. Currently accessible from Explore content detail and Library. Open question: should there be a more prominent entry point on the Today tab or Explore landing?

### Encounter Page — Two-Page Split (Future)
Sheri proposed splitting Encounter into two sub-pages: Page 1 = content info (no zoom), Page 2 = full image + zoom + breathe. Currently implemented as separate steps (Encounter + Breathe). Revisit if user testing shows friction with the 6-step count.

---

## Manual Tasks for Sheri

These can't be done in code — Sheri does them in dashboards:
1. ~~Rename GitHub repo: `s-beauty-app` → `kallos-app`~~ ✅ Done
2. ~~Rename Vercel project → `kallos-app`~~ ✅ Done
3. Rename Sanity Studio URL → `kallos.sanity.studio`
4. ~~Rename local folder in Finder → `kallos-app`~~ ✅ Done
5. Update splash page content in Sanity Studio with KALLOS copy
6. Seed Intro to Beauty, Truth & Goodness journey into Sanity (content doc ready)
7. Seed Pause & Ponder daily prompts into Sanity (14 days drafted, content doc ready)
8. Seed Themes 2–5 content into Sanity (entry guide doc ready)
9. Source high-res images for all new content (search terms in docs)
