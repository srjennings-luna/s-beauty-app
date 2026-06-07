import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const sanityClient = createClient({
  projectId: 'em44j9m8',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false, // Disable CDN to ensure fresh data
})

// Preview client: fetches draft (unpublished) content for Studio preview.
// Uses SANITY_TOKEN (server-only, never bundled to client) + 'drafts' perspective.
// Previously read NEXT_PUBLIC_SANITY_TOKEN, which leaked the token into client JS.
// previewClient is only called from server functions (page.tsx, route handlers).
// The older 'previewDrafts' name is deprecated and silently returns
// published-only data on apiVersion 2024-01-01+, confirmed 2026-04-24.
export const previewClient = createClient({
  projectId: 'em44j9m8',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_TOKEN,
  perspective: 'drafts',
})

// Image URL builder
const builder = imageUrlBuilder(sanityClient)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any) {
  return builder.image(source)
}

// ─────────────────────────────────────────────────────────────────────────────
// Reusable GROQ fragments
// ─────────────────────────────────────────────────────────────────────────────

const THEME_FIELDS = `
  _id,
  title,
  slug,
  question,
  description,
  color,
  order,
  "imageUrl": image.asset->url
`

const CONTENT_ITEM_FIELDS = `
  _id,
  contentType,
  title,
  "imageUrl": image.asset->url,
  description,
  context,
  "themes": themes[]->{${THEME_FIELDS}},
  reflectionQuestions,
  artworkHook,
  "artworkHookAudioUrl": artworkHookAudio.asset->url,
  "contextAudioUrl": contextAudio.asset->url,
  // Legacy — pulled for data-migration window only; remove after backfill verified
  "legacyCuratorNote": curatorNote,
  "legacyCuratorNoteAudioUrl": curatorNoteAudio.asset->url,
  locationName,
  city,
  country,
  coordinates,
  artist,
  year,
  medium,
  scripturePairing,
  thinkerName,
  quote,
  era,
  tradition,
  author,
  workTitle,
  excerpt,
  literaryForm,
  composer,
  performer,
  durationMinutes,
  // Audio source — consolidated object (replaces old musicUrl + audioFile fields)
  "audioFileUrl": audioSource.audioFile.asset->url,
  "audioUrl": audioSource.audioUrl,
  "externalMusicUrl": audioSource.externalUrl,
  // Legacy fields — kept for backward compat with any existing documents
  musicUrl,
  "legacyAudioFileUrl": audioFile.asset->url,
  craftTradition,
  pointsToward,
  creationTheology,
  mediaType,
  mediaUrl,
  series,
  discipline,
  principle,
  beautyConnection
`

// ─────────────────────────────────────────────────────────────────────────────
// Themes
// ─────────────────────────────────────────────────────────────────────────────

export async function getThemes() {
  return sanityClient.fetch(`
    *[_type == "theme"] | order(order asc) {
      ${THEME_FIELDS}
    }
  `)
}

