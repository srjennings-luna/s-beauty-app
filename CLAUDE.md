# Contueri — Claude Code Standing Brief

Read this at the start of every session. It contains all key product decisions, the current state of the project, and how to work with Sheri.

**Rebrand note (May 2026):** The app is being renamed from KALLOS to **Contueri**. The codebase, onboarding screens, GitHub repo, Vercel project, and all docs still reference KALLOS — a full find/replace CC task is pending (see Manual Task 70). When reading existing code or docs, KALLOS = Contueri. When writing new code or docs, use Contueri.

**Also read before any content, editorial, or product work:** `content-docs/KALLOS-Cowork-Briefing.html` (in this repo). It contains the product's purpose, the seven real people this is built for, what "earns its place" means, the Lectio quality standard, settled decisions not to relitigate, and how Sheri works as a PM. A session that skips this brief will produce generic output.

---

## The App

**Name:** Contueri (formerly KALLOS — rebrand in progress as of May 2026)
**Latin root:** *contueri* — "to look at fixedly, gaze on, or behold with purpose." Root of "contemplate" and "intuition." USPTO search: zero results, completely clean.
**Tagline:** TBD (open decision — see Open Decisions below)
**Founding statement:** Beauty is the splendor of truth
**Type:** Independent contemplative discovery app (not an EWTN companion — no relationship or rights)
**Primary audience:** All Christians and Christian curious seeking something deeper. Catholics are primary, but the invitation is open to all. The curious seeker — moved by beauty, asking deeper questions, regardless of faith background.
**Live app URL:** https://s-beauty-app.vercel.app (temporary — will move to contueri.app or contueri.com)
**Sanity Studio URL:** https://seeking-beauty.sanity.studio (to be renamed kallos.sanity.studio, then eventually contueri.sanity.studio)
**Domains:** contueri.com (primary) | contueri.app (app-specific links). Registered on Namecheap, May 2026. Subdomains (app., mail., support., dashboard.) do not require separate registrations.

