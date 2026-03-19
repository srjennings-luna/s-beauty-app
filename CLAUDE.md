# KALLOS — Claude Code Standing Brief

Read this at the start of every session. It contains all key product decisions, the current state of the project, and how to work with Sheri.

---

## The App

**Name:** KALLOS (double-L)
**Tagline:** Love the beautiful and the good
**Founding statement:** Beauty is the splendor of truth
**Type:** Independent contemplative discovery app (not an EWTN companion — no relationship or rights)
**Primary audience:** The curious seeker — moved by beauty, asking deeper questions, regardless of faith background

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
| `KALLOS-StPatrick-Day1-Draft.html` | St. Patrick feast day content — Day 1 standalone draft for review |
| `KALLOS-Sanity-Entry-Guide-Themes-2-5.docx` | Entry guide for seeding Themes 2–5 into Sanity |
| `KALLOS-Light-Journey-GoDeeper.html` | 16 tradition reflections for Light journey Step 6 |
| `KALLOS-Feast-Day-Content-Guide.html` | Editorial guide for feast day content — what it is, what it isn't, pre-publish checklist |
| `KALLOS-Content-Guide-Pause-Ponder.html` | Agent content instructions for Pause & Ponder daily prompts (updated March 2026 — hook + Lectio pairing revision) |
| `KALLOS-Content-Guide-7Day-Journey.html` | Agent content instructions for 7-day Journey content |
| `KALLOS-Pause-Ponder-18-Day-Checklist.html` | 18-day content checklist (March 17 – April 3) with per-day needs |
| `KALLOS-PP-Audit-Days4-8.html` | **NEW** — Content audit of Days 4–8 with specific rewrites + Lectio pairings. Use this for Sanity manual updates. |

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
- ✅ Pause & Ponder daily prompts drafted (18 days, March 17 – April 3) — content doc ready for Sanity entry. Includes St. Patrick feast day (Day 1) and Yeats "Lake Isle of Innisfree" replacing copyrighted Oriah poem
- ✅ Sanity entry guide for Themes 2–5 created

### Phase 2 Work Done (March 19, 2026)
- ✅ Lectio pairing schema deployed — `dailyPrompt` schema now includes `philosophyText` + `philosophyAttribution` fields inside the `lectio` object. `lib/types.ts` updated to match.
- ✅ 18 days of P&P content seeded into Sanity via script (Days 2–18; Day 1 St. Patrick manually entered). Day 2 Bosch philosophy/Lectio fields still need manual entry — see Manual Tasks.
- ✅ UTC timezone bug fixed — `getDailyPrompt()` now uses local timezone (`toLocaleDateString('en-CA')`) instead of UTC `.toISOString()`. Fixes "wrong day showing after 7pm ET" bug.
- ✅ P&P page — Begin state removed. Today card BEGIN → is the only entry trigger. No second gate on the P&P page itself.
- ✅ P&P page layout locked: Image (62vh) → Title + date below image → Curator Note → Prompt Question → Context (teaser + expand) → Lectio → Auditio → Actio
- ✅ P&P typography rule applied: Cormorant Garamond ONLY for prompt question, lectio quotes, auditio title. Open Sans for all other text (curator note, title, context, actio items).
- ✅ P&P context teaser: first 2 sentences always visible; "Read more / Less" toggle reveals remainder.
- ✅ P&P hero: 8x pinch-to-zoom + pan (react-zoom-pan-pinch). "pinch to explore" hint bottom-right. Parallax removed (conflicts with zoom).
- ✅ P&P Days 4–8 content audited against editorial guide — findings + rewrites saved to `KALLOS-PP-Audit-Days4-8.html` in Documents folder.
- ✅ "Non-Catholic" language removed from all docs and code — audience is always "the curious seeker."

### Up Next: Phase 2 Remaining
- Seed content into Sanity: Intro journey, Themes 2–5, Pause & Ponder prompts
- Source high-res images for all new content (search terms provided in docs)
- Build onboarding flow for the curious seeker
- Sanity Studio manual tasks (Sheri): rename Studio URL, update splash content
- User testing with Stories navigation and Breathe page

### P&P Page — Known UI Fixes Needed
- **Typography**: ✅ Fixed — Cormorant reserved for prompt question, lectio quotes, auditio title. Open Sans everywhere else.
- **Context teaser**: ✅ Fixed — First 2 sentences always visible, "Read more" reveals rest.
- **Hero image zoom**: ✅ Implemented pinch-to-zoom (8x max) + pan using react-zoom-pan-pinch. "pinch to explore" hint shown bottom-right. **Revisit after living with it** — if pinch feels awkward in the scroll context, switch to Option 2: tap hero → full-screen lightbox with zoom + pan.

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
- **Images:** Min 1200px, up to 4500px. 8x zoom on Breathe page and P&P hero (react-zoom-pan-pinch).
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
| `traditionReflection` | ✅ Updated — themes ref array added. ⚠️ **Schema change needed:** `authorType` currently only allows `church-father`, `saint`, `pope`. Need to add 3 new values: `theologian`, `mystic`, `church-doctor`. Also change field to allow **multiple selections** (some figures are both saint + doctor, etc.). **Known mismatches:** Jean-Pierre de Caussade (Jesuit priest, not a saint — currently tagged as `saint` as placeholder until new categories exist). |
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