export async function getThemeBySlug(slug: string) {
  return sanityClient.fetch(
    `*[_type == "theme" && slug.current == $slug][0] {
      ${THEME_FIELDS}
    }`,
    { slug }
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Content Items
// ─────────────────────────────────────────────────────────────────────────────

export async function getAllContentItems(contentType?: string) {
  const typeFilter = contentType ? ` && contentType == $contentType` : ''
  return sanityClient.fetch(
    `*[_type == "contentItem"${typeFilter}] | order(title asc) {
      ${CONTENT_ITEM_FIELDS}
    }`,
    contentType ? { contentType } : {}
  )
}

export async function getContentByTheme(themeId: string) {
  return sanityClient.fetch(
    `*[_type == "contentItem" && $themeId in themes[]._ref] | order(title asc) {
      ${CONTENT_ITEM_FIELDS}
    }`,
    { themeId }
  )
}

export async function getContentItemById(id: string) {
  return sanityClient.fetch(
    `*[_id == $id && _type in ["contentItem", "artwork"]][0] {
      ${CONTENT_ITEM_FIELDS}
    }`,
    { id }
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Journeys
// ─────────────────────────────────────────────────────────────────────────────

export async function getJourneys() {
  return sanityClient.fetch(`
    *[_type == "journey" && isPublished == true] | order(order asc) {
      _id,
      title,
      slug,
      "theme": theme->{${THEME_FIELDS}},
      description,
      "heroImageUrl": heroImage.asset->url,
      estimatedMinutesPerDay,
      isPublished,
      order,
      "totalDays": coalesce(totalDays, count(days)),
      journeyType,
      showName,
      episodeLabel
    }
  `)
}

// Shared GROQ projection for a single journey. Reused by published +
// preview fetches so the shape stays identical and one edit updates both.
const JOURNEY_QUERY = `*[_type == "journey" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  "theme": theme->{${THEME_FIELDS}},
  description,
  "heroImageUrl": heroImage.asset->url,
  estimatedMinutesPerDay,
  isPublished,
  order,
  "totalDays": coalesce(totalDays, count(days)),
  "days": days[]-> {
    dayNumber,
    dayTitle,
    "openImageUrl": openImage.asset->url,
    openText,
    "openTextAudioUrl": openTextAudio.asset->url,
    "encounterContent": encounterContent->{${CONTENT_ITEM_FIELDS}},
    encounterGuidance,
    encounterNote,
    "encounterNoteAudioUrl": encounterNoteAudio.asset->url,
    "lectio": lectio {
      philosophyQuote,
      philosophySource,
      scriptureVerse,
      scriptureReference,
      connectionNote
    },
    "auditio": auditio-> {
      title,
      composerArtist,
      workTitle,
      genre,
      licensingNote,
      "audioFileUrl": audioFile.asset->url,
      audioUrl,
      externalUrl
    },
    reflectionQuestions,
    "reflectionQuestionsAudioUrl": reflectionQuestionsAudio.asset->url,
    connectThread,
    "goDeeper": goDeeper[]->{
      _id,
      authorType,
      title,
      summary,
      shortQuote,
      source,
      order,
      era,
      "reflectionAudioUrl": reflectionAudio.asset->url
    }
  } | order(dayNumber asc),
  "plannedDays": plannedDays[] {
    dayNumber,
    dayTitle
  } | order(dayNumber asc)
}`

export async function getJourney(slug: string) {
  return sanityClient.fetch(JOURNEY_QUERY, { slug })
}

/**
 * Preview variant — reads drafts via the preview client (`drafts` perspective).
 * Use from server components guarded by `(await draftMode()).isEnabled`,
 * with a fallback to `getJourney` when the preview fetch fails or returns null.
 */
export async function getJourneyPreview(slug: string) {
  return previewClient.fetch(JOURNEY_QUERY, { slug })
}

// ─────────────────────────────────────────────────────────────────────────────
// Daily Prompt
// ─────────────────────────────────────────────────────────────────────────────

const DAILY_PROMPT_FIELDS = `
  _id,
  date,
  "content": content->{${CONTENT_ITEM_FIELDS}},
  promptQuestion,
  curatorNote,
  "curatorNoteAudioUrl": curatorNoteAudio.asset->url,
  lectio,
  "auditio": auditio-> {
    title,
    composerArtist,
    workTitle,
    genre,
    "audioFileUrl": audioFile.asset->url,
    audioUrl,
    externalUrl,
    verbaOriginal
  },
  actio,
  "relatedJourney": relatedJourney->{
    _id,
    title,
    slug,
    "heroImageUrl": heroImage.asset->url
  },
  "theme": theme->{${THEME_FIELDS}}
`

export async function getDailyPrompt(date?: string) {
  // Use local date (not UTC) so the prompt matches the user's actual calendar day
  const targetDate = date ?? new Date().toLocaleDateString('en-CA') // en-CA gives YYYY-MM-DD in local timezone

  // cache: 'no-store' on both fetches forces the browser (and any
  // intermediate caches) to bypass cached responses. Necessary during
  // active iteration: Safari on iOS will otherwise serve a stale empty
  // response after content is added to Sanity, even after dev server
  // restarts. Sanity's free-tier rate limits are well above what KALLOS
  // generates, so this is a safe always-on setting.
  const exact = await sanityClient.fetch(
    `*[_type == "dailyPrompt" && date == $targetDate][0] {${DAILY_PROMPT_FIELDS}}`,
    { targetDate },
    { cache: 'no-store' }
  )

  // If we got a valid result with content linked, use it
  if (exact?.content?.imageUrl) return exact

  // Fallback: most recently published prompt (handles editorial gaps).
  // defined(date) skips any half-entered draft with date=null —
  // GROQ's `order(date desc)` puts NULLs first, so without the
  // defined(date) filter the fallback returns the null-date stub
  // and PromptClient renders "No prompt for today yet" even when
  // there are perfectly good dated prompts behind it. June 5
  // 2026 surfaced this when today's date had no prompt and the
  // null-date stub shadowed the most-recent-dated one ("They
  // Were Early", 2026-06-01).
  return sanityClient.fetch(
    `*[_type == "dailyPrompt" && defined(date)] | order(date desc)[0] {${DAILY_PROMPT_FIELDS}}`,
    {},
    { cache: 'no-store' }
  )
}

export async function getDailyPromptById(id: string) {
  return sanityClient.fetch(
    `*[_type == "dailyPrompt" && _id == $id][0] {${DAILY_PROMPT_FIELDS}}`,
    { id }
  )
}

// Preview version: fetches draft content for a given date.
// Called when ?preview=1 is present in the URL (opened from Sanity Studio).
export async function getDailyPromptPreview(date: string) {
  const exact = await previewClient.fetch(
    `*[_type == "dailyPrompt" && date == $date][0] {${DAILY_PROMPT_FIELDS}}`,
    { date }
  )
  if (exact) return exact

  // Fallback: most recent draft/published prompt. Same `defined(date)`
  // guard as getDailyPrompt() — without it the null-date stub returned
  // first and Studio Presentation preview rendered the "no prompt"
  // empty state for routes the editor was actively browsing.
  return previewClient.fetch(
    `*[_type == "dailyPrompt" && defined(date)] | order(date desc)[0] {${DAILY_PROMPT_FIELDS}}`
  )
}

export async function getAllPrompts(): Promise<import('./types').DailyPrompt[]> {
  // Lean projection — just enough to render archive cards in Library.
  // Archive shows yesterday and earlier — today lives on the Today tab.
  const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD in local timezone
  return sanityClient.fetch(
    `*[_type == "dailyPrompt" && date < $today] | order(date desc) {
      _id,
      date,
      promptQuestion,
      curatorNote,
      "content": content->{
        _id,
        title,
        "imageUrl": image.asset->url
      }
    }`,
    { today }
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tradition Reflections
// ─────────────────────────────────────────────────────────────────────────────

export async function getTraditionReflections(themeId?: string) {
  const themeFilter = themeId ? ` && $themeId in themes[]._ref` : ''
  return sanityClient.fetch(
    `*[_type == "traditionReflection"${themeFilter}] | order(order asc) {
      _id,
      authorType,
      title,
      summary,
      shortQuote,
      source,
      "reflectionAudioUrl": reflectionAudio.asset->url,
      "themes": themes[]->{${THEME_FIELDS}},
      theme,
      order,
      era
    }`,
    themeId ? { themeId } : {}
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Splash Pages
// ─────────────────────────────────────────────────────────────────────────────

// Block-based splash. Each document is one screen; `blocks` is an ordered
// polymorphic array. The `...` spread inside each block selection pulls
// every field the block type defines (text, label, body, linkPath, etc.).
const SPLASH_QUERY = `*[_type == "splashPage"] | order(screenNumber asc) {
  _id,
  screenNumber,
  screenTitle,
  blocks[] {
    _type,
    _key,
    ...
  }
}`

export async function getSplashPages() {
  return sanityClient.fetch(SPLASH_QUERY)
}

export async function getSplashPagesPreview() {
  return previewClient.fetch(SPLASH_QUERY)
}

// ─────────────────────────────────────────────────────────────────────────────
// Visio Divina — prayer page (queries both artwork and contentItem)
// ─────────────────────────────────────────────────────────────────────────────

const ARTWORK_QUERY = `*[_id == $id && _type in ["contentItem", "artwork"]][0] {
  _id,
  title,
  artist,
  year,
  "imageUrl": image.asset->url,
  description,
  context,
  historicalSummary,
  scripturePairing,
  quote,
  contentType,
  locationType,
  reflectionQuestions,
  locationName,
  city,
  country,
  coordinates,
  traditionalPrayer,
  traditionalPrayerSource,
  customPrayerPrompt,
  customActioHeadline,
  customActioInstruction,
  "traditionReflections": traditionReflections[]->{
    _id,
    title,
    summary,
    shortQuote,
    source,
    authorType,
    order,
  }
}`

export async function getArtworkById(id: string) {
  return sanityClient.fetch(ARTWORK_QUERY, { id })
}

/**
 * Preview variant for the /pray/[id] (Visio Divina) page. Reads drafts
 * via the preview client. Pair with draftMode() in a server component.
 */
export async function getArtworkByIdPreview(id: string) {
  return previewClient.fetch(ARTWORK_QUERY, { id })
}

// ─────────────────────────────────────────────────────────────────────────────
// Visio Divina defaults — singleton document holding the contemplative
// prompt copy. Added June 6, 2026 (VD-ACTION-01). Cascade order in
// PrayClient.tsx: artwork.customX → defaults.defaultX → hardcoded fallback.
// ─────────────────────────────────────────────────────────────────────────────

const VISIO_DEFAULTS_QUERY = `*[_type == "visioDefaults"][0] {
  defaultActioHeadline,
  defaultActioInstruction,
  defaultPrayerPrompt,
  defaultTraditionalPrayer,
  defaultTraditionalPrayerSource,
}`

export async function getVisioDefaults() {
  return sanityClient.fetch(VISIO_DEFAULTS_QUERY)
}

/**
 * Preview variant. Pair with draftMode() in a server component so editors
 * can preview unpublished default-copy changes before saving.
 */
export async function getVisioDefaultsPreview() {
  return previewClient.fetch(VISIO_DEFAULTS_QUERY)
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard queries — /dashboard route (Task 3 from KALLOS-CC-Audit-Brief)
// Each function powers one dashboard section. All server-side.
// ─────────────────────────────────────────────────────────────────────────────

export async function getDashboardJourneyCompletion() {
  // Post-R5: queries journeyDay documents directly, groups by journey._ref.
  // Faster and cleaner than traversing the ref array from the journey side.
  return sanityClient.fetch(`
    *[_type == "journey" && !string::startsWith(_id, "drafts.")] | order(order asc) {
      _id, title, "slug": slug.current, description, order, isPublished,
      "totalDays": coalesce(totalDays, count(days)),
      "daysBuilt": count(*[_type == "journeyDay" && journey._ref == ^._id && !string::startsWith(_id, "drafts.")]),
      "plannedCount": count(plannedDays),
      estimatedMinutesPerDay,
      "themeName": theme->title,
      "days": *[_type == "journeyDay" && journey._ref == ^._id && !string::startsWith(_id, "drafts.")] | order(dayNumber asc) {
        _id, dayNumber, dayTitle,
        "hasOpenImage": defined(openImage),
        "openTextLen": length(coalesce(openText, "")),
        "hasOpenTextAudio": defined(openTextAudio.asset),
        "hasEncounterRef": defined(encounterContent._ref),
        "encNoteLen": length(coalesce(encounterNote, "")),
        "hasEncNoteAudio": defined(encounterNoteAudio.asset),
        "hasAuditio": defined(auditio._ref),
        "hasAuditioFile": defined(auditio->audioFile.asset),
        "auditioGenre": auditio->genre,
        "auditioComposerArtist": auditio->composerArtist,
        "auditioWorkTitle": auditio->workTitle,
        "hasLectio": length(coalesce(lectio.scriptureVerse, "")) > 0,
        "reflectCount": count(reflectionQuestions),
        "hasConnect": length(coalesce(connectThread, "")) > 0,
        "goDeeperCount": count(goDeeper)
      }
    }
  `)
}

export async function getDashboardContentItems() {
  // The `needsArtworkHookReview` flag detects REVIEW items from the April 24
  // audit by data state alone — KEEP items had curatorNote unset during the
  // rename migration, so any content item still holding legacy curatorNote
  // text is awaiting rewrite into the artwork-level hook.
  return sanityClient.fetch(`
    *[_type == "contentItem" && !string::startsWith(_id, "drafts.")] | order(contentType asc, title asc) {
      _id, contentType, title, artist, thinkerName, author, composer, year, medium, era,
      "hasImage": defined(image.asset),
      "hasArtworkHook": length(coalesce(artworkHook, "")) > 0,
      "hasContext": length(coalesce(context, "")) > 0,
      "hasAudioFile": defined(audioSource.audioFile.asset) || defined(audioFile.asset),
      "themeCount": count(themes),
      "themeNames": themes[]->title,
      "needsArtworkHookReview": defined(curatorNote) && length(curatorNote) > 0,
      // Post-R5: content items are referenced by journeyDay, not journey.
      "journeyTitles": array::unique(*[_type == "journeyDay" && encounterContent._ref == ^._id]{ "t": journey->title }.t)
    }
  `)
}

// Visio Divina audit — every contentItem eligible for /pray/[id]
// (sacred-art + landscape) with the artwork image, the FULL
// traditionalPrayer text (not yes/no), traditionalPrayerSource, and
// every linked traditionReflection expanded inline (title, shortQuote,
// summary, source, authorType, era). Sheri's spec: "the content should
// show, not just a yes, no or 3 (ex 3 reflections)." Server-rendered
// at /dashboard/visio-audit.
export async function getDashboardVisioAuditItems() {
  return sanityClient.fetch(`
    *[
      _type == "contentItem"
      && !string::startsWith(_id, "drafts.")
      && (contentType == "sacred-art" || contentType == "landscape")
    ] | order(contentType asc, title asc) {
      _id,
      title,
      contentType,
      artist,
      year,
      medium,
      era,
      "imageUrl": image.asset->url,
      "hasImage": defined(image.asset),
      traditionalPrayer,
      traditionalPrayerSource,
      "traditionReflections": traditionReflections[]->{
        _id,
        title,
        shortQuote,
        summary,
        source,
        authorType,
        era,
        order,
      } | order(order asc),
      "reflectionCount": count(traditionReflections),
    }
  `)
}

export async function getDashboardTraditionReflections() {
  return sanityClient.fetch(`
    {
      "list": *[_type == "traditionReflection" && !string::startsWith(_id, "drafts.")] | order(authorType asc, title asc) {
        _id, authorType, title, source, era,
        "hasSummary": length(coalesce(summary, "")) > 0,
        "hasAudio": defined(reflectionAudio.asset),
        "themeCount": count(themes),
        "themeNames": themes[]->title,
        // Post-R5: TRs are referenced by journeyDay, not journey. Find
        // journeys by traversing the journeyDay → journey ref.
        "journeyTitles": array::unique(*[_type == "journeyDay" && references(^._id)]{ "t": journey->title }.t),
        "journeyCount": count(array::unique(*[_type == "journeyDay" && references(^._id)]{ "t": journey->title }.t))
      },
      "byJourney": *[_type == "journey" && !string::startsWith(_id, "drafts.")] | order(order asc) {
        _id, title, "slug": slug.current,
        "daysBuilt": count(*[_type == "journeyDay" && journey._ref == ^._id && !string::startsWith(_id, "drafts.")]),
        "trRefs": *[_type == "journeyDay" && journey._ref == ^._id && !string::startsWith(_id, "drafts.")].goDeeper[]->{ _id, title, source, authorType, era }
      }
    }
  `)
}

export async function getDashboardAudioStatus() {
  return sanityClient.fetch(`
    {
      "journeys": *[_type == "journey" && !string::startsWith(_id, "drafts.")] | order(order asc) {
        title, "slug": slug.current,
        "days": *[_type == "journeyDay" && journey._ref == ^._id && !string::startsWith(_id, "drafts.")] | order(dayNumber asc) {
          _id, dayNumber, dayTitle,
          "hasOpenTextAudio": defined(openTextAudio.asset),
          "hasEncNoteAudio": defined(encounterNoteAudio.asset),
          // artworkHook + context audio live on the linked contentItem.
          "hasArtworkHookAudio": defined(encounterContent->artworkHookAudio.asset),
          "hasContextAudio": defined(encounterContent->contextAudio.asset),
          "hasReflectionQuestionsAudio": defined(reflectionQuestionsAudio.asset),
          "hasAuditio": defined(auditio._ref),
          // Tradition-reflection audio coverage for this day's Go Deeper refs.
          "goDeeperTotal": count(goDeeper),
          "goDeeperWithAudio": count(goDeeper[]->[defined(reflectionAudio.asset)])
        }
      },
      "prompts": *[_type == "dailyPrompt" && !string::startsWith(_id, "drafts.")] | order(date desc) {
        _id, date,
        "contentTitle": content->title,
        "hasCuratorAudio": defined(curatorNoteAudio.asset),
        "hasAuditioFile": defined(auditio->audioFile.asset),
        "hasAuditioUrl": defined(auditio->audioUrl),
        "hasAuditioExt": defined(auditio->externalUrl)
      },
      "genres": {
        "journeyDay": *[_type == "journeyDay" && !string::startsWith(_id, "drafts.") && defined(auditio._ref)]{ "genre": auditio->genre },
        "dailyPrompt": *[_type == "dailyPrompt" && !string::startsWith(_id, "drafts.") && defined(auditio._ref)]{ "genre": auditio->genre }
      },
      // Auditio works inventory — for work-level + composer-level repeat
      // detection. Prefers the structured composerArtist/workTitle fields;
      // falls back to the legacy free-text title/composer/artist so pre-
      // migration records are still surfaced.
      "works": {
        "journeyDay": *[_type == "journeyDay" && !string::startsWith(_id, "drafts.") && defined(auditio._ref)]{
          _id,
          "origin": "journeyDay",
          "journeyTitle": journey->title,
          dayNumber,
          dayTitle,
          "workTitle": coalesce(auditio->workTitle, auditio->title),
          "composerArtist": auditio->composerArtist,
          "isStructured": defined(auditio->workTitle)
        },
        "dailyPrompt": *[_type == "dailyPrompt" && !string::startsWith(_id, "drafts.") && defined(auditio._ref)]{
          _id,
          "origin": "dailyPrompt",
          date,
          "workTitle": coalesce(auditio->workTitle, auditio->title),
          "composerArtist": auditio->composerArtist,
          "isStructured": defined(auditio->workTitle)
        }
      }
    }
  `)
}

// ─────────────────────────────────────────────────────────────────────────────
// Review Grid (Phase 1, April 25 2026) /dashboard/review
// Powers the configurable content-review grid. Returns a unified set of
// journeyDay and dailyPrompt rows with all text fields and pre-joined ref
// fields (artworkHook, context, imageUrl from contentItem). One round-trip,
// no second fetch on row click.
//
// Types live in this file rather than lib/types.ts because they are
// dashboard-only concerns (per Build Brief). Field-name normalization is
// done in the GROQ projection so the grid uses consistent column keys
// across both row types (lectioPhilosophyText, auditioComposerArtist, etc).
// The actual schema field names differ between types (e.g. dailyPrompt's
// lectio.philosophyText vs journeyDay's lectio.philosophyQuote); the
// projection unifies them. The TypeScript discriminated union on _type
// preserves type-only fields like connectThread (journeyDay only) and
// actio (dailyPrompt only).
// ─────────────────────────────────────────────────────────────────────────────

export type GoDeeperRef = { _id: string; title: string | null }

export type JourneyDayRow = {
  _id: string
  _type: 'journeyDay'
  dayNumber: number
  dayTitle: string
  journeyTitle: string | null
  journeySlug: string | null
  openText: string | null
  openTextAudioUrl: string | null
  encounterGuidance: string | null
  encounterNote: string | null
  encounterNoteAudioUrl: string | null
  artworkTitle: string | null
  artworkHook: string | null
  artworkHookAudioUrl: string | null
  context: string | null
  contextAudioUrl: string | null
  imageUrl: string | null
  lectioPhilosophyText: string | null
  lectioPhilosophySource: string | null
  lectioScriptureText: string | null
  lectioScriptureSource: string | null
  lectioConnectionNote: string | null
  auditioTitle: string | null
  auditioComposerArtist: string | null
  auditioWorkTitle: string | null
  auditioGenre: string | null
  auditioAudioFileUrl: string | null
  auditioAudioUrl: string | null
  auditioExternalUrl: string | null
  reflectionQuestions: string[] | null
  reflectionQuestionsAudioUrl: string | null
  connectThread: string | null
  goDeeperTitles: GoDeeperRef[] | null
}

export type DailyPromptRow = {
  _id: string
  _type: 'dailyPrompt'
  date: string
  promptQuestion: string | null
  curatorNote: string | null
  curatorNoteAudioUrl: string | null
  artworkTitle: string | null
  imageUrl: string | null
  context: string | null
  contextAudioUrl: string | null
  lectioPhilosophyText: string | null
  lectioPhilosophySource: string | null
  lectioScriptureText: string | null
  lectioScriptureSource: string | null
  auditioTitle: string | null
  auditioComposerArtist: string | null
  auditioWorkTitle: string | null
  auditioGenre: string | null
  auditioAudioFileUrl: string | null
  auditioAudioUrl: string | null
  auditioExternalUrl: string | null
  verbaOriginal: string | null
  actio: string | null
}

export type GridRow = JourneyDayRow | DailyPromptRow

export type ReviewGridResponse = {
  journeyDays: JourneyDayRow[]
  dailyPrompts: DailyPromptRow[]
}

// Shared projections used by both the bulk grid query and the per-id
// record-view query so the row shape stays identical across surfaces.
const REVIEW_JOURNEY_DAY_PROJECTION = `
  _id,
  _type,
  dayNumber,
  dayTitle,
  "journeyTitle": journey->title,
  "journeySlug": journey->slug.current,
  openText,
  "openTextAudioUrl": openTextAudio.asset->url,
  encounterGuidance,
  encounterNote,
  "encounterNoteAudioUrl": encounterNoteAudio.asset->url,
  "artworkTitle": encounterContent->title,
  "artworkHook": encounterContent->artworkHook,
  "artworkHookAudioUrl": encounterContent->artworkHookAudio.asset->url,
  "context": encounterContent->context,
  "contextAudioUrl": encounterContent->contextAudio.asset->url,
  "imageUrl": encounterContent->image.asset->url,
  "lectioPhilosophyText": lectio.philosophyQuote,
  "lectioPhilosophySource": lectio.philosophySource,
  "lectioScriptureText": lectio.scriptureVerse,
  "lectioScriptureSource": lectio.scriptureReference,
  "lectioConnectionNote": lectio.connectionNote,
  "auditioTitle": auditio->title,
  "auditioComposerArtist": auditio->composerArtist,
  "auditioWorkTitle": auditio->workTitle,
  "auditioGenre": auditio->genre,
  "auditioAudioFileUrl": auditio->audioFile.asset->url,
  "auditioAudioUrl": auditio->audioUrl,
  "auditioExternalUrl": auditio->externalUrl,
  reflectionQuestions,
  "reflectionQuestionsAudioUrl": reflectionQuestionsAudio.asset->url,
  connectThread,
  "goDeeperTitles": goDeeper[]->{_id, title}
`

const REVIEW_DAILY_PROMPT_PROJECTION = `
  _id,
  _type,
  date,
  promptQuestion,
  curatorNote,
  "curatorNoteAudioUrl": curatorNoteAudio.asset->url,
  "artworkTitle": content->title,
  "imageUrl": content->image.asset->url,
  "context": content->context,
  "contextAudioUrl": content->contextAudio.asset->url,
  "lectioPhilosophyText": lectio.philosophyText,
  "lectioPhilosophySource": lectio.philosophyAttribution,
  "lectioScriptureText": lectio.text,
  "lectioScriptureSource": lectio.attribution,
  "auditioTitle": auditio->title,
  "auditioComposerArtist": auditio->composerArtist,
  "auditioWorkTitle": auditio->workTitle,
  "auditioGenre": auditio->genre,
  "auditioAudioFileUrl": auditio->audioFile.asset->url,
  "auditioAudioUrl": auditio->audioUrl,
  "auditioExternalUrl": auditio->externalUrl,
  "verbaOriginal": auditio->verbaOriginal,
  actio
`

export async function getReviewGridRows(): Promise<ReviewGridResponse> {
  return sanityClient.fetch<ReviewGridResponse>(`{
    "journeyDays": *[_type == "journeyDay" && !string::startsWith(_id, "drafts.")] | order(journey->title asc, dayNumber asc) {
      ${REVIEW_JOURNEY_DAY_PROJECTION}
    },
    "dailyPrompts": *[_type == "dailyPrompt" && !string::startsWith(_id, "drafts.")] | order(date desc) {
      ${REVIEW_DAILY_PROMPT_PROJECTION}
    }
  }`)
}

// Single-row fetch for the record-view route. Runs both projections in
// parallel; only the matching one returns a row. Shape matches the grid
// query exactly, so renderers can be shared.
export async function getReviewGridRowById(id: string): Promise<GridRow | null> {
  const [jd, dp] = await Promise.all([
    sanityClient.fetch<JourneyDayRow | null>(
      `*[_id == $id && _type == "journeyDay"][0] {${REVIEW_JOURNEY_DAY_PROJECTION}}`,
      { id }
    ),
    sanityClient.fetch<DailyPromptRow | null>(
      `*[_id == $id && _type == "dailyPrompt"][0] {${REVIEW_DAILY_PROMPT_PROJECTION}}`,
      { id }
    ),
  ])
  return jd ?? dp ?? null
}

export async function getDashboardTTSAudit() {
  return sanityClient.fetch(`
    {
      "journeyDayTTS": *[_type == "journey" && !string::startsWith(_id, "drafts.")]{
        title,
        "days": *[_type == "journeyDay" && journey._ref == ^._id && !string::startsWith(_id, "drafts.")] | order(dayNumber asc) {
          dayNumber, dayTitle,
          "openTextChars": length(coalesce(openText, "")),
          "openTextHasAudio": defined(openTextAudio.asset),
          "encounterNoteChars": length(coalesce(encounterNote, "")),
          "encounterNoteHasAudio": defined(encounterNoteAudio.asset)
        }
      },
      "contentItemTTS": *[_type=="contentItem" && !string::startsWith(_id, "drafts.")]{
        _id, title, contentType,
        "artworkHookChars": length(coalesce(artworkHook, coalesce(curatorNote, ""))),
        "artworkHookHasAudio": defined(artworkHookAudio.asset) || defined(curatorNoteAudio.asset),
        "contextChars": length(coalesce(context, "")),
        "contextHasAudio": defined(contextAudio.asset)
      },
      "dailyPromptTTS": *[_type=="dailyPrompt" && !string::startsWith(_id, "drafts.")]{
        _id, date,
        "contentTitle": content->title,
        "curatorChars": length(coalesce(curatorNote, "")),
        "curatorHasAudio": defined(curatorNoteAudio.asset)
      },
      "traditionReflectionTTS": *[_type=="traditionReflection" && !string::startsWith(_id, "drafts.")]{
        _id, title, authorType,
        "summaryChars": length(coalesce(summary, "")),
        "summaryHasAudio": defined(reflectionAudio.asset)
      }
    }
  `)
}

