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
      description: 'Exactly 7 days. Each follows: Open → Encounter → Reflect → Connect → Go Deeper.',
      of: [
        {
          type: 'object',
          name: 'journeyDay',
          title: 'Journey Day',
          fields: [
            {
              name: 'dayNumber',
              title: 'Day Number',
              type: 'number',
              description: '1–7',
              validation: (Rule) => Rule.required().min(1).max(7),
            },
            {
              name: 'dayTitle',
              title: 'Day Title',
              type: 'string',
              description: 'e.g., "The First Light" or "What Darkness Teaches"',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'openImage',
              title: 'Opening Image',
              type: 'image',
              description: 'ALWAYS required. The visual anchor for the day. Min 1200px.',
              options: {hotspot: true},
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'openText',
              title: 'Opening Text',
              type: 'text',
              rows: 3,
              description: 'Brief opening text (~1 min read). Sets the day\'s frame.',
            },
            {
              name: 'encounterContent',
              title: 'Encounter Content',
              type: 'reference',
              to: [{type: 'contentItem'}],
              description: 'The primary content for this day (3–5 min encounter).',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'encounterGuidance',
              title: 'Encounter Guidance',
              type: 'text',
              rows: 3,
              description: 'Optional editorial guidance. e.g., "Listen with your eyes closed for the first minute."',
            },
            {
              name: 'reflectQuestions',
              title: 'Reflection Questions',
              type: 'array',
              of: [{type: 'string'}],
              description: 'Journey-specific questions for this day (1–2).',
              validation: (Rule) => Rule.required().min(1).max(2),
            },
            {
              name: 'connectThread',
              title: 'Connect Thread',
              type: 'string',
              description: 'One sentence threading to tomorrow. e.g., "Tomorrow: what happens when the light goes away?"',
            },
            {
              name: 'goDeeper',
              title: 'Go Deeper',
              type: 'array',
              of: [{type: 'reference', to: [{type: 'traditionReflection'}]}],
              description: 'Optional tradition reflections for this day.',
            },
          ],
          preview: {
            select: {
              dayNumber: 'dayNumber',
              dayTitle: 'dayTitle',
              media: 'openImage',
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            prepare({dayNumber, dayTitle, media}: {dayNumber?: number; dayTitle?: string; media?: any}) {
              return {
                title: `Day ${dayNumber}: ${dayTitle || 'Untitled'}`,
                media,
              }
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(7).max(7),
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