## ⚠️ Design Consistency Rule

**When a design decision is made (new component, interaction pattern, visual treatment, player style, etc.), it MUST be applied to ALL screens where it's relevant — not just the screen being discussed.** Before pushing code, audit every screen for consistency. Known areas that need parity:

- **Audio player:** The custom circular play button (64px cream circle, play/pause SVG) is the chosen design. Pause & Ponder has it. Journey Encounter step still uses the native `<audio>` element — **must be replaced** with the circular player to match.
- **Navigation patterns:** Stories-style thin progress bar + swipe is on Journey. Ensure other multi-step flows (Visio Divina, onboarding) follow the same pattern when built.
- **Typography & spacing:** Espresso mode screens should all use the same heading sizes, label styles, and padding.

**Checklist before every push:** Does this design change appear on more than one screen? If yes, update all of them.

**Entry point rule:** Every page must work correctly from ALL entry points — direct navigation, Today tab, Library favorites, deep links, back button. Never test only the happy path. Ask: how else can a user arrive here, and does it still work?

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
- **8x pinch-to-zoom** — On Breathe page (Journey), content detail (Explore), and P&P hero image
- **P&P page** — No Begin state. Layout: Image → Title/date → Curator Note → Prompt Question → Context teaser → Lectio → Auditio → Actio. Typography: Cormorant for prompt question, lectio quotes, auditio title only.
- **Music player** — Chant / Ambient options on Pray page
- **Map** with colored markers by content type

---

## Editorial Principles (P&P and Journey Content)

These govern all content written for KALLOS — daily prompts, journey days, curator notes, questions. Read `KALLOS-Content-Guide-Pause-Ponder.html` for full detail.

### The Hook Rule
Every P&P day must open with one **surprising, specific, shareable fact** — something the user genuinely didn't know and would repeat at dinner. The hook lives in the **Curator Note** and must come first.

- ✅ Hook: "When this triptych is closed, Bosch painted seven scenes of Christ's suffering on the outside panels in grisaille. You move through darkness to reach the Adoration."
- ❌ Not a hook: "This painting rewards slowness." (atmosphere, not information)
- ❌ Not a hook: "This is one of the most influential works of the Renaissance." (significance claim, not a fact)

**Test:** Would someone say "wait, I didn't know that" and repeat it at dinner? If yes: hook. If not: keep looking.

### The Lectio Pairing
The Lectio is a philosophy + scripture pairing — two voices arriving at the same truth from different directions. Philosophy goes first (familiar entry for the curious seeker), scripture second (the discovery). Format:

- `philosophyText` + `philosophyAttribution` — e.g., Plato, Aristotle, Marcus Aurelius, Seneca, Heraclitus
- `lectio.text` + `lectio.attribution` — scripture passage

**The editorial thesis:** The great philosophers were asking questions that scripture had already answered. The Lectio is the room where that conversation happens. Do not force it — a strong scripture alone is better than a strained pairing.

### Voice Rules
- Write for the curious seeker — someone moved by beauty, regardless of faith background. Assume curiosity, not faith.
- Never use: "journey," "sacred," "profound," "transformative," "spiritual practice," "invitation to…"
- Curator note max length: 3–5 sentences. Short enough to read in one breath.
- Questions must connect to the user's real life — not hypothetical ("what would it feel like") but personal ("what was the last time you…")
- No explaining the art. The hook reveals what isn't obvious; the image speaks for itself.

### Language Rule
**Never say "non-Catholic" as a user category.** Sheri IS Catholic. Users may or may not be. The audience is always "the curious seeker." This applies to all docs, code comments, and content.

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

### Background Music Player — Journey Steps (Needs Restore) ⚠️
The chant/ambient background music player (Gregorian chant + piano options) was removed when the Stories-style navigation replaced the old footer nav. It still works on Visio Divina (`/pray/[artworkId]`) and the P&P prompt page (`/prompt`). **It needs to be restored for Journey steps.** The music player needs a new home — footer is gone, so options are: small floating button (top-right or bottom-right), integrate into the step header, or add to a slide-up controls panel. Discuss with Sheri before implementing. Music files are already in `/public/music/`.

### Background Music for Visio Divina — Preserve
The chant/ambient player on Visio Divina is working and intentional. Do not remove it. Consider whether it should also be available on the Breathe step of Journey (currently no music on Breathe).

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
7. ~~Seed Pause & Ponder daily prompts into Sanity~~ ✅ Done via script (Days 2–18). Day 1 manually entered. **Pending: Days 4–8 rewrites + Lectio additions — see `KALLOS-PP-Audit-Days4-8.html`**
8. **Day 2 Bosch — manual Sanity updates needed:**
   - Add `philosophyText` + `philosophyAttribution` to Lectio fields (seeded before schema existed)
   - Add Victoria "O Vos Omnes" YouTube URL to Auditio field
9. **Days 4–8 — P&P rewrites in Sanity Studio:** Open each daily prompt and apply the edits from `KALLOS-PP-Audit-Days4-8.html`. Includes question rewrites and Lectio pairings for all 5 days.
10. Seed Themes 2–5 content into Sanity (entry guide doc ready)
11. Source high-res images for all new content (search terms in docs)
