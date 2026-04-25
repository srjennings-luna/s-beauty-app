import {defineField, defineType} from 'sanity'

/**
 * journeyDay — promoted to a standalone document (April 2026, Schema Design Brief R5).
 * Previously an inline object inside journey.days[]. Migration to docs enables
 * cross-journey day reuse, independent querying, stable IDs for deep links, and
 * per-day analytics.
 *
 * Fields preserved from the previous inline definition plus the `journey`
 * back-reference (required). `reflectQuestions` was renamed to
 * `reflectionQuestions` (R6, April 24 2026) to match contentItem and remove
 * the singular/plural typo hazard. Task 3 (April 24) added
 * auditio.composerArtist, auditio.workTitle, and auditio.genre for
 * content-repeat analysis.
 */
export default defineType({
  name: 'journeyDay',
  title: 'Journey Day',
  type: 'document',
  fields: [
    defineField({
      name: 'journey',
      title: 'Journey',
      type: 'reference',
      to: [{type: 'journey'}],
      description: 'The journey this day belongs to.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'dayNumber',
      title: 'Day Number',
      type: 'number',
      description: '1–9',
      validation: (Rule) => Rule.required().min(1).max(9),
    }),
    defineField({
      name: 'dayTitle',
      title: 'Day Title',
      type: 'string',
      description: 'e.g., "The First Light" or "What Darkness Teaches"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'openImage',
      title: 'Opening Image',
      type: 'image',
      description: 'ALWAYS required. The visual anchor for the day. Min 1200px.',
      options: {hotspot: true},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'openText',
      title: 'Opening Text',
      type: 'text',
      rows: 3,
      description: 'Brief opening text (~1 min read). Sets the day\'s frame.',
    }),
    defineField({
      name: 'openTextAudio',
      title: 'Opening Text — Narration Audio',
      type: 'file',
      description: 'Optional MP3 narration of the opening text. Adds a small listen button.',
      options: {accept: 'audio/*'},
    }),
    defineField({
      name: 'encounterContent',
      title: 'Encounter Content',
      type: 'reference',
      to: [{type: 'contentItem'}],
      description: 'The primary content for this day (3–5 min encounter).',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'encounterGuidance',
      title: 'Encounter Guidance',
      type: 'text',
      rows: 3,
      description: 'Optional editorial guidance. e.g., "Listen with your eyes closed for the first minute."',
    }),
    defineField({
      name: 'encounterNote',
      title: 'Encounter Note (Look Closer)',
      type: 'text',
      rows: 5,
      description: 'Interpretive layer specific to this day\'s content type. Sacred art → symbolism/iconography. Literature → close reading. Music → listening guide. Landscape → ecological/geological insight. Thinkers → intellectual context. Pattern & Proof → plain-language explanation. Watch & Listen → viewing guide. Food & Wine → craft tradition.',
    }),
    defineField({
      name: 'encounterNoteAudio',
      title: 'Encounter Note — Narration Audio',
      type: 'file',
      description: 'Optional MP3 narration of the Look Closer text. Adds a Listen button at the top of the Look Closer section.',
      options: {accept: 'audio/*'},
    }),
    defineField({
      name: 'auditio',
      title: 'Auditio (Audio Suggestion)',
      type: 'reference',
      to: [{type: 'auditio'}],
      description: 'Optional audio pairing for this day. Create the Auditio document first, then reference it here.',
    }),
    defineField({
      name: 'lectio',
      title: 'Lectio',
      type: 'object',
      description: 'Optional philosophy + scripture pairing for this day. Connects the encounter to broader intellectual and spiritual tradition.',
      fields: [
        {
          name: 'philosophyQuote',
          title: 'Philosophy Quote',
          type: 'text',
          rows: 3,
          description: 'A quote from a philosopher, thinker, or writer (may be secular). e.g., Plato, Bergson, Socrates.',
        },
        {
          name: 'philosophySource',
          title: 'Philosophy Source',
          type: 'string',
          description: 'Full attribution. e.g., "Plato, Republic (Allegory of the Cave)"',
        },
        {
          name: 'scriptureVerse',
          title: 'Scripture Verse',
          type: 'text',
          rows: 3,
          description: 'Scripture pairing for this day.',
        },
        {
          name: 'scriptureReference',
          title: 'Scripture Reference',
          type: 'string',
          description: 'e.g., "1 Corinthians 13:12"',
        },
        {
          name: 'connectionNote',
          title: 'Connection Note',
          type: 'text',
          rows: 3,
          description: 'Why this pairing works. How the philosophy and scripture echo each other and connect to the day\'s encounter.',
        },
      ],
    }),
    defineField({
      name: 'reflectionQuestions',
      title: 'Reflection Questions',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Journey-specific questions for this day (1–2).',
      validation: (Rule) => Rule.required().min(1).max(2),
    }),
    defineField({
      name: 'reflectionQuestionsAudio',
      title: 'Reflection Questions — Narration Audio',
      type: 'file',
      description: 'Optional MP3 narration of the reflection questions. Adds a Listen button on the Reflect step.',
      options: {accept: 'audio/*'},
    }),
    defineField({
      name: 'connectThread',
      title: 'Connect Thread',
      type: 'string',
      description: 'One sentence threading to tomorrow. e.g., "Tomorrow: what happens when the light goes away?"',
    }),
    defineField({
      name: 'goDeeper',
      title: 'Go Deeper',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'traditionReflection'}]}],
      description: 'Optional tradition reflections for this day.',
    }),
  ],
  orderings: [
    {
      title: 'Day Number',
      name: 'dayNumberAsc',
      by: [{field: 'dayNumber', direction: 'asc'}],
    },
    {
      title: 'Journey, then Day',
      name: 'journeyDayAsc',
      by: [
        {field: 'journey.title', direction: 'asc'},
        {field: 'dayNumber', direction: 'asc'},
      ],
    },
  ],
  preview: {
    select: {
      dayNumber: 'dayNumber',
      dayTitle: 'dayTitle',
      journeyTitle: 'journey.title',
      media: 'openImage',
    },
    prepare({
      dayNumber,
      dayTitle,
      journeyTitle,
      media,
    }: {
      dayNumber?: number
      dayTitle?: string
      journeyTitle?: string
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      media?: any
    }) {
      return {
        title: `Day ${dayNumber}: ${dayTitle || 'Untitled'}`,
        subtitle: journeyTitle || '—',
        media,
      }
    },
  },
})
