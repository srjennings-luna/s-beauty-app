import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {presentationTool, defineLocations, defineDocuments} from 'sanity/presentation'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

// Preview URL for the KALLOS app on Vercel
const APP_PREVIEW_URL = 'https://s-beauty-app.vercel.app'

// Resolve the in-app preview URL for a given schema type + document.
// Returns null (with a reason) when a document can't be previewed yet.
function resolvePreviewUrl(
  schemaType: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doc: any,
): {url: string} | {error: string} {
  switch (schemaType) {
    case 'dailyPrompt': {
      const date = doc?.date as string | undefined
      if (!date) return {error: 'Save the document with a date first, then use Preview in app.'}
      // Use path-based route for Presentation compatibility (query strings
      // get URL-encoded and 404 in the iframe).
      return {url: `${APP_PREVIEW_URL}/prompt/${date}`}
    }
    case 'journey': {
      const slug = doc?.slug?.current as string | undefined
      if (!slug) return {error: 'Save the document with a slug first, then use Preview in app.'}
      return {url: `${APP_PREVIEW_URL}/journeys/${slug}?preview=1`}
    }
    case 'contentItem': {
      const contentType = doc?.contentType as string | undefined
      const id = doc?._id as string | undefined
      if (contentType !== 'sacred-art') {
        return {error: 'Preview in app is only available for sacred-art content items.'}
      }
      if (!id) return {error: 'Save the document first, then use Preview in app.'}
      const cleanId = id.replace(/^drafts\./, '')
      return {url: `${APP_PREVIEW_URL}/pray/${cleanId}?preview=1`}
    }
    case 'splashPage':
      return {url: `${APP_PREVIEW_URL}/splash?preview=1`}
    default:
      return {error: 'Preview in app is not available for this content type.'}
  }
}

// Custom document action: opens the in-app preview for the current document.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PreviewInAppAction(props: any) {
  const doc = props.draft || props.published
  const result = resolvePreviewUrl(props.type as string, doc)

  return {
    label: 'Preview in app',
    onHandle: () => {
      if ('url' in result) {
        window.open(result.url, '_blank', 'noopener,noreferrer')
      } else {
        alert(result.error)
      }
    },
  }
}

const PREVIEWABLE_TYPES = new Set(['dailyPrompt', 'journey', 'contentItem', 'splashPage'])

export default defineConfig({
  name: 'default',
  title: 'KALLOS CMS',

  projectId: 'em44j9m8',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items(
            S.documentTypeListItems().filter(
              (listItem) => !['episode'].includes(listItem.getId() ?? ''),
            ),
          ),
    }),
    // Presentation tool — side-by-side live preview of the app while editing.
    // The iframe opens at the per-document app route returned by `locations`
    // below (no draft-mode enable step — `previewMode` is intentionally
    // omitted). Today only the P&P page reads drafts, via its existing
    // `?preview=1` URL param + NEXT_PUBLIC_SANITY_TOKEN path (see
    // lib/sanity.ts `previewClient`). Other routes render published content
    // in the iframe; extending those to read drafts via `draftMode()` is
    // Manual Task 65. Once that lands, add
    //   previewMode: { enable: '/api/draft' }
    // here and wire the handler with @sanity/preview-url-secret — Sanity
    // manages the secret server-side (do not roll a custom one).
    presentationTool({
      title: 'Preview',
      previewUrl: {
        origin: APP_PREVIEW_URL,
      },
      resolve: {
        // URL → document (forward mapping). Populates the "Documents on this
        // page" panel when the iframe URL matches one of these routes, and
        // lets clicking a document in Structure navigate the iframe to its
        // preview URL.
        mainDocuments: defineDocuments([
          {
            // Path-based alias used only by Presentation. The public route
            // /prompt?date=X still works for share URLs; the Presentation
            // iframe navigates /prompt/:date because its filter params come
            // from path segments only (not query strings).
            route: '/prompt/:date',
            filter: `_type == "dailyPrompt" && date == $date`,
          },
          {
            route: '/journeys/:slug',
            filter: `_type == "journey" && slug.current == $slug`,
          },
          {
            // Path-based journey-day alias (query-string `?day=N` equivalent
            // for share URLs). Presentation navigates here; the app preselects
            // the day via initialDayNumber.
            route: '/journeys/:slug/day/:dayNumber',
            filter: `_type == "journeyDay" && journey->slug.current == $slug && string(dayNumber) == $dayNumber`,
          },
          {
            route: '/pray/:id',
            filter: `_type == "contentItem" && _id == $id`,
          },
          {
            route: '/splash',
            filter: `_type == "splashPage"`,
          },
        ]),
        // Document → URL (reverse mapping). Used by Sanity Studio's
        // document-level "Open in Preview" actions.
        locations: {
          dailyPrompt: defineLocations({
            select: {date: 'date', title: 'promptQuestion'},
            resolve: (doc) =>
              doc?.date
                ? {
                    locations: [
                      {title: `P&P — ${doc.date}`, href: `/prompt/${doc.date}`},
                    ],
                  }
                : undefined,
          }),
          journey: defineLocations({
            select: {slug: 'slug.current', title: 'title'},
            resolve: (doc) =>
              doc?.slug
                ? {
                    locations: [
                      {title: doc.title ?? 'Journey', href: `/journeys/${doc.slug}`},
                    ],
                  }
                : undefined,
          }),
          journeyDay: defineLocations({
            select: {
              dayNumber: 'dayNumber',
              dayTitle: 'dayTitle',
              journeySlug: 'journey->slug.current',
              journeyTitle: 'journey->title',
            },
            resolve: (doc) => {
              if (!doc?.journeySlug || typeof doc.dayNumber !== 'number') return undefined
              return {
                locations: [
                  {
                    title: `Day ${doc.dayNumber}: ${doc.dayTitle ?? ''}`.trim(),
                    // Path-based route for Presentation iframe compatibility.
                    href: `/journeys/${doc.journeySlug}/day/${doc.dayNumber}`,
                  },
                  {
                    title: `Journey: ${doc.journeyTitle ?? doc.journeySlug}`,
                    href: `/journeys/${doc.journeySlug}`,
                  },
                ],
              }
            },
          }),
          contentItem: defineLocations({
            select: {id: '_id', contentType: 'contentType', title: 'title'},
            resolve: (doc) => {
              if (!doc?.id) return undefined
              if (doc.contentType !== 'sacred-art') return undefined
              const cleanId = String(doc.id).replace(/^drafts\./, '')
              return {
                locations: [
                  {title: doc.title ?? 'Visio Divina', href: `/pray/${cleanId}`},
                ],
              }
            },
          }),
          splashPage: defineLocations({
            select: {title: 'title'},
            resolve: () => ({locations: [{title: 'Splash', href: `/splash`}]}),
          }),
        },
      },
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    actions: (prev: any[], context: any) => {
      if (PREVIEWABLE_TYPES.has(context.schemaType)) {
        return [...prev, PreviewInAppAction]
      }
      return prev
    },
  },
})
