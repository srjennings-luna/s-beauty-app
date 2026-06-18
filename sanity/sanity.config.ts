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
          .items([
            // ── Custom: Content Planning (planningItem) grouped by stream + journey name ──
            // Each documentList uses initialValueTemplates so the + button pre-populates
            // the stream / journeyName fields based on which folder the user is in.
            S.listItem()
              .title('Content Planning')
              .id('contentPlanning')
              .child(
                S.list()
                  .title('Content Planning')
                  .items([
                    S.listItem()
                      .title('Exploring (surface TBD)')
                      .id('planning-exploring')
                      .child(
                        S.documentList()
                          .title('Exploring')
                          .filter('_type == "planningItem" && stream == "exploring"')
                          .defaultOrdering([{field: '_updatedAt', direction: 'desc'}])
                          .initialValueTemplates([
                            S.initialValueTemplateItem('planningItem-exploring'),
                          ]),
                      ),
                    S.listItem()
                      .title('Pause & Ponder')
                      .id('planning-pp')
                      .child(
                        S.documentList()
                          .title('Pause & Ponder')
                          .filter('_type == "planningItem" && stream == "pp"')
                          .defaultOrdering([{field: 'targetDate', direction: 'asc'}])
                          .initialValueTemplates([
                            S.initialValueTemplateItem('planningItem-pp'),
                          ]),
                      ),
                    S.listItem()
                      .title('Journeys')
                      .id('planning-journeys')
                      .child(
                        S.list()
                          .title('Journeys')
                          .items([
                            S.listItem()
                              .title('Three Ways')
                              .id('planning-journey-three-ways')
                              .child(
                                S.documentList()
                                  .title('Three Ways')
                                  .filter(
                                    '_type == "planningItem" && stream == "journey" && journeyName == "three-ways"',
                                  )
                                  .defaultOrdering([{field: 'workingTitle', direction: 'asc'}])
                                  .initialValueTemplates([
                                    S.initialValueTemplateItem('planningItem-journey-three-ways'),
                                  ]),
                              ),
                            S.listItem()
                              .title('Out of the Silent Planet')
                              .id('planning-journey-ootsp')
                              .child(
                                S.documentList()
                                  .title('Out of the Silent Planet')
                                  .filter(
                                    '_type == "planningItem" && stream == "journey" && journeyName == "ootsp"',
                                  )
                                  .defaultOrdering([{field: 'workingTitle', direction: 'asc'}])
                                  .initialValueTemplates([
                                    S.initialValueTemplateItem('planningItem-journey-ootsp'),
                                  ]),
                              ),
                            S.listItem()
                              .title('Perelandra')
                              .id('planning-journey-perelandra')
                              .child(
                                S.documentList()
                                  .title('Perelandra')
                                  .filter(
                                    '_type == "planningItem" && stream == "journey" && journeyName == "perelandra"',
                                  )
                                  .defaultOrdering([{field: 'workingTitle', direction: 'asc'}])
                                  .initialValueTemplates([
                                    S.initialValueTemplateItem('planningItem-journey-perelandra'),
                                  ]),
                              ),
                            S.listItem()
                              .title('That Hideous Strength')
                              .id('planning-journey-ths')
                              .child(
                                S.documentList()
                                  .title('That Hideous Strength')
                                  .filter(
                                    '_type == "planningItem" && stream == "journey" && journeyName == "ths"',
                                  )
                                  .defaultOrdering([{field: 'workingTitle', direction: 'asc'}])
                                  .initialValueTemplates([
                                    S.initialValueTemplateItem('planningItem-journey-ths'),
                                  ]),
                              ),
                            S.divider(),
                            // TODO (next Sanity change): remove this Unassigned bucket.
                            // It existed during the June 17-18 journeyArcKey → journeyName
                            // migration to catch drift. Verified empty June 18; can be deleted
                            // when this file is next touched. Sheri's call June 18.
                            S.listItem()
                              .title('Unassigned (no journey name)')
                              .id('planning-journey-unassigned')
                              .child(
                                S.documentList()
                                  .title('Unassigned journey items')
                                  .filter(
                                    '_type == "planningItem" && stream == "journey" && !defined(journeyName)',
                                  ),
                              ),
                          ]),
                      ),
                    S.listItem()
                      .title('Companion Journeys')
                      .id('planning-companion')
                      .child(
                        S.documentList()
                          .title('Companion Journeys')
                          .filter('_type == "planningItem" && stream == "companion"')
                          .defaultOrdering([{field: 'targetDate', direction: 'asc'}])
                          .initialValueTemplates([
                            S.initialValueTemplateItem('planningItem-companion'),
                          ]),
                      ),
                    S.listItem()
                      .title('Tradition Reflections')
                      .id('planning-tr')
                      .child(
                        S.documentList()
                          .title('Tradition Reflections')
                          .filter('_type == "planningItem" && stream == "tr"')
                          .defaultOrdering([{field: 'targetDate', direction: 'asc'}])
                          .initialValueTemplates([
                            S.initialValueTemplateItem('planningItem-tr'),
                          ]),
                      ),
                    S.divider(),
                    S.listItem()
                      .title('All planning items')
                      .id('planning-all')
                      .child(
                        S.documentList()
                          .title('All planning items')
                          .filter('_type == "planningItem"')
                          .defaultOrdering([{field: 'targetDate', direction: 'asc'}]),
                      ),
                  ]),
              ),

            S.divider(),

            // ── Standard document types (auto-generated, minus internal + customized types) ──
            ...S.documentTypeListItems().filter(
              (listItem) => !['episode', 'planningItem'].includes(listItem.getId() ?? ''),
            ),
          ]),
    }),
    // Presentation tool: side-by-side live preview of the app while editing.
    // The iframe opens at the per-document app route returned by `locations`
    // below. `previewMode.enable` is wired to /api/draft, which validates the
    // Sanity-provisioned secret via @sanity/preview-url-secret and toggles
    // Next.js draftMode. The handler reads server-only SANITY_TOKEN (never
    // NEXT_PUBLIC_*, which would inline the token into the client bundle).
    // All draftMode-aware routes (journey, journeyDay, contentItem, P&P)
    // read drafts via lib/sanity.ts `previewClient`.
    presentationTool({
      title: 'Preview',
      previewUrl: {
        origin: APP_PREVIEW_URL,
        // Tells Presentation which route on the app enables Next.js
        // draftMode. Presentation calls this with a preview-secret query
        // param; app/api/draft/route.ts validates it via
        // @sanity/preview-url-secret and sets the draftMode cookie. Pages
        // read (await draftMode()).isEnabled to swap between published
        // and preview Sanity clients. Wired April 24, 2026.
        previewMode: {
          enable: '/api/draft',
        },
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
    // Document templates pre-populate fields when the + button is clicked
    // from a specific Content Planning sidebar folder. Without these, clicking
    // + in the Three Ways folder would create a planningItem with stream blank
    // and journeyName blank, landing it in the Unassigned bucket. With these,
    // the new item arrives with the right fields pre-set and shows up in the
    // intended folder immediately.
    templates: (prev) => [
      ...prev,
      {
        id: 'planningItem-exploring',
        title: 'Exploring (surface TBD)',
        schemaType: 'planningItem',
        value: {stream: 'exploring', status: 'idea'},
      },
      {
        id: 'planningItem-pp',
        title: 'Pause & Ponder planning item',
        schemaType: 'planningItem',
        value: {stream: 'pp', status: 'idea'},
      },
      {
        id: 'planningItem-journey-three-ways',
        title: 'Three Ways planning item',
        schemaType: 'planningItem',
        value: {stream: 'journey', journeyName: 'three-ways', status: 'idea'},
      },
      {
        id: 'planningItem-journey-ootsp',
        title: 'Out of the Silent Planet planning item',
        schemaType: 'planningItem',
        value: {stream: 'journey', journeyName: 'ootsp', status: 'idea'},
      },
      {
        id: 'planningItem-journey-perelandra',
        title: 'Perelandra planning item',
        schemaType: 'planningItem',
        value: {stream: 'journey', journeyName: 'perelandra', status: 'idea'},
      },
      {
        id: 'planningItem-journey-ths',
        title: 'That Hideous Strength planning item',
        schemaType: 'planningItem',
        value: {stream: 'journey', journeyName: 'ths', status: 'idea'},
      },
      {
        id: 'planningItem-companion',
        title: 'Companion Journey planning item',
        schemaType: 'planningItem',
        value: {stream: 'companion', status: 'idea'},
      },
      {
        id: 'planningItem-tr',
        title: 'Tradition Reflection planning item',
        schemaType: 'planningItem',
        value: {stream: 'tr', status: 'idea'},
      },
    ],
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