**Social handles claimed (@contueri):**
X (Twitter), Instagram, TikTok, YouTube (Brand Account under Sheri's personal Google), Etsy.
Pinterest and Facebook still to claim (see Manual Tasks 71-72).
**URGENT:** Write down which email was used to create each social account before you forget. Once hello@contueri.com is set up (Google Workspace, ~$6/month), update all accounts to that email.

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
| `content-docs/CONTUERI-CC-Explore-Library-Brief.html` | **In repo** — Claude Code build brief for Explore bubbles + Option E detail + Library subtitle polish. Shipped May 29, 2026. Includes Music bubble exclusion note. |
| `content-docs/CONTUERI-CC-Polish-Brief.html` | **In repo** — Claude Code build brief for Explore + Library polish pass: physics tuning, toggle placement, safe-area, reduced-motion, list card borders. Shipped May 29, 2026. |
| `content-docs/CONTUERI-CC-Rebrand-Brief.html` | **In repo** — Claude Code brief for full KALLOS → CONTUERI codebase rebrand: 10 tasks covering user-facing text, metadata, share text, and localStorage onboarding key rename. Pending CC execution (see Manual Task 82). |
| `content-docs/CONTUERI-Theme-Research.html` | **In repo** — Research doc for expanding the Sanity theme library. Intellectual tradition context (Augustinian/Neoplatonic), search strategies, key figures table, 15 candidate themes. |
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
| `CONTUERI-PP-30Day-Content-Plan-v3.html` | **Cowork doc (Documents folder)** — 30-day P&P content plan (v3, June 7, 2026). Content type rotation (not theme). Three Ways arc. 7 feast day anchors. CS Lewis Context narratives for all 30 days. Day 1 = Sacred Heart of Jesus (Rafael Salas, 1874), built around the García Moreno/Ecuador consecration story and US Bishops June 11, 2026 consecration. Replaces v1 and v2. |
| `CONTUERI-PP-Field-Reference.html` | **Cowork doc (Documents folder)** — field-by-field reference for P&P and Visio Divina Sanity entry. Includes VD Defaults singleton, per-artwork override fields, Tradition Reflection fields, Traditional Prayer field. Updated June 6–7, 2026. |
| `CONTUERI-PP-Seeding-Template.html` | **Cowork doc (Documents folder)** — fillable Sanity entry template for P&P content items. Step 0 (VD Defaults singleton), Step 1 (Content Item + Traditional Prayer field), Step 2 (Daily Prompt), Step 3 (Tradition Reflection). Updated June 6–7, 2026. |
| `Three-Ways-Reference.html` | **Cowork doc (Documents folder)** — comprehensive reference sheet on the Three Ways (purgative, illuminative, unitive). Covers key thinkers + dates, writings, themes, bios (Origen, Pseudo-Dionysius, John of the Cross), modern adaptations (Jung, Campbell, AA, Rohr, Keating, Fowler, Malick), additional themes with attributions, further reading, classical education parallel (Trivium mapping), and 18 source links. Created June 1, 2026. |
| `Three-Ways-Timeline.html` | **Cowork doc (Documents folder)** — genealogy roadmap from Plato to the CCC (1992). 7 eras, orthodox development nodes, 8 heresy forks with condemnation dates, councils, pivotal moments (plum), myth-to-fact sidebar arc, closing essay on when philosophical metaphor became magisterial doctrine. Created June 1, 2026. |
| `CONTUERI-Journey-Map-ThreeWays-OOTSP.html` | **Cowork doc (Documents folder)** — day-by-day planning maps for two journeys: Journey 1 "The Way Within" (Three Ways as 7-day arc: purgative Days 1-3, illuminative Days 4-5, threshold Day 6, unitive Day 7) and Journey 2 "Out of the Silent Planet" (Lewis's purgative displacement across 7 days). Draft for review. Part of a planned 4-journey arc. Created June 1, 2026. |

**Launch docs (in `~/Documents/KALLOS Launch/`):**

| File | What it is |
|------|-----------|
| `KALLOS-v1-Launch-Plan.html` | v1.0 app launch plan — scope, timeline, assumptions, deferred features, costs, code hosting, legal entity minimum. Single source of truth for iOS launch. |
| `KALLOS-SnailMail-MarketStrategy.html` | Snail mail subscription market strategy — competitor analysis (Thistle & Quartz $11.11/mo, Cloud Report $8/mo, Stephanie Hathaway $12/mo), unit economics, editorial framework ("Beautiful Traditions Worth Reclaiming"), open product decisions, GTM platform cards (X, YouTube, LinkedIn), conservative revenue scenarios. **Major revision completed May 2026.** Key decisions documented: target market is all Christians and Christian curious (Catholics primary), high-quality envelopes (not rigid flat mailers), working price hypothesis $13-15/month for founder launch (not locked, long-term TBD). |

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

### Phase 2 Work Done (June 6, 2026 · audio polish + OneSignal end-to-end + VD-ACTION-01 + Android port plan + Play Console enrollment)

Twelve-hour push that closed two of the biggest launch-blocking items (push notifications, VD prompt copy editability) and pivoted the launch strategy to ship Android in parallel with iOS rather than three months later. Audio system iterated to production polish through systematic waveform analysis. Net result: iOS submission target of June 12 holds; Android parallel-track submission added for the same target date.

**Audio system production polish**
- ✅ **Cross-fade between ambient sounds shipped** (commit `e42656ac`). 400ms gain ramps on the existing GainNode chain. Switching sounds mid-playback fades the current sound out, swaps the src, fades the new sound in. Pending-swap timer ref lets rapid sound-changes cancel the in-flight swap so the latest pick wins.
- ✅ **Haptic tick on long-press picker open** (`e42656ac`). Installed `@capacitor/haptics@8.0.2` + `Haptics.impact({style: Light})` fires the instant the 450ms long-press deadline hits. Try/catch graceful no-op on web / missing plugin so SSR + Vercel preview don't break.
- ✅ **Auditio→ambient pause coordination** (`e42656ac`). New `lib/audioEvents.ts` centralizes START/END event names for all 3 streams (narration, Auditio, ambient). PromptClient + JourneyDay CircularAudioPlayer dispatch AUDITIO_START/END when their `musicPlaying`/`audioPlaying` state flips. AmbientSoundProvider refcounts all four events so ambient stays paused while ANY higher-priority stream is active and only resumes when count == 0. Fixed the Veni Creator + Gregorian Chant simultaneous-playback bug Sheri caught.
- ✅ **AUDITIO-LS-01 + NARR-LS-01 + AMBIENT-LS attempt → revert** (`bca96d12` + `e4dee973` + `e10af45b` + `421abe38`). Lockscreen MediaSession metadata + brand artwork fallback (new `public/contueri-icon-1024.png`, copied from the iOS app icon). Narration now sets proper title/album + permission handlers so Sheri's earlier "stuck pause icon + ambient never resumes after TTS" bug is fixed. Ambient MediaSession was attempted twice but both times caused audio "ticking" on iOS Safari from the provider's high render frequency churning the action handlers; reverted to ship-quality on `421abe38`. Logged as **AMBIENT-LS-02** for v1.1 (three documented retry paths).
- ✅ **Narration "pause" event → END dispatch** (commit `9df7a866`). The previous code dispatched NARRATION_END only on `"ended"` event (natural completion) or user-initiated toggle. iOS Safari auto-pauses background audio on lock — that fires `"pause"` not `"ended"`, so ambient never resumed after a lock-screen TTS session. Fix: dispatch END from the `"pause"` listener (which fires uniformly for all three pause paths) and remove the duplicate dispatches.
- ✅ **Pause-click suppression iterated** (commits `e0acbcf0` → `9ead2a53` → `83b68c4f` → `d637cfbb`). Bumped soft-fade duration 40ms → 100ms → 200ms after Sheri felt the audio still "stop on whatever waveform position it happened to land on." 200ms reads as a graceful exhale rather than just imperceptible click suppression. Plus `PRE_PLAY_GAIN_SETTLE_MS=15` (settle delay before audio.play()) and `PAUSE_FIRE_DELAY_MS=220` (long enough that the fade-out propagates through iOS's audio buffer before audio.pause() interrupts). Final commit also REMOVED the gain restoration after audio.pause() — waveform analysis on Sheri's screen recording caught a 50ms audio burst happening 100ms after pause-fade completion, at exactly the moment gain was being restored. iOS WKWebView's output buffer was re-amplifying queued samples before iOS fully completed the pause.
- ✅ **preload="none" → preload="auto"** on the ambient `<audio>` element (`e0acbcf0`). iOS WKWebView was chunk-loading the MP3 with chunk-transitions audible in the first ~10s of playback. Forced preload eliminates the chunk-transition glitches at the cost of slightly larger upfront fetch.
- ✅ **Plainchant → Choral Chant label rename** (commit `74358ce5`). "Plainchant" is a music-history term most users don't recognize. "Choral Chant" reads clearly. ID stays `plainchant`, file path unchanged so saved preferences persist.

**OneSignal v1.0 push notifications end-to-end**
- ✅ **APNs Auth Key (.p8) generated in Apple Developer.** Key ID `CBXQ6PC624`, Team ID `X6HT86XZVP`, Bundle ID `app.contueri.ios`, configured for Sandbox & Production. Saved to `~/Documents/AuthKey_CBXQ6PC624.p8`. **CRITICAL**: this `.p8` cannot be re-downloaded from Apple. Lost file = generate a new key.
- ✅ **OneSignal account + Contueri app configured.** OneSignal App ID `c49ea9b5-2f9d-4d61-8ca5-ab3f55ea7d85`. Apple iOS (APNs) platform activated, .p8 + IDs uploaded.
- ✅ **Capacitor plugin + SDK init + iOS capabilities** (commits `d56fae47` + `d27bc755`). Installed `@onesignal/capacitor-plugin@1.0.6`. New `lib/onesignal.ts` wrapper (init, requestPermission, syncNotificationTags, tagLastOpenDate). New `components/OneSignalInitializer.tsx` mounts in root layout and calls init + tags `last_open_date` (local TZ) on every cold launch. Push Notifications capability + Background Modes → Remote notifications added in Xcode. `app/settings/notifications/page.tsx` TODO(W2) at acceptRationale now fires the iOS permission prompt. `useNotificationPreferences` syncs every toggle/time/day-of-week change to OneSignal user tags.
- ✅ **Tag schema established.** `last_open_date` (YYYY-MM-DD local), plus `{type}_enabled`, `{type}_time`, `{type}_days` per type (pp, journey, streak, seasonal). Dashboard uses these to build segment filters like "send pp template to users where pp_enabled=true AND pp_time=07:00 AND pp_days contains <current day number>". Streak segment also filters on `last_open_date != today`.
- ✅ **End-to-end verified.** Test push from OneSignal dashboard arrived on Sheri's iPhone lockscreen at ~7:40 PM, lockscreen showed correct "Today's pause." title with Contueri brand icon. Integration is functionally complete; remaining work is dashboard-side template + recurring send configuration (~30-45 min, Sheri).
- ✅ **Notification template copy locked** in `~/Documents/KALLOS Launch/CONTUERI-Notification-Templates-v1.html`. Four templates (P&P, Journey, Streak, Seasonal) following **constant trigger + variable body** per Eyal/Fogg habit-formation research. "Pause" is the brand verb (not "routine," not "piece"). "Beauty, Truth & Goodness" used universally in streak body — no per-journey personalization needed for v1.0 (the transcendentals are the brand's philosophical foundation, applies to every user). Rotation variants rejected in favor of consistency: the trigger should be predictable, the variable reward lives inside the app.

**VD-ACTION-01 — Visio Divina Pray + Action prompts moved to Sanity**
- ✅ **New `visioDefaults` singleton schema** (`sanity/schemaTypes/visioDefaults.ts`). Holds `defaultActioHeadline`, `defaultActioInstruction`, `defaultPrayerPrompt`, `defaultTraditionalPrayer`, `defaultTraditionalPrayerSource`. Singleton seeded via `scripts/seed-visio-defaults.ts` (already ran in production with the previous hardcoded copy as the editable starting point). Editors can now tune VD's contemplative prompts from Studio without a code change.
- ✅ **Three optional per-artwork override fields on contentItem**: `customPrayerPrompt`, `customActioHeadline`, `customActioInstruction`. The existing `traditionalPrayer` + `traditionalPrayerSource` fields continue to work unchanged.
- ✅ **PrayClient reads via cascade**: per-artwork override → singleton default → hardcoded last-resort. Server-side page.tsx parallel-fetches artwork + singleton and passes both to PrayClient. New `getVisioDefaults()` + `getVisioDefaultsPreview()` helpers in `lib/sanity.ts`. New `VisioDefaults` type in `lib/types.ts`.
- ✅ **Cowork briefing doc** (`~/Documents/KALLOS Launch/CONTUERI-VD-Cowork-Briefing-June6.html`) — 6-section breakdown of the schema changes + yesterday's VD flow changes, with specific action items for the Cowork content session.

**VD cream-tone audit + scroll fix**
- ✅ **Stark white text in GoDeeperSection reflection card** (commit `bac7aede`). Three swaps: h3 title `text-white` → `rgba(232,217,184,0.92)` (matches Reflect / Traditional Prayer / Go deeper section-title baseline); italic short quote `text-white/80` → `rgba(253,246,232,0.88)` (matches summary body); loading + empty states `text-white/50` → `rgba(253,246,232,0.5)`. Sheri's "the cream looks off" observation traced to the stark white pulling brightness around it.
- ✅ **VD-SCROLL-01 fix** (commit `5905dab4`). When opening sacred-art/landscape from Explore → `/pray/[id]`, the slide opened scrolled past the top — chrome (X close, GAZE label, Stories segments) hidden until user swiped down. Caused by PrayClient's outer container using `min-h-screen` which is Tailwind sugar for `min-height: 100vh`. On iOS Safari, `vh` refers to the LAYOUT viewport (URL bar collapsed), ~80px taller than visible viewport when URL bar showing. Body became scrollable, chrome at top:0 scrolled off with body scroll. Fix: `height: 100dvh` + `overflow: hidden`. Audit confirmed only PrayClient violated this; SplashClient + JourneyDay stepper already use 100dvh.

**Android Google Play Store launch — parallel-track scope reversal**
- ✅ **Previous "Android deferred 3 months" call REVERSED.** Sheri's call: ship Android in parallel with iOS for v1.0. Capacitor live-URL architecture means ~85% of work transfers as-is; remaining ~3.5 hours of focused build is FCM setup, adaptive icon, Android-specific native config, Play Store listing.
- ✅ **Google Play Console enrollment started** ($25 one-time fee paid). Account ID `6506133766924212145`, name "Contueri". Identity verification clock running (24-48 hours typical). Phone verification gates on identity. **Verify-access-to-Android-device requirement** (new 2024 Google policy) is a blocker: needs Play Console mobile app signed in on a real Android phone (Sheri's solution: borrow a friend's Android for 10 minutes).
- ✅ **Android port plan written** (`~/Documents/KALLOS Launch/CONTUERI-Android-Port-Plan-v1.html`). 7-phase plan with my-side/your-side breakdown, ~3.5-hour total build estimate, day-by-day timeline targeting Play Store submission same day as iOS App Store (June 12). OneSignal confirmed multi-platform: one app supports iOS + Android; same templates, same segments, same user tags.
- ✅ **Designer spec for Android adaptive icon written** + casual friend/family-style request message drafted. Specs for foreground (mark, transparent bg) + background (solid espresso) + Play Store hero icon (512×512). Awaiting designer turnaround.

### Phase 2 Work Done (June 7, 2026 · 30-day P&P content plan + Sacred Heart Day 1 + VD Traditional Prayer)

Content planning and seeding prep session. Core output: complete 30-day P&P content plan (v3) with correct content-type rotation. Day 1 built around the Sacred Heart of Jesus / García Moreno consecration story, timed to the US Bishops' June 11, 2026 consecration of America (first in 250 years of US history). Traditional Prayer field architecture clarified for launch.

- ✅ **CONTUERI-PP-30Day-Content-Plan-v3.html** built (`~/Documents/`). 30 days. Rotation by content TYPE (not theme): Sacred Art ×5, Thinkers ×4, Literature ×4, Pattern & Proof ×3, Music ×3, Landscape ×3, Photography ×3, Food & Wine ×2, Watch & Listen ×3. Three Ways arc (Invitation Days 1–10, Deepening 11–20, Return 21–30). 7 feast day anchors. CS Lewis-style Context narratives for all 30 days. No duplicates vs. 53 existing Sanity content items.
- ✅ **Day 1 rebuilt: Sacred Heart of Jesus.** Rafael Salas, *Sacred Heart of Jesus*, 1874. Hook: Ecuador first country consecrated to Sacred Heart (March 25, 1874, García Moreno + Archbishop Checa y Barba). García Moreno assassinated August 6, 1875 — last words *Dios no muere.* US Bishops consecrated America June 11, 2026 (first in 250 years). Context opens with Sacred Heart symbolism explainer for non-Catholic users (CS Lewis style, not catechism bullet points). Go Deeper: Annum Sacrum (Leo XIII, 1899), Haurietis Aquas (Pius XII, 1956), JPII. Salas painting public domain — sdcason.com.
- ✅ **CONTUERI-PP-Seeding-Template.html updated.** Added Traditional Prayer (Pray step) field section. Correct default already seeded (June 6): *"Lord, as I look upon this image, I am reminded of your glory made visible. Open the eyes of my heart. Let what I see lead me beyond what I see. Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen."* Leave content item Traditional Prayer blank to show this default. Add specific prayer only when artwork has a clear liturgical tradition.
- ✅ **Auditio document type clarified.** Auditio in Sanity is NOT ambient sound for P&P/VD. It is a **future standalone music content type for the Explore page** — same bubble model as Sacred Art, Photography, etc. Do not conflate with the ambient sound system.
- ✅ **Tradition Reflections confirmed as separate documents.** Separate Sanity docs (not inline fields on content items). Content items link them via reference array; if empty, carousel auto-matches by theme. Full document type name: **"Tradition Reflection (Church Fathers, Saints & Popes)"**. Author Type options: Church Father · Saint · Pope · Doctor of the Church · Theologian · Mystic · Philosopher. Papal encyclicals confirmed in scope — use "Pope" author type. JPII and Benedict XVI entries already exist.
- ✅ **Savinien Petit, *The Sacred Heart*, 1874** reserved. French academic, public domain. Held for future P&P: Sacred Heart devotion origin / St. Margaret Mary Alacoque. Not for Day 1.
- ✅ **PP-DAYTITLE-01 + PP-DEFAULTS-01 shipped** (commits `16f1eea5`, `ed3cbda7`).
  - **`dailyPrompt.dayTitle`** — new optional `string` field on the `dailyPrompt` schema for a poetic editorial title per day (e.g. "God Does Not Die" for Day 1 Sacred Heart). Max 80 chars. Distinct from the work title that lives on the linked `contentItem` (which names the painting/piece). Rendered prominently above the artwork on `/prompt`; falls back to the contentItem title when blank.
  - **`ppDefaults` singleton schema** (`sanity/schemaTypes/ppDefaults.ts`). Mirrors the `visioDefaults` pattern from VD-ACTION-01. Holds one field: `defaultActio` (required, max 280). Seeded by `scripts/seed-pp-defaults.ts` with Sheri's text: *"Look for beauty today, in a person, in the ordinary, in what would have passed unnoticed."* Editable in Studio after seed.
  - **Actio cascade in `PromptClient.tsx`** — `prompt.actio` → `ppDefaults.defaultActio` → hardcoded last-resort fallback. Per-day Actio in Sanity wins; otherwise the singleton fills the gap; the hardcoded string protects against an empty singleton (defense-in-depth only). Mirrors the VD-ACTION-01 cascade pattern.
  - **`getPpDefaults()` + `getPpDefaultsPreview()`** added to `lib/sanity.ts`. New `PpDefaults` type in `lib/types.ts`. New `DailyPrompt.dayTitle?: string` field on the type.

**Editorial rules added this session**
- **Saints and Church Fathers content type:** No new type needed. → **Thinkers & Quotes** if primary identity is theology/philosophy (Augustine, Aquinas, Hildegard, John of the Cross, Simone Weil). → **Literature & Poetry** if primary identity is literary/written (Francis of Assisi's *Canticle*, Dante). Test: what would you hand someone at dinner — their ideas, or the text itself?
- **Auditio ≠ ambient sound:** Auditio document type = future standalone Explore bubble music content. The ambient sound system is separate. Never conflate.
- **P&P audio is optional:** Audio suggestions in the content plan and seeding template are optional. Sheri decides per-day on entry. Blank does not block publishing.

### Phase 2 Work Done (June 7, 2026 afternoon · ambient track swaps + 30-day PP seed run + gap-fill patch)

Execution push that turned the morning's planning work into shipped artifacts. Three independent strands landed: production ambient sound swaps with denoise pipeline, the actual 30-day P&P content seed (20 of 30 days landed; remaining 10 blocked on Cowork's content), and a gap-fill patch script that filled fields Cowork's seed JSON had dropped.

**Ambient sound: Light Piano + Choral Chant track replacements**
- ✅ **`public/music/ambient-light-piano.mp3` swapped to Arvo Pärt's *Für Alina* (track 04)** (commits `2eaeedb3` → `8f4a312d` → `b621ffa0` → `1c21229c`). Source: Archive.org *alina2pianos* (Sheri's local download). Iteration sequence: initial swap from prior placeholder → ffmpeg `afftdn` (FFT denoise filter, nr=12) applied because the recording carried audible static → switched from Sheri's first source pick to a cleaner solo-piano source she had on disk → A/B'd track 02 vs track 04 on noise floor (track 02 measured −67.9 dB; track 04 measured −70.7 dB), shipped track 04. Final asset: 10:50 duration, 15.6 MB, processed through `/tmp/make-loop.sh` gapless-loop pipeline.
- ✅ **`public/music/ambient-plainchant.mp3` swapped to Suno-generated *Stabat Mater*** (commit `2eaeedb3`). Replaces the prior Pixabay-sourced plainchant. Note: file path stays `ambient-plainchant.mp3` so saved user preferences carry over; display label is already "Choral Chant" per the May 29 rename (commit `74358ce5`).
- ✅ **Pipeline rule for low-noise-floor classical recordings:** when audible static is present, run ffmpeg `afftdn` denoise BEFORE the gapless-loop pipeline, not after. The crossfade segment amplifies any residual noise; denoising first lets the crossfade math operate on clean signal. A/B noise-floor measurements (peak-normalized dBFS during silent passages) are the right test, not subjective listening alone.

**30-day P&P content seed: 20 of 30 days landed in production Sanity**
- ✅ **`scripts/seed-pp-content.ts` shipped + ran** (commit `91f37f33`). Reads `/tmp/cowork-seed-resolved.json` (the merged Cowork doc + Sheri's image-sourcing decisions) and creates one `contentItem` + one `dailyPrompt` per day where image sourcing status is `sourced` or `ok_already`. **20 of 30 days landed in production** with deterministic `_ids` (`pp-content-{slug}` + `pp-prompt-{slug}`). 10 days deferred: 4 explicit Cowork skips (content needs replacement), 3 needs-cowork (data gaps), 3 marginal-review on image quality.
- ✅ **Image asset uploads via Sanity client.** Each image downloaded from its source URL, uploaded via `client.assets.upload()`, and referenced on the contentItem. Sanity dedupes by content hash so re-runs return existing asset IDs (no orphan asset spam).
- ✅ **Wikimedia /thumb/ URL normalization.** Cowork's JSON had image URLs like `/thumb/a/bc/file.jpg/800px-file.jpg` which the direct upload endpoint rejects with 400. Added `normalizeWikimediaUrl()` to strip the `/thumb/` segment and final size-prefix path component before fetching. Six URLs needed it.
- ✅ **Wikimedia rate-limit handling.** Per-item 1.5s delay + exponential backoff retry on 429/503 status codes with `Contueri-Seeder/1.0` User-Agent. Avoided hammering the Wikimedia Commons API during bulk download.
- ✅ **Stale URL repair.** After /thumb normalization, 6 URLs still returned 404 because Wikimedia paths had moved since Cowork compiled the JSON. Used the Wikimedia Commons API to search for current valid URLs and updated the JSON before re-running the seed. Day 5 (Dante) substituted Plate 9 (Charon) for Plate 1 since Plate 1 was no longer at the listed URL.
- ✅ **3 contentType corrections in Sanity** (Days 7 Kepler, 17 Alhambra, 25 Chartres). Cowork's JSON used `pattern-proof` for these but the schema enum is `math-science`. Direct Sanity patch fixed all 3.
- ✅ **Theme slug coercion.** Cowork wrote `suffering-beauty`; Sanity stores `suffering-and-beauty`. `COWORK_TO_SANITY_THEME` map in the seed script handles the join.

**`scripts/patch-pp-content.ts` — fill gaps Cowork's seed JSON dropped**
- ✅ **Patch script shipped + ran** (commit `b2f1515f`). Cowork claimed `description`, `dayTitle`, `location`, `workTitle`, `mediaType`/`mediaUrl` were present in their handoff JSON; they weren't. Built a patch script with inline maps (`DESCRIPTIONS`, `LOCATIONS`, `DAY_TITLES`) drafted from existing `artworkHook` + context per the seed brief's guidance, and patched all 20 landed contentItems in production.
- ✅ **`DAY_TITLES` map** seeded from the `ppTitle` field in `CONTUERI-PP-Seed-Data.json` (Cowork's source doc) — e.g. "God Does Not Die" for Day 1 Sacred Heart. Populates the new `dailyPrompt.dayTitle` field shipped earlier today (PP-DAYTITLE-01).
- ✅ **`LOCATIONS` map** sourced from the `CONTUERI-CC-DataGaps-Brief.html` table. Each entry: `{locationName, city, country, coordinates}`. Populates the contentItem location block for the map view.
- ✅ **Day 9 mediaUrl decision (Sheri):** `https://youtu.be/je75FDjcUP4?t=9960` (Andrei Rublev's *Trinity* video). Cowork's brief pointed at 2:46:00 as a key visual moment; Sheri's call: "let it run to the end" because the closing minutes show close-ups of Rublev's work. Timestamp `t=9960` (2:46:00) lands at the start of that final stretch. **Adjust if the 2:46:00 estimate is wrong on Sheri's spot-check during launch.**
- ✅ **Cowork process lesson.** Cowork's handoff JSON claimed completeness on fields that were silently empty in the actual data. The patch script existed because the seed run revealed the gap. Future Cowork content handoffs: dry-run the seed against a 1-2 day sample before committing to the full 30-day batch — the gap surfaces in 30 seconds instead of an hour into the full run.

### Phase 2 Work Done (June 7, 2026 evening · 30-day P&P Tradition Reflections seeded)

TR seed end-to-end. Cowork delivered the 30-day Tradition Reflections as an HTML editorial doc (`~/Documents/CONTUERI-PP-TraditionReflections-30Day.html`), not as JSON. Built a parser + seed script, ran them to production, em dashes stripped, era enum coerced, idempotent re-run path established for the 10 days still waiting on Cowork's contentItem content.

- ✅ **`scripts/parse-tr-html.py`** — extracts 30 per-day TR records from Cowork's HTML into intermediate `/tmp/tr-extracted.json`. Each block has `tr-day-val`, `tr-content-title`, `tr-author-name`, `tr-source-work`, `tr-pull-quote` (blockquote + attribution), `tr-body` (4 paragraphs), and a `tr-sanity` footer with Slug / Author Type / Era / Source URL pre-extracted. Parser preserves body text verbatim. Re-runnable; output stays out of repo.
- ✅ **`scripts/seed-tr-content.ts`** — reads parsed JSON + `/tmp/cowork-seed-resolved.json` (for day → pp-content slug join), creates 30 `traditionReflection` docs with deterministic `_id = tr-{slug}`, then patches each PP contentItem (`_id = pp-content-{ppSlug}`) to set `traditionReflections: [{_ref}]`. Dry-run by default, `--patch` writes. Re-running is safe and idempotent — `createOrReplace` on TRs, `set` (not append) on the patch field.
- ✅ **30 traditionReflection docs landed in production Sanity** with `tr-{slug}` IDs. **20 PP contentItems patched** with their TR reference (the 20 days that already have a seeded contentItem). Remaining 10 days (6, 12, 15, 16, 19, 22, 24, 26, 27, 29) have TRs created but no contentItem link yet — those are days waiting on Cowork to redo their PP content. Re-running the script after those contentItems land auto-links them.
- ✅ **Em dashes stripped at seed time: 139 → 0.** Per the standing rule. Applied via `stripEmDashes()` transformer at the seed layer, not at the parse layer, so the source JSON stays faithful to Cowork's draft. Substitution pattern `\s*—\s*` → `, ` (comma + space). Audit confirmed comma substitution reads naturally in every observed parenthetical/appositive context.
- ✅ **Era enum coerced.** Schema accepts `ancient | fathers | medieval | modern`. Cowork used two non-schema values: `patristic` (Days 3, 4, 7, 10, 13, 21, 25, 30) → mapped to `fathers`. `early-modern` (Day 12 John of the Cross, 1542–1591, Counter-Reformation) → Sheri's call: maps to `modern`, not `medieval`. ERA_MAP updated to lock that decision for any future re-run.
- ✅ **Field mapping HTML → Sanity:** `authorName` → `title` (e.g. "Thomas Aquinas"); `{authorName}, {sourceWork}` → `source` (full attribution per schema example pattern); `body` → `summary` (verbatim, 4 paragraphs preserved); `shortQuote` → `shortQuote`; `authorType` passes through (already schema-valid); `era` mapped; `dayNumber` → `order` so Studio listing sorts 1..30. Source URLs from Cowork preserved internally but not on schema (no field for them; can be added in v1.1 if needed).
- ✅ **Three Cowork-side flags resolved with Sheri:** Day 6 Dorothy Day = `theologian` (keep — cause for canonization open, not philosopher in technical sense); Day 12 John of the Cross era → `modern` (Counter-Reformation); 76 hyphens in text are legit compound words (no action).
- ✅ **Studio editorial review pending** — Days 7 (Augustine), 12 (John of the Cross), 26 (Chesterton) flagged for spot-check because they had multiple parentheticals per paragraph in the Cowork draft. Sheri reviews in Studio (sorted by Display order in the TR list).
- ✅ **Commit `6add8980 feat(seed): 30-day P&P Tradition Reflections seeded + linked`.** Two files, 527 insertions. `npm run build` clean.

**Pipeline rule established this session**
- **Faithful seed + write-layer transform.** When a content source carries content that violates a standing rule (em dashes, here), transform at the write layer, not the parse layer. The parsed JSON stays faithful to the source so provenance is auditable; the seed script applies the rule before writing to Sanity. Rule violations become reportable (count in → count out) rather than silently rewritten upstream. Apply this pattern to future Cowork content seeds.

**Design + voice rules added this session**
- **`100dvh` not `100vh` on immersive routes** — Tailwind's `min-h-screen` resolves to `100vh` and violates this rule. Use inline `style={{ height: "100dvh" }}` + `overflow-hidden` on PrayClient / JourneyDay-stepper / SplashClient-style surfaces. Browse routes (Explore, Library, Settings, Journeys list, Dashboard) intentionally use `min-h-screen` because they're meant to scroll.
- **Cream-tone palette for espresso surfaces** — `rgba(253,246,232,0.88)` (C.cream) for body baseline; `rgba(232,217,184,0.92)` (C.creamWarm) for section titles; `rgba(253,246,232,0.5)` (C.creamDim) for dim/ancillary; `rgba(253,246,232,0.3)` (C.creamFaint) for faintest. **No `text-white` on espresso surfaces** — it pulls brightness and makes the surrounding cream tones read as muddy.
- **Notification voice principle: constant trigger, variable body.** Title is the predictable habit-loop trigger; body carries the variable content. Variable rewards live inside the app, not in the notification copy. Rotation rejected for v1.0.
- **"Pause" is the brand verb; "piece" is off-brand.** Use "pause," "Pause & Ponder," or "curated content" — never "piece" in notifications or contemplative-surface copy. Possessive "Your" frames notifications as fulfilling a user request, not pushing engagement.
- **"Beauty, Truth & Goodness" is the brand foundation.** The three transcendentals are the philosophical pillars Contueri orients around. Used universally — no per-journey personalization gating. Avoids needing "transcendentals" (mouthy for notification).

### Phase 2 Work Done (June 5, 2026 afternoon/evening · Ambient Sound System + Visio Divina restructure + audit dashboard)

Multi-hour continuation session that closed several W1 jobs, shipped the Ambient Sound System MVP, restructured Visio Divina end-to-end for App Store readiness, and produced a Visio content audit surface. Net result: launch path well ahead of the original Jun 12 timeline; remaining work is editorial / polish / final QA.

- ✅ **iOS native audio prerequisites + MediaSession lockscreen metadata** (commit `619d570a`). `Info.plist` gains `UIBackgroundModes = ["audio"]`; `AppDelegate.swift` configures `AVAudioSession.setCategory(.playback, mode: .default)` at `didFinishLaunchingWithOptions`. New `hooks/useMediaSession.ts` wraps the Media Session Web API — sets `navigator.mediaSession.metadata` while a track is active, registers play/pause/stop/seekto handlers wired to a passed audioRef, syncs via onPlay/onPause/onStop callbacks. Sanity CDN URLs auto-resized to multi-size artwork (128/256/512). Wired into `PromptClient` Auditio + `JourneyDaySteps` CircularAudioPlayer (new `artworkUrl` prop). Lockscreen now shows track title, composer, day's painting as cover art; AirPods double-tap pauses; Control Center carries the same UI. Background audio survives screen lock. **Closes W1 Job 2.**

- ✅ **Capacitor Browser plugin for external links** (commit `d6886722`). Installed `@capacitor/browser ^8.0.3`, ran `npx cap sync ios`, added new `components/native/ExternalLinkInterceptor.tsx` mounted in root layout. Global click listener at the document level intercepts cross-origin `http(s)` clicks and routes them through `Browser.open({url, presentationStyle: "popover"})`. Skips: same-host nav, mailto/tel/sms/skype, anchor links (#), `<a download>`, clicks with modifier keys (Cmd/Ctrl/Shift/Alt) or non-primary mouse button, already-defaultPrevented events. Silent no-op on web + in Sanity Presentation iframes via the dynamic `@capacitor/core` import guard. **Closes W1 Job 3 and App Store Review Guideline 4.5.4.**

- ✅ **CORS unblocked for contueri.app** — content tabs (Today, Explore, Journeys, Library) were returning empty from the Xcode-installed app despite working on `s-beauty-app.vercel.app` in browser. Diagnosis: server-side rendered `getSplashPages()` worked (no CORS) but client-side `getDailyPrompt()` etc. in `useEffect` were blocked because `https://contueri.app` was not in Sanity's CORS Origins allowlist. Sheri added the origin via https://manage.sanity.io/projects/em44j9m8/api → CORS Origins → Add `https://contueri.app` + Allow credentials checked. **Fix is config-only; no code change required.** Going forward: every new production domain must be added to the Sanity CORS allowlist before client-side queries from that origin will succeed.

- ✅ **6 gapless-loop ambient sound MP3s shipped to `public/music/`** (commit `787ecbeb`). Replaces the two earlier short, non-loopable test files (natureseye-piano + nickpanek-ave-maria). Slate (Pixabay-sourced, free + commercial-use, ~28 MB total): gregorian-chant (98s), plainchant (237s), light-piano (144s), lofi-piano (154s — replaces the brief's "nature" slot per Sheri's call that nature didn't meet the contemplative register), gentle-rain (259s), ocean-waves (101s). Processing pipeline kept at `/tmp/make-loop.sh`: takes input, splits into [first 3s] [middle] [last 3s], crossfades the last 3s into the first 3s with triangular fade curves, concatenates [middle] + [crossfade]. The crossfade segment IS the loop transition — end-of-iter-N acoustically blends into start-of-iter-N+1 with no perceptible gap or click. Loudnorm to -18 LUFS for volume consistency. PrayClient's Visio Divina Chant/Ambient picker updated to point at `ambient-gregorian-chant.mp3` and `ambient-light-piano.mp3` (later retired entirely when the global provider shipped). **Closes W2 Ambient Sound System content blocker.** See `public/music/README.md` for the slate + pipeline detail.

- ✅ **Ambient Sound System MVP shipped** (commit `9f548106` + `a0581566` iOS volume fix). Per CONTUERI-CC-Ambient-Sound-Brief.html, locked MVP scope per Sheri: provider + persistence + hook + 3-state floating button + inline Settings picker with simple slider + Visio Divina migration + auto-pause/auto-resume on TTS. Deferred to stretch: TTS volume ducking → reclassified to v1.1 per Sheri later in session, long-press popover, cross-fade between sounds. Deferred to v1.1: arc dial, discovery pulse animation.
  - `lib/userData.ts` — 4 storage keys (`contueri-ambient-sound`/`-volume`/`-was-playing`/`-discovery-seen`) with safe SSR defaults and clamping. `AmbientSoundId` union for the 6 sounds. `AMBIENT_SOUNDS` metadata table mapping id → display label → file path (single source of truth for the picker + provider).
  - `hooks/useAmbientPreferences.ts` — modeled on `useOnboarded`. Volume setter debounced 200ms trailing so a slider drag doesn't thrash localStorage.
  - `components/audio/AmbientSoundProvider.tsx` — single shared `<audio loop preload="none" style={{display:none}}>` rendered once in root layout, outside Navigation. Survives every route change. Context API: selectedSound, isPlaying, volume, isReady, discoverySeen, selectSound, play, pause, toggle, setVolume, markDiscoverySeen. Autoplay policy non-negotiable: cold launch never auto-resumes; wasPlaying flag is a UI hint, not a playback trigger. Iframe guard: in Sanity Presentation iframe, the audio element never mounts. Narration coordination via NARRATION_START_EVENT / NARRATION_END_EVENT (already dispatched by `NarrationButton`).
  - **iOS volume control via Web Audio GainNode** (commit `a0581566`). iOS Safari / WKWebView ignores `<audio>.volume` — Apple treats audio volume as user-hardware-controlled and the property is effectively read-only. The Settings slider had no audible effect on iPhone. Fix: route the shared `<audio>` element through `<audio> → MediaElementSource → GainNode → destination`. Gain values ARE honored on iOS. Lazy creation on first play() so AudioContext starts in a user-gesture context. `gain.setValueAtTime(v, ctx.currentTime)` for zipper-free volume drags. `<audio>.volume` still set as fallback for desktop where Web Audio routing might fail.
  - `components/audio/AmbientFloatingButton.tsx` — three-state floating button (Playing / Paused / Off entry-point that deep-links to `/settings#sound`). Position `bottom: env(safe-area-inset-bottom) + 64px; right: 16px` per the brief. Hidden on `/splash` and inside iframes.
  - `components/audio/AmbientSettingsSection.tsx` — inline picker (Off + 6 sounds, sage left-border + checkmark on selected), volume label + percentage + simple slider (disabled when nothing selected). `id="sound"` anchor for the floating button's deep-link.
  - **Visio Divina migration** — removed `MUSIC_CHANT` + `MUSIC_AMBIENT` constants, `MusicMode` type, music state (mode/paused/menuOpen/loadError), chant/ambient audio refs, setMusic/pauseMusic/resumeMusic handlers, `isPlaying` derived, the audio elements, the dropdown menu, the floating music button, and the "Music" label in the header right cluster. Ambient sound preference now travels across every contemplative surface via the global provider.

- ✅ **Visio Divina restructure for App Store release** (commits `b2628ca1` + `a31c4da4` + `b9faec4a` + `7ecc49c0`). Per Sheri's call that the prior state was "sloppy" for launch, multi-pass cleanup:
  - **Step order corrected** (`7ecc49c0`, earlier in session). Canonical Lectio Divina sequence Visio → Meditatio → Oratio → Contemplatio → Actio. Previously had Pray and Contemplate swapped. Latin label on step 5 also corrected: Operatio → Actio (`b9faec4a`).
  - **X close button added to header upper-right** (`b2628ca1`) — gives Visio Divina the modal-dismiss affordance most users expect. Tap routes to `/library` via `handleFinish()` from any step.
  - **Tradition Reflection card consistent frame size** (`b2628ca1`) — minHeight 220px so swiping between short and long reflections doesn't shift the layout. Card scrolls internally if a reflection runs longer.
  - **Carousel dot indicators replaced with "N/M" text counter** (`b2628ca1`) — the gold-pill dot row below the card was visually competing with the Stories progress segments at the top of the Visio Divina header. Two simultaneous "steppers" on one page read as confusion. A small monospace counter retires the conflict.
  - **Explore artwork tap → straight to `/pray/[id]`** (`a31c4da4`) — for `sacred-art` + `landscape` items only. Previously these tapped through a P&P-style detail card with a "Pray with this image" CTA as a two-step intermediate. For image-based contemplative content the intermediate added friction with no editorial gain. Non-image content types (music, literature, thinker, etc.) keep the detail-modal route. Eye-icon Link overlay on visio cards retired (redundant).
  - **Next/Finish footer button removed** (`a31c4da4`). Stories progress segments at the top + swipe + X close in the header are the navigation now. The bottom button was creating a "competing stepper" moment.
  - **GoDeeperSection moved from fixed-bottom-everywhere → inline within Meditate slide only** (`a31c4da4`). Meditate is the active-engagement step where text-rich tradition content earns its place; Gaze should be the image alone; Contemplate is silent abiding where text fights the mode. New `inline` prop on `GoDeeperSection` switches off the top border and 35vh height cap.
  - **"Go deeper" label color** gold `#C19B5F` → cream-faint `rgba(253,246,232,0.7)` (`a31c4da4`). Gold reserved for clear CTA moments; expandable section header reads as an affordance, not a CTA.
  - **Chrome polish + image rendering** (`33440f0c` + `7db34751` + `5acffab4` + `f164f3e0`) — final iteration set: step title centered in chrome row via `grid-cols-[1fr_auto_1fr]` (matches the BREATHE pattern from Journey Day); per-slide h2 step header removed (one label per slide, not two); icon-only Back + X close (no backgrounds, no hover state); Stories stepper segments color sage → cream `rgba(253,246,232,0.88)` (Sheri reversed her earlier call); chrome row vertical padding `py-3 → py-2`; sticky header `border-b` dropped (was the visible cream-faint seam between chrome and image). Image treatment unified across all 4 image-bearing steps: edge-to-edge horizontally (no px-4 frame), `object-cover` so image fills its container window (pinch-zoom + pan reveal any cropped region at up to 8x), unified height `min(65vh, 65dvh)` everywhere — was 75vh on Gaze/Contemplate and 60vh on Meditate/Pray; the mid-point keeps the artwork visually dominant on lighter-text steps without dwarfing reflect questions / prayer drawer on text-heavier steps.
  - **Action step redesigned with blurred-image-background pattern** (`c1d8e535` + `d9bf66ab`) — was a stark form-only layout (h3 + paragraph + textarea on plain espresso) that read out of place. Now mirrors Journey Reflect (`StepReflect`): blurred artwork as full-bleed background (blur 7px, brightness 0.5, ken-burns 8s ease-in-out infinite alternate), dark scrim `rgba(22,17,13,0.45)` for legibility, centered content with the prompt in Cormorant italic at `clamp(1.4rem, 5vw, 1.8rem)`, sub-prompt below in cream-dim sans. Textarea + safety caption hidden per Sheri ("just hide the text input box for now"); state and storage hook preserved for future un-hide. **Architectural gap logged in `~/Documents/Kallos-UX-Backlog.html` as `VD-ACTION-01`:** Actio prompts currently live ONLY on `dailyPrompt` (P&P), not on `contentItem`. Path C (hardcoded generic) for v1.0; path A (add `operatio` field to `contentItem` schema + per-artwork content writing) for v1.1.

- ✅ **Visio Divina content audit dashboard page** (`04a11035`). New `/dashboard/visio-audit` route, gated by `DASHBOARD_ENABLED` like the rest of `/dashboard`. Lists every contentItem eligible for `/pray/[id]` (sacred-art + landscape) with the artwork image, full Traditional Prayer text (not yes/no), `traditionalPrayerSource`, and every linked Tradition Reflection rendered in full (title, shortQuote, summary, source, authorType, era). Per Sheri: "the content should show, not just a yes, no or 3 (ex 3 reflections)" — editorial decisions on what's launch-ready happen at the audit surface without round-tripping to Studio. PRESENT / MISSING badges flag absent fields at a glance. Roll-up counters at top (total items, with prayer, with reflections, total reflections). "Open Visio Divina →" link per card jumps straight to `/pray/[id]`. New GROQ helper `getDashboardVisioAuditItems()` in `lib/sanity.ts`. Discovery affordance added on main `/dashboard` above Section 3.

- ✅ **Cross-route audio behavior verified by Sheri on device** — MediaSession lockscreen metadata renders correctly; ambient sound carries across route changes; pause-on-narration auto-resumes after narration ends. Cold launch never auto-resumes (autoplay policy honored).

### Phase 2 Work Done (June 5, 2026 early hours · iOS CI pipeline green, first TestFlight build uploaded)

Multi-hour session diagnosing and fixing every wall between the W1 scaffold and a working `git push → TestFlight` pipeline. Final result: build 2 uploaded to App Store Connect / TestFlight at 05:02 UTC on June 5. Total CI run time once green: ~3 minutes. The infrastructure to ship every commit on `main` to TestFlight automatically is now live.

- ✅ **iOS CI pipeline fully working end-to-end** — `.github/workflows/ios-build.yml` + `fastlane/Fastfile`. Six commits across the session, each unblocking the next wall:
  - `cf2048ad` — Ruby pinned to 3.1 (Gemfile.lock's `CFPropertyList 3.0.9` requires Ruby < 3.2; CI's default 3.3.x was incompatible).
  - `a4758d4c` — `MATCH_GIT_URL`, `MATCH_GIT_BASIC_AUTHORIZATION`, `MATCH_FORCE_LEGACY_ENCRYPTION` propagated to BOTH the Match step AND the Build step env blocks. Without them on the Build step, Fastlane errored with "No value found for 'git_url'" even though the prior Match step had succeeded.
  - `1631b6bf` — `fastlane/Fastfile` switched from `workspace: WORKSPACE_PATH` to `project: PROJECT_PATH`. Capacitor 8 with Swift Package Manager (CapApp-SPM) generates no `App.xcworkspace`; only `App.xcodeproj` exists. `build_app` accepts `project:` directly when there is no workspace.
  - `33d12f2b` — Added `update_code_signing_settings` between `match` and `build_app` so the Xcode project switches from automatic signing (which requires a GUI) to manual signing using the Match-installed AppStore profile. Without this, `xcodebuild archive` failed in CI with "No profiles for 'app.contueri.ios' were found".
  - `9acdd00b` — Runner upgraded `macos-14 → macos-15` with explicit Xcode 16 select. `@capacitor/status-bar` 8.0.x and `@capacitor/splash-screen` 8.0.x call `capacitor-swift-pm` 8.4.0 binary APIs gated behind `#if compiler(>=5.3) && $NonescapableTypes` (a Swift 6 experimental feature). Xcode 15 silently treats those APIs as undefined — the compiler reported `PluginConfig has no member 'getString'`, `CAPBridgeProtocol has no member 'webView'/'viewController'`, and `incorrect argument label in call (have 'fromHex:', expected 'argb:')`. Xcode 16 enables `$NonescapableTypes` and the gated APIs resolve. Also restored Capacitor plugin pins to clean stable (`^8.0.1` splash-screen, `^8.0.2` status-bar) since the issue was the runner toolchain, not the plugin source.
  - `dc93aa1a` — `setup_ci if ENV["CI"]` added to the top of the `deploy_testflight` lane, BEFORE `match`. Without it, `xcodebuild` hung 58 minutes at the "Signing Cordova.framework" step waiting for a keychain unlock prompt that never arrives on a headless runner, until the 60-min workflow timeout killed the build. `setup_ci` creates `fastlane_tmp_keychain-db`, unlocks it, sets a long timeout, and configures the keychain partition list so signing identities are accessible without prompting. Match then imports certs into this temp keychain. Also removed the separate "Install certificates via Fastlane Match" workflow step — it ran match in its own Ruby invocation, set up no CI keychain, and the resulting cert state did not carry over to the build step.
  - `57983e6b` — Xcode select bumped `16 → 26`. After signing was fixed, App Store Connect rejected the upload at altool with iris-code `STATE_ERROR.VALIDATION_ERROR`: "SDK version issue. This app was built with the iOS 18.5 SDK. All iOS and iPadOS apps must be built with the iOS 26 SDK or later, included in Xcode 26 or later, in order to be uploaded to App Store Connect or submitted for distribution." Xcode 16.4 ships iOS 18.5 SDK; Apple's June 2026 policy requires iOS 26. macos-15 has Xcode 26.x pre-installed alongside 16.x.
- ✅ **Apple Developer Individual enrollment is Active.** Team ID, App Store Connect API key, App Store Connect "Contueri-ios" app record all created. Eight GitHub Actions secrets configured (APPLE_ID, APPLE_TEAM_ID, APP_STORE_CONNECT_API_KEY_ID, APP_STORE_CONNECT_API_KEY_ISSUER_ID, APP_STORE_CONNECT_API_KEY_CONTENT, MATCH_PASSWORD, MATCH_GIT_URL, MATCH_GIT_BASIC_AUTHORIZATION, MATCH_FORCE_LEGACY_ENCRYPTION). Encrypted Match certs repo `srjennings-luna/contueri-certs` populated via one-time local `bundle exec fastlane match_init`. Distribution cert + provisioning profile (`match AppStore app.contueri.ios`) live in that repo and pulled read-only by every CI build.
- ✅ **Mid-session secret fixes Sheri did manually:** retyped MATCH_GIT_URL after a leading-space copy/paste caused `protocol ' https' is not supported`; regenerated MATCH_GIT_BASIC_AUTHORIZATION with a fresh fine-grained PAT scoped to Contueri-certs (Contents Read+write) after the old token returned 401; deleted typo'd `APPLE_STORE_CONNECT_API_KEY_ISSUER_ID` and created the correct `APP_STORE_CONNECT_API_KEY_ID = SJAYUGD994`.
- ✅ **fastlane/Fastfile final state** (`deploy_testflight` lane):
  1. `setup_ci if ENV["CI"]` — keychain setup.
  2. `match(type: "appstore", readonly: true)` — pull certs into temp keychain.
  3. `update_code_signing_settings` — switch project to manual signing.
  4. `app_store_connect_api_key` — auth.
  5. `increment_build_number` from highest TestFlight build.
  6. `build_app(project: PROJECT_PATH, scheme: "App", export_method: "app-store")`.
  7. `upload_to_testflight(skip_waiting_for_build_processing: true)`.
- ✅ **fastlane/Fastfile second commit** `7ecc49c0` (cleanup pass): corrected Visio Divina step order to canonical Lectio Divina sequence (Gaze → Meditate → Pray → Contemplate → Action; was Pray and Contemplate swapped). Same commit: StatusBar default flipped from `DARK` on parchment to `LIGHT` on espresso to eliminate cold-launch parchment strip flash before `StatusBarController` resolves the per-route style. 99% of cold-launch routes land on espresso surfaces, so LIGHT-on-espresso is the correct default; parchment routes get the swap via the runtime controller.
- ✅ **Final timing on the green run (#26996339629):** `setup_ci` 0s, `match` 2s, `update_code_signing_settings` 0s, `app_store_connect_api_key` 0s, `latest_testflight_build_number` 0s, `increment_build_number` 1s, `build_app` 54s, `upload_to_testflight` 116s. Total workflow: 3m 28s including npm install and Xcode select.
- ✅ **Repo + secret topology now standing:**
  - `srjennings-luna/s-beauty-app` — main app repo. Pushes to `main` trigger `.github/workflows/ios-build.yml` on macos-15 / Xcode 26.
  - `srjennings-luna/contueri-certs` — encrypted Match cert storage, private, accessed via PAT in `MATCH_GIT_BASIC_AUTHORIZATION`.
  - App Store Connect: app `Contueri-ios` (bundle id `app.contueri.ios`), Team ID active. API key file content lives in `APP_STORE_CONNECT_API_KEY_CONTENT` secret.

### Phase 2 Work Done (June 3, 2026 night / June 4 early hours · Mineral Blue splash + onboarding editorial pass)

Late-night session that pivoted from iOS step 1 (status bar runtime wiring) to a splash architecture correction after Sheri reviewed the previous Claude Code session's notes and caught three explicit mistakes in the splash plumbing. iOS step 1 paused; will resume on top of the new splash design.

- ✅ **Mineral Blue P&P gradient shipped across native iOS launch image AND in-app `/splash` route** as commit `4b1405e8`. Three explicit corrections to the previous CC session's work:
  - **Native iOS launch master** at `assets/splash.png` re-rendered from solid parchment `#fdf6e9` to three Mineral Blue (`#7ba2b8`) radial-gradient layers (sweep / band / pool) on espresso base, with centered CONTUERI wordmark in Montserrat 600 caps cream. Approximates a single frozen moment of the live PPGradientBackground (drifting on 22s/18s/28s cycles in gradient.module.css). Source script: `~/Documents/KALLOS Launch/icon-source/render-ios-splash.mjs` (rewritten this session; kept historical solid + wordmark renders for reference).
  - **In-app `/splash`** background swapped from the deprecated `WHISPER_GRADIENT` to `<PPGradientBackground contentType={undefined}>` which falls back to Sacred Art Mineral Blue per `getPPGradient`. Inner wrapper changed from `fixed inset-0` to `relative h-[100dvh]` so it sits as a flex child of the PPGradientBackground `.phone` wrapper. WHISPER_GRADIENT import removed from SplashClient.
  - **`capacitor.config.ts` `SplashScreen.backgroundColor`** updated from `#fdf6e9` (parchment) to `#5a7a8a` (Mineral Blue dominant blend tone). Eliminates the parchment-flash that the previous color choice would have caused during the native splash → WebView handoff. Any letterboxed sliver now blends with the gradient tone instead of flashing parchment. iOS Splash.imageset regenerated via `npx @capacitor/assets generate --ios --iconBackgroundColor '#16110d' --splashBackgroundColor '#5a7a8a'`. `Package.swift` updated by `npx cap sync ios` to wire the four installed Capacitor plugins (App, Keyboard, SplashScreen, StatusBar) as Swift Package Manager dependencies (was missing before).
  - **Design intent locked:** native launch image AND in-app `/splash` BOTH use the Mineral Blue P&P gradient. Splash is the intentional exception to the P&P gradient's "use sparingly" rule — it announces "this is curated." Browse-mode surfaces (Explore, Library, Journeys list) stay flat per the original rule.
- ✅ **Onboarding editorial pass shipped** as commits `83ad8fe7`, `137470d3`, `dbc806c8`, `6e6c435d`. Triggered by Sheri's "the gold at the bottom of the screen seemed off since the rebrand" — the May 29 rebrand had added "CONTUERI is built on that." (screen 2 tagline, gilt) and "CONTUERI is built for exactly that." (screen 4 body, cream) as closers. Two versions of the same brand-assertion line, two screens apart, in inconsistent block types and colors. Voice-rule register violation (explaining instead of showing — same instinct as the bans on "spiritual practice," "invitation to," etc.).
  - **Tagline renderer color** swapped from gilt `G` (`#B89238`) to verdigris `#5F7A6B`. Restores gold's "one use per screen" preciousness — gold is now reserved for screen 5's "Start here →" CTA, the single action moment across the whole onboarding flow.
  - **Screen 1 definition** stripped of "Contueri:" prefix. Was: "Contueri: To gaze on, behold, contemplate with purpose." Now: "To gaze on, behold, contemplate with purpose." Wordmark + pronunciation above already name the word twice; the third repetition before the definition read anxious. Now renders in verdigris (per the renderer change), echoing the hairline above it.
  - **Screen 4 closer typing migrated** from `body` to `tagline` in production Sanity via `scripts/migrate-splash-screen-4-closer-to-tagline.ts` (idempotent, dry-run flag, backup written before mutation). Document `kallos-splash-4`, block index 3, `_type: body → tagline`. Text and `_key` preserved. Backup at `scripts/backups/splash-screen-4-pre-tagline-migration-2026-06-04T04-57-52-605Z.json` (gitignored). This corrects the May 29 rebrand inconsistency where screens 2 and 4 closers used different block types.
  - **`tagline.text` now optional in `splashPage` schema** (was `Rule.required()`). Renderer in `SplashClient.tsx` guards against empty/whitespace text and returns null — without the guard, an empty `<p>` with `marginTop: 48` would leave a visible gap. This enables the placeholder pattern: clear text in Studio without re-creating the block; type new text later to bring the closer back, automatically rendering verdigris. Sanity Studio redeployed via `cd sanity && npm run deploy`.
  - **Sheri cleared the tagline text on screens 2 + 4 in Sanity Studio and published.** Both blocks remain in place as empty structural placeholders for future closer copy. Closers don't render. Fallback synced to mirror live state.
- ✅ **Net architectural result.** Gold across the 5 onboarding screens now carries exactly one job: "this is what you do next" (screen 5 CTA only). Verdigris is the quiet anchor for content (definitions, future closer copy). Tagline blocks are the canonical closer treatment across the splash flow — body blocks are paragraph content only. The placeholder pattern (empty tagline blocks) gives editorial flexibility: any closer can come back via Studio without touching code or schema.
- ⚠️ **Editorial follow-up flagged by Sheri at session close.** With closers removed, screens 2 and 4 feel incomplete — the closer slots were doing real pacing work even though the rebrand copy was wrong. Replacement closer text TBD; whenever Sheri drafts it, the path is open block in Studio → type → publish → renders verdigris. Voice-rule standard for replacement: show, don't explain.
- ✅ **Memory saved:** `project_splash_tagline_vs_definition.md` — the Contueri splash `tagline` field currently holds the word definition (etymology), not a brand tagline. Real brand tagline is TBD (Open Decisions #6). Don't conflate them in copy or mockups. Linked into `MEMORY.md` under Kallos App Notes.
- ✅ **Reference artifacts on disk (not version-controlled in repo):**
  - `~/Documents/KALLOS Launch/CONTUERI-Splash-Decisions-Mockup.html` — Q1 native splash hide timing + Q2 status bar icon-color decision mockups (work paused upstream)
  - `~/Documents/KALLOS Launch/CONTUERI-Splash-Redesign-Mockup.html` — P&P fluid gradient candidates + content variant trim mockups (superseded by what shipped)
  - `~/Documents/KALLOS Launch/icon-source/render-ios-splash.mjs` — rewritten to render the Mineral Blue gradient master

### Phase 2 Work Done (June 3, 2026 evening · W1 iOS scaffold complete + Apple Dev enrollment in flight)

- ✅ **Apple Developer Individual enrollment submitted** via the iPhone Developer app. $99 paid. 24-48h activation pending. Watch for the confirmation email; once Active, grab Team ID from https://developer.apple.com/account → Membership tab; generate App Store Connect API key at https://appstoreconnect.apple.com/access/api (save the .p8 file content for the GitHub Actions secret); then run through the `fastlane/README.md` activation checklist to add the 8 GH Actions secrets and run `bundle exec fastlane match_init` locally once.
- ✅ **Privacy Policy + Terms of Service routes shipped** as commit `9d75e337`. Both required for App Store submission (ASC will not accept submission without working URLs). Drafted content from `~/Documents/KALLOS Launch/KALLOS-Privacy-Policy-Draft.html` and `KALLOS-Terms-of-Service-Draft.html` converted to Next.js routes with Contueri rebrand applied. Legal placeholders rendered as visible pink boxes (aria-hidden so screen readers do not narrate the bracketed text as content per the June 3 a11y polish). Settings rows now route real destinations.
- ✅ **Notification preferences UI scaffold (D-04)** shipped as commit `98113cc2` at `/settings/notifications`. 4 per-type cards (P&P, journey day, "if you have not been here" / streak, seasonal) with on/off toggle + native time picker + 7-chip day-of-week selector. Pre-permission rationale modal with parchment sheet, Cormorant italic title, Continue + "Not now" actions. Persistence via 4 new `lib/userData.ts` keys + new `useNotificationPreferences` hook. UI ships now; W2 OneSignal API wire-up happens once APNs cert generates (gated on Apple Dev activation).
- ✅ **Notification copy library typed module** shipped as commit `e698895d` at `lib/notificationCopy.ts`. Single source of truth for W2 OneSignal scheduled-send configuration. Source: `KALLOS-Notification-Copy.html` (May 20 draft), rebranded to Contueri and mapped onto the D-04 four-type structure. Streak copy is new (May 20 draft predated the D-04 streak type); the streak voice frames messages as "today is still here" not "you're about to break something." Permission rationale constant matches the modal already shipped on `/settings/notifications` so the two never drift. Helpers: `pickVariant(variants, seed)` deterministic daily rotation; `formatVariant(variant, substitutions)` for `{{key}}` template substitution.
- ✅ **iOS build pipeline scaffold (GitHub Actions + Fastlane)** shipped as commit `7f7932a5`. `.github/workflows/ios-build.yml`, `fastlane/Fastfile` (lanes: `match_init`, `deploy_testflight`), `fastlane/Matchfile`, `fastlane/Appfile`, `fastlane/README.md` (activation checklist), `Gemfile` (Fastlane 2.224 pinned), `.gitignore` updates for Ruby + Fastlane + Xcode artifacts.
- ✅ **A11y polish** shipped as commit `b0afad06`. Notification rationale modal: focus trap (Tab from last wraps to first; Shift+Tab from first wraps to last), auto-focus Continue button on open via 0ms setTimeout (iOS Safari render workaround), Escape key calls `onSkip()`, restore focus to triggering toggle on unmount via captured `document.activeElement`. Privacy + Terms `<Placeholder>` component: `aria-hidden="true"` so screen readers do not narrate `[LEGAL ENTITY NAME]` etc. as legal content. Required before TestFlight per the June 3 a11y audit; resolves the material findings.
- ✅ **Capacitor 8 stack installed** as commit `088ec394`. Dependencies: `@capacitor/core`, `@capacitor/app`, `@capacitor/status-bar`, `@capacitor/splash-screen`, `@capacitor/keyboard`. DevDeps: `@capacitor/cli`, `@capacitor/ios`, `@capacitor/assets`. `capacitor.config.ts` switched from inline structural type to real `import type { CapacitorConfig } from "@capacitor/cli"`.
- ✅ **iOS Xcode scaffold + AppIcon.appiconset + Splash.imageset** shipped as commit `1231f440`. Sheri ran `npx cap add ios` and `npx @capacitor/assets generate --ios --iconBackgroundColor '#16110d' --splashBackgroundColor '#fdf6e9'` from her terminal after installing Xcode 26.5, Homebrew, and CocoaPods (Capacitor 8 used Swift Package Manager so CocoaPods install was insurance not requirement). Asset masters committed to repo at `assets/icon.png` and `assets/splash.png` so the generator can be re-run without referencing `~/Documents/KALLOS Launch/`. Splash.imageset: 1x/2x/3x portrait + landscape. AppIcon.appiconset: all 13 iOS sizes. Capacitor uses `capacitor-swift-pm 8.4.0` Swift Package for native deps; no CocoaPods Podfile present. Xcode workspace loads clean with "App: Ready" status. Personal Team signing works for Simulator. Distribution cert via Fastlane Match wires up once Apple Dev enrollment activates.
- ✅ **Three launch docs created in `~/Documents/KALLOS Launch/`:**
  - `CONTUERI-AppStore-Listing-Copy.html` rebrand of May 20 KALLOS draft. New pronunciation guide block, Latin etymology in description above-fold, contueri.com / contueri.app URL split, DEV-01 developer-name caveat (App Store shows "Sheri Jennings" until Organization migration).
  - `CONTUERI-Legal-Placeholders-Reference.html` walks through `[LEGAL ENTITY NAME]`, `[STATE/JURISDICTION]`, `[STATE]`, `[COUNTY, STATE]`, `[LAUNCH DATE]` with recommended fills for the Individual enrollment path → "Sheri Jennings"; future DBA → "Sheri Jennings d/b/a Contueri"; future Org → "Contueri."
  - `CONTUERI-A11y-Audit-June3.html` accessibility audit on Settings + Privacy + Terms + Notifications. Material findings shipped as `b0afad06`. Remaining items are polish or resolve-at-submission.
- ✅ **PAT updated with Workflows scope.** Fine-grained PAT for `s-beauty-app` repo now has Actions + Workflows + Contents + Metadata permissions. Resolved the push-rejection blocker. Future pushes (including W1/W2 commits that touch `.github/workflows/`) succeed without keychain shuffling.
- ✅ **Mac infrastructure installed (Sheri-side):** Xcode 26.5 + Build 17F42; Homebrew 5.1.15; CocoaPods 1.16.2 via brew. xcode-select pointed at the full Xcode IDE. License accepted.

### Phase 2 Work Done (June 3, 2026 · Ambient Sound System brief locked)

- ✅ **Voices + Lectio split shipped** as commit `5e25e8b2`. The single READING (Lectio) section in P&P split into two sibling sections: VOICES (Voces) with philosophy quote in Open Sans Regular at smaller clamp + sage left hairline + gold/sage eyebrow with border-bottom; LECTIO with scripture in Cormorant Garamond italic + no eyebrow border + no left rule. Section order on a music day reads Context → Music (Auditio + Verba) → Voices → Lectio → Action. Auditio moved up from its prior position after Lectio. Schema unchanged.
- ✅ **PB-01 shipped** as commit `e7368fc9` via a 4-agent workflow (parallel scout of Journey Stories pattern + PrayClient current state → implement → adversarial verify). Visio Divina dot indicators replaced with the Journey Day Stories-style thin segments at the top, sage active fill. Footer collapses to Next/Finish only. All 7 verify checks pass.
- ✅ **Ambient Sound System brief locked** at `~/Documents/KALLOS Launch/CONTUERI-CC-Ambient-Sound-Brief.html`. 19 sections, self-contained, validated by a 5-agent workflow + 1 synthesis pass (Run ID `wf_02061b58-02c`). The original June 2 ambient brief had a materially incorrect premise (Visio Divina floating button was NOT deleted, it lives at `PrayClient.tsx:339-353`); this locked version corrects the framing to "recolor + rewire" and folds in all decisions:
  - Architecture: three independent `<audio>` elements (no shared AudioContext), `AmbientSoundProvider` in `app/layout.tsx`, persistence via `lib/userData.ts` extension + new `useAmbientPreferences` hook, full context API spec.
  - Sheri product decisions (June 3): (1) intentional evolution not walk-back from June 2 P&P chrome Music removal; (2) full PrayClient migration to provider, floating-player-only on both surfaces (remove chrome label button + dropdown, remove 2 local audio elements, remove ~150 lines of music plumbing).
  - Sheri / Cowork design decisions (June 3): cross-route ambient continues uninterrupted (no fade), 300ms+300ms cross-fade between sounds, 10px minimum stroke on parchment dial (accept 2.4:1 gold contrast as interactive-control not text), discovery flag set on first render (one-time render regardless of action), iOS interruption pauses ambient and does NOT auto-resume, Journey Day included as contemplative surface for floating button.
  - Mockups confirmed: 4 floating button states (Playing / Paused / First-launch / Off-hidden), 2 dial contexts (espresso + parchment), Settings inline picker (sage selection), long-press popover (gold selection on espresso).
  - Spec additions baked in: DUCK_RATIO 0.30, 250ms rAF volume ramp, DUCK_FOR_TTS = true gate, autoplay policy non-negotiable callout, SVG arc math with `pathLength="1"` + `stroke-dashoffset` portable formula, Pointer Events with `touch-action: none`, full ARIA slider pattern with keyboard support.
  - Effort: 5 days realistic, 6 days stretch. Blocker: 6 gapless-loop MP3 audio assets (Gregorian Chant, Plainchant, Light Piano, Gentle Rain, Ocean Waves, Nature Sounds) must be sourced + licensed + encoded by Sheri before W2 build can start.
- ✅ **Launch plan updated.** `KALLOS-v1-Launch-Plan.html` now lists the Ambient Sound System as W2 Agent 2's primary deliverable; privacy/terms pages slid to W3. The brief is registered in the Companion Docs section.

### Phase 2 Work Done (June 2, 2026 evening · Launch readiness gates closed)

All pre-W1 gates for the v1.0 launch were closed in a planning conversation. Detail lives in `~/Documents/KALLOS Launch/KALLOS-v1-Launch-Plan.html` (updated June 2 with locked specs). Summary for cold-session reference:

- ✅ **D-01 (palette lock for v1.0)** LOCKED. Full current palette system, not just "verdigris" (the May 20 launch plan used "verdigris" as a placeholder before the P&P gradient system existed; verdigris is actually one of nine P&P type colors, not a global anchor). Locked tokens: global (espresso `#16110d`, parchment `#fdf6e9`, gold `#C19B5F`, sage `#4a7a62`, sage-muted `#7a9a8a`, editorial-muted `#978b7d`, warm-dark `#3d3530`), 9-color P&P type-driven palette, 6-color Explore fresco palette from Sanity `theme.color`. No further visual rethink before launch.
- ✅ **D-04 (notifications)** LOCKED with expansion to 4 types: P&P, journey day, streak, seasonal. Per-type timing (each toggle gets its own time-of-day + day-of-week selector). All four off by default. Streak fires conditionally only when user has not opened the app that day (OneSignal user-tag segmentation: app reports `last_open_date` on launch; OneSignal sends streak push only to users where `last_open_date != today`). Notification copy in contemplative register, not gamified. Build effort: ~3 days W2.
- ✅ **Q-01 (push infrastructure)** LOCKED. OneSignal.
- ✅ **Q-04 (guest mode)** LOCKED with stretch. Guest mode for v1.0 baseline. Auth (Supabase + Sign in with Apple / Google / email + cross-device sync) is a possible v1.0 stretch if W1+W2 finishes with 5+ working days banked by end of W2. Independent of the stretch decision, the W1 data layer is architected **auth-ready**: components don't read localStorage directly; they go through hooks (`useStreak()`, `useJourneyProgress()`, etc.) whose implementations can swap from localStorage to API calls without component rewrites. Half day W1 cost to architect now; saves ~3 days of rewrites later.
- ✅ **Q-06 (app icon)** LOCKED. Ship the Sheri-made Ballet (uppercase C) + Kalam (lowercase l) mark from Figma. Cream `#fdf6e9` on espresso `#16110d`, 55% canvas width, centered. Zero licensing cost (Google Fonts under Open Font License). Render pipeline at `~/Documents/KALLOS Launch/icon-source/render-preview.mjs` generates the full iOS size set from a single SVG source. Spec doc: `~/Documents/KALLOS Launch/icon-source/icon-spec.html`. Illuminated medieval C direction is a v1.1+ backlog item.
- ✅ **SET-01 (Settings page architecture, new add)** LOCKED. Gear icon top-right on Today opens Settings as a push view (does not break the 4-tab nav). v1.0 minimum contents: notification preferences (4 toggles + per-type timing UI), Privacy Policy link, Terms link, app version, "Send feedback" link (mailto: `hello@contueri.com`), "Restart onboarding" (re-shows splash). Visual: parchment background, Two-Zone Header pattern, espresso chrome/toggles. ~1 day W2 for the scaffold.
- ✅ **DEV-01 (Apple Developer enrollment type, new add)** LOCKED. Individual enrollment. $99/yr, ~30 min form, 24-48h activation, no D-U-N-S, no EIN required. App Store will display "Sheri Jennings" as developer name. Organization migration (to display "Contueri") is a backlog item: ~3.5 hours active + ~2 weeks calendar for D-U-N-S, executed only if/when the display name actively matters.
- ✅ **Launch strategy reframe.** v1.0 ships to App Store **silently** (no marketing, no contueri.com link, no social push). Apple Review wait (1-7 days) becomes parallel v1.1 build time. v1.1 (auth + cross-device sync + Supabase backend) ships ~3-4 weeks after v1.0 went live silent. **Public announcement waits for v1.1 to be live**, so first user encounter is the full-feature experience. Total timeline ~9 weeks instead of 4-5, but one cohesive launch moment instead of two awkward ones. Aligns with Mail subscription Month 2 timing.
- ✅ **Apple Developer + D-U-N-S clarified.** Apple Individual enrollment requires SSN only (no D-U-N-S, no EIN). Organization enrollment requires both EIN and D-U-N-S (1-2 weeks for D-U-N-S issuance via Dun & Bradstreet). Sheri's call: Individual for v1.0, migration deferred.
- ✅ **Architecture confirmed laptop-free.** Every piece of v1.0 production infrastructure runs in the cloud (Vercel + Sanity + OneSignal + GitHub Actions macOS runners + Fastlane Match in encrypted git + Supabase if auth ships). Sheri's laptop is involved only during local development (`npm run dev`); never required for production builds, push delivery, or any user-facing runtime.

### Phase 2 Work Done (June 2, 2026 · Today + P&P redesign, strip rollback)

- ✅ **Today + P&P redesign shipped.** Commits `a3491aee` (main redesign) and `5a0f2cba` (pinch-hint fade fix). Today landing and standalone `/prompt` share identical chrome/layout now. Live behavior:
  - **Sticky chrome.** Chrome row sits above the image in document flow (`position: sticky; top: 0`) and pins to viewport top on scroll. Image scrolls up under the chrome cleanly. Safe-area-inset-top lives on the sticky wrapper so it clears the iOS notch. The prior `position: fixed` + hero `marginTop: 48px/96px` pattern is gone, along with the dead space it created above wide images.
  - **Dynamic hero height.** Hero loses fixed `height: 62vh` + `object-contain` (which letterboxed wide frescoes). Image now uses `width: 100%; height: auto; max-height: 85vh`. Wide horizontal pieces give a short hero, tall portraits give a tall one, no letterboxing. Confirmed on device for both shapes: Justin Martyr (wide fresco) on Today, El Greco "Christ in Gethsemane (Agony in the Garden)" (tall portrait) via Library archive.
  - **Editorial title + date.** Title bumps from ~22px to 50px Cormorant Garamond italic (weight 500, line-height 1.02). Date moves to its own line above the title in sage/Montserrat caps (11.5px, weight 600, letter-spacing 0.24em). Date color cascades from `var(--pp-accent)` so each content type reads in its own accent. Title wraps flush-left; see CLAUDE_REFERENCE.md Typography for the multi-line rule.
  - **Music button + dropdown removed from P&P chrome.** Editorial simplification: per-day music lives in the Auditio field of each `dailyPrompt`; general music browsing will move to the Explore tab when Music content is built out. `MUSIC_CHANT`/`MUSIC_AMBIENT` constants, `playChant`/`playAmbient`/`stopMusic` functions, `audioRef`, `wasMusicPlayingRef`, `musicMenuOpen` state, and the background-music half of the narration pause/resume handlers all deleted. `musicPlaying` state stays but now exclusively tracks Auditio playback.
  - **Pinch hint moved onto the image.** "pinch to explore image" used to share the date's row below the image; now it sits as an overlay on the bottom-right of the hero with a soft text shadow for legibility on light artwork edges. Fades to opacity 0 over 400ms on first zoom or pan (TransformWrapper's `onZoomStart` + `onPanningStart` callbacks set `heroInteracted` state). Stays hidden for the rest of the session. Marked `aria-hidden` once faded.
- ✅ **JourneyContinueStrip rolled back from Today.** The component never landed reliably on device despite multiple stacking-context fixes through the late-May sprint. Component file remains at `components/JourneyContinueStrip.tsx` (unused) for a future fresh-eyes investigation. `app/page.tsx` now renders `<PromptClient />` exactly as standalone `/prompt`. Today collapses to pure P&P. Backlog entry logged in `~/Documents/Kallos-UX-Backlog.html` under Pending with leading suspect: `localStorage["kallos-journey-progress"]` slug keys not matching Sanity `slug.current`.

### Phase 2 Work Done (June 1, 2026 — Three Ways Research + Journey Planning)

- ✅ **Three Ways reference suite created (Cowork session).** Three documents built covering the full Three Ways framework and its intellectual lineage:
  - `Three-Ways-Reference.html` — comprehensive reference sheet with thinker timeline, bios, modern adaptations, additional themes, Trivium parallel, and sources
  - `Three-Ways-Timeline.html` — genealogy roadmap from Plato to the CCC (1992) with heresy forks, councils, myth-to-fact arc, and closing essay
  - `CONTUERI-Journey-Map-ThreeWays-OOTSP.html` — day-by-day planning maps for Journey 1 (Three Ways as arc) and Journey 2 (Out of the Silent Planet)
- ✅ **Four-journey Lewis Space Trilogy arc confirmed.** Journey 1: The Three Ways (theological map). Journey 2: Out of the Silent Planet (purgative). Journey 3: Perelandra (illuminative). Journey 4: That Hideous Strength + Abolition of Man (unitive stakes). Each journey standalone; all four form a complete arc.
- ✅ **Trivium/Three Ways parallel documented.** Grammar/Logic/Rhetoric maps structurally onto Purgative/Illuminative/Unitive. Hugh of St. Victor (1096-1141) is the only medieval figure who explicitly unified them. Gap in contemporary literature confirmed: no canonical piece connecting the two traditions currently exists.

### Phase 2 Work Done (May 29, 2026 — Contueri Polish Build + Rebrand Brief)

- ✅ **Explore Polish CC session shipped.** 9-task polish brief (`CONTUERI-CC-Polish-Brief.html`) executed. Key results:
  - iOS safe-area gap fixed: `env(safe-area-inset-top, 16px)` with 16px non-notch fallback. Correct fix is NOT `max(env(), 48px)` -- that form preserves the gap on non-notch devices.
  - Reduced-motion users default to list view on Explore; toggle still available for override.
  - Toggle placement settled: separate row below Zone 2 tagline, right-aligned. Not inside the Zone 2 header row.
  - Bubble physics tuned to meditative feel: BUBBLE_RESTITUTION 0.70 (from 0.88), WALL_RESTITUTION 0.12 (unchanged), DAMPING 0.991.
  - Explore toggle icon color: 3 distinct sage green hues (variants of `#4a7a62`). Not espresso. Not the fresco palette. Will revisit in a future session.
- ⚠️ **Library layout change -- under review.** CC removed the ALL/SAVED toggle and surfaced Saved as its own section above the archive. Sheri has not approved this change and does not like the new layout. See Manual Task 85.
- ✅ **KALLOS → CONTUERI Rebrand Brief written.** `content-docs/CONTUERI-CC-Rebrand-Brief.html` -- 10 tasks covering all user-facing text, metadata, share text, and localStorage onboarding key. Pronunciation confirmed: `kon · too · air · ee`. The `kallos-onboarded` → `contueri-onboarded` rename is intentional (re-shows splash on next visit for existing users -- splash content is changing to match new brand). See Manual Task 82. Do NOT rename: `kallos-prompt-streak`, `kallos-prompt-last`, `kallos-journey-progress`, `kallos-visio-note-*` -- renaming those wipes user streak, progress, and notes data.
- ✅ **Contueri intellectual tradition identified.** Existing themes (Light, Silence, Restless Heart, Music) are rooted in the Augustinian/Western Christian contemplative tradition, grounded in Neoplatonism (Plato → Plotinus → Augustine → medieval mystics). Best single search for more themes: "Classics of Western Spirituality Paulist Press" series -- each volume's table of contents is a ready-made theme list. 15 candidate themes + key figures table documented in `content-docs/CONTUERI-Theme-Research.html`.
- ✅ **Onboarding copy fully rewritten for Contueri brand.** All 5 screens updated in `app/splash/fallback.ts` and Sanity Studio:
  - Screen 1: wordmark CONTUERI, pronunciation `kon · too · air · ee`, tagline field holds Latin definition "Contueri: To gaze on, behold, contemplate with purpose" as intentional placeholder (see Onboarding Framework below).
  - Screen 2 P&P description (new): "Every day, a painting, a proof, a text, a life to sit with."
  - Screen 3 Journey description (new): "Or go deeper. A theme, artist, or author. One day at a time."
  - Screen 4 hook (new): "Ever had that feeling?" -- common phrase, users will recognize it immediately.
  - Screen 5: Ghost CTA button (thin gilt border, gilt text, transparent fill); secondary = "SKIP" at reduced opacity matching the Skip button top-right.
- ✅ **Splash CTA redesigned to ghost button.** Primary CTA: transparent background, `1.5px solid #B89238` border, gilt text. Gradient CTA was rejected. Secondary CTA changed from "See today's Pause and Ponder" to "SKIP" at opacity 0.4 -- both routes now sit in the same gilt thread without one dominating the other.

### Phase 2 Work Done (May 29, 2026 — Explore Bubbles + Library Polish)

- ✅ **Explore page rebuilt with physics bubble navigation.** Six theme bubbles (Light, Silence, Suffering & Beauty, Creation, Home/The Restless Heart, Beauty Truth & Goodness) replace the flat theme-card grid. requestAnimationFrame physics loop: velocity, damping, wall-bounce, repulsion. Drag vs. tap distinction. React port uses `useThemeBubbles` hook; `display: none` (not unmount) preserves physics state; rAF cancelled when hidden. Reduced-motion fallback: static circle grid. Production-readiness fixes shipped (Task #12): ARIA + keyboard nav, iOS ghost-click suppression, touchcancel handler, ResizeObserver for dynamic canvas width, `viewport-fit=cover` in `layout.tsx`, innerHTML replaced with JSX.
- ✅ **Explore detail screen: Option E design locked.** Two-zone header architecture: Zone 1 = slim 46px nav (back chevron + CONTUERI wordmark + map button), Zone 2 = editorial header (uppercase accent-colored title + italic question). Option E spec: Montserrat 600 26px letter-spacing 0.14em text-transform uppercase color=theme accent. No rule. Open Sans italic 14px `#978b7d` margin-top 20px. Hairline borders: `rgba(22,17,13,0.18)` Zone 1 / `rgba(22,17,13,0.22)` Zone 2. See `CLAUDE_REFERENCE.md` Two-Zone Header Pattern.
- ✅ **Editorial card pattern on Explore detail.** 1:1 square image, Montserrat 8px 600 uppercase type label (accent color), Cormorant Garamond 24px weight 400 title, sage attribution, Cormorant italic 13px `#3d3530` excerpt with 3-line clamp. Flush edge-to-edge. Two-pass dedupe: title (normalized) + image asset filename (catches same image under different names like "Casina Pio IV" vs "Casino of Pius IV"). Manual Task #52 (Sanity dedup) is the real fix; code safety net stays until then.
- ✅ **Variant fresco palette locked.** Six theme-specific accent colors (see `CLAUDE_REFERENCE.md`). Stored in Sanity `theme.color` field. Apply to bubble fill, Zone 2 title, and type labels. Separate from P&P gradient system.
- ✅ **Library subtitle cleaned.** Removed "26 prompts · 1 saved" count — replaced with a blank space-holding line. Prompt count is non-user-meaningful. Spacing preserved.
- ✅ **Design system corrections documented.** Parchment hex corrected from `#fdf6e8` to `#fdf6e9`. Chrome on parchment rule: espresso `#16110d` for nav/header chrome, not gray. New tokens: `--color-editorial-muted: #978b7d`, `--color-warm-dark: #3d3530`. Hairline border values established. CLAUDE_REFERENCE.md updated.
- ✅ **CC build brief created.** `content-docs/CONTUERI-CC-Explore-Library-Brief.html` — full spec for Explore + Library implementation. Includes explicit "do not ship Music bubble to production" note (no content behind it; would open blank screen).
- ✅ **Session retrospective created by CC.** `Contueri-Explore-Library-Retrospective.html` in Documents folder. Documents 10 brief errors caught during the CC session, corrected spec, and 3 open items (resolved via Cowork widget: question color `#978b7d`, excerpt color `#3d3530`, bubble sizes hand-tuned fixed values).

**Bubble sizes (hand-tuned fixed — do not calculate from Sanity or screen size):**
Light 52px, Silence 47px, Suffering & Beauty 50px, Creation 49px, Home/The Restless Heart 48px, Beauty Truth & Goodness 45px.

**Brief hierarchy rule (established May 29):** Prototype wins for visual/layout/interaction decisions. Brief wins for scope and deferred items. When prototype and brief conflict, prototype is the spec.

**Music bubble — do not ship to production.** Tapping it would open a blank detail screen. Music is a Sanity content type but has no app implementation. Music bubble is a backlog item for a future session when Music content exists.

### Phase 2 Work Done (May 28, 2026 — P&P Gradient Color System)
- ✅ **P&P Gradient Color System designed, documented, and shipped to production.** 15 commits. Each P&P screen now has a three-layer ambient gradient fixed to the viewport, color driven by `contentItem.contentType`. Full 9-type mapping finalized (see P&P Gradient Color System section in this file). Key implementation details:
  - Architecture: `lib/ppGradients.ts` (pure TS color tokens, native-portable), `components/PPGradientBackground/` (wrapper component + CSS module), `app/globals.css` (`@property --pp-accent` registered as `<color>`), `app/prompt/PromptClient.tsx` (accent cascade: section labels, music toggle, audio progress fill, actio checkbox)
  - Architectural deviation from brief: `@property` + `color-mix(in srgb, var(--pp-accent) X%, transparent)` used instead of `rgba(var(--pp-accent-rgb), X)` so gradient layers themselves interpolate on type change. Full color cascade (gradient + text + borders + fills) morphs over 0.5s. Requires Safari 16.4+ — confirmed fine for 2026 launch; pre-16.4 degrades to plain espresso background (graceful, app fully functional).
  - Reduced-motion: both keyframe animations AND color transition disabled per Apple HIG.
  - Desktop/iPad: max-width 480px centered, parchment on either side.
  - Bugs fixed: `PageTransition` transform trapped gradient — inverted nesting to fix; Safari Sanity API caching — added `cache: 'no-store'`; stale `textDecorationColor` React warning cleaned up.
  - Side UX fix: actio checkbox strike-through removed (kept dim only) — striking out a contemplative practice was tonally wrong.
  - 8 of 9 colors live in production. Photography (Warm Slate `#a49898`) wired but untestable — no Photography P&P exists yet. Cameron "English Blossoms" re-tagged to `photography` in Sanity by Sheri.
  - Deliberately NOT migrated to type accent: favorite heart, Related Journey CTA (keeps sacred gold `#C19B5F`), `.cta-inline-dark`, preview-mode banner.
- ✅ **BG-01 closed (Won't Do).** Parchment-mode gradient exploration (Plaster/Verdigris/Manuscript) formally closed. Parchment screens staying flat `#fdf6e8` is now intentional — signals browse vs. contemplative mode. UX Backlog updated.
- ✅ **CC build brief created.** `content-docs/CONTUERI-CC-PP-Gradient-Brief.html` — full implementation spec including architectural decisions, type→color mapping, mobile web requirements, what not to touch.
- ✅ **9 P&P mockup files** created in Documents folder (one per content type) — reference visuals for all gradient variants with correct READ MORE/LISTEN row and attribution styling.

### Phase 2 Work Done (May 21, 2026 — evening, UI iteration)
- ✅ UX backlog **LBL-01** closed. Renamed the P&P related-journey CTA eyebrow from "Go deeper" to "Related Journey" (commit `ace74a60`). Removes label collision with the Journey Day Step 6 "Go Deeper" tradition reflections section. UX Backlog updated.
- ✅ Encounter step full design pass (commit `322b0587`). Iterated live on Sheri's iPhone over the dev server. Final state:
  - **Context** (feature): full-bleed plum gradient panel with single light source from above + counter-glow from below; panel base fades to transparent at side edges so there's no hard rectangle; "Context" label in Cormorant Garamond italic 1.5rem; body text bumped to 16px / 1.85 line-height for editorial weight (no italics — italics reserved for short emphasis only).
  - **Look Closer** (supporting note): plain text block, no gradient. Flush-aligned with hook text. Body opacity bumped from 50% to 88%. Small Montserrat uppercase label stays as standard section header. Asymmetry with Context establishes hierarchy.
  - **Lectio**: quote borders softened to 1px at 50% opacity (was 2px solid). Plum line on philosophy quote (matches Context), gold line on scripture (matches the gold-as-scripture convention). LECTIO eyebrow neutral cream-faint.
  - **Expand/collapse**: SVG chevron replaces the `▾` character on section labels and the `↓` arrow on Read more buttons; Read more / Read less buttons removed (header chevron is now the only toggle); truncated text gets `...` ellipsis; aria-expanded + aria-label added for accessibility.
  - **Palette config**: `ENCOUNTER_PALETTES.default` is plum+gold (Sheri's pick after live A/B); the sage+gold pairing is kept as `alt` palette accessible via `?palette=alt` URL param for future comparison.
- ✅ **PB-01 decision locked**: keep the Stories-style progress bar (thin segments at top) consistent across the entire app. Visio Divina's dot indicators are out; they will be replaced with segments in a follow-up. UX Backlog item PB-01 still pending execution but the decision is documented.
- Decisions deferred from this session: **AUDIO-01** (background music on Journey steps) to its own session, has placement decisions; **Look Closer width** to a future pass (Sheri to live with the current flush-aligned look first); **Encounter step header overlap** under Sheri's consideration (proposed fix: gradient fade from solid at top of screen to transparent ~100px down, applied consistently across all 6 steps including Breathe).

### Phase 2 Work Done (May 20-21, 2026)
- ✅ Launch planning consolidated. v1.0 launch plan complete and stored in `~/Documents/KALLOS Launch/`. Eleven launch docs total (v1.0 plan is the single source of truth; original 10-week plan, timeline, assumptions docs are superseded but retained). Decisions captured: native iOS via Capacitor, push notifications top priority, user-initiated downloads (Hallow Collections/Sessions pattern) replacing service-worker offline cache, auth deferred to v1.1, Mail subscription page deferred to Month 2, Android deferred to v1.1, Capacitor live-URL approach (no static export refactor in v1.0), code on GitHub with iOS builds in the cloud via GitHub Actions + Fastlane, sole proprietor with EIN + DBA as minimum legal entity. Target compressed timeline: 4-5 weeks instead of original 10-12. Entry doc: `KALLOS-v1-Launch-Plan.html`.
- ✅ Sanity token leak closed. Both call sites (`lib/sanity.ts` and `app/api/draft/route.ts`) now read server-only `SANITY_TOKEN` instead of the client-bundled `NEXT_PUBLIC_SANITY_TOKEN`. Commits 98397fd8, 748b8836. Vercel env var sync is a Sheri manual task before deploy (Manual Task 67 below).
- ✅ Stale Presentation comment in `sanity/sanity.config.ts` refreshed (Manual Task 65 was already complete; the comment was lagging). Commit 6b1061e1.
- ✅ `metadataBase` build warning resolved in `app/layout.tsx`. OG image URLs now resolve correctly when shared, no longer defaulting to localhost. Em dashes in the metadata title and description replaced with middle-dot and colon (per the no-em-dash rule). Commit 98acc122.
- ✅ Em dash rule scope clarified. Rule applies to user-facing content and docs Claude writes; existing code comments are out of scope. Reason: users seeing em dashes will infer AI involvement, and KALLOS does not want that. Saved as `feedback_em_dash_scope.md` memory + linked in MEMORY.md. The voice rule in this doc was updated to reflect the clarified scope (see Voice Rules below).

### Phase 2 Work Done (May 14, 2026)
- ✅ Splash refactor to Sanity-driven content complete. Closes the April 24 Parking Lot item and Manual Task #5.
  - New `splashPage` schema: one document per screen, ordered `blocks[]` polymorphic array with 10 block types (`wordmark`, `pronunciation`, `goldRule`, `quote`, `heading`, `body`, `tagline`, `featureCard`, `primaryCta`, `secondaryCta`). Visual treatment (colors, fonts, spacing) is fixed per block type in the renderer — Studio controls content and order only. Brand colors stay in code per the non-negotiable design system.
  - `app/splash/page.tsx` converted to a server component that fetches via `getSplashPages()` (honors `?preview=1` for Studio Preview). Falls back to the original hardcoded 5 screens in `app/splash/fallback.ts` if Sanity returns empty so a failed query never breaks first-launch.
  - New client renderer `app/splash/SplashClient.tsx` preserves the Stories progress bar, swipe nav, fade animations, and `kallos-onboarded` localStorage gate. Auto nav button on screens without CTAs; on the last screen with no CTA, falls back to `/prompt` + mark session so users can never get trapped.
  - `scripts/seed-splash-pages.ts` rewritten for the new schema with deterministic IDs (`kallos-splash-1`..`5`), idempotent (deletes old + drafts before recreating in one transaction), `--dry-run` flag. Seeded the 5 current screens.
  - Stale `sanity/create-splash-pages.mjs` removed (referenced the dropped `pageType`/`pageNumber` fields).
  - localStorage onboarding gate left as-is by Sheri's call — flagged for the broader localStorage cleanup work (favorites, journey progress, streak, Visio notes). No auth, so the realistic alternatives are cookie or always-show-dismissible.
  - **Token rotation lesson:** an editor-role Sanity token was briefly exposed in screenshot/chat and revoked immediately. Future seed scripts: never paste tokens into chat; rotate immediately if exposed. Studio token panel: https://www.sanity.io/manage/personal/project/em44j9m8/api

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
- ✅ P&P page layout locked: Image (62vh) → Title + date below image → Curator Note → Prompt Question → Context (teaser + expand) → Lectio → Auditio → Actio. **Superseded June 2, 2026.** See June 2 Phase 2 entry for the dynamic-height hero + editorial title pass that replaced the 62vh letterboxed treatment.
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
- ✅ Splash refactor to Sanity-driven content added to Parking Lot (hardcoded copy in `app/splash/page.tsx` → `splashPage.screens[]` array). Keep layout intact. **[Resolved May 14, 2026 — see Phase 2 Work Done (May 14).]**
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
- ✅ Day 1 full content item audit added to BTG-3Day-Voice-Rewrite.html: Context rewrite, Encounter Note (Look Closer) (N/A), Lectio (Simone Weil + Psalm 27:4, both need verification), Auditio direction (Psalm 27 chant), TR1 Plato (fixed misattribution + rewrite), TR2 Augustine (verify quote + rewrite), TR3 JPII (replace quote with Letter to Artists + rewrite).
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

### Up Next: iOS App Store Launch (current focus, June 5, 2026)

**🎯 App Store submission target: June 12, 2026 (personal commitment, 7 days from June 5).** Every decision below is in service of hitting this date. If something would push past June 12, flag it and find a smaller cut rather than slipping.

**Day-by-day path to submission (7 days) — updated June 5 evening to reflect dramatic compression:**
- **Fri Jun 5 (today):** ✅ EVERYTHING from days 1–3 done in one push.
  - CI green, builds 2 + 3 uploaded ✅
  - MediaSession lockscreen metadata + iOS background audio ✅
  - Capacitor Browser plugin ✅
  - 6 ambient MP3s sourced, gapless-loop-processed, shipped ✅
  - Ambient Sound System MVP built end-to-end ✅
  - Visio Divina restructured for App Store readiness ✅
  - Visio Divina content audit dashboard built ✅
  - CORS unblocked on contueri.app (Sheri added the origin in Sanity manage) ✅
- **Remaining tasks for June 12** (in priority order):
  - Privacy + Terms legal placeholder fills (Sheri's ~5 min) — Manual Task #94
  - DNS contueri.app → Vercel finalize / verify (Sheri's ~30 min if not already complete)
  - OneSignal push wiring (~1 day, **gated on Apple Push cert**; if cert isn't ready by Wed Jun 10 it slips to v1.1)
  - Settings page polish if anything reads off after on-device review
  - Final on-device QA pass (~1 day)
  - App Store Connect listing fill (~2 hrs): screenshots, description, support URL, marketing URL — per `~/Documents/KALLOS Launch/CONTUERI-AppStore-Listing-Copy.html`
  - Submit

**Schedule risk read June 5 evening:** Effectively ~2–3 days of real work remaining, ~6 days of calendar headroom available. **Comfortable margin.** Sheri could submit as early as Tue-Wed if she wants the Apple Review buffer, otherwise Jun 12 is still the line.

**No critical-path content blocker remains.** The earlier "6 ambient files" blocker is closed; Sheri's editorial pass on Privacy/Terms placeholder fills + screenshots is the only Sheri-side critical path.

After submission: Apple Review wait 1–7 days. v1.0 ships silent (no marketing). v1.1 (auth + cross-device sync) build begins immediately and runs in parallel with the review wait.

**Priorities in order (same scope, now framed against the June 12 deadline):**

**1. (PASSIVE) Verify build 2 in TestFlight on Sheri's phone.**
- Apple processes uploaded builds for 5–30 min. Watch for "Processing complete" email or refresh App Store Connect → Apps → Contueri → TestFlight → Builds.
- Install via the TestFlight app on iPhone (Sheri is already an internal tester since she's the account holder).
- Sanity-check on device: splash gradient renders Mineral Blue (no parchment flash), status bar style swaps correctly between espresso routes (Today, /splash, /prompt) and parchment routes (Settings, Privacy, Terms, Explore), Auditio audio plays, no obvious crashes. If anything broken, file an entry under the bug list and decide before pushing.
- This is the gate before anything else ships. **Do not move to W2 if v1 doesn't render on a real device.**

**2. W1 iOS Job 2: MediaSession lockscreen metadata.** (~½ day)
- During Auditio playback, the lockscreen / Control Center / CarPlay should display the artwork title + composer/artist + album-art-style cover. Currently the audio plays but the lockscreen shows nothing meaningful.
- iOS-side: configure `MPNowPlayingInfoCenter.nowPlayingInfo` via a Capacitor plugin when the `<audio>` element fires `playing`. Reset on `pause`/`ended`.
- Web-side: `navigator.mediaSession.metadata = new MediaMetadata({title, artist, album, artwork: [{src, sizes, type}]})` covers most of this once the WKWebView is configured to surface it.
- Acceptance: lockscreen on Sheri's phone shows the painting + title + artist when an Auditio track is playing.

**3. W1 iOS Job 3: Capacitor Browser plugin for external links.** (~2 hours)
- Tap on any external URL inside the WebView should open in `SFSafariViewController` (in-app browser) instead of jumping out to Safari proper.
- Required for App Store Review Guideline 4.5.4 ("in-app browsing experience").
- Install `@capacitor/browser`, intercept link clicks via a global handler, call `Browser.open({url})`.
- Acceptance: external links in Tradition Reflection sources, Visio Divina related links, etc. open in-app with a Done button.

**4. (NO-CODE BLOCKERS — do anytime, can run in parallel)**
- **Privacy + Terms legal placeholder fills** (Manual Task #94). ~5 min. Open `app/privacy/page.tsx` and `app/terms/page.tsx`; replace `[LEGAL ENTITY NAME]` with "Sheri Jennings", `[STATE]` with Sheri's state of residence, `[LAUNCH DATE]` with the actual launch date when known. App Store will not accept submission without working URLs.
- **6 ambient sound MP3s sourced + licensed + gapless-loop encoded** (Manual Task #95). Hard blocker for the W2 Ambient Sound System build. Paths required: `/public/music/ambient-{gregorian-chant,plainchant,light-piano,gentle-rain,ocean-waves,nature-sounds}.mp3`. Source per CLAUDE.md Auditio rules (Pixabay / Musopen / archive.org / gregorian-chant-hymns.com). Convert MP4→MP3 with ffmpeg if needed.
- **DNS: contueri.app → Vercel.** (Manual Task #96). ~30 min including propagation. Vercel Project Settings → Domains → add contueri.app; add A record (or CNAME for www) in Namecheap DNS per Vercel's instructions. Lets the Capacitor live-URL approach (which currently loads contueri.app per `capacitor.config.ts server.url`) work on a real domain instead of relying on the Vercel default.

**5. Once 1–3 are done: W2 begins.**
- Ambient Sound System (per `~/Documents/KALLOS Launch/CONTUERI-CC-Ambient-Sound-Brief.html`). Blocked by #4 ambient sound assets.
- OneSignal push wiring once Apple Push cert generates.
- Settings page polish.
- See `~/Documents/KALLOS Launch/KALLOS-v1-Launch-Plan.html` for full W2 scope.

**6. v1.0 App Store submission.** App Store Connect → Apps → Contueri-ios → Add for Review. Apple Review wait 1–7 days. v1.0 ships silent (no marketing) per the launch strategy reframe. Public announcement waits for v1.1 (auth + cross-device sync) ~3–4 weeks later.

---

### Content Backlog (defer until post-launch)

These are content/editorial tasks that predate the launch focus. They will resume after v1.0 ships:

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
- **Seed Day 1 Sacred Heart content item** (Manual Task #97). Rafael Salas, *Sacred Heart of Jesus*, 1874. Download image from sdcason.com/the-sacred-heart-of-jesus-1874-by-rafael-salas-public-domain-catholic-painting/. Fill Traditional Prayer (Pray step) field with Sacred Heart Novena prayer (text in `CONTUERI-PP-30Day-Content-Plan-v3.html` Day 1). All other fields per seeding template.
- **Seed Day 1 Pause & Ponder** (Manual Task #98). Reference the Sacred Heart content item. All fields in `CONTUERI-PP-30Day-Content-Plan-v3.html` Day 1.
- **Create Tradition Reflection document for Day 1 Go Deeper** (Manual Task #99). Content: Annum Sacrum (Leo XIII, 1899) or Haurietis Aquas (Pius XII, 1956) — use Author Type: **Pope**. Schema confirmed to accept papal documents (JPII and Benedict XVI entries already exist). Link to Sacred Heart content item after creating.
- **Check Day 28 flag before seeding** (Manual Task #100). Dom Perignon quote ("Come quickly, I am tasting the stars") noted as almost certainly apocryphal 19th-century advertising copy. The content plan includes both the flag and a verified alternative. Choose before seeding.
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

**Current 5-screen structure (locked May 29, 2026):**
1. Brand identity — CONTUERI wordmark, pronunciation `kon · too · air · ee`, Dostoevsky quote "Beauty will save the world.", tagline field: "Contueri: To gaze on, behold, contemplate with purpose" (Latin definition placeholder -- see Tagline Field note above). Not the hook -- grounding first.
2. The Three — Beauty. Truth. Goodness. Introduces the transcendentals. Body: "Ancient philosophers called them the transcendentals... Follow any one far enough, you might find something unexpected." Tagline: "CONTUERI is built on that."
3. Feature tour -- two cards: "Pause and Ponder" card: "Every day, a painting, a proof, a text, a life to sit with." Journeys card: "Or go deeper. A theme, artist, or author. One day at a time."
4. Hook -- "Ever had that feeling?" (common phrase, users will know immediately). Body describes the experience: the painting you can't look away from, music that opens something, a line from a book carried for years. Closes: "CONTUERI is built for exactly that."
5. CTA -- "Start here →" routes to BTG journey. Secondary: "SKIP" at reduced opacity (matches Skip button top-right). Ghost button style: transparent fill, gilt border + text.

**Note:** Screen order above is indicative. The hook (4) is the only locked position — always the culmination before the CTA. Screens 2 and 3 can be reordered. If the hook copy is strong enough to carry purpose + emotion in one screen, Screens 2 and 4 could merge — but keep them separate until copy is confirmed.

**Primary CTA (non-negotiable):** Start the 3-day Beauty, Truth & Goodness journey directly. Label TBD. Frame: "3 days or 30 minutes — you decide." Do NOT route to P&P as primary.

**Day-gating:** Not implemented and will not be added for testing. All journey days are accessible in one sitting. A user can complete all 3 days of the intro journey immediately after onboarding. No code changes needed for this behavior.

**Secondary option:** Skip to Today (P&P) or Browse Journeys — always available.

**Onboarding gate — show once per install, skip in iframes:**
- `localStorage` flag `contueri-onboarded` (renamed from `kallos-onboarded` via CC Rebrand Brief) — set on skip or CTA tap, checked on Today page load. Once set, splash never shows again for that install/browser. The rename intentionally re-shows the splash for existing users -- splash content has changed for the rebrand.
- Iframe guard: if `window.self !== window.top` (Sanity Presentation preview context), the gate is bypassed entirely and the Today page renders directly. Prevents Presentation iframes being hijacked to `/splash` on cold load.
- Changed April 24, 2026 from `sessionStorage` (every session) to `localStorage` (once per install). Earlier beta-only "show every session" rule retired -- it was hijacking preview iframes and wasn't serving real beta testers (who rarely closed the tab).
- Reverting to every-session behavior would require: swap `localStorage` → `sessionStorage` in `app/page.tsx` gate + `app/splash/page.tsx` `markSession`. Not recommended.

**Skip behavior:**
- Skip button visible at all times on all screens.
- Skip routes to Today page (P&P / current daily prompt).
- On return: splash does NOT show again (localStorage persists). To force-re-view, clear site data in DevTools or delete the `contueri-onboarded` key in localStorage (renamed from `kallos-onboarded` via CC Rebrand Brief Task 1 + 3).

**localStorage keys -- critical, never rename these four:**
- `kallos-prompt-streak` -- user streak count; renaming wipes it
- `kallos-prompt-last` -- last visit date; renaming resets streak
- `kallos-journey-progress` -- journey completion state; renaming wipes progress
- `kallos-visio-note-*` -- user-written Visio Divina notes; renaming loses content
These four keep the `kallos-` prefix permanently. They can be migrated in a future dedicated session with a key-migration utility. Do not rename them as part of the rebrand.

**Tagline field on Screen 1 -- why it holds a definition, not a tagline:**
The `tagline` block type on Screen 1 currently holds the Latin definition: "To gaze on, behold, contemplate with purpose." (June 3, 2026 trim — was previously prefixed "Contueri:" but the wordmark + pronunciation above already name the word twice, so the prefix read anxious.) This is an intentional placeholder. The app has no official brand tagline yet. "Beauty will save the world." (Dostoevsky) is used as a quote on Screen 1 but has not been designated as the official tagline. Do NOT remove the tagline block or treat it as an error -- it is holding a meaningful field that will be updated once the tagline decision is made. See Open Decisions #6. **The screen 1 tagline renders in verdigris green** (`#5F7A6B`) per `SplashClient.tsx`, not gold — the gold thread is reserved for screen 5's CTA so it stays the "this is what you do next" signal across the whole onboarding flow.

**Tagline placeholder blocks on Screens 2 + 4:**
Screens 2 ("The Three") and 4 ("Hook") each have a tagline block in place with empty text. The renderer skips empty taglines so no closer renders on either screen and no visual gap appears. The blocks exist as **structural placeholders** so future closer copy can be added via Studio without re-creating the block — open the empty Tagline block on the screen's splashPage document, type, publish, renders verdigris automatically. The original rebrand closers ("CONTUERI is built on that." and "CONTUERI is built for exactly that.") were removed June 3 — voice-rule register issue, explaining instead of showing. When replacement copy is drafted, the standard is: land what the user just read, not summarize it. (Memory note: the tagline → body inconsistency on screen 4 was a May 29 rebrand artifact, migrated body → tagline in Sanity via `scripts/migrate-splash-screen-4-closer-to-tagline.ts`.) See Phase 2 Work Done (June 3 night / June 4 early hours) for full context.

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
  - **Parchment mode** (browse): `#fdf6e9` — Today, Explore, Journeys, Library
- **Gold accent:** `#C19B5F` — CTAs, active states, labels. NOT `#C9A227`.
- **Sage:** `#4a7a62` — active step indicator, interactive elements
- **Explore toggle icon color:** 3 distinct sage green hues (variants of `#4a7a62`). Not espresso (`#16110d`). Not the fresco/bubble palette. This is "good enough for now" -- will be revisited in a future design pass.
- **Typography:** Montserrat (labels/UI), Open Sans regular (body), Open Sans italic (contemplative instructional text), Cormorant Garamond (quoted material only — 1.3rem minimum, line height 1.4). Below 1.3rem, use Open Sans italic instead. Cormorant is a display typeface; it breaks down at small sizes on screen.
- **Images:** Min 1200px, up to 4500px. 8x zoom on Breathe page and P&P hero (react-zoom-pan-pinch).
- **Safe areas:** Always pad for phone notches and home indicators.
- **DEPRECATED:** `#203545` (old dark teal) — do NOT use anywhere. Espresso `#16110d` replaced it.

Full details: `CLAUDE_REFERENCE.md`

---

## P&P Gradient Color System

### What it is
Each Pause & Ponder screen has an ambient gradient background that reflects the **content type** of that day's prompt — not the theme. A Sacred Art P&P breathes mineral blue; a Thinker P&P glows with illuminated gold; a Landscape P&P settles into sage stone. The color is a fresco pigment analog: muted, low-opacity, classical.

The gradient is three layered radial ellipses on a fixed (viewport-anchored) container so it stays put while the content scrolls over it. All interactive/label elements (READ MORE, LISTEN, section labels, scripture attribution, checkbox border, active tab) use the same accent color as the gradient. One type = one color, used consistently throughout the screen.

### Why it exists
P&P is already the most contemplative screen in the app. The gradient deepens that without adding visual complexity — it works subliminally. It also gives each content type a distinct "atmosphere" that users will feel even if they can't articulate why, similar to how Spotify bleeds album art color into the player UI.

### Type → Color mapping (May 2026)
| Content Type | Color Name | Hex |
|---|---|---|
| Sacred Art | Mineral Blue | `#7ba2b8` |
| Music | Fresco Plum | `#9a8a9e` |
| Literature | Old Ochre | `#c9a07c` |
| Landscape | Sage Stone | `#a8ae9a` |
| Food & Wine | Clay Terra | `#c68a77` |
| Pattern & Proof | Verdigris | `#84a9a2` |
| Thinker | Illuminated Gold | `#E4C371` |
| Watch/Listen | Pompeian Crimson | `#b8869a` |
| Suffering / Depth | Roman Wine | `#8b4557` |

Photography → Warm Slate `#a49898` (rgb: 164,152,152). Muted warm grey-taupe — sits in its own territory, not cool/blue, not green, not terracotta. Chosen May 27, 2026.

### When to use
P&P screen only (`/prompt`). This is the **only** screen in the app with this treatment.

### When NOT to use
- **Explore** — light parchment background (`#fdf6e8`). These colors are designed for espresso dark and will not translate.
- **Journeys** — Journey steps have their own immersive treatment (plum gradient panels etc). The P&P gradient is a separate system.
- **Library / Today / ArtworkViewer** — neutral screens. Adding gradient here dilutes what makes P&P feel special.
- **Theme cards on Explore** — themes (Home, Light, Silence, Suffering, Creation) have their own `color` field in the Sanity `theme` schema. That is a completely separate color system. Do not substitute P&P type colors there.

### ⚠️ What to watch for
1. **Illuminated Gold (`#E4C371`) is the most at-risk color.** Yellow/gold reads more luminous on dark backgrounds than the cooler colors. If opacity is ever increased, gold tips first. Test on device before pushing higher opacity.
2. **Animation on OLED at night.** The 22–28 second opacity breathing cycles are designed to be felt, not seen. On a phone OLED in a dark room even slow movement can feel unsettled on a reading screen. Never shorten the cycle times or increase travel distance without testing on device.
3. **Keep the gradient contained to P&P.** Its power comes from contrast with the rest of the app. If it appears on other screens, it stops being special.
4. **Color transitions between P&P types.** If a user navigates directly from one P&P to another (e.g. via Library archive), the background color will shift. No animation is needed for this — it's a context change, not a continuous experience.

### Technical implementation
- `.gradient-bg { position: fixed; }` — gradient stays in viewport while content scrolls
- Three layers: `.g-sweep` (upper-left, 22s), `.g-band` (diagonal rotated ellipse, 18s), `.g-pool` (lower-right, 28s)
- Animation: `transform: translate()` + `opacity` together (GPU-accelerated, no jumping). Never animate `background` position directly — causes visible jump.
- Travel distances: 70–80px for sweep/pool, 60px for band. Opacity range: 1.0 → 0.55.
- Accent color = gradient hex, applied to: `.section-label`, `.scripture-ref`, `.read-more-btn`, `.listen-btn`, `.check` border, `.tab.active`

### Mockup files (in Documents folder)
`contueri-pp-mockup.html` (Mineral Blue), `contueri-pp-plum.html`, `contueri-pp-ochre.html`, `contueri-pp-sage.html`, `contueri-pp-terra.html`, `contueri-pp-verdigris.html`, `contueri-pp-crimson.html`, `contueri-pp-gold.html`

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
| `dailyPrompt` | ✅ New — "Pause & Ponder" daily feature on Today tab. Auditio object includes `verbaOriginal` (lyrics/VERBA panel) plus `composerArtist`, `workTitle`, `genre` (April 24, 2026 — content-repeat intelligence). June 7, 2026: added optional `dayTitle` (string, max 80) for a poetic editorial title per day (e.g. "God Does Not Die"); rendered above the artwork on `/prompt`; falls back to the linked `contentItem.title` when blank. |
| `ppDefaults` | ✅ New June 7, 2026 (PP-DEFAULTS-01). Singleton, one document per dataset. Holds `defaultActio` (required, max 280) — the global default Actio shown on any P&P day where `dailyPrompt.actio` is blank. Mirrors `visioDefaults`. Seeded by `scripts/seed-pp-defaults.ts` with Sheri's text. Edit in Studio after seed; the cascade in `PromptClient.tsx` reads it via `getPpDefaults()`. |
| `journeyDay` | ✅ Standalone document (April 24, 2026 — R5 migration complete). 25 docs live. Each has a required `journey` back-reference. Fields: dayNumber, dayTitle, openImage, openText(+audio), encounterContent (ref → contentItem), encounterGuidance, encounterNote(+audio), auditio (composerArtist/workTitle/genre), lectio, reflectionQuestions (+audio, new April 24 Dashboard Enhancement), connectThread, goDeeper. |
| `splashPage` | ✅ Updated June 3, 2026 (night) — `tagline.text` now optional (`Rule.required()` removed). Enables the placeholder pattern: editors can clear text in Studio without re-creating the block, and the SplashClient renderer skips empty taglines so no visual gap appears. Tagline blocks render in verdigris `#5F7A6B`. Block types unchanged: `wordmark`, `pronunciation`, `goldRule`, `quote`, `heading`, `body`, `tagline`, `featureCard`, `primaryCta`, `secondaryCta`. |
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
- **Completion states (no strike-through rule):** When a user marks something complete (actio checkbox, journey day, etc.), dim the text to a faded color as the "done" cue. Do NOT strike through. Strikethrough reads productivity-app; dim alone says "honored." Established May 28, 2026 during P&P gradient QA — applied to actio checkbox items, applies anywhere completion states surface.

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
- **P&P page**: No Begin state. Sticky chrome (back / heart / share; no Music button as of June 2, 2026) sits above a dynamic-height hero (image determines container height, capped at 85vh). Pinch hint sits as an overlay on the image bottom-right and fades on first zoom/pan. Below the image: date on its own line in sage caps (color cascades from `--pp-accent`), then title in 50px Cormorant Garamond italic, then Curator Note → Prompt Question → Context teaser → Lectio → Auditio → Actio. Typography: Cormorant for prompt question, lectio quotes, and the editorial title (1.3rem minimum for quotes; ~3.125rem for title). Open Sans italic for auditio title. Open Sans regular for everything else.
- **Music player**: Chant / Ambient options on Visio Divina / Pray page. Removed from P&P chrome June 2, 2026 (per-day music lives in Auditio; general browsing will move to Explore when Music content ships).
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
- **No em dashes in anything users might see.** Em dashes are a tell that AI wrote something, and users seeing them will infer AI involvement. KALLOS specifically does not want that. The rule exists to protect the user-facing perception of the product, not as a style preference. Applies to: all KALLOS content, marketing pages, App Store copy, notification text, and any HTML/markdown docs Claude writes or updates during a session (CLAUDE.md, skills tracker, session summaries, entry guides, launch docs, everything). Does NOT apply to existing code comments, which are read only by developers and never by users (clarified May 21, 2026). When Claude writes new comments or strings in code it is touching, follow the rule. Use a comma, a period, a colon, or a short hyphen instead. Before ending any session, Claude must grep new content (not code comments) for em dashes and fix them.
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
Go Deeper tradition reflections must add genuinely new content not already present in the Encounter Note (Look Closer). If the Go Deeper summary covers the same argument as the Encounter Note (Look Closer) in different words, it fails. The test: could this TR appear in any journey day, or is it specific to this one?

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
**Never say "non-Catholic" as a user category.** Sheri IS Catholic. Users may or may not be. The audience is always "the curious seeker" or "all Christians and Christian curious." This applies to all docs, code comments, and content.

**Target market:** All Christians and Christian curious seeking something deeper. Catholics are primary. The product leads with beauty and art as the trad principle of invitation. Do not write as if the audience is Catholic-only, and do not write as if it is generic. These two things are not in tension.

**Never frame Contueri as "not a Catholic app."** That framing is unnecessary and inaccurate. The tradition Contueri recovers is rooted in the Church — do not apologize for that or distance from it. The content points toward beauty, truth, and goodness. Beauty, truth, and goodness point toward God. Contueri does not make that argument explicitly — it makes the encounter possible. The tradition belongs to everyone.

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

## Parking Lot — see UX Backlog

**Active deferred UX/design/bug items now live in `~/Documents/Kallos-UX-Backlog.html`** as the single source of truth. CLAUDE.md no longer duplicates that list. When you log a new UX issue, add it to the UX Backlog with an ID, severity badge, file location, and date entered. When Claude Code resolves an item, move it to the Done section of the UX Backlog with a resolved date.

CLAUDE.md retains: phase work history, settled architectural decisions, editorial principles, design system reference, and the Manual Tasks list (Sheri's Sanity content entry tasks, which are different scope from UX issues).

### Resolved decisions (kept for historical context)

These items are no longer pending but are kept here because they explain WHY current app state exists. New work that touches these areas should respect the resolution rather than re-litigate.

#### ~~Journey Day Steps — Progress Indicator~~ ✅ RESOLVED
Replaced with Stories-style thin progress bar at top + swipe navigation. No footer, no Continue button.

#### ~~Breath Interaction~~ ✅ RESOLVED
Built as dedicated Breathe page (Step 3). Full-bleed image with 8x zoom, pulsing dot animation (CSS keyframe, `scale(1)→scale(4)`, 8s infinite loop), helper text "Sit with this image and let your eyes explore." Cormorant Garamond italic.

#### ~~Explore Page redesign~~ ✅ RESOLVED (March 30, 2026)
Replaced dual filter rows (content type + theme) with a theme-cards landing page. Five theme cards are the entry point. Tapping a card filters the full content feed to that theme. Empty themes sort to the bottom, grayed out at 35% opacity with grayscale, non-tappable. No dead-end "Coming soon" screen. Map toggle preserved. Design principle settled: "Explore surfaces content items, not features or sub-fields. The richness is discovered, not advertised." Each tab does one thing: Today = P&P, Journeys = journeys, Explore = browse by theme, Library = saved.

---

## Manual Tasks for Sheri

These can't be done in code — Sheri does them in dashboards:
1. ~~Rename GitHub repo: `s-beauty-app` → `kallos-app`~~ ✅ Done
2. ~~Rename Vercel project → `kallos-app`~~ ✅ Done
3. Rename Sanity Studio URL → `kallos.sanity.studio`
4. ~~Rename local folder in Finder → `kallos-app`~~ ✅ Done
5. ~~Update splash page content in Sanity Studio with KALLOS copy~~ ✅ Done May 14, 2026. Splash schema migrated to block-based and seeded with the current 5 screens. Edit in Studio under "Splash Screen".
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
19. **Custom domain:** Replace `s-beauty-app.vercel.app` with `contueri.app` or `contueri.com` before wider launch. Domains registered on Namecheap (May 2026). Do this as part of the full rebrand CC task (Manual Task 70).
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
67. **Vercel: set `SANITY_TOKEN` env var in Production** before deploying recent commits (98397fd8, 748b8836, 6b1061e1, 98acc122). Without this, Studio Presentation drafts silently fall back to published content. 30-second fix in Vercel project settings. **Blocks the next deploy.**
68. **Launch plan source of truth** lives at `~/Documents/KALLOS Launch/KALLOS-v1-Launch-Plan.html`. Single doc covering scope, timeline (4-5 weeks compressed), assumptions, deferred features with reasons + days-to-build, costs ($218/year baseline), code hosting + cloud build infrastructure, and legal entity minimum (sole prop + EIN + DBA, no LLC needed at this stage). Reference this before any iOS launch decisions.
69. ~~**Confirm 5 launch decisions before W1 build start:**~~ ✅ **DONE June 2, 2026 evening.** All five locked + two new decisions added (SET-01 Settings architecture, DEV-01 Apple Dev enrollment type). Locked specs in KALLOS-v1-Launch-Plan.html "Decisions Sheri locked" section. Summary in CLAUDE.md Phase 2 Work Done (June 2 evening) above.

### New app surface

- **`/dashboard`** — content operations dashboard. Server-rendered, revalidated every 60s, gated by `DASHBOARD_ENABLED` env var, no-indexed. 7 sections: Journey Completion, Content Library, Tradition Reflections, Audio Status, Schema Health (static), TTS Coverage, Companion Journey placeholders. See `app/dashboard/page.tsx` + 5 new named query functions in `lib/sanity.ts` (search for "Dashboard queries"). Schema Health section is hand-maintained — update the `SCHEMA_HEALTH` const in the page file after every audit. Has a discovery affordance above Section 3 that deep-links into `/dashboard/visio-audit` (see below).

- **`/dashboard/visio-audit`** — Visio Divina content audit (June 5, 2026). Same DASHBOARD_ENABLED gate, same noindex, same 60s revalidate as the main dashboard. Lists every contentItem eligible for the Visio Divina flow (sacred-art + landscape) with the artwork image, full Traditional Prayer text, traditionalPrayerSource, and every linked Tradition Reflection expanded inline (title, shortQuote, summary, source, authorType, era). Sheri's spec: "the content should show, not just a yes, no or 3 (ex 3 reflections)" — editorial decisions on what's launch-ready happen on this surface without round-tripping to Studio. PRESENT / MISSING badges flag absent fields at a glance. Roll-up counters at top (total items, with prayer, with reflections, total reflections). Per-card "Open Visio Divina →" link straight to `/pray/[id]` for end-to-end verification. New GROQ helper `getDashboardVisioAuditItems()` in `lib/sanity.ts`. See `app/dashboard/visio-audit/page.tsx`.

---

## Open Decisions (as of May 2026)

These are not yet made. Do not assume or resolve them without a session with Sheri.

1. **Mail subscription identity** — Does the snail mail subscription share the Contueri name, or does it get its own brand identity under the Contueri umbrella? (e.g., "Contueri Letters" vs. a separate name entirely)
2. **Color palette** — Does the existing Contueri/KALLOS palette (espresso #16110d, gold #C19B5F, parchment #fdf6e8, sage #4a7a62) carry over as-is, or is a fresh start warranted with the rebrand?
3. **One-line descriptor** — What is the single sentence that describes Contueri for someone who has never heard of it? Governs App Store copy, social bio, pitch deck cover. Not yet written.
4. **App vs. mail content split** — Does the mail subscription deliver unique content not in the app, or is it a physical companion to the app experience? Governs the editorial calendar and content creation workload.
5. **Protestant sensitivity** — Two options: (a) be transparent about Catholic roots and trust that intellectual honesty draws broad-minded Protestants, or (b) lead so firmly with "beauty and tradition" that Protestant visitors self-select in without friction. Recommendation is (a) -- transparency is a feature, not a risk. Not yet locked.
6. **Official Contueri tagline** -- No official tagline exists yet. The splash Screen 1 tagline field currently holds the Latin definition as a placeholder. "Beauty will save the world." (Dostoevsky) appears as a quote on Screen 1 but is not the designated tagline. Once a tagline is decided, update Screen 1 in Sanity Studio and retire the placeholder.

---

### Manual tasks added May 29, 2026 (Polish Build + Rebrand)

82. **CC task — Execute CONTUERI-CC-Rebrand-Brief.html.** Brief is written and ready. 10 tasks, full KALLOS → CONTUERI codebase rebrand. Run this as a dedicated CC session before the next deploy to production. After CC completes: rename GitHub repo and Vercel project manually. Reminder: do NOT rename `kallos-prompt-streak`, `kallos-prompt-last`, `kallos-journey-progress`, or `kallos-visio-note-*` localStorage keys -- brief already excludes them.

83. **CC task -- Fix Explore toggle icon color.** The list/bubble toggle icons should use 3 distinct sage green hues (variants of `#4a7a62`). The dark espresso color tried in the Polish Build session did not read well on device. Implement the 3-hue sage approach and verify on device before closing.

84. **CC task -- Fix Explore list view card borders.** Each content item row in the list view is missing a thin card border. Add the card border to each list row to match the design. Polish Build CC session shipped rows without it.

85. **Review Library layout -- CC changed without approval.** The Polish Build CC session removed the ALL/SAVED toggle and surfaced Saved as its own section above the archive. Sheri has not approved this layout change. Evaluate on device and decide: keep the new layout, modify it, or revert to the original ALL/SAVED toggle. Do not leave this as-is without an explicit decision.

### Manual tasks added May 29, 2026 (Explore + Library corrections)

79. **CC task — Explore detail question text color.** Update question text color to `#978b7d` (`--color-editorial-muted`) on the detail Zone 2 header. The CC session shipped with a slightly different value. A new short CC task to correct this and verify on device.

80. **CC task — Add `--color-warm-dark` token.** Add `--color-warm-dark: #3d3530` to `app/globals.css` CSS token block. Used for Cormorant italic excerpt text on editorial cards. Confirm it's applied in the Explore detail card component.

81. **CC task — Confirm bubble sizes are hand-tuned fixed values.** Verify that bubble sizes in the shipped code match the locked spec: Light 52px, Silence 47px, Suffering & Beauty 50px, Creation 49px, Home/The Restless Heart 48px, Beauty Truth & Goodness 45px. If they were overridden during the CC session, revert to these values.

### Manual tasks added May 2026 (Contueri rebrand and snail mail)

70. **CC task — Contueri rebrand:** Full brief is now written: `content-docs/CONTUERI-CC-Rebrand-Brief.html`. 10 tasks: Today page display name, splash fallback content, splash localStorage key + CSS rename, share sheet text, journey share text, OpenGraph wordmark, root layout metadata, prompt page metadata, journey page metadata, dashboard metadata. Pronunciation: `kon · too · air · ee`. GitHub repo rename and Vercel project rename are separate manual steps (not in the CC brief). See Manual Task 82 to schedule the CC session. **Do NOT run until you are ready for existing users to see the splash again on next visit** (the `kallos-onboarded` → `contueri-onboarded` key rename is intentional and documented).

71. **Claim @contueri on Pinterest** — Manual. Sheri does this directly on Pinterest.com.

72. **Claim Contueri page on Facebook** — Manual. Sheri does this directly on Facebook.

73. **URGENT: Write down account credentials** — Write down which email address was used to create each social account (X, Instagram, TikTok, YouTube Brand Account, Etsy). Do this before the memory fades. Store in a secure password manager or notes doc.

74. **Set up hello@contueri.com** — Google Workspace account, ~$6/month. Once live, update all social accounts to use this email as the primary account email.

75. **File Contueri trademark** — When revenue is established. Use an attorney. Budget ~$750-1000 across relevant classes: software (Class 42), subscription services (Class 41), publishing (Class 16). Prior use rights began at first commercial use — document that date when it happens. Trademark filing date does not need to match launch date.

76. **Companion journey description issue (pre-existing, flagged for next content session)** — Series title "Seeking Beauty" is not in the journey title; "Liv Lev" named without David Henrie (host). Clarify location of this content in Sanity before the next companion journey session.

77. **CC task (post-launch) — Migrate nav tab active indicator to `var(--pp-accent)` on `/prompt` route.** The global `components/ui/Navigation.tsx` uses a hardcoded color for the active tab. When on `/prompt`, the Today tab active indicator should pick up the type accent color for full system coherence. Intentionally deferred from the gradient build — address after gradient is confirmed in production.

78. **Photography gradient untestable until a Photography P&P is created.** Cameron "English Blossoms" is re-tagged `photography` in Sanity (done May 28) but has never been used in a P&P — only in the BTG journey. Warm Slate (`#a49898`) is wired and ready; it just needs a Photography daily prompt to render against. Create one when the editorial pipeline reaches Photography.

### Manual tasks added June 2026 (Three Ways reference suite + journey planning)

86. **Review Three-Ways-Reference.html** — Read through the full reference sheet. Check accuracy of thinker bios (Origen, Pseudo-Dionysius, John of the Cross), modern adaptations, additional themes, and the Trivium comparison table. Note anything to correct or expand before using as a session reference doc.

87. **Review Three-Ways-Timeline.html** — Read through the full genealogy roadmap. Verify the heresy fork descriptions and condemnation dates. Check the myth-to-fact sidebar arc and the closing essay. Flag anything that needs a source check.

88. **Review CONTUERI-Journey-Map-ThreeWays-OOTSP.html** — Review both journey maps (The Way Within + Out of the Silent Planet) day by day. Confirm content type selections, lectio passages, and look-closer details are right for Contueri's voice and audience. Note any days that need a different content item or thinker pairing before moving to Sanity entry planning.

89. **Decide: proceed with Perelandra and That Hideous Strength journey maps?** — If yes, schedule a Cowork session to map Journeys 3 and 4. Journey 3 (Perelandra) is illuminative; Journey 4 (THS) is unitive and integrates Abolition of Man Days 5-6. Confirm whether Abolition of Man warrants its own standalone journey or folds entirely into THS.

90. **Consider: does Abolition of Man warrant a standalone journey?** — The book is 90 pages and integrates directly into THS, but it could also stand alone as a 5-7 day journey ("What Are We Made For?") aimed at classical educators and former evangelicals. Decision affects how the Lewis arc is marketed and sequenced in the app.

### Manual tasks added June 3, 2026 evening (W1 in flight, Apple Dev pending)

91. ~~**Apple Developer activation watch.**~~ ✅ DONE June 4, 2026. Apple Dev Individual enrollment active. Team ID, App Store Connect API key (Key ID `SJAYUGD994`), and `.p8` file content all in place.

92. ~~**GitHub Actions secrets setup.**~~ ✅ DONE June 4, 2026. All 9 secrets configured in `s-beauty-app` repo (APPLE_ID, APPLE_TEAM_ID, APP_STORE_CONNECT_API_KEY_ID, APP_STORE_CONNECT_API_KEY_ISSUER_ID, APP_STORE_CONNECT_API_KEY_CONTENT, MATCH_PASSWORD, MATCH_GIT_URL, MATCH_GIT_BASIC_AUTHORIZATION, MATCH_FORCE_LEGACY_ENCRYPTION). Encrypted certs repo `srjennings-luna/contueri-certs` created. Match auth uses fine-grained PAT scoped to that repo (Contents Read+write).

93. ~~**One-time `fastlane match_init` locally.**~~ ✅ DONE June 4, 2026. Distribution cert + AppStore provisioning profile (`match AppStore app.contueri.ios`) generated and pushed to encrypted `contueri-certs` repo. Every CI build pulls them read-only via `match(readonly: true)`.

94. **Privacy + Terms placeholder fills** in `app/privacy/page.tsx` and `app/terms/page.tsx`. Per `~/Documents/KALLOS Launch/CONTUERI-Legal-Placeholders-Reference.html`. Five placeholders total. Recommended values: "Sheri Jennings" for legal entity (Individual enrollment path); state of residence for jurisdiction; launch date filled at App Store submission. ~5 minutes once values are known. Per Sheri's standing rule, review with qualified counsel before publishing.

95. **6 ambient sound audio assets sourced, licensed, gapless-loop encoded as MP3.** Per `~/Documents/KALLOS Launch/CONTUERI-CC-Ambient-Sound-Brief.html` section 5. File paths required: `/public/music/ambient-gregorian-chant.mp3`, `-plainchant.mp3`, `-light-piano.mp3`, `-gentle-rain.mp3`, `-ocean-waves.mp3`, `-nature-sounds.mp3`. License sources per CLAUDE.md Auditio rules. **Hard blocker for W2 Agent 2 Ambient Sound System build.**

96. **DNS contueri.app → Vercel.** Before W3 ideally (testing the live URL on device). Vercel Project Settings → Domains → add contueri.app. Namecheap DNS for contueri.app needs an A record (or CNAME for www) per Vercel's instructions. ~30 minutes including propagation.

97. ~~**iOS scaffold next steps when Apple Dev activates.**~~ ✅ DONE June 4-5, 2026. Local Xcode + Simulator signing confirmed, CI build + TestFlight upload confirmed green on run #26996339629 (June 5, 05:02 UTC). Every push to `main` now triggers an automatic TestFlight build via `.github/workflows/ios-build.yml`.

98. **Verify Vercel deploy of recent commits.** Open `s-beauty-app.vercel.app` and confirm `/privacy`, `/terms`, `/settings`, `/settings/notifications` all render. Gear icon top-left on Today routes to Settings. Settings rows route to Privacy + Terms.

99. **Verify build 2 on TestFlight on Sheri's phone.** After Apple finishes processing the upload from CI run #26996339629 (5–30 min from 05:02 UTC June 5), open the TestFlight app on Sheri's phone, install Contueri build 2, and sanity-check on a real device: splash gradient renders Mineral Blue (no parchment flash), StatusBar style swaps correctly between espresso routes (Today /, /splash, /prompt, journey day) and parchment routes (Settings, Privacy, Terms, Explore, Library, Journeys list), Auditio audio plays, no crashes. **This is the gate before W1 Jobs 2 + 3 begin.** If anything breaks, log a bug entry and decide before pushing.

100. **Watch for Apple TestFlight processing email** from build 2 upload (CI run #26996339629). Usually arrives within 5–30 min. If no email after 30 min, check spam folder + appstoreconnect.apple.com → Apps → Contueri-ios → TestFlight → Builds (the dashboard updates in real time independent of email).

101. **OneSignal templates + recurring sends configuration in dashboard.** Add June 6, 2026. Integration is complete on the code side and verified end-to-end (test push delivered to lockscreen). Remaining work is dashboard-side using the locked copy in `~/Documents/KALLOS Launch/CONTUERI-Notification-Templates-v1.html`. Create 4 templates (P&P, Journey, Streak, Seasonal) + 4 recurring sends segmented by the user tags the app already publishes (`pp_enabled`, `pp_time`, `pp_days`, etc.). Streak segment additionally filters `last_open_date != today`. ~30-45 min in OneSignal dashboard, no code. Approximately required before App Store launch so launch users get their first notification on time.

102. **App Store Connect listing fill.** Copy ready at `~/Documents/KALLOS Launch/CONTUERI-AppStore-Listing-Copy.html`. ~2 hours of dashboard work pasting the title, subtitle, description, keywords, screenshots, support URL, privacy policy URL into the App Store Connect listing form. **Required before App Store submission (target June 12).**

103. **Privacy + Terms placeholder fills.** ~5 minutes. `/privacy` and `/terms` routes exist but the legal copy at the placeholders needs to be filled in. Reference: `~/Documents/KALLOS Launch/CONTUERI-Legal-Placeholders-Reference.html`. Required before App Store submission.

104. **TestFlight tester emails to add.** Add friends/family who will internally test iOS build. Apple TestFlight External Testing track supports up to 10,000 testers; first build requires Apple beta review (~24-48 hours). Adding testers is instant; they can't install until the first reviewed build clears. Path: App Store Connect → My Apps → Contueri-ios → TestFlight → External Testing → create group → add testers.

105. **Android adaptive icon — designer brief sent.** Specifications + casual ask-message both drafted June 6, 2026. Designer needs to deliver: foreground PNG (transparent bg, parchment cream C+l mark, 1024×1024), background PNG (solid espresso #16110D, 1024×1024), Play Store hero PNG (1024×500). Plus Illustrator source file for future tweaks. Source SVG to attach: `~/Documents/KALLOS Launch/icon-source/contueri-mark.svg`. **Blocks Android build polish — Capacitor `cap add android` work proceeds without it, but a publishable Android binary needs the icon.**

106. **Android tester emails (friend/family circle).** For Play Console Internal Testing track (up to 100 testers, no review wait — internal builds go live within hours of upload). Recommended mix: 2-3 Samsung devices, 1-2 Google Pixel, 1-2 OnePlus/Xiaomi/Motorola, mix of Android versions 12 through 15 to catch the `POST_NOTIFICATIONS` runtime permission change in 13+. Same workflow as iOS TestFlight tester list; addresses likely overlap with TestFlight list.

107. **Find a friend with an Android phone for Play Console device verification.** Required by Google's 2024 policy to publish Android apps. Friend installs Google Play Console mobile app on their Android phone, signs in with Sheri's developer Google account, opens the app once. That's all — verification satisfied. **Hard blocker for Android publishing** (no path around it without a real Android device). Sheri does not own an Android phone and is not buying one for v1.0.

108. **hello@contueri.com email setup.** Optional but recommended before App Store submission so the public contact email on the listing reads `hello@contueri.com` not `srjennings@gmail.com`. Recommended path: Cloudflare Email Routing (free, ~10 min). Steps: add contueri.com domain to Cloudflare → update Namecheap nameservers to Cloudflare's → enable Email Routing → create rule `hello@contueri.com` → forwards to srjennings@gmail.com. Caveat: Cloudflare Email Routing only RECEIVES; to SEND from `hello@contueri.com` need Gmail "Send mail as" SMTP setup (separate step, also free with workarounds).

109. **Studio editorial review of 30 Tradition Reflections** (June 7 evening seed). Open Sanity Studio → "Tradition Reflection (Church Fathers, Saints & Popes)" → sort by Display order (1..30). Spot-check Days 7 (Augustine), 12 (John of the Cross), 26 (Chesterton) first — they had multiple em-dash parentheticals per paragraph in Cowork's draft and the comma-substitution may need a polish pass. The seed script's `stripEmDashes()` substituted all 139 em dashes with `, ` (comma + space); most read naturally but dense parentheticals may want a colon or sentence break instead.

110. **Re-link 10 TR contentItems when Cowork lands the missing content.** Days 6, 12, 15, 16, 19, 22, 24, 26, 27, 29 have `traditionReflection` documents in Sanity (`tr-{slug}` _ids) but no `contentItem.traditionReflections` reference yet — those PP days have no contentItem because Cowork's source data flagged them as `needs_cowork` or `review`. When those contentItems land via a future PP seed run, re-run `npx tsx scripts/seed-tr-content.ts --patch` from the repo root. The script is idempotent: TRs `createOrReplace` to no-op (no changes since last run), and the patch step will now find the newly-seeded contentItems and link them automatically.
