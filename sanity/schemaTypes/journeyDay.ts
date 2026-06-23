import {defineField, defineType} from 'sanity'

/**
 * journeyDay, the day-document inside a 7-day Journey.
 *
 * Promoted to a standalone document in April 2026 (R5) so days can be
 * queried, deep-linked, and analytically tracked independently. Each day
 * has a required back-reference to its parent journey.
 *
 * Field order matches the 6-step Journey Day render flow (Open, Encounter,
 * Breathe, Reflect, Connect, Go Deeper) so the Studio form mirrors what
 * the user sees. June 22, 2026 label and description cleanup with
 * surface-first descriptions.
 */
export default defineType({
  name: 'journeyDay',
  title: 'Journey Day',
  type: 'document',
  fields: [
    defineField({
      name: 'journey',
      title: 'Journey (parent reference)',
      type: 'reference',
      to: [{type: 'journey'}],
      description:
        'INTERNAL. Reference to the parent Journey document this day belongs to. Drives breadcrumb display and journey-day grouping in Studio. Required.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'dayNumber',
      title: 'Day Number (Journey Day, navigation + sort)',
      type: 'number',
      description:
        'INTERNAL sort. The day position in the journey arc (1 through 9). Drives the Stories-style progress segments at the top of the Journey Day stepper and the day-of-N badges. Required.',
      validation: (Rule) => Rule.required().min(1).max(9),
    }),
    defineField({
      name: 'dayTitle',
      title: 'Day Title (Journey Day, big editorial title across all 6 steps)',
      type: 'string',
      description:
        'Renders as the big editorial title at the top of every Journey Day step (Open, Encounter, Breathe, Reflect, Connect, Go Deeper). The day\'s editorial framing, e.g. "The First Light" or "What Darkness Teaches." Distinct from the linked content item\'s title (the work\'s actual name shown elsewhere on the Encounter step). Required.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'openImage',
      title: 'Opening Image (Journey Day Step 1 Open, visual anchor)',
      type: 'image',
      description:
        'Renders as the full-bleed visual anchor on Step 1 (Open) of the Journey Day. The image that sets the day\'s tone. Min 1200px. Required.',
      options: {hotspot: true},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'openText',
      title: 'Opening Text (Journey Day Step 1 Open, body text)',
      type: 'text',
      rows: 3,
      description:
        'Renders on Step 1 (Open) below the dayTitle. Brief opening text (~1 minute read) that sets the day\'s frame. Lewis-register, concrete opener.',
    }),
    defineField({
      name: 'openTextAudio',
      title: 'Opening Text, Narration Audio (Journey Day Step 1 Open)',
      type: 'file',
      description:
        'Optional MP3 narration of the openText field. Adds a small listen button on Step 1.',
      options: {accept: 'audio/*'},
    }),
    defineField({
      name: 'encounterContent',
      title: 'Encounter Content (Journey Day Step 2 Encounter, REFERENCE PICKER)',
      type: 'reference',
      to: [{type: 'contentItem'}],
      description:
        'Reference picker. The contentItem this day features (sacred-art, thinker, literature, music, photography, food-wine, landscape, math-science, or watch-listen). The linked piece\'s image, title, artworkHook (the dark hook box), and context paragraphs all render on Step 2 (Encounter). Required.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'encounterGuidance',
      title: 'Encounter Guidance (Journey Day Step 2 Encounter, italic instruction line)',
      type: 'text',
      rows: 3,
      description:
        'Optional italic instruction line that renders on Step 2 (Encounter), guiding how to approach the piece. e.g. "Listen with your eyes closed for the first minute." Not the editorial hook (that lives on contentItem.artworkHook).',
    }),
    defineField({
      name: 'encounterNote',
      title: 'Look Closer (Journey Day Step 2 Encounter, expandable below hook)',
      type: 'text',
      rows: 5,
      description:
        'Renders on Step 2 (Encounter) as the "Look Closer" expandable text below the dark hook box. Truncated to ~200 chars with an expand toggle. Interpretive layer specific to THIS day\'s content type. Sacred art: symbolism / iconography. Literature: close reading. Music: listening guide. Landscape: ecological or geological insight. Thinker: intellectual context. Pattern & Proof: plain-language explanation. Watch & Listen: viewing guide. Food & Wine: craft tradition. Journey-day-specific (may reference other days in the arc), so this text does not display outside this journey context.',
    }),
    defineField({
      name: 'encounterNoteAudio',
      title: 'Look Closer, Narration Audio (Journey Day Step 2 Encounter)',
      type: 'file',
      description:
        'Optional MP3 narration of the Look Closer text. Adds a small listen button at the top of the Look Closer expandable on Step 2.',
      options: {accept: 'audio/*'},
    }),
    defineField({
      name: 'auditio',
      title: 'Auditio (Journey Day Step 2 Encounter, music player, REFERENCE PICKER)',
      type: 'reference',
      to: [{type: 'auditio'}],
      description:
        'Reference picker. Optional audio pairing for this day, shown as the music player on Step 2 (Encounter). Create the Auditio document first, then reference it here. Per CLAUDE.md Auditio rules: mood is the primary selection criterion; recommend a specific piece, not a genre.',
    }),
    defineField({
      name: 'lectio',
      title: 'Voices & Lectio (Journey Day Step 2 Encounter, philosophy + scripture pairing)',
      type: 'object',
      description:
        'Optional philosophy + scripture pairing for this day. Renders on Step 2 (Encounter) below the Look Closer expandable. Connects the encounter to broader intellectual and spiritual tradition. Per CLAUDE.md the philosophy should be a one-liner from a verified ancient (Plato, Aristotle, Marcus Aurelius, Seneca, Cicero, Heraclitus, etc.). Scripture in RSV-2CE.',
      fields: [
        {
          name: 'philosophyQuote',
          title: 'Philosophy Quote (Step 2, "Voices" section)',
          type: 'text',
          rows: 3,
          description:
            'A one-line quote from a philosopher reaching toward a truth that scripture names. Renders in the Voices half of the Lectio pair on Step 2.',
        },
        {
          name: 'philosophySource',
          title: 'Philosophy Source (Step 2, "Voices" attribution)',
          type: 'string',
          description:
            'Renders below the philosophy quote as the attribution line. e.g. "Plato, Republic, Allegory of the Cave"',
        },
        {
          name: 'scriptureVerse',
          title: 'Scripture Verse (Step 2, "Lectio" section)',
          type: 'text',
          rows: 3,
          description:
            'Renders in the Lectio half of the pair on Step 2. RSV-2CE per the project scripture standard.',
        },
        {
          name: 'scriptureReference',
          title: 'Scripture Reference (Step 2, "Lectio" attribution)',
          type: 'string',
          description:
            'Renders below the scripture as the reference line. e.g. "1 Corinthians 13:12 RSV-2CE"',
        },
        {
          name: 'connectionNote',
          title: 'Connection Note (Step 2, optional bridge line)',
          type: 'text',
          rows: 3,
          description:
            'Optional. Renders below the Lectio pair as a short bridge sentence explaining how the philosophy and scripture echo each other and connect to the day\'s encounter. Skip when the pairing already speaks for itself.',
        },
      ],
    }),
    defineField({
      name: 'reflectionQuestions',
      title: 'Reflection Questions (Journey Day Step 4 Reflect, one per swipe)',
      type: 'array',
      of: [{type: 'string'}],
      description:
        'Renders on Step 4 (Reflect) as one question per swipe. 1 or 2 questions for this day. Lewis-register, personal, concrete (named place, person, object, time). NOT abstract ("how does it feel"). Distinct from contentItem.reflectionQuestions (which is for Visio Divina + Explore REFLECT panel). Required.',
      validation: (Rule) => Rule.required().min(1).max(2),
    }),
    defineField({
      name: 'reflectionQuestionsAudio',
      title: 'Reflection Questions, Narration Audio (Journey Day Step 4 Reflect)',
      type: 'file',
      description:
        'Optional MP3 narration of the reflection questions. Adds a small listen button on Step 4 (Reflect).',
      options: {accept: 'audio/*'},
    }),
    defineField({
      name: 'connectThread',
      title: 'Connect Thread (Journey Day Step 5 Connect, tomorrow-pointer)',
      type: 'string',
      description:
        'Renders on Step 5 (Connect). One sentence pointing to tomorrow\'s arc, e.g. "Tomorrow: what happens when the light goes away?" Builds anticipation; do not summarize today.',
    }),
    defineField({
      name: 'goDeeper',
      title: 'Go Deeper (Journey Day Step 6, Tradition Reflections carousel)',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'traditionReflection'}]}],
      description:
        'Reference picker, array. The traditionReflection cards shown in the Go Deeper carousel on Step 6. Order here = carousel order. If empty, Step 6 is hidden and the progress segments collapse from 6 to 5. Per CLAUDE.md Go Deeper standard: each reflection must add NEW content not already in the Look Closer text.',
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
        subtitle: journeyTitle || '-',
        media,
      }
    },
  },
})
