import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const sanityClient = createClient({
  projectId: 'em44j9m8',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false, // Disable CDN to ensure fresh data
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
  musicUrl,
  craftTradition,
  pointsToward,
  creationTheology,
  mediaType,
  mediaUrl,
  series
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
      order
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
      "days": days[] {
        dayNumber,
        dayTitle,
        "openImageUrl": openImage.asset->url,
        openText,
        "encounterContent": encounterContent->{${CONTENT_ITEM_FIELDS}},
        encounterGuidance,
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
          era
        }
      } | order(dayNumber asc)
    }`,
    { slug }
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Daily Prompt
// ─────────────────────────────────────────────────────────────────────────────

export async function getDailyPrompt(date?: string) {
  const targetDate = date ?? new Date().toISOString().slice(0, 10)
  return sanityClient.fetch(
    `*[_type == "dailyPrompt" && date == $targetDate][0] {
      _id,
      date,
      "content": content->{${CONTENT_ITEM_FIELDS}},
      promptQuestion,
      curatorNote,
      "theme": theme->{${THEME_FIELDS}}
    }`,
    { targetDate }
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
      coordinates
    }`,
    { id }
  )
}

