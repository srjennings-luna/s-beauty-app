import {defineField, defineType} from 'sanity'

/**
 * Tradition reflections (Church Fathers, Saints, Popes) for "Go deeper" on the prayer/meditation page.
 * Theme: beauty → truth → God. Summaries are shown after the Visio Divina flow.
 */
export default defineType({
  name: 'traditionReflection',
  title: 'Tradition Reflection (Church Fathers, Saints & Popes)',
  type: 'document',
  fields: [
    defineField({
      name: 'authorType',
      title: 'Author type',
      type: 'string',
      description: 'Category of the source',
      options: {
        list: [
          {title: 'Church Father', value: 'church-father'},
          {title: 'Saint', value: 'saint'},
          {title: 'Pope', value: 'pope'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
      initialValue: 'church-father',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Short label, e.g. "Beauty as a path to God"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      description: '2–4 sentences in plain language (the reflection, not necessarily a direct quote)',
      validation: (Rule) => Rule.required(),
      rows: 4,
    }),
    defineField({
      name: 'shortQuote',
      title: 'Short quote (optional)',
      type: 'string',
      description: 'One memorable line to show above the summary, if desired',
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      description: 'Attribution, e.g. "St. Augustine, On True Religion" or "Benedict XVI, Address to Artists"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'theme',
      title: 'Theme',
      type: 'string',
      description: 'Used to filter which reflections appear together (e.g. beauty, truth, contemplation)',
      options: {
        list: [
          {title: 'Beauty', value: 'beauty'},
          {title: 'Truth', value: 'truth'},
          {title: 'Beauty and truth', value: 'beauty-and-truth'},
          {title: 'Contemplation', value: 'contemplation'},
          {title: 'Encounter with God', value: 'encounter'},
          {title: 'Action / living it out', value: 'action'},
        ],
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Display order',
      type: 'number',
      description: 'Lower numbers appear first when showing multiple reflections',
      initialValue: 0,
    }),
    defineField({
      name: 'era',
      title: 'Era (optional)',
      type: 'string',
      description: 'e.g. "Early Church", "Medieval", "Modern" – for future use or labels',
      options: {
        list: [
          {title: 'Early Church / Fathers', value: 'fathers'},
          {title: 'Medieval', value: 'medieval'},
          {title: 'Modern', value: 'modern'},
        ],
        layout: 'dropdown',
      },
    }),
  ],
  orderings: [
    {title: 'Display order', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]},
    {title: 'Author type', name: 'authorTypeAsc', by: [{field: 'authorType', direction: 'asc'}]},
    {title: 'Title A–Z', name: 'titleAsc', by: [{field: 'title', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'title', source: 'source', authorType: 'authorType'},
    prepare({title, source, authorType}: {title?: string; source?: string; authorType?: string}) {
      const labels: Record<string, string> = { 'church-father': 'Church Father', 'saint': 'Saint', 'pope': 'Pope' }
      const typeLabel = (authorType && labels[authorType]) || ''
      return {
        title: title || 'Untitled',
        subtitle: [typeLabel, source].filter(Boolean).join(' · '),
      }
    },
  },
})
