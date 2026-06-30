import {defineField, defineType} from 'sanity'

/**
 * dailyPrompt, the Pause & Ponder daily content document.
 *
 * Field order matches the Pause & Ponder render flow in
 * app/prompt/PromptClient.tsx so the Studio entry form mirrors what an
 * editor sees in the app. Field labels include the rendering surface in
 * parentheses where helpful, descriptions lead with the surface and then
 * name the content type. June 22, 2026 audit + cleanup.
 */
export default defineType({
  name: 'dailyPrompt',
  title: 'Pause & Ponder',
  type: 'document',
  fields: [
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      description:
        'Renders on the P&P as the small sage-caps date above the artwork title. Required. One prompt per day. Format YYYY-MM-DD.',
      options: {
        dateFormat: 'YYYY-MM-DD',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Featured Content',
      type: 'reference',
      to: [{type: 'contentItem'}],
      description:
        'The contentItem this prompt features. Drives the artwork image, title, context paragraphs, and (on the linked piece) the artworkHook (which is NOT shown on P&P, only on Journey Day Encounter). Required.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'curatorNote',
      title: 'Curator Note (P&P, dark hook box)',
      type: 'text',
      rows: 3,
      description:
        'Renders on the P&P as the dark hook box just below the artwork title. The most prominent USER-FACING text on the prompt screen, not internal. The P&P-specific story hook for THIS day, the surprising fact or arc that opens this day\'s practice. Distinct from contentItem.artworkHook (which is the universal hook for the piece on Journey Day Encounter); curatorNote is THIS day\'s framing of the same piece. See CLAUDE.md "Hook Rule" for the three-fields-three-jobs rule.',
    }),
    defineField({
      name: 'curatorNoteAudio',
      title: 'Curator Note, Narration Audio (P&P, dark hook box)',
      type: 'file',
      description:
        'Renders on the P&P inside the dark hook box as a small listen button below the curatorNote text. Optional MP3 narration.',
      options: {accept: 'audio/*'},
    }),
    defineField({
      name: 'dayTitle',
      title: 'Editorial Day Title (P&P, subtitle between hook box and long story)',
      type: 'string',
      description:
        'Renders on the P&P as the italic Cormorant subtitle, sitting BETWEEN the curatorNote dark hook box (above) and the long-form context storytelling paragraphs (below). Optional poetic editorial title for THIS day, e.g. "God Does Not Die" for the Sacred Heart day. Falls back to promptQuestion in the same slot if blank. Distinct from contentItem.title (the work\'s actual name, renders as the large 50px Cormorant italic at the top of the page). Added June 7, 2026 (PP-DAYTITLE-01).',
      validation: (Rule) => Rule.max(80),
    }),
    defineField({
      name: 'promptQuestion',
      title: 'Prompt Question (P&P, subtitle fallback + share text)',
      type: 'text',
      rows: 2,
      description:
        'Renders on the P&P in the subtitle slot below the curatorNote dark box, BUT only when dayTitle is blank (dayTitle takes priority). Also used as the share-sheet text when a user shares the prompt. The reflective question for THIS day. User-facing.',
    }),
    defineField({
      name: 'lectio',
      title: 'Voices & Lectio (P&P, two stacked sections)',
      type: 'object',
      description:
        'Renders on the P&P as TWO separate sections per the June 3, 2026 split (commit 5e25e8b2): a "Voices" section for the philosophy quote (sage left rule, gold/sage eyebrow), and a "Lectio" section for the scripture (Cormorant italic, no left rule). Philosophy first, scripture second. Optional philosophy + scripture pairing; scripture alone is fine if no matching philosophy quote exists.',
      fields: [
        defineField({
          name: 'philosophyText',
          title: 'Philosophy Quote (P&P, "Voices" section)',
          type: 'text',
          rows: 3,
          description:
            'Renders on the P&P inside the "Voices" section above the scripture. A philosopher reaching toward a truth that scripture names. Plato, Aristotle, Marcus Aurelius, Seneca, Boethius, Heraclitus, or another verified ancient. One-liner, modern accessible translation. Leave blank for scripture-only.',
        }),
        defineField({
          name: 'philosophyAttribution',
          title: 'Philosophy Attribution (P&P, "Voices" section)',
          type: 'string',
          description:
            'Renders on the P&P below the philosophy quote in the "Voices" section. The author + work, e.g. "Plato, Republic, Allegory of the Cave" or "Marcus Aurelius, Meditations IV.3".',
        }),
        defineField({
          name: 'text',
          title: 'Scripture / Primary Text (P&P, "Lectio" section)',
          type: 'text',
          rows: 4,
          description:
            'Renders on the P&P inside the "Lectio" section below the Voices section. The scripture passage (RSV-2CE per CLAUDE.md standard) or other primary text. Required.',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'attribution',
          title: 'Scripture Attribution (P&P, "Lectio" section)',
          type: 'string',
          description:
            'Renders on the P&P below the scripture text in the "Lectio" section. The book / chapter / verse, e.g. "1 Corinthians 13:12" or "Psalm 46:10".',
        }),
      ],
    }),
    defineField({
      name: 'auditio',
      title: 'Music (P&P, Auditio player)',
      type: 'reference',
      to: [{type: 'auditio'}],
      description:
        'Renders on the P&P as the music player below the Lectio. The audio pairing for this practice. Reference to a separate Auditio document, so create that doc first then reference it here. Optional but expected per CLAUDE.md Auditio rules.',
    }),
    defineField({
      name: 'actio',
      title: 'Action (P&P, Actio checkbox at bottom)',
      type: 'text',
      rows: 3,
      description:
        'Renders on the P&P as the Actio checkbox(es) at the bottom of the page. One concrete gentle action to carry into the day. Must name a specific place, person, object, or time (not a disposition). If left blank, the global default from the ppDefaults singleton fills in. Per CLAUDE.md Actio specificity rule.',
    }),
    defineField({
      name: 'relatedJourney',
      title: 'Related Journey (P&P, "Related Journey" CTA at bottom)',
      type: 'reference',
      to: [{type: 'journey'}],
      description:
        'Renders on the P&P as a quiet "Related Journey" CTA link near the bottom of the prompt, below the Actio. Optional. Use when a Journey deepens this prompt thematically.',
    }),
    defineField({
      name: 'theme',
      title: 'Theme (internal, filter only)',
      type: 'reference',
      to: [{type: 'theme'}],
      description:
        'INTERNAL field, not directly rendered as visible text on the P&P. Optional theme tag used by Explore filtering and dashboard analytics. Helps users on a Journey see thematic threads in P&P content.',
    }),
  ],
  orderings: [
    {
      title: 'Date (newest first)',
      name: 'dateDesc',
      by: [{field: 'date', direction: 'desc'}],
    },
    {
      title: 'Date (oldest first)',
      name: 'dateAsc',
      by: [{field: 'date', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      date: 'date',
      dayTitle: 'dayTitle',
      promptQuestion: 'promptQuestion',
    },
    prepare({date, dayTitle, promptQuestion}: {date?: string; dayTitle?: string; promptQuestion?: string}) {
      return {
        title: date || 'No date',
        subtitle: dayTitle || promptQuestion,
      }
    },
  },
})
