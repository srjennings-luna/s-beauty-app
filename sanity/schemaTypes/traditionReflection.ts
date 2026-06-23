import {defineField, defineType} from 'sanity'

/**
 * traditionReflection, the "Go Deeper" cards on the Visio Divina Pray step.
 *
 * Each reflection is a short voice from the tradition (Church Father, Saint,
 * Pope, Doctor of the Church, Theologian, Mystic, or Philosopher) shown in
 * a carousel of cards after the user has been with the artwork for a moment.
 *
 * Theme arc, beauty to truth to God. Voices that point the same way.
 *
 * Field order matches the render order on the Visio Divina Go Deeper card:
 * authorType (category tag) at top, then title, optional shortQuote rendered
 * above the summary, summary as the main body, source as the attribution,
 * then audio + metadata. June 22, 2026 label and description cleanup.
 */
export default defineType({
  name: 'traditionReflection',
  title: 'Tradition Reflection (Church Fathers, Saints & Popes)',
  type: 'document',
  fields: [
    defineField({
      name: 'authorType',
      title: 'Author Type (Visio Divina Go Deeper, category tag)',
      type: 'string',
      description:
        'Renders as the category tag near the title on the Visio Divina Go Deeper card. The category of the voice. Drives the small metadata tag the user sees. Also used by the dashboard for source-concentration analysis. Required.',
      options: {
        list: [
          {title: 'Church Father', value: 'church-father'},
          {title: 'Saint', value: 'saint'},
          {title: 'Pope', value: 'pope'},
          {title: 'Doctor of the Church', value: 'doctor'},
          {title: 'Theologian', value: 'theologian'},
          {title: 'Mystic', value: 'mystic'},
          {title: 'Philosopher', value: 'philosopher'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
      initialValue: 'church-father',
    }),
    defineField({
      name: 'title',
      title: 'Title (Visio Divina Go Deeper, card heading)',
      type: 'string',
      description:
        'Renders as the bold title at the top of the Visio Divina Go Deeper card. A short editorial heading naming the angle, e.g. "Beauty as a path to God" or "The greening power." Not the source attribution (that lives in Source below). Required.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'shortQuote',
      title: 'Short Quote (Visio Divina Go Deeper, italic gold-bordered line above summary)',
      type: 'string',
      description:
        'Optional. Renders above the summary on the Visio Divina Go Deeper card, in italic Cormorant Garamond with a thin gold left border. One memorable line that lets the source speak in their own words. Keep short, one breath. If the reflection has no quotable line, leave blank and the summary takes the lead.',
    }),
    defineField({
      name: 'summary',
      title: 'Summary (Visio Divina Go Deeper, main body)',
      type: 'text',
      description:
        'Renders as the main body of the Visio Divina Go Deeper card, below the shortQuote (if present). 2 to 4 sentences in plain Lewis-register language paraphrasing or expanding the source\'s thought. Not necessarily a direct quote (use shortQuote for that). Per the Go Deeper standard in CLAUDE.md, the summary must add genuinely NEW content not already in the linked piece\'s encounterNote (Look Closer). Required.',
      validation: (Rule) => Rule.required(),
      rows: 4,
    }),
    defineField({
      name: 'source',
      title: 'Source (Visio Divina Go Deeper, attribution below summary)',
      type: 'string',
      description:
        'Renders below the summary on the Visio Divina Go Deeper card as the attribution line. Author + work, e.g. "St. Augustine, On True Religion" or "Benedict XVI, Address to Artists". Required.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'reflectionAudio',
      title: 'Reflection Audio (Visio Divina Go Deeper, narration button)',
      type: 'file',
      description:
        'Optional MP3 narration of the full reflection. Adds a small listen button on the expanded Go Deeper card.',
      options: {accept: 'audio/*'},
    }),
    defineField({
      name: 'themes',
      title: 'Themes (filter + matching)',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'theme'}]}],
      description:
        'INTERNAL. Which Contueri themes this reflection connects to. Drives the auto-match logic when a contentItem has no explicit traditionReflections array (the carousel falls back to theme-matched reflections). Not rendered as user-visible tags.',
    }),
    defineField({
      name: 'era',
      title: 'Era (filter + dashboard analytics)',
      type: 'string',
      description:
        'INTERNAL. The historical era of the source. Used by the dashboard for source-distribution analysis (so the corpus does not over-cluster in one era). Not rendered as user-visible text on the Go Deeper card. Optional but recommended for analytics.',
      options: {
        list: [
          {title: 'Ancient', value: 'ancient'},
          {title: 'Early Church / Fathers', value: 'fathers'},
          {title: 'Medieval', value: 'medieval'},
          {title: 'Modern', value: 'modern'},
        ],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'order',
      title: 'Display Order (Visio Divina carousel sort)',
      type: 'number',
      description:
        'INTERNAL sort order. When multiple reflections are linked to the same contentItem, lower numbers appear first in the Go Deeper carousel. Default 0 means alphabetical fallback.',
      initialValue: 0,
    }),
    defineField({
      name: 'theme',
      title: 'Theme (legacy, use Themes above)',
      type: 'string',
      description: 'LEGACY field, kept for migration only. Use the Themes reference array above for any new entries.',
      hidden: true,
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
    }),
  ],
  orderings: [
    {title: 'Display order', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]},
    {title: 'Author type', name: 'authorTypeAsc', by: [{field: 'authorType', direction: 'asc'}]},
    {title: 'Title A-Z', name: 'titleAsc', by: [{field: 'title', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'title', source: 'source', authorType: 'authorType'},
    prepare({title, source, authorType}: {title?: string; source?: string; authorType?: string}) {
      const labels: Record<string, string> = { 'church-father': 'Church Father', 'saint': 'Saint', 'pope': 'Pope', 'doctor': 'Doctor of the Church', 'theologian': 'Theologian', 'mystic': 'Mystic', 'philosopher': 'Philosopher' }
      const typeLabel = (authorType && labels[authorType]) || ''
      return {
        title: title || 'Untitled',
        subtitle: [typeLabel, source].filter(Boolean).join(' · '),
      }
    },
  },
})
