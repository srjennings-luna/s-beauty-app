import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'journey',
  title: 'Journey',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Journey title. e.g., "Light"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-safe. Source: title.',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'theme',
      title: 'Theme',
      type: 'reference',
      to: [{type: 'theme'}],
      description: 'Which theme this Journey explores',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'journeyType',
      title: 'Journey Type',
      type: 'string',
      description:
        'Controls which section this journey appears in on the Journeys page. Standard goes in "Journeys"; Intro goes in "Where to Begin" with a START HERE badge; Companion goes in "Episode Companions" with companion card treatment.',
      options: {
        list: [
          {title: 'Standard', value: 'standard'},
          {title: 'Intro (Where to Begin)', value: 'intro'},
          {title: 'Companion (Episode Companions)', value: 'companion'},
        ],
      },
      initialValue: 'standard',
    }),
    defineField({
      name: 'showName',
      title: 'Show Name',
      type: 'string',
      description:
        'Companion journeys only. The name of the show or series this journey pairs with. Example: "Seeking Beauty". Appears in the dark teal strip at the top of the companion card.',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      hidden: ({document}: {document?: any}) => document?.journeyType !== 'companion',
    }),
    defineField({
      name: 'episodeLabel',
      title: 'Episode Label',
      type: 'string',
      description:
        'Companion journeys only. The episode identifier shown on the companion card strip. Example: "Episode 1".',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      hidden: ({document}: {document?: any}) => document?.journeyType !== 'companion',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      description: 'What the seeker will explore over 7 days. Shown on Journey card.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      description: 'Cover image for Journey card. High-res.',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'estimatedMinutesPerDay',
      title: 'Estimated Minutes Per Day',
      type: 'number',
      description: 'Default: 10. Shown as "~10 min/day".',
      initialValue: 10,
    }),
    defineField({
      name: 'isPublished',
      title: 'Published',
      type: 'boolean',
      description: 'Toggle on when all 7 days are ready.',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Display order in Journey list.',
    }),
    defineField({
      name: 'days',
      title: 'Days',
      type: 'array',
      description:
        'References to journeyDay documents. Add existing journeyDay docs or create new ones. Each day follows: Open → Encounter → Reflect → Connect → Go Deeper.',
      of: [{type: 'reference', to: [{type: 'journeyDay'}]}],
      validation: (Rule) => Rule.required().min(1).max(9),
    }),
    defineField({
      name: 'totalDays',
      title: 'Total Days (full arc)',
      type: 'number',
      description: 'The intended total number of days for this journey. Used for the progress bar and day count even before all days are built. Leave blank to auto-calculate from built + planned days.',
      validation: (Rule) => Rule.min(1).max(365),
    }),
    defineField({
      name: 'plannedDays',
      title: 'Planned Days (coming soon)',
      type: 'array',
      description: 'Day numbers and titles for days not yet built in Sanity. These appear greyed out and non-tappable in the app, so users can see the full journey arc before all days are published.',
      of: [
        {
          type: 'object',
          name: 'plannedDay',
          title: 'Planned Day',
          fields: [
            {
              name: 'dayNumber',
              title: 'Day Number',
              type: 'number',
              description: 'Must match the intended day slot (e.g. 2 for Day 2).',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              validation: (Rule: any) => Rule.required().min(1).max(9),
            },
            {
              name: 'dayTitle',
              title: 'Day Title',
              type: 'string',
              description: 'The title users will see in the greyed-out row.',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              validation: (Rule: any) => Rule.required(),
            },
          ],
          preview: {
            select: {dayNumber: 'dayNumber', dayTitle: 'dayTitle'},
            prepare({dayNumber, dayTitle}: {dayNumber?: number; dayTitle?: string}) {
              return {title: `Day ${dayNumber}: ${dayTitle || 'Untitled'} (planned)`}
            },
          },
        },
      ],
    }),
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
    {
      title: 'Title A–Z',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      isPublished: 'isPublished',
      media: 'heroImage',
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prepare({title, isPublished, media}: {title?: string; isPublished?: boolean; media?: any}) {
      return {
        title: title || 'Untitled Journey',
        subtitle: isPublished ? '✓ Published' : '○ Draft',
        media,
      }
    },
  },
})
