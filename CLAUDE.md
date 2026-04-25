# KALLOS — Claude Code Standing Brief

Read this at the start of every session. It contains all key product decisions, the current state of the project, and how to work with Sheri.

**Also read before any content, editorial, or product work:** `content-docs/KALLOS-Cowork-Briefing.html` (in this repo). It contains the product's purpose, the seven real people this is built for, what "earns its place" means, the Lectio quality standard, settled decisions not to relitigate, and how Sheri works as a PM. A session that skips this brief will produce generic output.

---

## The App

**Name:** KALLOS (double-L)
**Tagline:** Love the beautiful and the good
**Founding statement:** Beauty is the splendor of truth
**Type:** Independent contemplative discovery app (not an EWTN companion — no relationship or rights)
**Primary audience:** The curious seeker — moved by beauty, asking deeper questions, regardless of faith background
**Live app URL:** https://s-beauty-app.vercel.app
**Sanity Studio URL:** https://seeking-beauty.sanity.studio (to be renamed kallos.sanity.studio)

---

## How Sheri Works

- Product Manager, 20 years experience. Does not write code.
- Makes product decisions here in Cowork (Claude desktop), implementation happens in Claude Code (here).
- Always read the spec docs before starting work — they are the source of truth.
- Build verification: run `npm run build` from the repo root after every code change. If the SWC binary error appears (Cowork VM limitation, ARM64 architecture), fall back to `npx tsc --noEmit` instead. If the environment ever changes so that `npm run build` succeeds, use it. Commit after every step so there's a clean rollback.
- ⚠️ **`npx tsc --noEmit` is not enough on its own.** It catches type errors but misses Next.js-specific build failures: missing Suspense around client `useSearchParams`, prerender errors, dynamic-route metadata mismatches, image-domain config gaps, and similar. These ship to Vercel and break production. Always prefer `npm run build`. Only fall back to tsc when the build genuinely cannot run (Cowork VM SWC error). When the build runs locally, never claim a task is shipped on tsc alone. Lesson logged April 25, 2026 after a Suspense-wrap miss broke `/dashboard/review` on Vercel.
- Prefer the Claude Code app tab over the terminal.
- All future documents: HTML, not Word/docx. Sheri is not a Microsoft user.
- Design direction reference: **Variant.com** — use for layout, spacing, and typography inspiration.

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

