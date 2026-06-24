import {defineField, defineType} from 'sanity'

/**
 * contentItem — replaces the `artwork` schema.
 * Unified type for all 7 content categories: sacred art, thinkers, literature,
 * music, food & wine, natural landscape, and watch/listen.
 *
 * Migration from `artwork`:
 *   - locationType → contentType (mapped: architecture → sacred-art, workshop → food-wine, cultural → food-wine)
 *   - historicalSummary → context
 *   - quote object kept for backward compat; use curatorNote going forward
 *   - existing image, coordinates, location fields unchanged
 */
export default defineType({
  name: 'contentItem',
  title: 'Content Item',
  type: 'document',

  // ─── Shared Fields ──────────────────────────────────────────────────────────
  fields: [
    defineField({
      name: 'contentType',
      title: 'Content Type (drives every other field + P&P gradient color + Explore type label)',
      type: 'string',
      description:
        'INTERNAL but high-impact. Drives which type-specific fields show in Studio (artist, thinkerName, author, composer, etc.), which P&P gradient color renders on the prompt page (Mineral Blue for sacred-art, Old Ochre for literature, etc., per the 9-color palette), and which type label shows on Explore + the museum-style caption pattern on P&P. Required.',
      options: {
        list: [
          {title: 'Sacred Art & Architecture', value: 'sacred-art'},
          {title: 'Photography', value: 'photography'},
          {title: 'Thinkers & Quotes', value: 'thinker'},
          {title: 'Literature & Poetry', value: 'literature'},
          {title: 'Music', value: 'music'},
          {title: 'Food & Wine', value: 'food-wine'},
          {title: 'Natural Landscape', value: 'landscape'},
          {title: 'Watch & Listen', value: 'watch-listen'},
          {title: 'Pattern & Proof', value: 'math-science'},
        ],
        layout: 'radio',
      },
      initialValue: 'sacred-art',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title (work\'s actual name, rendered everywhere)',
      type: 'string',
      description:
        'The work\'s actual name: artwork title, thinker name, piece title, etc. e.g. "Pietà", "St. Augustine", "Into Great Silence", "God\'s Grandeur". Renders on Explore detail card (top), Journey Day Encounter step (museum-style caption below image for sacred-art + photography), Library thumbnail. Distinct from dailyPrompt.dayTitle (which is the editorial framing for THAT day on P&P). Required.',
      validation: (Rule) => Rule.required(),
    }),

    // ─── Type-Specific Identity Fields (who created / who is this) ───────────
    defineField({
      name: 'artist',
      title: 'Artist / Creator (sacred-art + photography)',
      type: 'string',
      description: 'The work\'s creator. e.g. "Michelangelo Buonarroti" for sacred-art, "Julia Margaret Cameron" for photography. Shown on the P&P as part of the museum-style caption directly below the image (for sacred-art and photography only). Also used in Explore detail attribution string.',
      hidden: ({document}) =>
        document?.contentType !== 'sacred-art' && document?.contentType !== 'photography',
    }),
    defineField({
      name: 'thinkerName',
      title: 'Thinker Name',
      type: 'string',
      description: 'e.g., "St. Augustine", "Roger Scruton"',
      hidden: ({document}) => document?.contentType !== 'thinker',
      validation: (Rule) => Rule.custom((val, ctx) => {
        if (ctx.document?.contentType === 'thinker' && !val) return 'Required for Thinkers'
        return true
      }),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
      description: 'e.g., "Gerard Manley Hopkins"',
      hidden: ({document}) => document?.contentType !== 'literature',
      validation: (Rule) => Rule.custom((val, ctx) => {
        if (ctx.document?.contentType === 'literature' && !val) return 'Required for Literature'
        return true
      }),
    }),
    defineField({
      name: 'composer',
      title: 'Composer',
      type: 'string',
      description: 'e.g., "Arvo Pärt", "J.S. Bach"',
      hidden: ({document}) => document?.contentType !== 'music',
    }),

    // ─── Shared Fields (continued) ──────────────────────────────────────────
    defineField({
      name: 'themes',
      title: 'Themes (Explore filter + tradition reflection auto-match)',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'theme'}]}],
      description:
        'INTERNAL filter. Which themes this content speaks to. Drives the Explore page theme filter and the Visio Divina Go Deeper auto-match logic when traditionReflections is empty (the carousel falls back to theme-matched reflections). Not rendered as visible tags. Min 1.',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'description',
      title: 'Brief Description (Explore detail card)',
      type: 'text',
      rows: 3,
      description:
        'Renders on the Explore detail card as the neutral 1 to 2 sentence summary below the title. Not the editorial hook (that lives on artworkHook); this is the calm summary version. NOT shown on P&P or Journey Day. Required.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'artworkHook',
      title: 'Hook (Encounter - 1st text)',
      type: 'text',
      rows: 3,
      description:
        'The story hook, the surprising fact that opens the encounter. About the work or its subject. Safe to show anywhere this piece appears (Journey Day Encounter step, Explore detail card, Library). For sacred-art the hook can be artwork-specific or subject-story; for thinker / literature / music it is the surprising fact about the work or its subject. Journey-day-specific hooks (text that only makes sense within that journey arc) live on journeyDay.encounterNote. P&P-specific hooks live on dailyPrompt.curatorNote.',
    }),
    defineField({
      name: 'artworkHookAudio',
      title: 'Hook, Narration Audio',
      type: 'file',
      description: 'Optional MP3 narration of the hook. Adds a small listen button.',
      options: {accept: 'audio/*'},
    }),
    defineField({
      name: 'context',
      title: 'Context (P&P + Journey Day Encounter, body paragraphs below the hook)',
      type: 'text',
      rows: 6,
      description:
        'Renders as the body paragraphs below the hook on Pattern & Proof and on the Journey Day Encounter step. The deeper layer: why this matters, what to notice, how it connects to the tradition. NOT shown on the Explore detail card (description handles that). Per the Hook Rule in CLAUDE.md, this must add information beyond what the hook already said.',
    }),
    defineField({
      name: 'contextAudio',
      title: 'Context, Narration Audio (P&P + Journey Day Encounter)',
      type: 'file',
      description:
        'Optional MP3 narration of the Context paragraphs. Adds a small listen button next to the context body on P&P and Journey Day Encounter.',
      options: {accept: 'audio/*'},
    }),
    defineField({
      name: 'image',
      title: 'Image (P&P, Journey Day Encounter, Explore detail, Library)',
      type: 'image',
      description:
        'The primary visual for this piece, used everywhere it appears (Pattern & Proof full-bleed hero, Journey Day Encounter step, Explore detail card, Library thumbnail). High-res, min 1200px. Required.',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'imageCredit',
      title: 'Image Credit (small caption below image, every surface)',
      type: 'string',
      description:
        'Optional. Renders as a small grey caption directly below the image on every surface where the image appears (P&P, Journey Day Encounter, Explore detail, Visio Divina Gaze step). Paste the credit line whatever shape the source asks for: "Wikimedia Commons, public domain", "Photo by Julia Margaret Cameron, public domain", "NASA / STScI / Webb", "Photo by Sheri Jennings", "Pixabay, free use", etc. Distinct from the Artist field (which names the WORK\'s creator, e.g. Caravaggio); this names whoever holds the IMAGE rights or supplied the file. Keep it short, ~140 char max.',
      validation: (Rule) => Rule.max(140),
    }),

    // ─── Type-Specific Detail / Metadata Fields ─────────────────────────────

    // Sacred Art & Architecture
    defineField({
      name: 'year',
      title: 'Year / Date Range (sacred-art + photography)',
      type: 'string',
      description: 'When the work was created. e.g. "1498–1499", "c. 1600", "1873" (Cameron). Shown on the P&P as part of the museum-style caption below the image (for sacred-art and photography only).',
      hidden: ({document}) =>
        document?.contentType !== 'sacred-art' && document?.contentType !== 'photography',
    }),
    defineField({
      name: 'medium',
      title: 'Medium (sacred-art + photography)',
      type: 'string',
      description: 'The physical medium of the work. e.g. "Oil on canvas", "Marble", "Fresco" for sacred-art, "Albumen print", "Silver gelatin" for photography. Optional. Used in Explore detail attribution.',
      hidden: ({document}) =>
        document?.contentType !== 'sacred-art' && document?.contentType !== 'photography',
    }),
    defineField({
      name: 'scripturePairing',
      title: 'Scripture Pairing (Explore detail REFLECT expand panel, sacred-art + photography)',
      type: 'object',
      description:
        'Optional scripture tied to the work itself (not the same as dailyPrompt.lectio, which is per-day). Renders on the Explore detail card inside the REFLECT expand panel. RSV-2CE per the project scripture standard.',
      hidden: ({document}) =>
        document?.contentType !== 'sacred-art' && document?.contentType !== 'photography',
      fields: [
        {
          name: 'verse',
          title: 'Scripture Verse (REFLECT panel body)',
          type: 'text',
          rows: 3,
          description: 'RSV-2CE.',
        },
        {
          name: 'reference',
          title: 'Scripture Reference (REFLECT panel attribution)',
          type: 'string',
          description: 'e.g., "Lamentations 1:12 RSV-2CE"',
        },
      ],
    }),

    // Thinkers & Quotes
    defineField({
      name: 'quote',
      title: 'Primary Quote (Explore detail REFLECT panel, thinker only)',
      type: 'object',
      description:
        'The thinker\'s signature line. Renders on the Explore detail REFLECT expand panel for thinker content. Verified quote only, no apocryphal attributions per CLAUDE.md.',
      hidden: ({document}) => document?.contentType !== 'thinker',
      fields: [
        {name: 'text', title: 'Quote Text (REFLECT panel body)', type: 'text', rows: 3},
        {
          name: 'source',
          title: 'Source (REFLECT panel attribution)',
          type: 'string',
          description: 'e.g., "Confessions, Book X" or "Pensées §423"',
        },
        {name: 'attribution', title: 'Attribution (legacy, use Source above)', type: 'string'},
      ],
    }),
    defineField({
      name: 'era',
      title: 'Era',
      type: 'string',
      description: 'Historical era of the thinker',
      options: {
        list: [
          {title: 'Ancient', value: 'ancient'},
          {title: 'Patristic', value: 'patristic'},
          {title: 'Medieval', value: 'medieval'},
          {title: 'Renaissance', value: 'renaissance'},
          {title: 'Modern', value: 'modern'},
          {title: 'Contemporary', value: 'contemporary'},
        ],
        layout: 'dropdown',
      },
      hidden: ({document}) => document?.contentType !== 'thinker',
    }),
    defineField({
      name: 'tradition',
      title: 'Tradition',
      type: 'string',
      description: 'e.g., "Platonist", "Thomist", "Phenomenologist"',
      hidden: ({document}) => document?.contentType !== 'thinker',
    }),

    // Literature & Poetry
    defineField({
      name: 'workTitle',
      title: 'Work Title',
      type: 'string',
      description: 'e.g., "God\'s Grandeur" or "The Brothers Karamazov"',
      hidden: ({document}) => document?.contentType !== 'literature',
      validation: (Rule) => Rule.custom((val, ctx) => {
        if (ctx.document?.contentType === 'literature' && !val) return 'Required for Literature'
        return true
      }),
    }),
    defineField({
      name: 'literaryForm',
      title: 'Literary Form',
      type: 'string',
      options: {
        list: [
          {title: 'Poetry', value: 'poetry'},
          {title: 'Novel', value: 'novel'},
          {title: 'Essay', value: 'essay'},
          {title: 'Letter', value: 'letter'},
          {title: 'Homily', value: 'homily'},
          {title: 'Prayer', value: 'prayer'},
        ],
        layout: 'dropdown',
      },
      hidden: ({document}) => document?.contentType !== 'literature',
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt (Explore detail REFLECT panel, literature only)',
      type: 'text',
      rows: 8,
      description:
        'A passage or stanza from the work. Renders on the Explore detail REFLECT expand panel for literature content (clamped to 3 lines on the card with full text in the expand). Must be public domain or properly licensed.',
      hidden: ({document}) => document?.contentType !== 'literature',
    }),

    // Music
    defineField({
      name: 'performer',
      title: 'Performer',
      type: 'string',
      description: 'e.g., "Hilliard Ensemble"',
      hidden: ({document}) => document?.contentType !== 'music',
    }),
    defineField({
      name: 'durationMinutes',
      title: 'Duration (minutes)',
      type: 'number',
      description: 'Approximate listening/viewing time',
      hidden: ({document}) => document?.contentType !== 'music' && document?.contentType !== 'watch-listen',
    }),
    defineField({
      name: 'audioSource',
      title: 'Audio Source (any content type, in-app playback)',
      type: 'object',
      description:
        'Optional audio pairing for any content type. Renders as the inline audio player wherever this piece appears. Use the file upload for in-app playback (preferred). Use the URL for direct MP3 links. External link (YouTube, Spotify) opens outside the app.',
      fields: [
        defineField({
          name: 'audioFile',
          title: 'Audio File Upload (in-app playback)',
          type: 'file',
          description: 'Upload an MP3, plays directly in Contueri. Preferred over URL.',
          options: { accept: 'audio/*' },
        }),
        defineField({
          name: 'audioUrl',
          title: 'Audio URL (in-app playback)',
          type: 'string',
          description: 'Direct MP3 link (e.g. archive.org), plays in-app. Use if file upload is not possible.',
        }),
        defineField({
          name: 'externalUrl',
          title: 'External Link (reference only)',
          type: 'url',
          description: 'YouTube, Spotify, or Apple Music. Only used if no file or audio URL is provided. Opens outside the app.',
        }),
      ],
    }),

    // Food & Wine
    defineField({
      name: 'craftTradition',
      title: 'Craft Tradition',
      type: 'string',
      description: 'e.g., "Cistercian monastic brewing", "3rd-generation Neapolitan bakery"',
      hidden: ({document}) => document?.contentType !== 'food-wine',
    }),
    defineField({
      name: 'pointsToward',
      title: 'Points Toward',
      type: 'text',
      rows: 3,
      description: 'What does this point toward? The beauty-connection.',
      hidden: ({document}) => document?.contentType !== 'food-wine',
    }),

    // Natural Landscape
    defineField({
      name: 'creationTheology',
      title: 'Creation Theology',
      type: 'text',
      rows: 4,
      description: 'How this landscape speaks to creation theology. Paired thinker/scripture connection.',
      hidden: ({document}) => document?.contentType !== 'landscape',
    }),

    // Watch & Listen
    defineField({
      name: 'mediaType',
      title: 'Media Type',
      type: 'string',
      options: {
        list: [
          {title: 'Video', value: 'video'},
          {title: 'Podcast', value: 'podcast'},
          {title: 'Documentary', value: 'documentary'},
          {title: 'Lecture', value: 'lecture'},
        ],
        layout: 'radio',
      },
      hidden: ({document}) => document?.contentType !== 'watch-listen',
      validation: (Rule) => Rule.custom((val, ctx) => {
        if (ctx.document?.contentType === 'watch-listen' && !val) return 'Required for Watch & Listen'
        return true
      }),
    }),
    defineField({
      name: 'mediaUrl',
      title: 'Media URL',
      type: 'url',
      description: 'YouTube, Vimeo, or podcast URL',
      hidden: ({document}) => document?.contentType !== 'watch-listen',
      validation: (Rule) => Rule.custom((val, ctx) => {
        if (ctx.document?.contentType === 'watch-listen' && !val) return 'Required for Watch & Listen'
        return true
      }),
    }),
    defineField({
      name: 'series',
      title: 'Series',
      type: 'string',
      description: 'If part of a series. e.g., "Bishop Barron\'s Word on Fire"',
      hidden: ({document}) => document?.contentType !== 'watch-listen',
    }),

    // Math & Science
    defineField({
      name: 'discipline',
      title: 'Discipline',
      type: 'string',
      description: 'e.g., Mathematics, Physics, Biology, Astronomy, Geometry',
      hidden: ({document}) => document?.contentType !== 'math-science',
    }),
    defineField({
      name: 'principle',
      title: 'Principle or Discovery',
      type: 'string',
      description: 'The key concept, e.g., "Golden Ratio", "Fibonacci Sequence", "Double Helix"',
      hidden: ({document}) => document?.contentType !== 'math-science',
    }),
    defineField({
      name: 'beautyConnection',
      title: 'Beauty Connection',
      type: 'text',
      rows: 3,
      description: 'How does this reveal beauty, truth, or the divine? The contemplative thread.',
      hidden: ({document}) => document?.contentType !== 'math-science',
    }),

    // ─── Shared Fields (bottom) ─────────────────────────────────────────────
    defineField({
      name: 'reflectionQuestions',
      title: 'Reflection Questions (Visio Divina Reflect step + Explore detail REFLECT panel)',
      type: 'array',
      of: [{type: 'string'}],
      description:
        'Renders on the Visio Divina Reflect step (one question per swipe) and on the Explore detail REFLECT expand panel for non-sacred-art content types. 1 to 3 questions. Distinct from journeyDay.reflectionQuestions (which is for Journey Day Step 4 Reflect, day-specific).',
    }),
    defineField({
      name: 'traditionalPrayer',
      title: 'Traditional Prayer (Visio Divina Pray step, expandable drawer)',
      type: 'text',
      rows: 6,
      description:
        'Optional. Renders inside the expandable "Traditional Prayer" drawer on the Visio Divina Pray step. Per-artwork override; leave blank to inherit the global visioDefaults fallback prayer.',
    }),
    defineField({
      name: 'traditionalPrayerSource',
      title: 'Traditional Prayer Source (Visio Divina Pray step, attribution below prayer)',
      type: 'string',
      description:
        'Renders below the Traditional Prayer text on the Visio Divina Pray step as the attribution line. e.g. "Act of Adoration, Traditional" or "St. Francis of Assisi".',
      hidden: ({ document }) => !document?.traditionalPrayer,
    }),

    // ── Visio Divina per-artwork prompt overrides ──────────────────────────
    // Each of these is optional. When set, it overrides the matching field on
    // the visioDefaults singleton for THIS artwork's Visio Divina session
    // only. Leave blank to inherit the global default. The cascade lives in
    // app/pray/[artworkId]/PrayClient.tsx and lib/sanity.ts. Added June 6,
    // 2026 as part of VD-ACTION-01.
    defineField({
      name: 'customPrayerPrompt',
      title: 'Custom Pray prompt (Visio Divina Pray step, per-artwork override)',
      type: 'text',
      rows: 3,
      description:
        'Optional. Overrides the default Pray-step instruction sentence for this artwork only. Leave blank to inherit the visioDefaults singleton fallback.',
    }),
    defineField({
      name: 'customActioHeadline',
      title: 'Custom Actio headline (Visio Divina Action step, per-artwork override)',
      type: 'string',
      description:
        'Optional. Overrides the italic Actio headline (e.g. "How will you live this out?") for this artwork only on the Visio Divina Action step. Leave blank to inherit the visioDefaults singleton fallback.',
      validation: (Rule) => Rule.max(140),
    }),
    defineField({
      name: 'customActioInstruction',
      title: 'Custom Actio instruction (Visio Divina Action step, per-artwork override)',
      type: 'text',
      rows: 3,
      description:
        'Optional. Overrides the supporting instruction below the Actio headline for this artwork only on the Visio Divina Action step. Leave blank to inherit the visioDefaults singleton fallback.',
      validation: (Rule) => Rule.max(280),
    }),

    defineField({
      name: 'traditionReflections',
      title: 'Go Deeper Tradition Reflections (Visio Divina Go Deeper carousel, REFERENCE PICKER)',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'traditionReflection' }] }],
      description:
        'Reference picker, array. The traditionReflection cards shown in the Visio Divina Go Deeper carousel for this artwork. Order here = carousel order. If empty, the carousel auto-matches by theme. Per CLAUDE.md Go Deeper standard: each reflection must add NEW content not already in the artworkHook or context.',
    }),
    // ─── Location Fields (optional for non-place content) ─────────────────────
    defineField({
      name: 'locationName',
      title: 'Location Name (Explore map marker popup)',
      type: 'string',
      description: 'Renders on the Explore map marker popup as the location heading. e.g. "St. Peter\'s Basilica", "Grande Chartreuse".',
      group: 'location',
    }),
    defineField({
      name: 'city',
      title: 'City (Explore map marker popup)',
      type: 'string',
      description: 'Renders on the Explore map marker popup below the location name. e.g. "Rome", "Florence".',
      group: 'location',
    }),
    defineField({
      name: 'country',
      title: 'Country (Explore map marker popup)',
      type: 'string',
      description: 'Renders on the Explore map marker popup with the city. Contueri is global, no default country.',
      group: 'location',
    }),
    defineField({
      name: 'coordinates',
      title: 'Map Coordinates (drives whether marker appears on Explore map)',
      type: 'object',
      description:
        'INTERNAL. Drives whether this content item appears as a marker on the Explore map view. Only populate when content has a meaningful physical location.',
      group: 'location',
      fields: [
        {name: 'lat', title: 'Latitude', type: 'number', description: 'e.g., 41.9022'},
        {name: 'lng', title: 'Longitude', type: 'number', description: 'e.g., 12.4568'},
      ],
    }),

    // ─── Legacy / Migration Fields (hidden in Studio) ─────────────────────────
    defineField({
      name: 'locationType',
      title: 'Location Type (legacy, use Content Type)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'historicalSummary',
      title: 'Historical Summary (legacy, use Context)',
      type: 'text',
      rows: 5,
      hidden: true,
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      hidden: true,
    }),
  ],

  groups: [
    {name: 'location', title: 'Location'},
  ],

  orderings: [
    {
      title: 'Title A–Z',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}],
    },
    {
      title: 'Content Type',
      name: 'contentType',
      by: [{field: 'contentType', direction: 'asc'}],
    },
  ],

  preview: {
    select: {
      title: 'title',
      contentType: 'contentType',
      artist: 'artist',
      composer: 'composer',
      author: 'author',
      thinkerName: 'thinkerName',
      media: 'image',
    },
    prepare({title, contentType, artist, composer, author, thinkerName, media}: {
      title?: string
      contentType?: string
      artist?: string
      composer?: string
      author?: string
      thinkerName?: string
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      media?: any
    }) {
      const typeIcons: Record<string, string> = {
        'sacred-art': '🎨',
        'photography': '📷',
        'thinker': '📖',
        'literature': '✍️',
        'music': '🎵',
        'food-wine': '🍷',
        'landscape': '🌿',
        'watch-listen': '🎬',
        'math-science': '🔬',
      }
      const icon = (contentType && typeIcons[contentType]) || '📌'
      const byline = artist || composer || author || thinkerName || ''
      return {
        title: `${icon} ${title || 'Untitled'}`,
        subtitle: byline,
        media,
      }
    },
  },
})
