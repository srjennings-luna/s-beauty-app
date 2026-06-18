import {defineField, defineType} from 'sanity'

/**
 * planningItem — Editorial content-planning surface.
 *
 * Where Sheri (and any future content collaborator) adds ideas, drafts,
 * research leads, and action items for upcoming P&P days, Journeys,
 * companion arcs, or Tradition Reflections.
 *
 * Distinct from contentItem / dailyPrompt which hold *published* content.
 * planningItem is the pre-production layer: idea → research → draft →
 * review → seed (at which point the actual contentItem + dailyPrompt
 * get created and this planningItem is moved to "seeded" then "archived").
 *
 * The /dashboard/content-plan page (Tier 2, to be built) reads these
 * for calendar + filter views.
 */
export default defineType({
  name: 'planningItem',
  title: 'Content Planning',
  type: 'document',
  fields: [
    defineField({
      name: 'workingTitle',
      title: 'Working Title',
      type: 'string',
      description:
        'Short label for this idea — e.g. "Josemaría Escrivá — Spanish embassy 9 months" or "Hildegard Day 2 (deeper)". Refine later.',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'stream',
      title: 'Stream',
      type: 'string',
      description: 'Which content surface this planning item is for.',
      options: {
        list: [
          {title: 'Pause & Ponder (P&P)', value: 'pp'},
          {title: 'Journey', value: 'journey'},
          {title: 'Companion Journey', value: 'companion'},
          {title: 'Tradition Reflection', value: 'tr'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
      initialValue: 'pp',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      description:
        'Move items left-to-right as they progress. Archived items are kept for history but hidden from the active plan view.',
      options: {
        list: [
          {title: '1 · Idea', value: 'idea'},
          {title: '2 · Researching', value: 'researching'},
          {title: '3 · Drafted', value: 'drafted'},
          {title: '4 · Reviewed', value: 'reviewed'},
          {title: '5 · Seeded (live in Sanity)', value: 'seeded'},
          {title: '6 · Archived', value: 'archived'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
      initialValue: 'idea',
    }),
    defineField({
      name: 'journeyArcKey',
      title: 'Journey Arc Key',
      type: 'string',
      description:
        'Which journey arc this planning item belongs to. Used by the Content Planning sidebar to group journey-stream items. Examples: "Three Ways", "OOTSP", "Perelandra", "THS". Only set when Stream = Journey.',
      options: {
        list: [
          {title: 'Three Ways', value: 'three-ways'},
          {title: 'Out of the Silent Planet', value: 'ootsp'},
          {title: 'Perelandra', value: 'perelandra'},
          {title: 'That Hideous Strength', value: 'ths'},
        ],
      },
      hidden: ({parent}) => parent?.stream !== 'journey',
    }),
    defineField({
      name: 'contentType',
      title: 'Content Type',
      type: 'string',
      description:
        'What kind of content this will be. Matches the 9 contentItem.contentType values for compatibility with the eventual seed.',
      options: {
        list: [
          {title: 'Sacred Art', value: 'sacred-art'},
          {title: 'Photography', value: 'photography'},
          {title: 'Thinker', value: 'thinker'},
          {title: 'Literature', value: 'literature'},
          {title: 'Music', value: 'music'},
          {title: 'Food & Wine', value: 'food-wine'},
          {title: 'Landscape', value: 'landscape'},
          {title: 'Watch & Listen', value: 'watch-listen'},
          {title: 'Math & Science', value: 'math-science'},
        ],
      },
    }),
    defineField({
      name: 'targetDate',
      title: 'Target Date',
      type: 'date',
      description:
        'The intended launch date for this content (the date the P&P appears, or the journey starts, etc.). Leave blank if not yet scheduled.',
      options: {dateFormat: 'YYYY-MM-DD'},
    }),
    defineField({
      name: 'targetMonth',
      title: 'Target Month (fallback)',
      type: 'string',
      description:
        'Use when a specific date is not yet decided but the month is known. e.g. "July 2026". Ignored if Target Date is set.',
    }),
    defineField({
      name: 'themes',
      title: 'Themes',
      type: 'array',
      description: 'Optional theme tags (Light, Silence, Suffering & Beauty, etc.). Helps with calendar grouping.',
      of: [{type: 'reference', to: [{type: 'theme'}]}],
    }),
    defineField({
      name: 'relatedJourney',
      title: 'Related Journey',
      type: 'reference',
      to: [{type: 'journey'}],
      description:
        'If this P&P is meant to warm users up for a specific Journey (or this Journey idea relates to existing material), link it here.',
    }),
    defineField({
      name: 'relatedPPs',
      title: 'Related Pause & Ponder days',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'dailyPrompt'}]}],
      description:
        'Existing P&P days that this planning item relates to (e.g., a Journey idea whose P&P teasers are already published).',
    }),
    defineField({
      name: 'feastDayAnchor',
      title: 'Feast Day Anchor',
      type: 'string',
      description:
        'If this content is tied to a specific feast day, name it here. e.g. "John the Baptist — June 24", "Peter & Paul — June 29", "Benedict of Nursia — July 11". Used by the calendar view to mark feast-day-anchored slots.',
    }),
    defineField({
      name: 'subjectNotes',
      title: 'Subject Notes (the lesser-known angle)',
      type: 'text',
      rows: 6,
      description:
        'What is the content about? What is the surprising fact, the dinner-table-test moment, the angle that earns the slot? Capture the editorial idea here before any drafting.',
    }),
    defineField({
      name: 'sourceMaterial',
      title: 'Source Material (citations)',
      type: 'text',
      rows: 4,
      description:
        'Citations for verification: book editions, page numbers, Lectio quote provenance. For clickable research leads (podcasts, articles, Pinterest, source artwork), use Inspiration Links below.',
    }),
    defineField({
      name: 'inspirationLinks',
      title: 'Inspiration Links',
      type: 'array',
      description:
        'Research leads and source material that lives on the web: podcast episodes, articles, YouTube/video, Pinterest pins, candidate artwork pages. Each link has a kind, optional label, and a note for why it matters or where in the source to look.',
      of: [
        defineField({
          name: 'inspirationLink',
          title: 'Inspiration Link',
          type: 'object',
          fields: [
            {
              name: 'url',
              title: 'URL',
              type: 'url',
              description: 'The full URL. Required.',
              validation: (Rule) =>
                Rule.required().uri({scheme: ['http', 'https']}),
            },
            {
              name: 'kind',
              title: 'Kind',
              type: 'string',
              options: {
                list: [
                  {title: 'Artwork', value: 'artwork'},
                  {title: 'Music', value: 'music'},
                  {title: 'Podcast', value: 'podcast'},
                  {title: 'Video', value: 'video'},
                  {title: 'Article', value: 'article'},
                  {title: 'Book', value: 'book'},
                  {title: 'Pinterest', value: 'pinterest'},
                  {title: 'Other', value: 'other'},
                ],
                layout: 'radio',
              },
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'label',
              title: 'Label',
              type: 'string',
              description:
                'Short display name. e.g. "Pints With Aquinas Ep 412 — John vs the Gnostics".',
              validation: (Rule) => Rule.max(100),
            },
            {
              name: 'note',
              title: 'Note',
              type: 'text',
              rows: 3,
              description:
                'Why this matters, timestamp ("23:00 onward"), the snippet that caught you, what to come back to.',
              validation: (Rule) => Rule.max(500),
            },
          ],
          preview: {
            select: {url: 'url', label: 'label', kind: 'kind'},
            prepare({url, label, kind}: {url?: string; label?: string; kind?: string}) {
              const kindTag = kind ? kind.toUpperCase() : '?'
              const display =
                label || (url ? url.replace(/^https?:\/\//, '').slice(0, 60) : '(no url)')
              return {title: `[${kindTag}] ${display}`}
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'sheriComments',
      title: 'Sheri Comments (running notes)',
      type: 'text',
      rows: 6,
      description:
        'Your running editorial notes. Reactions to drafts, questions for me, decisions, redirects. Date your entries (e.g. "Jun 17 — pivot to John of Damascus angle").',
    }),
    defineField({
      name: 'claudeNotes',
      title: 'Claude Notes (research + draft material)',
      type: 'text',
      rows: 8,
      description:
        'My research findings, draft hooks, draft contexts, fact-check notes. I write here when working on the item; you review and respond in Sheri Comments.',
    }),
    defineField({
      name: 'actionItems',
      title: 'Action Items',
      type: 'array',
      description:
        'Concrete next steps. Each item names an action, an owner (Sheri or Claude), a status, and an optional due date.',
      of: [
        defineField({
          name: 'actionItem',
          title: 'Action Item',
          type: 'object',
          fields: [
            {
              name: 'item',
              title: 'Action',
              type: 'string',
              description: 'What needs to happen. Be specific.',
              validation: (Rule) => Rule.required().max(200),
            },
            {
              name: 'owner',
              title: 'Owner',
              type: 'string',
              options: {
                list: [
                  {title: 'Sheri', value: 'sheri'},
                  {title: 'Claude', value: 'claude'},
                  {title: 'Cowork', value: 'cowork'},
                ],
                layout: 'radio',
              },
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'status',
              title: 'Status',
              type: 'string',
              options: {
                list: [
                  {title: 'Pending', value: 'pending'},
                  {title: 'In Progress', value: 'in_progress'},
                  {title: 'Done', value: 'done'},
                  {title: 'Blocked', value: 'blocked'},
                ],
                layout: 'radio',
              },
              initialValue: 'pending',
            },
            {
              name: 'dueDate',
              title: 'Due Date (optional)',
              type: 'date',
              options: {dateFormat: 'YYYY-MM-DD'},
            },
          ],
          preview: {
            select: {item: 'item', owner: 'owner', status: 'status'},
            prepare({item, owner, status}: {item?: string; owner?: string; status?: string}) {
              const ownerTag = owner ? owner.toUpperCase() : '?'
              const statusTag = status === 'done' ? '✓' : status === 'in_progress' ? '⟳' : status === 'blocked' ? '⊘' : '○'
              return {title: `${statusTag} [${ownerTag}] ${item || '(no action)'}`}
            },
          },
        }),
      ],
    }),
  ],
  orderings: [
    {
      title: 'Target Date (soonest first)',
      name: 'targetDateAsc',
      by: [{field: 'targetDate', direction: 'asc'}],
    },
    {
      title: 'Status (least progressed first)',
      name: 'statusAsc',
      by: [{field: 'status', direction: 'asc'}],
    },
    {
      title: 'Stream, then date',
      name: 'streamThenDate',
      by: [
        {field: 'stream', direction: 'asc'},
        {field: 'targetDate', direction: 'asc'},
      ],
    },
  ],
  preview: {
    select: {
      workingTitle: 'workingTitle',
      stream: 'stream',
      status: 'status',
      contentType: 'contentType',
      targetDate: 'targetDate',
      targetMonth: 'targetMonth',
    },
    prepare({
      workingTitle,
      stream,
      status,
      contentType,
      targetDate,
      targetMonth,
    }: {
      workingTitle?: string
      stream?: string
      status?: string
      contentType?: string
      targetDate?: string
      targetMonth?: string
    }) {
      const streamTag = (stream || '?').toUpperCase()
      const statusTag = status || 'idea'
      const when = targetDate || targetMonth || 'unscheduled'
      const type = contentType || 'no-type'
      return {
        title: workingTitle || '(untitled)',
        subtitle: `${streamTag} · ${statusTag} · ${type} · ${when}`,
      }
    },
  },
})
