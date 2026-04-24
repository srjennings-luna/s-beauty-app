import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const sanityClient = createClient({
  projectId: 'em44j9m8',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false, // Disable CDN to ensure fresh data
})

// Preview client: fetches draft (unpublished) content for Studio preview
// Uses NEXT_PUBLIC_SANITY_TOKEN + previewDrafts perspective
export const previewClient = createClient({
  projectId: 'em44j9m8',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.NEXT_PUBLIC_SANITY_TOKEN,
  perspective: 'previewDrafts',
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
      "totalDays": coalesce(totalDays, count(days))
    }
  `)
}

export async function getJourney(slug: string) {
  return sanityClient.fetch(
    `*[_type == "journey" && slug.current == $slug][0] {
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
        "auditio": auditio {
          title,
          composer,
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
    }`,
    { slug }
  )
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
  "auditio": auditio {
    title,
    artist,
    composerArtist,
    workTitle,
    genre,
    url,
    "audioFileUrl": audioUrl.audioFile.asset->url,
    "audioUrl": audioUrl.audioUrl,
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

  // Try exact date match first
  const exact = await sanityClient.fetch(
    `*[_type == "dailyPrompt" && date == $targetDate][0] {${DAILY_PROMPT_FIELDS}}`,
    { targetDate }
  )

  // If we got a valid result with content linked, use it
  if (exact?.content?.imageUrl) return exact

  // Fallback: most recently published prompt (handles editorial gaps)
  return sanityClient.fetch(
    `*[_type == "dailyPrompt"] | order(date desc)[0] {${DAILY_PROMPT_FIELDS}}`
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

  // Fallback: most recent draft/published prompt
  return previewClient.fetch(
    `*[_type == "dailyPrompt"] | order(date desc)[0] {${DAILY_PROMPT_FIELDS}}`
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

export async function getSplashPages() {
  return sanityClient.fetch(`
    *[_type == "splashPage"] | order(pageNumber asc) {
      _id,
      pageNumber,
      pageType,
      "heroImageUrl": heroImage.asset->url,
      quote,
      quoteAttribution,
      title,
      description,
      buttonText,
      quoteColor,
      quoteFont,
      attributionColor,
      bottomBackgroundColor,
      titleColor,
      titleSize,
      descriptionColor,
      buttonBackgroundColor,
      buttonTextColor,
      backgroundGradientStart,
      backgroundGradientEnd
    }
  `)
}

// ─────────────────────────────────────────────────────────────────────────────
// Visio Divina — prayer page (queries both artwork and contentItem)
// ─────────────────────────────────────────────────────────────────────────────

export async function getArtworkById(id: string) {
  return sanityClient.fetch(
    `*[_id == $id && _type in ["contentItem", "artwork"]][0] {
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
      "traditionReflections": traditionReflections[]->{
        _id,
        title,
        summary,
        shortQuote,
        source,
        authorType,
        order,
      }
    }`,
    { id }
  )
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
        "hasAuditio": defined(auditio.title),
        "hasAuditioFile": defined(auditio.audioFile.asset),
        "auditioGenre": auditio.genre,
        "auditioComposerArtist": auditio.composerArtist,
        "auditioWorkTitle": auditio.workTitle,
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
          "hasAuditio": defined(auditio.audioFile.asset),
          // Tradition-reflection audio coverage for this day's Go Deeper refs.
          "goDeeperTotal": count(goDeeper),
          "goDeeperWithAudio": count(goDeeper[]->[defined(reflectionAudio.asset)])
        }
      },
      "prompts": *[_type == "dailyPrompt" && !string::startsWith(_id, "drafts.")] | order(date desc) {
        _id, date,
        "contentTitle": content->title,
        "hasCuratorAudio": defined(curatorNoteAudio.asset),
        "hasAuditioFile": defined(auditio.audioUrl.audioFile.asset),
        "hasAuditioUrl": defined(auditio.audioUrl.audioUrl),
        "hasAuditioExt": defined(auditio.url)
      },
      "genres": {
        "journeyDay": *[_type == "journeyDay" && !string::startsWith(_id, "drafts.") && defined(auditio.genre)]{ "genre": auditio.genre },
        "dailyPrompt": *[_type == "dailyPrompt" && !string::startsWith(_id, "drafts.") && defined(auditio.genre)]{ "genre": auditio.genre }
      },
      // Auditio works inventory — for work-level + composer-level repeat
      // detection. Prefers the structured composerArtist/workTitle fields;
      // falls back to the legacy free-text title/composer/artist so pre-
      // migration records are still surfaced.
      "works": {
        "journeyDay": *[_type == "journeyDay" && !string::startsWith(_id, "drafts.") && (defined(auditio.workTitle) || defined(auditio.title))]{
          _id,
          "origin": "journeyDay",
          "journeyTitle": journey->title,
          dayNumber,
          dayTitle,
          "workTitle": coalesce(auditio.workTitle, auditio.title),
          "composerArtist": coalesce(auditio.composerArtist, auditio.composer),
          "isStructured": defined(auditio.workTitle)
        },
        "dailyPrompt": *[_type == "dailyPrompt" && !string::startsWith(_id, "drafts.") && (defined(auditio.workTitle) || defined(auditio.title))]{
          _id,
          "origin": "dailyPrompt",
          date,
          "workTitle": coalesce(auditio.workTitle, auditio.title),
          "composerArtist": coalesce(auditio.composerArtist, auditio.artist),
          "isStructured": defined(auditio.workTitle)
        }
      }
    }
  `)
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

