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
  curatorNote,
  "curatorNoteAudioUrl": curatorNoteAudio.asset->url,
  "contextAudioUrl": contextAudio.asset->url,
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
      "days": days[] {
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
          licensingNote,
          "audioFileUrl": audioFile.asset->url,
          audioUrl,
          externalUrl
        },
        reflectQuestions,
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
  return sanityClient.fetch(`
    *[_type == "journey"] | order(order asc) {
      _id, title, "slug": slug.current, description, order, isPublished,
      "totalDays": coalesce(totalDays, count(days)),
      "daysBuilt": count(days),
      "plannedCount": count(plannedDays),
      estimatedMinutesPerDay,
      "themeName": theme->title,
      "days": days[] | order(dayNumber asc) {
        dayNumber, dayTitle,
        "hasOpenImage": defined(openImage),
        "openTextLen": length(coalesce(openText, "")),
        "hasOpenTextAudio": defined(openTextAudio.asset),
        "hasEncounterRef": defined(encounterContent._ref),
        "encNoteLen": length(coalesce(encounterNote, "")),
        "hasEncNoteAudio": defined(encounterNoteAudio.asset),
        "hasAuditio": defined(auditio.title),
        "hasAuditioFile": defined(auditio.audioFile.asset),
        "hasLectio": length(coalesce(lectio.scriptureVerse, "")) > 0,
        "reflectCount": count(reflectQuestions),
        "hasConnect": length(coalesce(connectThread, "")) > 0,
        "goDeeperCount": count(goDeeper)
      }
    }
  `)
}

export async function getDashboardContentItems() {
  return sanityClient.fetch(`
    *[_type == "contentItem" && !string::startsWith(_id, "drafts.")] | order(contentType asc, title asc) {
      _id, contentType, title, artist, thinkerName, author, composer, year, medium, era,
      "hasImage": defined(image.asset),
      "hasCurator": length(coalesce(curatorNote, "")) > 0,
      "hasContext": length(coalesce(context, "")) > 0,
      "hasAudioFile": defined(audioSource.audioFile.asset) || defined(audioFile.asset),
      "themeCount": count(themes),
      "themeNames": themes[]->title,
      "journeyTitles": *[_type=="journey" && references(^._id)].title
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
        "journeyCount": count(*[_type=="journey" && references(^._id)]),
        "journeyTitles": *[_type=="journey" && references(^._id)].title
      },
      "byJourney": *[_type == "journey"] | order(order asc) {
        _id, title, "slug": slug.current,
        "daysBuilt": count(days),
        "trRefs": days[].goDeeper[]->{ _id, title, source, authorType, era }
      }
    }
  `)
}

export async function getDashboardAudioStatus() {
  return sanityClient.fetch(`
    {
      "journeys": *[_type == "journey"] | order(order asc) {
        title, "slug": slug.current,
        "days": days[] | order(dayNumber asc) {
          dayNumber, dayTitle,
          "hasOpenTextAudio": defined(openTextAudio.asset),
          "hasEncNoteAudio": defined(encounterNoteAudio.asset),
          "hasAuditio": defined(auditio.audioFile.asset)
        }
      },
      "prompts": *[_type == "dailyPrompt" && !string::startsWith(_id, "drafts.")] | order(date desc) {
        _id, date,
        "contentTitle": content->title,
        "hasCuratorAudio": defined(curatorNoteAudio.asset),
        "hasAuditioFile": defined(auditio.audioUrl.audioFile.asset),
        "hasAuditioUrl": defined(auditio.audioUrl.audioUrl),
        "hasAuditioExt": defined(auditio.url)
      }
    }
  `)
}

export async function getDashboardTTSAudit() {
  return sanityClient.fetch(`
    {
      "journeyDayTTS": *[_type=="journey"]{
        title,
        "days": days[]{
          dayNumber, dayTitle,
          "openTextChars": length(coalesce(openText, "")),
          "openTextHasAudio": defined(openTextAudio.asset),
          "encounterNoteChars": length(coalesce(encounterNote, "")),
          "encounterNoteHasAudio": defined(encounterNoteAudio.asset)
        }
      },
      "contentItemTTS": *[_type=="contentItem" && !string::startsWith(_id, "drafts.")]{
        _id, title, contentType,
        "curatorChars": length(coalesce(curatorNote, "")),
        "curatorHasAudio": defined(curatorNoteAudio.asset),
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