**Content docs (key files now in `content-docs/` folder in this repo; full set also in Sheri's Documents folder):**

| File | What it is |
|------|-----------|
| `content-docs/KALLOS-Cowork-Briefing.html` | **In repo** — master context brief (product purpose, seven users, Lectio standard, Sheri's working style) |
| `content-docs/KALLOS-Content-Guide-7Day-Journey.html` | **In repo** — agent content instructions for 7-day Journey content |
| `content-docs/KALLOS-Content-Guide-Pause-Ponder.html` | **In repo** — agent content instructions for Pause and Ponder daily prompts |
| `content-docs/KALLOS-MythJourney-v3.html` | **In repo** — active Myth Journey (7 days, all fields). Days 1-4 complete in Sanity (Day 4 entered April 22, 2026). Days 5-7 pending. |
| `content-docs/KALLOS-JustinMartyr-PP-SanityEntry.html` | **In repo** — "They Were Early" Justin Martyr Pause and Ponder Sanity entry guide. April 12, 2026. All fields complete. Includes CTA linking to When Myth Became Fact journey. |
| `content-docs/BTG-3Day-Voice-Rewrite.html` | **In repo** — Complete voice rewrite of the 3-day BTG journey. April 13, 2026. Treats BTG as a standalone playlist for users who have never heard the term "Transcendentals." Includes Journey Description Card, Lewis-register titles, all 3 days (Day 3 = Emmaus), Day 3 Journey Close (bridge to Myth Became Fact), quote flags (Newman/Dorothy Day), and priority Sanity entry order. Supersedes `BTG-3Day-Field-Revisions.html`. |
| `content-docs/KALLOS-BTG-Day3-Goodness-SanityEntry.html` | **In repo** — Day 3 Goodness (Emmaus) Sanity entry guide. Caravaggio "Supper at Emmaus" 1601. Day title: "Everything Was Pointing Here." All fields complete. Dorothy Day quote (Tradition Reflection 3) needs verification before entry. |
| `content-docs/KALLOS-Myth-Journey-Arc.html` | **In repo** — Myth Journey arc planning doc |
| `content-docs/KALLOS-Content-Usage-Log.html` | **In repo** — content usage log (tracks audio, quotes, scripture used across all content) |
| `content-docs/CONTENT-RULES.md` | **In repo** — condensed content rules reference |
| `content-docs/KALLOS-CC-Audit-Brief.html` | **In repo** — Claude Code audit brief. READ THIS before any architecture or schema work. |
| `content-docs/KALLOS-CC-Schema-Design-Brief.html` | **In repo** — Claude Code schema design and migration brief. ✅ Complete April 23, 2026. |
| `content-docs/KALLOS-CC-Dashboard-Enhancement-Brief.html` | **In repo** — Claude Code dashboard enhancements brief. ✅ Complete April 24, 2026.
| `content-docs/KALLOS-CC-Content-Review-Dashboard-Brief.html` | **In repo** — Content Review Dashboard design brief. Architecture input requested from Opus before any build begins. Five open questions: where to build (Next.js vs App SDK), cross-type row model, detail panel strategy, preset view persistence, data fetching approach.
| `content-docs/KALLOS-CC-Content-Review-Dashboard-ADR.html` | **In repo** — Architecture Decision Record from Opus. Answers all five Q1-Q5 questions. Sheri amended: slide modal becomes inline cell expansion; field prefixing keeps journey days grouped in sort order.
| `content-docs/KALLOS-CC-Content-Review-Dashboard-Build.html` | **In repo** — Build brief. Five tasks: data layer, grid foundation, presets + URL state, cell expansion + record view, CSV export + voice scanner. Reference all three docs (Brief + ADR + Build) when starting the CC session. Answers all five Q1-Q5 questions from the brief. Sheri amended: slide modal (not slide-over) for detail panel; field prefixing to keep journey days grouped in sort order. ADR phase-1 scope bullets map directly to build-brief tasks. Reference both this and the brief when writing the build brief. Tasks 1–5 all shipped: photography content type, ancient era, reflectionQuestionsAudio, dashboard TTS columns, filter/sort client components, work-level repeat detection + source concentration, Sanity Presentation plugin. |
| `content-docs/KALLOS-Schema-Audit.html` | **In repo** — Task 1 output from audit (April 23, 2026). Full schema field inventory, cross-schema duplicate detection, GROQ trace, dead-field analysis, 15 prioritized recommendations (R1–R15). Read before any schema or data migration work. |
| `content-docs/KALLOS-artworkHook-Audit.html` | **In repo** — April 24, 2026 audit of all 47 populated contentItem.curatorNote records. KEEP/REVIEW decision per item. 41 KEEP (migrated to artworkHook), 6 REVIEW (still under legacy curatorNote, pending rewrite). Rewrite the REVIEW items first; the dashboard shows a live count in Section 2. |
| `content-docs/KALLOS-Content-Inventory.html` | **In repo** — Task 2 output from audit (April 23, 2026). Full Sanity content inventory snapshot: 53 content items, 27 P&P prompts, 28 tradition reflections, 5 journeys. Field-by-field completeness, TTS coverage (70,017 char gap), consolidated red list. GROQ queries embedded at bottom for reuse. |
| `KALLOS-Intro-Journey-Beauty-Truth-Goodness.html` | Intro journey — 7 days, all fields, ready for Sanity |
| `KALLOS-StPatrick-Day1-Draft.html` | St. Patrick feast day content — Day 1 standalone draft for review |
| `KALLOS-Sanity-Entry-Guide-Themes-2-5.docx` | Entry guide for seeding Themes 2–5 into Sanity |
| `KALLOS-Light-Journey-GoDeeper.html` | 16 tradition reflections for Light journey Step 6 |
| `KALLOS-Feast-Day-Content-Guide.html` | Editorial guide for feast day content — what it is, what it isn't, pre-publish checklist |
| `KALLOS-Content-Guide-Pause-Ponder.html` | Agent content instructions for Pause & Ponder daily prompts (updated March 2026 — hook + Lectio pairing revision) |
| `KALLOS-Content-Guide-7Day-Journey.html` | Agent content instructions for 7-day Journey content |
| `KALLOS-Pause-Ponder-18-Day-Checklist.html` | 18-day content checklist (March 17 – April 3) with per-day needs |
| `KALLOS-PP-Audit-Days4-8.html` | **NEW** — Content audit of Days 4–8 with specific rewrites + Lectio pairings. Use this for Sanity manual updates. |
| `KALLOS-Bosch-7Day-Journey.html` | Full 7-day Bosch journey content (narrative/editorial doc) |
| `KALLOS-Bosch-Sanity-Entry-Guide.html` | 8-day Bosch journey Sanity entry guide — all fields for all 8 days, including medium, themes, location. Ready for manual Sanity entry. |
| `KALLOS-HolyWeek-2026-Pipeline.html` | Holy Week P&P pipeline — 8 days (Palm Sunday–Easter), hooks, Surprising History notes, audio table. Needs Lectio + Actio before Sanity entry. |
| `KALLOS-Content-Guide-HolyWeek.html` | Agent content instructions for Holy Week P&P — arc table, hook guidance, Surprising History layer, Lectio territory by day, Actio rules, audio table, voice rules, pre-publish checklist. |
| `KALLOS-HolyWeek-Sanity-Entry-Guide.html` | Holy Week P&P Sanity entry guide — all 8 days (Palm Sunday–Easter), all fields pre-filled except Lectio + Actio (placeholders with territory guidance). Deadline March 28. |
| `KALLOS-PM-Brief.html` | Product brief for cold sessions — product purpose, the seven real users, what "earns its place," Lectio quality standard, Sheri's working style, settled decisions. Read this before any content or editorial work. |
| `KALLOS-Onboarding-Copy.html` | Onboarding screen copy — 4 screens, voice-reviewed March 2026. Reference doc for onboarding build. |

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

### Phase 2 Work Done (March 26, 2026)
- ✅ Deprecated `#203545` teal fully purged — ArtworkViewer info bar, GlobalMap cluster gradient, globals.css variable all updated to espresso `#16110d`
- ✅ ArtworkViewer info bar redesigned — cream text palette, ambiguous book icon replaced with labeled "Reflect" button (square corners)
- ✅ Nav icons — all icons use stroke-only active state (strokeWidth 2 vs 1.5 inactive). Fixes Today tab showing only a green dot (fill has no effect on open line paths like sun rays). Inactive opacity bumped 35% → 55%.
- ✅ Tap targets fixed — FavoriteButton sm/md increased to 44px (w-11 h-11). Explore pray icon increased from 28px to 44px.
- ✅ Go Deeper step hidden when day has zero tradition reflections. Progress bar auto-adjusts from 6 to 5 segments.
- ✅ Cormorant accessibility — Lectio quotes >150 chars fall back to Open Sans 0.95rem. Cormorant preserved for short quotes only. (Superseded March 28 — see font audit below.)
- ✅ P&P archive built in Library — all past prompts browseable without notifications. All/Saved filter toggle. Gold heart indicator on saved prompts.
- ✅ Journey day Encounter + Breathe layers fixed — curatorNote displays on Encounter, encounterNote collapsible ("Look Closer"), Lectio and Auditio layers render, CircularAudioPlayer shared component added.
- ✅ Onboarding Screen 1 headline revised to: "Beauty calls deep to the soul" — replaces "Beauty has always been trying to tell you something"
- ✅ Onboarding Screen 1 pronunciation added: *kal · os* in small Cormorant italic below wordmark
- ✅ Onboarding Screen 4 secondary CTA revised: "Browse Journeys" → "Start with Beauty, Truth & Goodness →"
- ✅ Intro Journey restructured: 3-day entry-point version (Beauty / Truth / Goodness) + 7-day deeper dive — see Journey Framework below

### Phase 2 Work Done (March 29, 2026)
- ✅ Verba feature built: optional collapsible scrollable text panel in P&P page (VERBA label, chevron toggle). Appears below audio player only when text is present. Single Sanity field (`verbaOriginal` in auditio object) — paste any format: Latin only, English only, or interleaved. Schema, GROQ query, TypeScript types, and UI all updated.
- ✅ Verba entry guide format: Holy Week entry guide Day 2 and Day 3 use `<textarea>` elements for reliable copy-paste (line breaks preserved). All other days have optional placeholder.
- ✅ Day 2 (Holy Monday) Verba text: full Adoro te devote, 7 verses, Latin and English interleaved line by line. Ready in entry guide textarea.
- ✅ Day 3 (Holy Tuesday) Verba text: Christus factus est (Philippians 2:8-9), Latin and English interleaved line by line. Ready in entry guide textarea.
- ✅ Adoro te devote MP4 converted to MP3: `01-adoro-te-devote--st-cecilia.mp3` in Documents/Holy Week/Audio-Holy Week/. Ready for Sanity upload.
- ✅ Preview fallback fixed: preview client errors caught silently; falls back to regular published client. No `NEXT_PUBLIC_SANITY_TOKEN` required for previewing published records.
- ✅ Sanity Studio preview URL confirmed: `https://s-beauty-app.vercel.app`. Studio deployed with corrected URL.
- ✅ Audio rule added: gregorian-chant-hymns.com may deliver MP4 files. Convert to MP3 using ffmpeg before uploading to Sanity.

### Phase 2 Work Done (March 28, 2026)
- ✅ BTG Day 3 (Goodness) content complete: new content item (Caravaggio "Supper at Emmaus," 1601, National Gallery London) + journey day record. Hook: ichthys hidden in fruit basket wicker and tablecloth shadow (verified, National Gallery). Concept: bonum as third Transcendental. Lectio: Aristotle Nicomachean Ethics Book I opening + Luke 24:31 RSV-2CE. Music: "Perfect Situation" by Alana Jordan (Pixabay, CC0, track ID 500256). Day title: TBD (options: "What beauty asks of us" / "What you were aiming at" / "Everything was pointing here" / "The one who was there"). Sanity entry guide: `KALLOS-BTG-Day3-Goodness-SanityEntry.html`. Note: no context field on journey day schema (content item context field carries the philosophical depth). No actio field on journey day schema (P&P only).
- ✅ Journey day Connect step fixed: step order corrected (Go Deeper before Connect), "TOMORROW" label conditional on nextDayImageUrl, last-day state renders "Journey complete" + "Start a new journey" CTA + Close button.
- ✅ Cormorant font audit and fixes: full app audit across JourneyDaySteps.tsx, ArtworkViewer.tsx, prompt/page.tsx. All small-size Cormorant (openText, audio titles, Breathe helper text, ArtworkViewer quotes) replaced with Open Sans italic. Lectio 150-char conditional removed; both philosophy and scripture quotes now always Cormorant at clamp(1.3rem, 4.5vw, 1.55rem), consistent every day. Font hierarchy locked: Montserrat (labels), Open Sans regular (body), Open Sans italic (contemplative instruction), Cormorant (quotes at 1.3rem+ only).
- ✅ Swipe sensitivity fixed: threshold raised 60px to 90px, angle tightened to 22 degrees, time window reduced to 350ms. touch-action: pan-y added to swipe container to fix off-center artifacts on iOS. Multi-touch guard added so pinch-to-zoom on Breathe no longer accidentally triggers a swipe. Transitioning lock (520ms) prevents double-swipe mid-animation.
- ✅ Build verification rule added to CLAUDE.md: run npm run build first; fall back to npx tsc --noEmit if SWC binary error (Cowork VM ARM64 limitation). Update the rule if environment changes.

### Phase 2 Work Done (March 27, 2026)
- ✅ Onboarding flow built : 5 screens, Stories-style progress bar + swipe, espresso mode (`app/splash/page.tsx`)
- ✅ Beta onboarding gate : `localStorage` replaced with `sessionStorage`. Shows once per browser session, resets on close. See Beta behavior note in Onboarding Framework below.
- ✅ Pulsing circle nav button on all onboarding screens , consistent with Breathe page animation language (`kallosNavBreathe` keyframe, 3.5s ease-in-out)
- ✅ Onboarding typography finalized . KALLOS wordmark: Montserrat 1.75rem tracking 0.3em weight 600. Headlines: Cormorant 2.125rem italic. Body: Open Sans 0.9375rem weight 300 lineHeight 1.8. Screen 3 cards: Open Sans (not Cormorant, not quotes).
- ✅ Safe area bottom padding: `calc(env(safe-area-inset-bottom, 0px) + 88px)` across all 5 screens
- ✅ Primary CTA label confirmed: "Start here →" routes to `beauty-truth-and-goodness` journey slug
- ✅ Beta feedback survey drafted : 6 questions, anonymous, no Google account required. Ready for Sheri to enter in Google Forms.
- ✅ Beta tester text message drafted
- ✅ Audio player bug fixed: added useEffect cleanup to stop audio when journey closes, added pause/play event listeners to keep UI in sync if browser interrupts playback. Both bugs resolved in `CircularAudioPlayer` in `JourneyDaySteps.tsx`.

### Phase 2 Work Done (March 25, 2026)
- ✅ Em dash ban enforced universally — all content docs and pipeline docs cleaned (87–88 em dashes removed per doc)
- ✅ Audio sourcing rules synced across all docs — both content guides now match the full 5-rule framework in CLAUDE.md (Pixabay, Musopen, FMA, Internet Archive, gregorian-chant-hymns.com, Bandcamp; genre guidance; worked examples)
- ✅ "Surprising History" editorial framework defined — discovery framing rule, where it lives in Sanity fields, when to use vs. skip. Added to CLAUDE.md Editorial Principles.
- ✅ Onboarding copy audited and fixed — parallel triplets removed (Screen 2), content types corrected to all 8 (Screen 3), "Step into a Journey" → "Start a Journey" (Screen 4)
- ✅ Holy Week pipeline doc audited — em dashes removed, "Not Pagan Angle" → "Surprising History" sections renamed, audio pipeline note corrected (Miserere not pre-uploaded)
- ✅ Holy Week Content Guide written — full agent instructions: arc table, hook guidance, Surprising History layer, Lectio territory by day, Actio rules, audio table, voice rules, pre-publish checklist
- ✅ session-close skill created — approval-gated session documentation tool. Available in Documents folder.
- ✅ skills-tracker skill created — PM resume/skills evidence tracker. Available in Documents folder.
- ✅ Bosch journey + Bosch Sanity entry guide added to CLAUDE.md content docs table

### Phase 2 Work Done (April 24, 2026)
- ✅ R5 complete — `journeyDay` promoted from inline object to standalone document schema. Migration script ran atomically per journey (`scripts/migrate-journey-days-to-documents.ts`); 25 journeyDay documents created with deterministic IDs (`journeyDay-<journeyId>-day-<N>`) and required `journey` back-references. All 5 journeys validated post-migration. Pre-migration backup: `scripts/backups/journeys-pre-migration-2026-04-24T01-22-48-179Z.json`. 3 auto-generated draft journey copies (BTG original, Light, Bosch) were discarded before migration per Sheri's decision.
- ✅ R1 complete — `contentItem.curatorNote` renamed to `artworkHook` (and `curatorNoteAudio` → `artworkHookAudio`). Interactive audit of all 47 populated records: 41 KEEP (migrated via `scripts/migrate-artwork-hook-rename.ts`), 6 REVIEW (Addison's Walk, The Art of Being Moved, Easter Sunday, Holy Saturday, Calling of Saint Matthew ×2 — data untouched, flagged for rewrite). Full audit doc: `content-docs/KALLOS-artworkHook-Audit.html`. App reads both fields via `legacyCuratorNote` GROQ alias during the rewrite window.
- ✅ R6 complete — `reflectQuestions` renamed to `reflectionQuestions` on journeyDay (matches contentItem). 25 documents migrated via `scripts/migrate-reflect-questions-rename.ts`. Typo hazard closed.
- ✅ Task 3 — auditio object on both `journeyDay` and `dailyPrompt` gained `composerArtist`, `workTitle`, and `genre` (9-value dropdown) fields for content-repeat intelligence. Purely additive. Existing records have empty fields until Sheri fills them in Studio.
- ✅ Task 4b — `traditionalPrayerSource` rendering bug fixed. Field is now projected by `getArtworkById` and the Visio Divina Pray step displays it correctly.
- ✅ Task 4c — inline comment added to `app/prompt/PromptClient.tsx` explaining the three-fields-three-jobs rule for curator notes (R1 Option C).
- ✅ Task 5 — dashboard rewritten for post-R5 structure: `getDashboardJourneyCompletion` and `getDashboardAudioStatus` now query `journeyDay` documents directly via `journey._ref`. TR-to-journey traversal updated through the new journeyDay layer. Each day row in Section 1 links directly to its journeyDay Studio document. Genre distribution view added to Section 4 (flags any genre > 40% of total). REVIEW-items banner added to Section 2, automatically detected from data state (items still holding legacy curatorNote). SCHEMA_HEALTH block updated — R1, R5, R6 marked RESOLVED; R3/R4 still open.
- ✅ Studio deployed twice during the session (intermediate + final). App build passes clean.

### Phase 2 Work Done (April 24, 2026 — evening, Presentation drafts)
- ✅ Full draft-mode preview wired and confirmed live for **journey**, **journeyDay**, and **contentItem** (Visio Divina). Closes Manual Task 65.
  - `previewMode: { enable: '/api/draft' }` added to `presentationTool` in `sanity/sanity.config.ts`.
  - `app/api/draft/route.ts` validates via `@sanity/preview-url-secret` (Sanity-managed secret, not hand-rolled) and flips `draftMode()` on before redirecting back.
  - Server-side routes now branch on `(await draftMode()).isEnabled`:
    - `app/journeys/[slug]/page.tsx` → `getJourneyPreview(slug)` with published fallback on null.
    - `app/journeys/[slug]/day/[dayNumber]/page.tsx` → same pattern.
    - `app/pray/[artworkId]/page.tsx` → refactored from all-client to server wrapper; `PrayClient` now receives pre-fetched `initialArtwork`.
  - All three tested end-to-end: edit in Presentation's right pane → draft edit shows on iframe after ↻ refresh.
- ✅ Onboarding gate hardened for iframe context. `app/page.tsx` now skips the splash redirect entirely when inside an iframe (`window.self !== window.top`). Storage upgraded from `sessionStorage` (every-session re-show) to `localStorage` (show once per install). Prevents Presentation's iframe from being hijacked to `/splash` on cold load. See Onboarding Framework below.
- ✅ Splash refactor to Sanity-driven content added to Parking Lot (hardcoded copy in `app/splash/page.tsx` → `splashPage.screens[]` array). Keep layout intact.
- ✅ Visio Divina Finish button fixed: routes to `/library` via `router.push("/library")` instead of `router.back()`. The `back()` call failed silently when there was no browser history (e.g., arrival from a share link or inside Sanity Presentation's iframe).

**Presentation workflow quirk to remember:** typing into the iframe URL bar updates the URL and matches `mainDocuments` on the right, but the iframe doesn't always navigate. **Always click ↻ refresh** after changing the iframe URL or making a doc edit — forces re-hydration and pulls current draft state. Auto-refresh isn't magic.

**Stacked fixes that made Presentation work** (kept for reference, in order required):
1. `@sanity/visual-editing` + `<VisualEditing />` mounted in root layout (`components/VisualEditingClient.tsx`) — without this, postMessage handshake throws "Unable to connect".
2. CSP `frame-ancestors` includes `https://sanity.io` and `https://*.sanity.io` (not just `*.sanity.studio`). Deprecated `X-Frame-Options` removed.
3. Path-based routes for iframe compatibility: `/prompt/[date]` and `/journeys/[slug]/day/[dayNumber]` (Presentation URL-encodes `?` so query strings 404 in the iframe).
4. `perspective: 'drafts'` in `previewClient` (was `'previewDrafts'`; renamed in newer Sanity API versions).
5. `NEXT_PUBLIC_SANITY_TOKEN` in Vercel must be the **full** token (was truncated ~88 chars, silently returned 401 → drafts fell back to published).
6. `previewMode: { enable: '/api/draft' }` + per-route `draftMode()` branching (evening session).

### Security reminder before launch

`NEXT_PUBLIC_SANITY_TOKEN` is bundled into client JS (visible in any visitor's browser network tab). Before broad release: rotate to a **read-only / viewer-role** token via Sanity manage.sanity.io → API → Tokens, save the new value to Vercel + `.env.local`.

---

### Phase 2 Work Done (April 24, 2026 — Dashboard Enhancement)
- ✅ Schema additions (all additive, no migration): `photography` added to `contentItem.contentType` as the 9th option (after `sacred-art`); `ancient` added to `traditionReflection.era` as the first option (before `fathers`); new `reflectionQuestionsAudio` file field on `journeyDay` for Reflect-step narration. Closes Manual Tasks #36 and #37.
- ✅ Dashboard Section 4 — Journey Day Audio now shows all six narration slots per day (openText, encNote, artworkHook, context, reflectQ, auditio) plus a `goDeeper` column showing count of tradition reflections with audio / total linked. `artworkHook` and `context` audio are pulled from the linked contentItem via ref traversal in GROQ.
- ✅ Dashboard filter + sort — three tables extracted to client components: `app/dashboard/TRTableClient.tsx`, `app/dashboard/ContentItemsClient.tsx`, `app/dashboard/AudioTableClient.tsx`. Each accepts server-fetched data as props (same pattern as `app/prompt/PromptClient.tsx`). Filters: TR by journey/type/era/theme/audio; Audio by journey and "show days with gaps only"; Content by type/theme/REVIEW-only/missing-hook/missing-audio. Click column headers to sort; arrow indicator on active column. In-memory state, no URL params. REVIEW banner in Section 2 refers to the new REVIEW-only filter.
- ✅ Dashboard Section 3 — source concentration bar above TR table (stacked 7-bucket breakdown with "other / unset"; flags any single type >50%). "Authors in >1 journey" banner now includes count and points to amber row highlight. `TRTableClient` accepts `repeatedAuthors` prop and paints matching rows amber.
- ✅ Dashboard Section 4 — work-level repeat detection. New GROQ `works` block in `getDashboardAudioStatus` projects `composerArtist` + `workTitle` (with legacy fallback to free-text `title`/`composer`/`artist`) across journeyDay and dailyPrompt auditio records; case-insensitive grouping surfaces any work used more than once. Three-state UI (no data / no repeats / N repeats).
- ✅ Stretch: Sanity Presentation plugin installed. Studio now shows a live side-by-side app preview while editing. `resolve.locations` maps each document type to its app route (dailyPrompt, journey, journeyDay, contentItem sacred-art, splashPage). Draft-mode enable wired to `app/api/draft/route.ts` (validates `SANITY_PREVIEW_SECRET` before enabling Next.js draft mode). Full draft-read path only exists on the P&P page today (via existing `?preview=1` shortcut); other routes render published content in the iframe until each page's data-fetch is extended to honor `draftMode()` — tracked as a follow-up. Sheri: add `SANITY_PREVIEW_SECRET` to `.env.local` and Vercel env vars before Presentation's enable-drafts button works.
- ✅ Five per-task commits for clean rollback: schema (660e03c7 checkpoint → 649262f6 → 1 per task).

### Phase 2 Work Done (April 23, 2026 — continued)
- ✅ Schema design CC session complete — R1 (artworkHook rename, 41 KEEP / 6 REVIEW), R5 (journeyDay promoted to document, 25 docs migrated), genre + composerArtist + workTitle fields added, R6 (reflectionQuestions rename), rendering bugs fixed, dashboard updated. Commit 649262f6.
- ✅ R10 decision: Hold — episode schema and 6 Seeking Beauty documents kept as-is. No migration. Verify watch-listen links when convenient.
- ✅ R15 decision: Defer — 8-in-1 contentItem schema manageable. Revisit after companion journeys ship.
- ✅ Dashboard enhancement brief created — KALLOS-CC-Dashboard-Enhancement-Brief.html. CC session in progress.

### Phase 2 Work Done (April 23, 2026)
- ✅ Full architecture audit complete (Claude Code, Opus 4.6) — schema field inventory, GROQ trace, dead field detection, 15 recommendations (R1-R15), 4 open questions. Output: `content-docs/KALLOS-Schema-Audit.html`.
- ✅ Full content inventory complete — 53 content items, 27 P&P prompts, 28 tradition reflections, 5 journeys, TTS gap of 70,017 characters identified. Output: `content-docs/KALLOS-Content-Inventory.html`.
- ✅ Live content dashboard built and deployed at `/dashboard` — server-rendered Next.js page, 7 sections, revalidate 60s, gated by `DASHBOARD_ENABLED=true` env var. 5 new named GROQ query functions in `lib/sanity.ts`.
- ✅ Schema design brief written — R1 (artworkHook rename) and R5 (journeyDay promotion) decisions made and documented. Ready for next CC session. See `content-docs/KALLOS-CC-Schema-Design-Brief.html`.
- ✅ Pitch research expanded — CTS Corporate Travel Services, Elizabeth Lev (Liz Lev Tours), and PAVM added to KALLOS-Pitch-Research.html. Companion journey types mapped against pitch list.
- ✅ Companion journey framework designed — four formats (PRE/DURING/POST/SUSTAINED), voice framework (Story/Companion/Curator/Contemplative), three demo journeys identified (Seeking Beauty Ep1, CTS Rome, Elizabeth Lev Pio Cristiano).

### Phase 2 Work Done (April 22, 2026)
- ✅ When Myth Became Fact Day 4 content complete and entered in Sanity — all fields revised: Curator Note (Mythopoeia/Philomythus to Misomythus hook), Opening Text (thirst metaphor removed, paragraph break added), Context (em dashes fixed, Whipsnade quote confirmed), Go Deeper (Tertullian "anima naturaliter Christiana" replaces Tolkien subcreation repeat), Auditio (Scarborough Fair piano, NowoArt, Pixabay, confirmed uploaded). Hero image: addisons-walk-bw-warm.jpg (real Flickr photo, converted to warm duotone).
- ✅ Disputation of the Holy Sacrament P&P v2 complete — new beneath-scenes Curator Note, Renaissance disputatio Context opening, new Prompt Question (mystery exceeds inquiry), new Actio (Host then beneath-scenes), copy-paste buttons added to all fields. Pagan Sacrifice journey concept captured in doc.

### Phase 2 Work Done (April 21, 2026)
- ✅ Conversation backup hook — added `SessionEnd` hook to `~/.claude/settings.json`. Backups now write on every session close, not only on context compression. Backup location: `~/Documents/claude-conversation-backups/`.
- ✅ Sanity "Preview in app" expanded — now available on `journey` (→ `/journeys/[slug]`), `contentItem` sacred-art (→ `/pray/[id]`), and `splashPage` (→ `/splash`) in addition to `dailyPrompt`. Refactored with `resolvePreviewUrl()` helper in `sanity/sanity.config.ts`. Non-previewable types show a clear alert.
- ✅ Sanity Studio upgraded to React 19.2.5 — matches main app. `react`, `react-dom`, `@types/react` all updated in `sanity/package.json`. Studio redeployed clean.
- ✅ Journey day deep-linking — `?day=N` URL parameter added. Tapping a shared day link opens that day's stepper directly. Per-day OG metadata: day artwork, day title, "Day N of [Journey]" as description. `app/journeys/[slug]/page.tsx` converted to server component with `generateMetadata` handling both journey-level and day-level cases. Client UI extracted to `app/journeys/[slug]/JourneyDetailClient.tsx` with `useSearchParams` URL sync.
- ✅ Share This Day — upload arrow icon on each day list row (left of chevron). `stopPropagation` so tap-to-open still works. Shares `title + url` only (no text field) to prevent double link previews in iMessage.
- ✅ Share icon consistency — upload arrow SVG used app-wide: Share This Journey (Connect step, replaces 3-circle network icon), P&P share (top bar), Share This Day (day list row).

### Phase 2 Work Done (April 13, 2026)
- ✅ Share CTA added to Journey Connect step — circle icon (40px, gold border) + "SHARE THIS JOURNEY" small caps label. Uses Web Share API: shares journey title + URL. Clipboard fallback for unsupported platforms. paddingBottom 24px (matches paddingTop 20px rhythm).
- ✅ OG meta tags for journey pages — created `app/journeys/[slug]/layout.tsx` with `generateMetadata`. Pulls journey title, description, and hero image from Sanity. Enables rich iMessage/social link preview cards. `NEXT_PUBLIC_SITE_URL=https://s-beauty-app.vercel.app` set in .env.local and Vercel environment variables.
- ✅ X button on Connect step now marks day complete — header close button was calling `onClose` without `onMarkComplete`. Fixed to match swipe behavior.
- ✅ Theme pill removed from journey pages — removed from journey card list and journey detail hero. Theme tagging serves the Explore filter, not a visible label.
- ✅ `totalDays` field added to Sanity journey schema — editors set the intended full arc once. GROQ queries updated to `coalesce(totalDays, count(days))`. Detail page prefers Sanity field. Sanity Studio deployed. All 4 journeys updated: Beauty Truth & Goodness (3 days), When Myth Became Fact (7 days), Light (7 days), Bosch (8 days).
- ✅ Journey complete badge redesigned — gold filled circle (30px, rgba(193,155,95,0.92)) with cream checkmark SVG. Replaces "Complete ✓" text badge. In-progress journeys still show "Day X/Y" text badge.
- ✅ BTG 3-day journey voice rewrite complete — treated as standalone playlist for users who have never heard the term "Transcendentals." New doc: `content-docs/BTG-3Day-Voice-Rewrite.html`. Supersedes `BTG-3Day-Field-Revisions.html`.
- ✅ BTG Day 3 replaced entirely: monastery/Benedict content out, Caravaggio "Supper at Emmaus" (1601, National Gallery) in. Day title confirmed: "Everything Was Pointing Here." Sanity entry guide: `content-docs/KALLOS-BTG-Day3-Goodness-SanityEntry.html`.
- ✅ BTG day titles updated to Lewis register: "The Inconsolable Longing" (Day 1, Lewis's own phrase from The Weight of Glory), "Light From Outside the Frame" (Day 2), "Everything Was Pointing Here" (Day 3).
- ✅ Day 2 Connect Thread updated to point to Emmaus (previous version pointed to monastery/Benedict Day 3, which no longer exists).
- ✅ Journey Description Card written in Lewis register: "Three things have been stopping people mid-sentence since before Plato had words for them. C.S. Lewis followed one of them for thirty years before he understood what it was pointing at. Three days. One thread."
- ✅ Day 3 Journey Close written as bridge to Myth Became Fact: opens the question of where the Transcendentals point without answering it.
- ✅ TTS workflow note added to CONTENT-RULES.md: every field entered in Sanity is also the TTS script. Read aloud before confirming.
- ✅ Caravaggio factual error corrected in Day 2: "The Calling of Saint Matthew" was NOT rejected. The rejected painting was a different commission (Saint Matthew and the Angel, first version). Fixed in voice rewrite.
- ✅ BTG Journey Description Card finalized: "Three things the philosophers kept returning to for centuries: beauty, truth, and goodness. They called them the transcendentals. Classical education was built on them. Cathedrals were built to embody them. Christian theology spent centuries on why all three point in the same direction. Follow the thread." Replaces original (too mysterious, Plato line factually wrong, Lewis named in user-facing copy).
- ✅ Day 1 full content item audit added to BTG-3Day-Voice-Rewrite.html: Context rewrite, Encounter Note (N/A), Lectio (Simone Weil + Psalm 27:4, both need verification), Auditio direction (Psalm 27 chant), TR1 Plato (fixed misattribution + rewrite), TR2 Augustine (verify quote + rewrite), TR3 JPII (replace quote with Letter to Artists + rewrite).
- ✅ Day 1 Curator Note revised: removed duplicate with Context ("What he eventually understood: Joy was not pointing at any earthly thing. It was pointing past all of them."). Biscuit tin paragraph preserved. Context carries the conclusion; Curator Note carries the concrete arrivals.
- ✅ Three new voice rules added to CLAUDE.md: Lewis as internal-only register test, opening text length follows content, BTG Day 1 artwork guidance.

### Phase 2 Work Done (April 2, 2026)
- ✅ Context expanded text opacity fixed — expanded paragraphs were using `creamDim` (50% opacity) while teaser used `cream` (88% opacity). Both now use `cream` consistently. Fix in `app/prompt/PromptClient.tsx`.
- ✅ OG image social sharing fixed — root cause: Next.js auto-generated `og:image` URL did not include the `?date=` param, so all platforms cached one image indefinitely. Fix: added `generateMetadata` export to `app/prompt/page.tsx` (requires server component). Client UI moved to `app/prompt/PromptClient.tsx`. `generateMetadata` now fetches the prompt server-side and sets `og:image` directly to the Sanity CDN URL with `?w=1200&fit=crop&auto=format`. Fast, globally cached, no generation timeout.
- ✅ Twitter card format fixed — added `twitter:card: "summary_large_image"` to metadata. Without it X defaulted to small thumbnail ("summary") format. Now shows full-bleed artwork card. Confirmed working on X (The Last Supper visible full-width).
- ✅ `app/prompt/page.tsx` restructured — now a server component (no `"use client"`). Exports `generateMetadata`. Renders `<PromptClient />`. All UI logic lives in `app/prompt/PromptClient.tsx` (client component, unchanged functionally).
- ✅ `opengraph-image.tsx` kept in place but superseded — `generateMetadata` takes priority. The dynamic image generation route timed out for X/Facebook bots (had to call Sanity + load 4500px painting on demand). Sanity CDN URL is the reliable replacement.

### Phase 2 Work Done (April 1, 2026)
- ✅ Social sharing built — P&P share button with date-stable URLs (`/prompt?date=YYYY-MM-DD`), native Web Share API. OG image uses Sanity CDN URL directly (see April 2 fix). Confirmed working on X, Facebook, iMessage, Instagram DM. Instagram Stories is a platform limitation (only accepts media files, not URLs).
- ✅ Vercel build error fixed — `opengraph-image.tsx` `searchParams` typed as `Promise<{date?: string}>` with null-coalesce `?? {}` to handle static prerender.
- ✅ Holy Week Days 7 and 8 content finalized and entered into Sanity. Day 7 image: Image 1 (dark atmospheric Anastasis, Chora Church). Day 8 audio: placeholder uploaded, may be replaced before Easter.
- ✅ Day 7 Holy Saturday: curator note updated ("no morning Mass"), actio updated ("Light a candle. Reflect on the week."), Exsultet audio sourced (archive.org, CC0, cantor unattributed).
- ✅ Day 8 Easter Sunday: context restructured (CHRIST IS RISEN leads), curator note rewritten (Justin Martyr/Emperor's court), prompt question updated ("Did you know it was true?"), Lectio updated (Cicero + Luke 24:5-6).

### Up Next: Phase 2 Remaining

**Next session priorities (in order):**
1. ~~**Holy Week Sanity entry:** Days 3-6 still need entry.~~ ✅ All 8 Holy Week days entered and published (April 1, 2026). Day 8 audio is a placeholder — confirm or replace before Easter.
2. **Today tab redesign:** Remove the tap-to-begin card. Make Today = full P&P experience as the landing state. Decision made March 30 (see Parking Lot). **Now unblocked — Holy Week content is complete.**
3. **Standards for seeding docs:** define a repeatable format/checklist for Sanity entry guides so every new content type gets the same treatment.
4. ~~**3-day BTG journey content review:** reshape Days 1, 3, 5 from existing 7-day doc into standalone 3-day entry-point journey. Sanity entry guide needed.~~ ✅ Done (April 13, 2026). Voice rewrite complete. See `content-docs/BTG-3Day-Voice-Rewrite.html`.
4a. **BTG Sanity entry:** Enter all BTG revised copy using `BTG-3Day-Voice-Rewrite.html` (priority order at bottom of doc). Fix Newman quote (Day 1) first. Verify Dorothy Day quote (Day 3) before entering Tradition Reflection 3. Confirm Day 3 Journey Close field with dev. Create TTS for each field during entry.
5. **Create Google Forms beta feedback survey:** 6 questions drafted (March 27). Sheri enters in Google Forms.
6. **Content pipeline audit:** review all P&P + Journey content for variety and cohesion across the full arc. Claude content audit pass.

**Also pending (smaller):**
- Explore page duplicate content items: when a content item has been uploaded more than once to Sanity, each instance shows as a separate card on Explore. Confirmed with Adoration of the Magi and Calling of Matthew. Needs dedup logic or a Sanity cleanup pass. Discuss before building.
- Days 4–8 P&P rewrites in Sanity: edits from `KALLOS-PP-Audit-Days4-8.html`. Sheri manual entry.
- Day 2 Bosch Sanity updates: `philosophyText` + `philosophyAttribution` + Auditio YouTube URL. Sheri manual entry.
- Scripture audit (NIV → RSV-2CE): Holy Week + Days 9–18 drafted before translation standard was set. Verify before or during Sanity entry.
- Background music player: restore for Journey steps (removed when Stories nav replaced footer). Discuss placement with Sheri before building.
- Seed content into Sanity: Intro journey, Themes 2–5
- Source high-res images for all new content (search terms provided in docs)
- ✅ Onboarding flow built: 5 screens live (March 27, 2026)
- Sanity Studio manual tasks (Sheri): rename Studio URL, update splash content
- User testing with Stories navigation and Breathe page

### Onboarding Framework — Settled Decisions (March 27, 2026)

**Build status:** ✅ Built and deployed (March 27, 2026). `app/splash/page.tsx`.

**Screen count:** Target 5 screens. 4 feels tight; up to 6 is acceptable. Each screen does one thing.

**Proposed 5-screen structure:**
1. Brand identity — KALLOS wordmark, pronunciation (*kal · os*), brief "what this is" framing. Not the hook — grounding first.
2. App purpose — high-level explanation of why KALLOS exists. The idea of beauty, truth, goodness as a way of seeing. Copy being wordsmithed by Sheri.
3. Feature tour — two things only: daily P&P and Journeys. Format: two stacked cards (mobile), each with a small visual + one sentence. Card 1: cropped artwork thumbnail + "Every day — a piece of art and a question to sit with." Card 2: journey card visual + "Or go deeper — 7 days into Beauty, Truth, and Goodness." No icons, no bullet lists, no feature names. Show what they'll encounter, not what the product is.
4. Hook — the emotional culmination. This is the last thing before the CTA. Copy being wordsmithed by Sheri.
5. CTA — primary: start the 3-day BTG journey. Secondary: skip to Today (P&P). Label TBD.

**Note:** Screen order above is indicative. The hook (4) is the only locked position — always the culmination before the CTA. Screens 2 and 3 can be reordered. If the hook copy is strong enough to carry purpose + emotion in one screen, Screens 2 and 4 could merge — but keep them separate until copy is confirmed.

**Primary CTA (non-negotiable):** Start the 3-day Beauty, Truth & Goodness journey directly. Label TBD. Frame: "3 days or 30 minutes — you decide." Do NOT route to P&P as primary.

**Day-gating:** Not implemented and will not be added for testing. All journey days are accessible in one sitting. A user can complete all 3 days of the intro journey immediately after onboarding. No code changes needed for this behavior.

**Secondary option:** Skip to Today (P&P) or Browse Journeys — always available.

**Onboarding gate — show once per install, skip in iframes:**
- `localStorage` flag `kallos-onboarded` — set on skip or CTA tap, checked on Today page load. Once set, splash never shows again for that install/browser.
- Iframe guard: if `window.self !== window.top` (Sanity Presentation preview context), the gate is bypassed entirely and the Today page renders directly. Prevents Presentation iframes being hijacked to `/splash` on cold load.
- Changed April 24, 2026 from `sessionStorage` (every session) to `localStorage` (once per install). Earlier beta-only "show every session" rule retired — it was hijacking preview iframes and wasn't serving real beta testers (who rarely closed the tab).
- Reverting to every-session behavior would require: swap `localStorage` → `sessionStorage` in `app/page.tsx` gate + `app/splash/page.tsx` `markSession`. Not recommended.

**Skip behavior:**
- Skip button visible at all times on all screens.
- Skip routes to Today page (P&P / current daily prompt).
- On return: splash does NOT show again (localStorage persists). To force-re-view, clear site data in DevTools or delete the `kallos-onboarded` key in localStorage.

**Navigation:** Same Stories-style thin progress bar + swipe as Journey steps. No back button needed. Skip always visible top-right.

**Reference doc:** `KALLOS-Onboarding-Copy.html` (copy in progress — structural decisions above supersede the 4-screen version in that doc).

---

### P&P Page — Known UI Fixes Needed
- **Typography**: ✅ Fixed — Cormorant for prompt question and lectio quotes (both, always, at 1.3rem+). Open Sans italic for auditio title and all contemplative instruction text. Open Sans regular everywhere else.
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

### 7 Founding Journeys

**Intro — two tiers, both on Journeys tab:**
- **0a. Beauty, Truth & Goodness (3-day)** — Entry-point intro. Day 1 Beauty, Day 2 Truth, Day 3 Goodness. Can be done in one sitting (~30 min) or across 3 days. Same 6-step format as full Journeys. Sits in its own "Begin here" section above the 5 themed journeys. Surfaced directly from onboarding Screen 4. Content: reshape Days 1, 3, 5 from existing 7-day doc. Sanity entry guide needed. **Pending build.**
- **0b. Beauty, Truth & Goodness (7-day)** — Deeper dive into classical thought. Days 1–2 Beauty, Days 3–4 Truth, Days 5–6 Goodness, Day 7 Integration. For users who want to go further after the 3-day. Content doc ready (`KALLOS-Intro-Journey-Beauty-Truth-Goodness.html`). Lives below "Begin here" section on Journeys tab.

**Journeys tab structure:**
- "Begin here" section: 3-day intro (prominent, badged "3 days")
- "Journeys" section: 7-day deeper dive + 5 founding themes

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
- **Typography:** Montserrat (labels/UI), Open Sans regular (body), Open Sans italic (contemplative instructional text), Cormorant Garamond (quoted material only — 1.3rem minimum, line height 1.4). Below 1.3rem, use Open Sans italic instead. Cormorant is a display typeface; it breaks down at small sizes on screen.
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
| `contentItem` | ✅ New — `curatorNote` renamed to `artworkHook` (April 24, 2026 — R1). 41 KEEP migrated; 6 REVIEW pending rewrite. April 24 (Dashboard Enhancement): added `photography` as a 9th content type (closes Manual Task 36). Auditio fields shared with dailyPrompt / journeyDay. |
| `journey` | ✅ New — 7-day structure. Added `totalDays` number field (April 13, 2026). April 24, 2026: `days` field converted from inline object array to references to `journeyDay` documents. |
| `dailyPrompt` | ✅ New — "Pause & Ponder" daily feature on Today tab. Auditio object includes `verbaOriginal` (lyrics/VERBA panel) plus `composerArtist`, `workTitle`, `genre` (April 24, 2026 — content-repeat intelligence). |
| `journeyDay` | ✅ Standalone document (April 24, 2026 — R5 migration complete). 25 docs live. Each has a required `journey` back-reference. Fields: dayNumber, dayTitle, openImage, openText(+audio), encounterContent (ref → contentItem), encounterGuidance, encounterNote(+audio), auditio (composerArtist/workTitle/genre), lectio, reflectionQuestions (+audio, new April 24 Dashboard Enhancement), connectThread, goDeeper. |
| `splashPage` | ✅ Kept unchanged |
| `traditionReflection` | ✅ Updated — themes ref array added. April 24, 2026 (Dashboard Enhancement): added `ancient` as an era option before `fathers` (closes Manual Task 37). ⚠️ **Schema change still needed:** `authorType` is single-select (`radio`); needs to allow multi-select for figures who are both saint + doctor (e.g. Augustine, Aquinas). Values `theologian`, `mystic`, `doctor`, `philosopher` are already present. |
| `episode` | ⚠️ Deprecated — kept to preserve data, hidden from sidebar |
| `artwork` | ⚠️ Legacy — schema file unregistered, 11 orphan records remain in Sanity (reachable only via GROQ fallback). |

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
- **Visio Divina** (`/pray/[artworkId]`) — 5-step prayer: Gaze → Meditate → Pray → Contemplate → Action. Finish button routes to `/library` (not `router.back()` — safe from any entry point including share links and Presentation iframes).
- **Go Deeper** — Tradition reflections (Church Fathers, Saints, Popes) expandable bar
- **8x pinch-to-zoom** — On Breathe page (Journey), content detail (Explore), and P&P hero image
- **P&P page** — No Begin state. Layout: Image → Title/date → Curator Note → Prompt Question → Context teaser → Lectio → Auditio → Actio. Typography: Cormorant for prompt question and lectio quotes (both, always, at 1.3rem+). Open Sans italic for auditio title. Open Sans regular for everything else.
- **Music player** — Chant / Ambient options on Pray page
- **Map** with colored markers by content type
- **Journey Social Sharing** — Share CTA on Connect step (Step 5). Upload arrow icon + "SHARE THIS JOURNEY" small caps. Web Share API sends journey title + URL. OG meta tags on each journey page pull title, description, and hero image from Sanity for rich link previews. `NEXT_PUBLIC_SITE_URL` env var controls base URL.
- **Share This Day** — Upload arrow icon on each day list row (left of chevron). Shares `/journeys/[slug]?day=N` with day title + "Day N of [Journey]" as OG metadata. iMessage card shows day artwork and day title. `stopPropagation` so tap-to-open still works.
- **Journey day deep-linking** — `?day=N` URL param. Shared day link opens that day's stepper directly. Per-day OG metadata served from server component `generateMetadata` in `app/journeys/[slug]/page.tsx`.
- **Journey complete badge** — Gold filled circle (30px) with cream checkmark SVG in top-right corner of journey card. Shows when journey progress reaches 100%. In-progress shows "Day X/Y" text badge.
- **P&P Social Sharing** — Share button on P&P page (upload arrow icon). Uses `navigator.share()` Web Share API. Sends prompt question + "— KALLOS" as message text, date-stable URL (`/prompt?date=YYYY-MM-DD`) as link. Dynamic OG image at `app/prompt/opengraph-image.tsx` (full-bleed artwork + KALLOS wordmark bottom-left, no question text in image). Confirmed working: X, Facebook, iMessage, Instagram DM. Known limitation: Instagram Stories only accepts media files (images/video), not URLs — platform constraint, not a bug. Clipboard fallback for unsupported platforms.

---

## Editorial Principles (P&P and Journey Content)

These govern all content written for KALLOS — daily prompts, journey days, curator notes, questions. Read `KALLOS-Content-Guide-Pause-Ponder.html` for full detail.

### The Hook Rule
Every P&P day must open with one **surprising, specific, shareable fact** — something the user genuinely didn't know and would repeat at dinner. The hook lives in the **Curator Note** and must come first.

- ✅ Hook: "When this triptych is closed, Bosch painted seven scenes of Christ's suffering on the outside panels in grisaille. You move through darkness to reach the Adoration."
- ❌ Not a hook: "This painting rewards slowness." (atmosphere, not information)
- ❌ Not a hook: "This is one of the most influential works of the Renaissance." (significance claim, not a fact)

**Test:** Would someone say "wait, I didn't know that" and repeat it at dinner? If yes: hook. If not: keep looking.

### Scripture Translation Standard
**All scripture quotes in KALLOS use the RSV-2CE (Revised Standard Version, Second Catholic Edition).** This is the Ignatius Press translation — literary, faithful to original languages, used by Catholic scholars and serious readers. Do not quote from NIV, ESV, NABRE, or other translations.

⚠️ **Audit needed:** The Lectio scripture pairings written for Holy Week (all 8 days) and P&P Days 9–18 were drafted in NIV before this standard was set. Every scripture quote in those documents should be verified against RSV-2CE before Sanity entry. Most will be close; some will differ noticeably, especially Psalms.

### The Lectio Pairing
The Lectio is a philosophy + scripture pairing — two voices arriving at the same truth from different directions. Philosophy goes first (familiar entry for the curious seeker), scripture second (the discovery). Format:

- `philosophyText` + `philosophyAttribution` — e.g., Plato, Aristotle, Marcus Aurelius, Seneca, Heraclitus
- `lectio.text` + `lectio.attribution` — scripture passage (RSV-2CE)

**The editorial thesis:** The great philosophers were asking questions that scripture had already answered. The Lectio is the room where that conversation happens. Do not force it — a strong scripture alone is better than a strained pairing.

**The quality standard:** Both texts must be chosen because they connect specifically to what the user just encountered in that day's content — not because they relate to the general theme. A quote that could appear in any KALLOS day is the wrong quote for this day. The test: does this pairing make this specific content unlock in a new way? If it's interchangeable with another day, keep looking. The obvious Plato quote, the verse everyone already knows — those are first-search-result choices. The Lectio should feel like a thread the user didn't see coming.

**Philosophy quote format:** One-liner only. Modern, accessible translation. The reader should feel the thought land, not work to parse it. Model: "To philosophize is to learn to die." (Cicero) or "No evil can happen to a good man, either in life or after death." (Plato, Apology). Long multi-clause quotes are not suitable for the Lectio philosophy field regardless of their quality.

**Eucatastrophe rule:** If the word "eucatastrophe" appears in any KALLOS content, it must be defined inline on first use. Format: "a eucatastrophe, a sudden joyful turn after the long darkness." The second use in the same piece does not need re-definition.

### Voice Rules
- Write for the curious seeker — someone moved by beauty, regardless of faith background. Assume curiosity, not faith.
- Never use: "journey," "sacred," "profound," "transformative," "spiritual practice," "invitation to…"
- Never use **"shaft"** when describing light. Use "ray" or "stream" instead. (e.g., "a ray of light," not "a shaft of light")
- **No em dashes. This applies everywhere.** Em dashes are a telltale sign of AI-generated text and are banned in all KALLOS content AND in all docs Claude writes or updates during a session (CLAUDE.md, skills tracker, session summaries, entry guides, everything). Use a comma, a period, a colon, or a short hyphen instead. Before ending any session, Claude must grep new content for em dashes and fix them.
- Curator note max length: 3–5 sentences. Short enough to read in one breath.
- Questions must connect to the user's real life — not hypothetical ("what would it feel like") but personal ("what was the last time you…")
- No explaining the art. The hook reveals what isn't obvious; the image speaks for itself.
- **CS Lewis is an internal editorial register test, not an audience-facing name.** The test "would CS Lewis say this?" governs voice across all KALLOS content. His name should not appear in user-facing copy unless the content item is specifically about him (e.g., a Thinker content item where Lewis IS the subject). Do not name him in Journey Description Cards, Opening Texts, or any copy the user reads before or during an experience.
- **Opening text length follows content, not a target length.** There is no rule that opening texts should be short. When Myth Became Fact Day 1 opens with a full myth story, that length is correct because the content earns it. The only question is: does this opening do its job efficiently? Cut what does not earn its place. Keep what does.
- **Artwork for the BTG intro journey (Day 1 especially): do not front-load the Christian resolution.** Day 1 introduces Beauty as a transcendental through the universal human experience of longing. Art for Day 1 should carry the quality of Sehnsucht (longing for something beautiful and unreachable) without pointing at the theological answer. The answer arrives at Day 3 (Emmaus) and more fully in Myth Became Fact. Caspar David Friedrich, Wanderer Above the Sea of Fog (1818) is the recommended image for Day 1 — visual Sehnsucht, no theological pre-loading, creates discovery. Fra Angelico full Annunciation scene is too early theologically. Degas, The Star has a historically documented dark figure (wealthy patron) that creates wrong complexity for a Day 1 entry point.

### Content Revision Rule (Non-Negotiable)

**Never delete original content from Journey or P&P docs.** When content is revised, the new version goes in as the primary content, and the original is preserved in one of two ways:

1. **Inline:** A collapsible/expandable box directly below the revised field, labeled "ORIGINAL" with the date and reason for change.
2. **End of doc:** A dedicated "Revision History" section at the bottom of the document, with each entry noting the day number, field name, date of change, and reason.

**Why this rule exists:**
- Sheri needs to see what changed and why, without losing the original thinking.
- Other agents learning KALLOS voice and tone need examples of both what worked and what was revised -- including the reasoning. A revision log is a training set.
- Decisions made in one session should be traceable in future sessions.

**Format for inline collapsible box (HTML docs):**
```html
<details>
<summary style="font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#999;cursor:pointer;">ORIGINAL (replaced [date] -- [reason])</summary>
<div style="margin-top:8px;padding:12px;background:#f5f0e8;font-size:13px;color:#5a5048;font-style:italic;">
[original content here]
</div>
</details>
```

**Format for end-of-doc revision log:**
A section titled "REVISION HISTORY" at the very bottom. Each entry: Day X / Field / Date / Reason / Original text.

This rule applies to all Journey content docs, P&P docs, entry guides, and content audit docs. It does not apply to CLAUDE.md itself or technical/code docs.

### Content Type Check Rule (April 23, 2026)
Before writing, auditing, or suggesting content for any `contentItem` record, always check the `contentType` field first. Each type has different relevant fields — a landscape has no artist name; a thinker has no medium; a music item has no location. Do not default to sacred-art field conventions when working with other content types. This applies in all Cowork content sessions.

### artworkHook Rule (April 23, 2026)
`contentItem.artworkHook` (formerly `curatorNote`) must be about the specific artwork or piece itself — a surprising fact safe to display anywhere the content item appears (Journey, Explore, Library, P&P). It must never be written for a specific journey context or day. Journey-specific hooks belong on `dailyPrompt.curatorNote` (P&P hook) or `journeyDay.encounterNote` (journey layer). Three fields, three distinct jobs, no overlap. See Schema Design Brief for migration details.

### Companion Journey Voice Framework (April 23, 2026)
Four voice registers for companion journeys. User selects preference at onboarding (expressed as a natural question, not a settings toggle):
- **Story** — narrative-led, immersive, third-person. Use for PRE (preparation journeys) and POST (episode/lecture companions).
- **Companion** — question-led, Socratic, second-person. Use for DURING (at-site) and SUSTAINED. Gets out of the way, directs attention without explaining.
- **Curator** — fact-rich, specific, accessible. The AI Q&A layer voice. For users who want information without full contemplation.
- **Contemplative** — slow, spacious, minimal content. For users who are already formed. Closest to current Visio Divina.

### Companion Journey Format Framework (April 23, 2026)
Four companion journey formats, each with different UX requirements:
- **Format D (PRE)** — Multi-week preparation before a pilgrimage, episode, or lecture. Story voice. Daily habit format (like P&P). Ends when the physical experience begins. The most distinctive and highest-value format — nothing like it exists in the market.
- **Format B (DURING)** — At-site companion for someone physically present. Companion voice. Maximum 90 seconds of screen time. One prompt, then phone down. Designed to get users back to the real thing, not deeper into the app.
- **Formats A/C (POST)** — After consuming video/lecture content. Story bridge from the content into a contemplative journey. Gaze step needs reframing (not a cold encounter). Pray step optional/gentle for non-devotional audiences.
- **Format E (SUSTAINED)** — After the experience, weeks later. Companion or Contemplative voice. "You've been there now — what do you see that you couldn't see before?" P&P daily format already serves this.

### Content Repeat Intelligence (April 23, 2026)
Three distinct types of content repetition to track in the dashboard:
1. **Work-level repeat** — same specific work used twice (e.g., Spiegel im Spiegel twice) vs. same composer twice (acceptable). Requires `composerArtist` + `workTitle` as separate fields on auditio records.
2. **Source concentration** — if any single author/thinker exceeds ~30% of all TRs or auditio selections, flag it. Show % distribution in dashboard.
3. **Cross-field concept repetition** — "allegory of the cave" referenced in passing in Curator Note AND told in full in a TR. Requires concept tagging across all field types. Approach: free-form tagging first (learning phase), then consolidate to controlled vocabulary. Do not build the full tagging system until the natural categories emerge from actual content.

### Go Deeper Standard
Go Deeper tradition reflections must add genuinely new content not already present in the Encounter Note. If the Go Deeper summary covers the same argument as the Encounter Note in different words, it fails. The test: could this TR appear in any journey day, or is it specific to this one?

Voices must come from tradition: Church Fathers, philosophers, historical thinkers — with specific quotes and verifiable sources. Summaries should name what is surprising or new in the source, not describe the book's cover. "Lewis's own account of his conversion" is not sufficient — name what specifically in the account earns reading it.

Each journey day should use a different voice. Before proposing a TR, check who has already been used in the journey. Do not repeat Church Fathers across adjacent days.

### Nine Layers of Depth — Discussion Note (April 24, 2026)

From Elizabeth Lev's *How Catholic Art Saved the Faith*. A framework for thinking about how much depth a given artwork can carry across nine layers. Useful when evaluating whether a piece can sustain a full journey day, or whether it will run out of material by Day 3. Not a scoring checklist yet — treat as a lens for content selection conversations.

Nine layers, each scored 0-3 (0 = absent, 3 = richly present), max 27:

1. **Visual Symbol Decoding:** embedded symbols with specific theological or historical meaning
2. **Typological Resonance:** Old/New Testament pairings, prefigurements and fulfillments
3. **Heresy Response:** a rebuttal to a theological error or controversy of the era. Can be visual (one painting answering another tradition's visual argument) not just textual or polemical
4. **Gestural Threads:** figures whose posture, gaze, or gesture form a narrative across the composition
5. **Ecclesial Commission Context:** who ordered it, for what liturgical or civic purpose, and how that shapes meaning
6. **Primary Source Grounding:** patristic texts, scripture, liturgy, or philosophy the image draws on directly (not just thematically)
7. **Political/Cultural Turmoil:** the historical crisis the work was produced inside and responds to
8. **Patron's Story:** the patron's identity, faith, and agenda as interpretive layer
9. **The Faithful's Experience:** how ordinary people in the original context would have encountered and received it (procession, pilgrimage, Mass, devotional practice)

Not yet formalized into a scoring rubric. Revisit after applying informally to 2-3 existing journey days to see if the framework holds.

### TTS Pronunciation Flag
When a proper noun has a non-obvious pronunciation, add a TTS sanity-note to the field in the content doc. Format: "TTS note: [word] is pronounced [phonetic] — not [common mispronunciation]."

Confirmed flags for When Myth Became Fact:
- "Magdalen" (Magdalen College, Oxford) = "Maudlin" — not "Mag-da-len"
- "Reading" (Reading University, England) = "Redding" — not "Reeding"

Apply the same pattern to any place name, proper noun, or Latin/Greek term that a TTS engine would likely mispronounce.

### Surprising History
Some content — especially feast days and Holy Week — has historical facts with genuine "I didn't know that" power. When a fact clears the dinner-table test, use it. When it doesn't, skip it.

- **Where it lives:** Curator note if it's hook-level. Context field if it's background enrichment.
- **Framing:** Always discovery framing ("here's something that happened"), never apologetics ("here's why Christianity isn't what you think").
- **Frequency:** Not every day. Only when the material genuinely earns it.
- **Not a Sanity field.** This is an editorial decision about where to place content you already have — not a new structural element.

### Journey Hero Image Convention

**The hero image for every journey is the Day 1 artwork.** It is the entry point into the journey — it sets the tone without previewing the resolution. Using the final day's artwork gives away the ending before the user begins. Using art from outside the journey introduces an image with no role in the content.

Established April 17, 2026. Apply to all new journeys going forward. Existing journeys may need updating if they use placeholder or thematically-selected-but-unrelated art.

**BTG II (Beauty, Truth & Goodness — 3 Day):** Hero image = Julia Margaret Cameron, "English Blossoms" (Day 1 artwork). Cropped file ready: `JMG-English-Blossoms-cropped.jpg` in `Documents/Journeys/BTG-New Revised Journey/new btg artworks/`.

---

### Content Selection Rules

These govern the selection of all content items — art, photography, music, thinkers, literature, landscape, food/wine, math/science — across all journeys and P&P prompts. Apply before proposing or accepting any content.

**1. Cross-journey content check — mandatory.** Before proposing or accepting any content item, read `content-docs/KALLOS-Content-Usage-Log.html`. Flag exact duplicates. Flag same-artist, same-tradition, same-period as potential duplicates even if the specific work differs. Do not proceed with content selection without this check. If the log is out of date, update it before making decisions.

**2. Content-work pre-check.** When starting any content work on a journey, ask Sheri: "What journeys already exist that overlap with this theme, artist, or thinker?" Do not assume the current doc is the full picture. The answer may reveal conflicts that change the entire approach.

**3. Similarity flagging.** If Sheri proposes content that resembles existing content — by artist, tradition, period, conceptual territory, or emotional register — say so before proceeding. Format: "This feels similar to [X] in [Y journey] — I think it's similar because [specific reason]. Is that intentional, or should we look for a different angle?" Claude may be wrong about whether it's truly similar. The goal is to surface it for a decision, not block it.

**4. Content type diversity — enforced, not aspirational.** Before finalizing any journey day, ask: have we considered the full range of KALLOS's 8 content types? Sacred art and thinkers are not defaults — they are two options among eight:
- Sacred art, Thinker, Literature, Music (as content item type)
- **Also:** Landscape, Food & Wine, Math & Science, Watch/Listen, Photography
If all proposed content clusters in sacred art and thinkers, flag it. This applies to music selection too: have we considered ambient, folk, jazz, world music, contemporary alongside or instead of chant and classical sacred? If all music suggestions are from the same register, flag it.

**5. Pictorialist photography is an underused content type that belongs in KALLOS.** Pictorialism (c. 1845-1945) is photography that carries the same intentionality as painting: soft focus, tonal richness, deliberate composition, emotional depth. The core principle: a photograph should be *made*, not just *taken*. It shows ordinary subjects (a field, a figure at a window, a child's face, morning mist) with the same reverence we associate with sacred art, without announcing itself as religious. Key photographers, all public domain (pre-1928), almost none known to a general audience:
- **Julia Margaret Cameron** (UK, 1815-1879): intentionally soft, allegorical portraits. Her *Prayer* (1866) shows a child looking upward, hands clasped: Sehnsucht in a face, no explanation needed.
- **Alfred Stieglitz** (USA): Photo-Secession movement, atmospheric street and landscape work.
- **Edward Steichen** (USA): atmospheric landscapes (*The Flatiron*), hand-colored prints. Extraordinary tonal range.
- **Henry Peach Robinson** (UK, 1830-1901): combination printing, staged pastoral scenes with warm golden tones.
- **Peter Henry Emerson** (UK, 1856-1936): rural English landscapes and laborers (*Polling the Marsh Hay*, c. 1885).

The George Eastman House exhibition "Truth/Beauty: Pictorialism and the Photograph as Art, 1845-1945" named the connection to the Transcendentals directly. Before defaulting to another painting, ask: is there a pictorialist photograph that carries this day's quality?

---

### Language Rule
**Never say "non-Catholic" as a user category.** Sheri IS Catholic. Users may or may not be. The audience is always "the curious seeker." This applies to all docs, code comments, and content.

**Never frame KALLOS as "not a Catholic app."** That framing is unnecessary and inaccurate. The tradition KALLOS recovers is rooted in the Church — do not apologize for that or distance from it. The content points toward beauty, truth, and goodness. Beauty, truth, and goodness point toward God. KALLOS does not make that argument explicitly — it makes the encounter possible. The tradition belongs to everyone. These two things are not in tension.

### Art and Music Are a Single Content Decision

The art and music for each journey day are not selected separately — they are a pairing, one decision. The art alone is incomplete. The music alone is incomplete. The experience is the combination. When selecting content for any day, propose art and music together as a unit. Do not lock the art first and then hunt for music to fit it. Find what works as a pair.

### Auditio (Audio) Selection Criteria
The Auditio is a music pairing for P&P and Journey days. Apply these rules when selecting or suggesting audio:

**Context:** Sheri is also learning the sacred traditions — KALLOS is part of her own discovery alongside the user's. The music selections are not just functional; they are part of an ongoing conversation with the tradition. This means audio suggestions should be genuinely illuminating, not just safe or genre-matched.

**1. Licensing first — free, downloadable, no copyright**
- Must be free to download and use with no copyright restrictions. No Spotify, no Apple Music, no YouTube-only, no copyrighted recordings.
- Acceptable sources:
  - [Pixabay Music — Catholic](https://pixabay.com/music/search/catholic/) — free, no copyright, direct download
  - [Musopen.org](https://musopen.org) — public domain classical performances
  - [Free Music Archive](https://freemusicarchive.org) — Creative Commons
  - [Internet Archive](https://archive.org) — public domain recordings
  - [gregorian-chant-hymns.com](https://gregorian-chant-hymns.com) — free for personal/institutional use, attribution required (note source abbey/schola in Sanity artist field)
  - Bandcamp free downloads, artist sites offering direct downloads with explicit free-use license
- Format: MP3 preferred. If only MP4/AAC is available, convert to MP3 before uploading to Sanity. gregorian-chant-hymns.com in particular delivers MP4 files — always convert. Claude can do this with ffmpeg in the Cowork VM.

**2. Connection can be thematic, mood-based, or emotional**
- Doesn't have to match the subject literally. A piece can match the feeling of a day, the emotional arc, or the theological undercurrent.
- Example: Victoria "O Vos Omnes" for Bosch's Adoration — matches the grief-to-joy arc of the triptych.
- Example: The Porter's Gate "Breastplate of Saint Patrick" for Day 1 — matches theme, mood, and subject directly.
- Example: Taizé "Stay With Me" for Agony in the Garden (Holy Wednesday) — not a traditional hymn, but holds the emotional weight of that night (the disciples falling asleep, the loneliness) better than almost anything from the classical canon.
- Example: A piece like "The Sound of Silence" — secular, well-known — can work for meditation on something profound if the meditative quality is strong and the context earns it.

**3. Sacred/classical is the safe anchor — always offer an alternative**
- Sacred/classical (Gregorian chant, polyphony, Bach, Pärt, Taizé, etc.) is the trusted starting point. It grounds content in the tradition and is always appropriate.
- **But:** Too much of anything beautiful loses its light. Do not default to 15th-16th century sacred music for every day — that register becomes invisible through repetition.
- **Rule:** For every Auditio suggestion, provide a primary sacred/classical option AND at least one alternative from a different register (folk, ambient, meditation, contemporary, world music, or even a well-chosen secular track). Sheri chooses.
- The alternative must still meet the emotional and licensing tests. It doesn't need to be obscure — it needs to be right for that day.
- Well-known secular music is acceptable if it creates genuine contemplative space rather than distraction or irony. The test: does hearing this song here open something, or does it close it?

**4. Attribution**
- Note the source/performer in the Sanity `artist` field.
- For gregorian-chant-hymns.com material: add source abbey/schola to the artist field (e.g., "St. Cecilia's Abbey, UK").

---

## Parking Lot — Future Design Work

These are deferred decisions to revisit with more content and real user testing:

### ~~Journey Day Steps — Progress Indicator~~ ✅ RESOLVED
Replaced with Stories-style thin progress bar at top + swipe navigation. No footer, no Continue button.

### ~~Breath Interaction~~ ✅ RESOLVED
Built as dedicated Breathe page (Step 3). Full-bleed image with 8x zoom, pulsing dot animation (CSS keyframe, `scale(1)→scale(4)`, 8s infinite loop), helper text "Sit with this image and let your eyes explore." Cormorant Garamond italic.

### Splash / Onboarding — Move to Sanity (April 24, 2026)
Splash screen copy and images are currently hardcoded in `app/splash/page.tsx` (5 screens of Montserrat/Cormorant headlines + body copy, all inline). Sheri is OK **deleting the hardcoded content and recreating it in Sanity** as long as the layout is preserved (Stories-style progress bar, swipe, pulsing nav button, 5-screen structure, skip-to-P&P + start-BTG CTAs — all per the Onboarding Framework section above).

Approach when picked up:
- Extend `splashPage` schema from a single doc to an array of `splashScreen` objects (headline, body, image, CTA label per screen; optional per-screen style flags if needed).
- Convert `app/splash/page.tsx` from a purely-client component with hardcoded copy into a server fetch of `splashPage` → render screens from the array → client component handles swipe/animation/state only.
- Verify Presentation preview works on `/splash` after the refactor — the `splashPage` location is already defined in `sanity.config.ts`.
- Sheri then enters copy once and edits in Studio from that point on.

Estimated scope: ~1 hour. Do after draft-preview testing is fully green.

### Journey Day Stepper — Share This Day placement (April 21, 2026)
Share This Day currently lives on the day list row only. In-stepper placement was explored and deferred: left header felt wrong for a content app; bottom share bar conflicts with copy-heavy steps (Day 1 opening text fills the screen); Connect step is a candidate but needs intentional design alongside Share This Journey. Revisit when there is dedicated design time. The day list row share covers the content-review and pre-experience use cases for now.

### Journey Day Steps — Connect Step (Step 5)
Current: Dark background with next-day image drift animation. Simple.
Open question: What's the right visual treatment for the "sneak peek" of the next day's image?
Sheri to brainstorm. Options: letterbox strip, partial reveal from bottom, full-bleed dark with a peek edge.

### Explore Page — ✅ REDESIGNED (March 30, 2026)
Replaced dual filter rows (content type + theme) with a theme-cards landing page. Five theme cards are the entry point. Tapping a card filters the full content feed to that theme. Empty themes (no content yet) sort to the bottom, grayed out at 35% opacity with grayscale, non-tappable. No dead-end "Coming soon" screen. Map toggle preserved throughout. Design principle settled: "Explore surfaces content items, not features or sub-fields. The richness is discovered, not advertised." Each tab does one thing: Today = P&P, Journeys = journeys, Explore = browse by theme, Library = saved.

Future Explore work (deferred until more content is seeded): larger goal is editorial voice and direction. Content voice audit needed once real images and content density are in place.

### Today Tab — Redesign Pending (Next after Holy Week)
**Decision (March 30, 2026):** Remove the tap-to-begin card on the Today tab. Make Today = full P&P experience as the landing state, no second gate. Sheri: "I'm leaning towards full page pause and ponder." Rationale: now that Journeys and Explore are their own tabs, Today doesn't need to route anywhere else — it IS the P&P. The BEGIN button on the Today card was the original entry point before dedicated tabs existed; it is now redundant. **Do not build until Holy Week content entry is complete.**

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
10. **Seed Bosch 7-Day Journey into Sanity:** 8 content items + 8 journey day records. Use `KALLOS-Bosch-Sanity-Entry-Guide.html` — all fields ready including medium, themes, location.
11. ~~**Holy Week P&P — write Lectio pairings (all 8 days)**~~ ✅ Done (in entry guide)
12. ~~**Holy Week P&P — write Actio (all 8 days)**~~ ✅ Done (in entry guide)
13. ~~**Holy Week P&P — Sanity entry:**~~ ✅ All 8 days entered and published (April 1, 2026). Day 8 audio is a placeholder — confirm or replace before Easter. Use Verba textarea for Days 2-3 if re-entering.
20. **Day 1 Connect Thread em dash in Sanity:** Text reads "other forms — and not every one of them stayed in the past." Replace "—" with a comma. Manual Sanity edit on the When Myth Became Fact journey, Day 1 Connect Thread field.
21. **Set `totalDays` for all journeys in Sanity Studio:** ✅ Done April 13. BTG = 3, When Myth Became Fact = 7, Light = 7, Bosch = 8.
19. **Custom domain:** Replace `s-beauty-app.vercel.app` with `kallos.app` or update Vercel alias to `kallos-app.vercel.app` before wider launch.
17. **Palm Sunday — Sanity edits still pending:** curator note rewrite (palms as political act = the hook), context fix ("The disciples behind him are not watching Christ. They are watching the crowd." replaces "almost mechanical" line), actio update ("Press play. While it plays, zoom into the painting and find one face. Stay with it until the music ends.")
18. **Holy Monday — upload audio:** `01-adoro-te-devote--st-cecilia.mp3` is in Documents/Holy Week/Audio-Holy Week/. Upload to Holy Monday Sanity record Audio File Upload field. Then copy Verba text from entry guide textarea into Verba field.
14. Seed Themes 2–5 content into Sanity (entry guide doc ready)
15. Source high-res images for all new content (search terms in docs)
16. Add lat/long coordinates to Bosch Sanity entry guide and Intro Journey content doc — map is empty without them
22. **BTG Day 1 — Newman quote:** Fix before Sanity entry. Replace with Pascal Pensées §423 (copy in `BTG-3Day-Voice-Rewrite.html`) or remove entirely. Do not enter the current Newman quote — it cannot be verified.
23. **BTG Day 3 — Dorothy Day quote:** Verify before entering Tradition Reflection 3. Check The Long Loneliness and By Little and By Little. Backup quote from The Long Loneliness is in `BTG-3Day-Voice-Rewrite.html` if the primary cannot be confirmed.
24. **BTG Sanity entry — all 3 days:** Enter revised copy using `BTG-3Day-Voice-Rewrite.html`. Priority order is at the bottom of that doc. Create TTS audio for each field during entry (read aloud before confirming — the field is both the copy and the TTS script).
25. **BTG Day 3 Journey Close — confirm field with dev:** Does a closing text field exist on the last journey day before the "Journey complete" CTA? The bridge copy to Myth Became Fact is written and ready in `BTG-3Day-Voice-Rewrite.html`. Confirm before entering.
26. **BTG Days 2 and 3 — Caravaggio back-to-back:** Decide whether two consecutive Caravaggio days is acceptable, or whether Day 2 should use a different artist for variety. Vermeer alternative is noted in `BTG-3Day-Voice-Rewrite.html`.
27. **BTG Day 1 — artwork decision pending:** Fra Angelico full Annunciation front-loads theological answer (not recommended for Day 1). Options: Caspar David Friedrich "Wanderer Above the Sea of Fog" (recommended — visual Sehnsucht, no theological pre-loading), Van Gogh "Starry Night" (widely loved but overexposed), or a tight crop of Fra Angelico detail (removes the angel/Gabriel resolution problem). Decision deferred April 13.
28. **BTG Day 1 — Context:** Enter revised version from `BTG-3Day-Voice-Rewrite.html`. Context TTS audio already created — use revised copy for new recording. Do not use current Sanity copy (explains full BTG arc before user has started).
29. **BTG Day 1 — Curator Note:** Enter revised version from `BTG-3Day-Voice-Rewrite.html`. Removes duplicate line with Context ("What he eventually understood..."). Biscuit tin paragraph preserved. Context carries the conclusion; Curator Note carries the concrete arrivals.
30. **BTG Day 1 — Lectio (both fields — new, not in original Sanity record):**
    - Philosophy: Simone Weil quote on beauty as the only entry point for what is greater. Verify exact wording in *Waiting for God* before entry. Backup in *Gravity and Grace* if not found. Do not enter until confirmed.
    - Scripture: Psalm 27:4 RSV-2CE ("One thing have I asked of the LORD, that will I seek after; that I may dwell in the house of the LORD all the days of my life, to behold the beauty of the LORD, and to inquire in his temple."). Bonus: "Dominus illuminatio mea" (Psalm 27 opening) = motto of Oxford University where Lewis taught.
31. **BTG Day 1 — Auditio (new, not in original Sanity record):** Source a Psalm 27 chant from gregorian-chant-hymns.com. If delivered as MP4, convert to MP3 with ffmpeg before uploading to Sanity. Direction and Pixabay alternative are in `BTG-3Day-Voice-Rewrite.html`.
32. **BTG Day 1 — TR1 Plato:** Replace misattributed quote (current quote is Aquinas, not Plato). Enter revised Tradition Reflection from `BTG-3Day-Voice-Rewrite.html`. New quote: "Beauty absolute, separate, simple, and everlasting." (Symposium 211a, Plato). Body text: Diotima's ladder story.
33. **BTG Day 1 — TR2 Augustine:** Verify quote source before entry — see flag in `BTG-3Day-Voice-Rewrite.html`. Enter revised body text (story-first rewrite). Do not enter until quote is confirmed. Note: "Our heart is restless until it rests in Thee" is reserved for Day 3 TR1 — do not use here.
34. **BTG Day 1 — TR3 JPII:** Replace current unverified quote with "Beauty is a key to the mystery and a call to transcendence." from *Letter to Artists* (1999). Verify exact paragraph number before entry. Enter revised body text from `BTG-3Day-Voice-Rewrite.html`.
35. **Verify before Day 1 Sanity entry:** (a) Simone Weil quote exact wording — *Waiting for God*, chapter on beauty. (b) JPII Letter to Artists paragraph number for "Beauty is a key to the mystery." (c) Psalm 27:4 RSV-2CE exact wording (already in item 30 above — confirm against RSV-2CE text).
36. **Schema: Add Photography as content type** — ✅ DONE April 24, 2026 (Dashboard Enhancement session). `photography` added as the 9th option in `contentItem.contentType`. Cameron "English Blossoms" and future Pictorialist content can now be re-tagged from `sacred-art` to `photography` at your convenience.
37. **Schema: Add "Ancient" as Era option in Go Deeper (Tradition Reflections)** — ✅ DONE April 24, 2026 (Dashboard Enhancement session). `ancient` added as the first option in `traditionReflection.era`. Existing pre-Medieval thinkers (Plato, Aristotle, etc.) can now be re-tagged from the other era options.
40. **Schema design CC session** — ✅ DONE April 24, 2026. See Phase 2 Work Done. R1, R5, R6, genre, split audio, rendering bug fixes, dashboard update all shipped.
41. **Set DASHBOARD_ENABLED=true in Vercel** — ✅ Done April 23, 2026. Dashboard live at /dashboard.
42. **Dashboard enhancements (separate CC session after schema design)** — Add filter/sort to TR table, work-level repeat detection (flag same work title not just same author), source concentration % view, cross-field concept repetition with expandable text previews, genre distribution in audio section.
43. **Review 4 open questions from Schema Audit** — See `content-docs/KALLOS-Schema-Audit.html` bottom section. Review before schema design CC session.
44. **Companion journey mapping session (Cowork)** — Map three demo companion journeys (Seeking Beauty Ep1, CTS Rome Pilgrimage, Elizabeth Lev Pio Cristiano) before building any content. Requires schema design session to be complete first.
39. **Claude Code task — Sanity Go Deeper content inventory:** Query Sanity for all entered Tradition Reflection (Go Deeper) content across all journeys and output as a content list doc. Purpose: prevent duplicate voices across journeys as content scales. Pending until after Days 5-7 Myth Journey Sanity entry.
38. **Schema: Add "Fresco" as Medium option** — The Medium dropdown does not include Fresco. Add it alongside Oil on canvas, Oil on panel, Engraving, Marble relief, etc. Needed for Raphael's School of Athens (Myth Journey Day 3) and any future fresco content. Enter as custom text in Sanity for now.

### Manual tasks from April 23 schema + content audit

Full detail in `content-docs/KALLOS-Schema-Audit.html` and `content-docs/KALLOS-Content-Inventory.html`. Summarized here for quick reference.

40. **Journey `totalDays` — Light and Bosch still null.** CLAUDE.md item 21 says it was done. It wasn't. Enter 7 for Light, 8 for Bosch. **Sanity.**
41. **Hieronymus Bosch — trim trailing space in journey title.** Search for other places that use the title before editing. **Sanity.**
42. **BTG II and When Myth Became Fact both have `order = 1`.** Duplicate sort key. Re-sort. **Sanity.**
43. **Bosch journey — zero Tradition Reflections linked across all 8 days.** Largest editorial gap. **Sanity.** Plan a TR session.
44. **Light journey — no lectio, no auditio, no encounterNote on any of the 7 days.** Predates current editorial standard. Decide: update in place, replace, or leave as-is for historical reasons. **Sanity.**
45. **BTG II — Days 2 and 3 missing `goDeeper` entries.** **Sanity.**
46. **Myth Became Fact — only 1 TR/day across Days 1-4.** Editorial target is 2-3/day. Add a second TR to each built day when revising. **Sanity.**
47. **5 sacred-art content items missing curatorNote:** Holy Monday, Holy Thursday, Holy Tuesday, The Haywain (central), The Liturgy of Eating Well, The Atacama Desert. **Sanity.**
48. **Orphan Tradition Reflection:** "Hospitality is prayer" (Saint Benedict) is not linked from any journey or content item. Link it or delete it. **Sanity.**
49. **11 Tradition Reflections have no theme tag; 4 have no era tag.** List in Content Inventory. **Sanity.**
50. **10 of 27 daily prompts are scripture-only (no philosophy pairing).** Add philosophy per the Lectio standard when it can be found. **Sanity.**
51. **20 of 27 daily prompts are untagged with a theme.** Low priority but affects Explore filter. **Sanity.**
52. **Content item duplicates in Sanity:** "Spiegel im Spiegel" (×2), "The Adoration of the Magi (Triptych)" (×2), "The Calling of Saint Matthew" (×2), "The Supper at Emmaus" (×2). Dedup pass or cleanup. **Migration / Sanity.**
53. **1 music item has legacy `audioFile` + `musicUrl` fields** (Spiegel im Spiegel, one of two). Move to `audioSource.audioFile`. **Migration.**
54. **11 legacy `_type: "artwork"` records** still in Sanity. Schema is unregistered; data reachable only via fallback query. Plan a one-time migration to contentItem or formally archive. **Migration.**
55. **6 legacy `_type: "episode"` records** still in Sanity. No GROQ query in the app reads them. Either migrate forward or accept as archival. **Migration.**
56. **CLAUDE.md Schema Status table is stale on `traditionReflection.authorType`.** The values `theologian`, `mystic`, `doctor` already exist in the schema (confirmed in code). What's *still* true: the field is single-select (`radio`) and cannot represent Aquinas = saint + doctor or Augustine = father + doctor. Schema change = convert to multi-select array. See Schema Audit R8.
57. **Rendering bug — `traditionalPrayerSource`** — ✅ Fixed April 24, 2026. Field projected by `getArtworkById`; displays on Visio Divina Pray step.
58. **Rendering asymmetry — curator note on P&P** — ✅ Resolved April 24, 2026 via R1 Option C. Three fields, three distinct jobs: `contentItem.artworkHook` (artwork-level, renders wherever the piece appears — currently only Journey Day), `dailyPrompt.curatorNote` (P&P hook, renders on P&P), `journeyDay.encounterNote` (journey-specific "Look Closer"). Comment added in `app/prompt/PromptClient.tsx` documenting that `artworkHook` is intentionally not shown on P&P.
59. **TTS gap — 70,017 characters / ~13,464 words** across published records have no audio. Biggest: `contentItem.context` (32,846 chars in 44 records). All 27 P&P curator notes are audio-less. See Content Inventory 2e for provider pricing.
60. **Dashboard enabled flag:** Add `DASHBOARD_ENABLED=true` to Vercel environment variables before the `/dashboard` route will be reachable in production. Without the flag, the route returns 404. Add to `.env.local` for local testing. The dashboard is also `noindex, nofollow` by default.
61. **Rewrite the 6 REVIEW artworkHook items** — Sheri, editorial pass. The April 24 audit flagged these for rewrite because the existing curator-note text was journey-specific or lacked piece-level grounding: Addison's Walk, The Art of Being Moved, Easter Sunday, Holy Saturday, The Calling of Saint Matthew (×2 — two duplicate content items, will also need dedup). New hook goes into `artworkHook` in Sanity Studio. Once saved, unset the legacy `curatorNote` on that document (Sanity: open document, click the ⋮ on the Curator Note field → "Clear"). Dashboard Section 2 shows a live count. Full decision detail + current text: `content-docs/KALLOS-artworkHook-Audit.html`.
62. **Populate auditio structured fields** — New in April 24: `auditio.composerArtist`, `auditio.workTitle`, `auditio.genre` on journeyDay and dailyPrompt. Existing records have them empty. When content-editing in Studio, fill in these three alongside the existing free-text `title`/`composer`/`artist` fields so the dashboard can track work-level repeats and genre variety. See Content Repeat Intelligence section above.
63. **Re-populate `totalDays` if missing** — Light and Bosch had null `totalDays` at audit time. Re-check in Studio; enter 7 and 8 respectively if still null.
~~64. **Add `SANITY_PREVIEW_SECRET` env var**~~ NOT NEEDED. Sanity auto-provisions the preview secret via `@sanity/preview-url-secret`. No manual secret required. The `app/api/draft/route.ts` handler calls `validatePreviewUrl()` with Sanity's client and Sanity manages secret rotation automatically. Confirmed working April 24, 2026.
~~65. **(Follow-up) Extend draft-mode reading to remaining routes**~~ ✅ DONE April 24, 2026. Journey detail, journeyDay, and pray pages all honor `draftMode()` and swap to the preview client. See Phase 2 Work Done (April 24 evening, Presentation drafts).
66. **(Follow-up) Re-tag existing Pictorialist content as `photography`** — Cameron "English Blossoms" (BTG II Day 1) is entered as `sacred-art` because `photography` did not exist at the time. Now that it does (Manual Task #36 complete), re-tag in Sanity Studio.

### New app surface

- **`/dashboard`** — content operations dashboard. Server-rendered, revalidated every 60s, gated by `DASHBOARD_ENABLED` env var, no-indexed. 7 sections: Journey Completion, Content Library, Tradition Reflections, Audio Status, Schema Health (static), TTS Coverage, Companion Journey placeholders. See `app/dashboard/page.tsx` + 5 new named query functions in `lib/sanity.ts` (search for "Dashboard queries"). Schema Health section is hand-maintained — update the `SCHEMA_HEALTH` const in the page file after every audit.
