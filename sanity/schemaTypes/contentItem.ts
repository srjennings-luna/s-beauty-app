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
      title: 'Content Type',
      type: 'string',
      description: 'What kind of content is this?',
      options: {
        list: [
          {title: 'Sacred Art & Architecture', value: 'sacred-art'},
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
      title: 'Title',
      type: 'string',
      description: 'e.g., "Pietà" or "Into Great Silence"',
      validation: (Rule) => Rule.required(),
    }),

    // ─── Type-Specific Identity Fields (who created / who is this) ───────────
    defineField({
      name: 'artist',
      title: 'Artist / Creator',
      type: 'string',
      description: 'e.g., "Michelangelo Buonarroti"',
      hidden: ({document}) => document?.contentType !== 'sacred-art',
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
      title: 'Themes',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'theme'}]}],
      description: 'Which themes this content speaks to (min 1).',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'description',
      title: 'Brief Description',
      type: 'text',
      rows: 3,
      description: 'Short description for cards and previews. 1–2 sentences.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'context',
      title: 'Context',
      type: 'text',
      rows: 6,
      description: 'Deeper context. Why this matters, what to notice, how it connects to the tradition.',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      description: 'High-res image. Min 1200px. Every content item must have an image.',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),

    // ─── Type-Specific Detail / Metadata Fields ─────────────────────────────

    // Sacred Art & Architecture
    defineField({
      name: 'year',
      title: 'Year / Date Range',
      type: 'string',
      description: 'e.g., "1498–1499" or "c. 1600"',
      hidden: ({document}) => document?.contentType !== 'sacred-art',
    }),
    defineField({
      name: 'medium',
      title: 'Medium',
      type: 'string',
      description: 'e.g., "Oil on canvas", "Marble", "Fresco"',
      hidden: ({document}) => document?.contentType !== 'sacred-art',
    }),
    defineField({
      name: 'scripturePairing',
      title: 'Scripture Pairing',
      type: 'object',
      hidden: ({document}) => document?.contentType !== 'sacred-art',
      fields: [
        {name: 'verse', title: 'Scripture Verse', type: 'text', rows: 3},
        {name: 'reference', title: 'Scripture Reference', type: 'string', description: 'e.g., "Lamentations 1:12"'},
      ],
    }),

    // Thinkers & Quotes
    defineField({
      name: 'quote',
      title: 'Primary Quote',
      type: 'object',
      description: 'The primary quote. Source = work title.',
      hidden: ({document}) => document?.contentType !== 'thinker',
      fields: [
        {name: 'text', title: 'Quote Text', type: 'text', rows: 3},
        {name: 'source', title: 'Source', type: 'string', description: 'e.g., "Confessions, Book X"'},
        // backward compat alias kept for existing artwork data
        {name: 'attribution', title: 'Attribution (legacy)', type: 'string'},
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
      title: 'Excerpt',
      type: 'text',
      rows: 8,
      description: 'A passage or stanza. Must be public domain or properly licensed.',
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
      title: 'Audio Source',
      type: 'object',
      description: 'Optional audio pairing for any content type. Use the file upload for in-app playback (preferred). Use the URL for direct MP3 links. External link (YouTube, Spotify) opens outside the app.',
      fields: [
        defineField({
          name: 'audioFile',
          title: 'Audio File Upload (in-app playback)',
          type: 'file',
          description: 'Upload an MP3 — plays directly in KALLOS. Preferred over URL.',
          options: { accept: 'audio/*' },
        }),
        defineField({
          name: 'audioUrl',
          title: 'Audio URL (in-app playback)',
          type: 'string',
          description: 'Direct MP3 link (e.g. archive.org) — plays in-app. Use if file upload is not possible.',
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
      title: 'Reflection Questions',
      type: 'array',
      of: [{type: 'string'}],
      description: '1–3 questions for contemplation.',
    }),
    defineField({
      name: 'curatorNote',
      title: 'Curator Note',
      type: 'text',
      rows: 3,
      description: 'Why this was chosen. The human voice behind the curation.',
    }),

    defineField({
      name: 'traditionalPrayer',
      title: 'Traditional Prayer (Pray step)',
      type: 'text',
      rows: 6,
      description: 'Optional. A traditional Catholic prayer shown in the expandable "Traditional Prayer" drawer on the Pray step of Visio Divina. Leave blank to use the built-in fallback prayer.',
    }),
    defineField({
      name: 'traditionalPrayerSource',
      title: 'Traditional Prayer — Source',
      type: 'string',
      description: 'Attribution for the prayer above, e.g. "Act of Adoration, Traditional" or "St. Francis of Assisi". Shown below the prayer text.',
      hidden: ({ document }) => !document?.traditionalPrayer,
    }),
    defineField({
      name: 'traditionReflections',
      title: 'Go Deeper: Tradition Reflections',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'traditionReflection' }] }],
      description: 'Link specific tradition reflections to this content item for the Visio Divina "Go Deeper" carousel. Order here = carousel order. If empty, the carousel shows reflections matching this item\'s themes.',
    }),
    // ─── Location Fields (optional for non-place content) ─────────────────────
    defineField({
      name: 'locationName',
      title: 'Location Name',
      type: 'string',
      description: 'e.g., "St. Peter\'s Basilica", "Grande Chartreuse"',
      group: 'location',
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
      description: 'e.g., "Rome", "Florence"',
      group: 'location',
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
      description: 'KALLOS is global — no default country.',
      group: 'location',
    }),
    defineField({
      name: 'coordinates',
      title: 'Map Coordinates',
      type: 'object',
      description: 'For Explore map view. Only populate when content has a meaningful physical location.',
      group: 'location',
      fields: [
        {name: 'lat', title: 'Latitude', type: 'number', description: 'e.g., 41.9022'},
        {name: 'lng', title: 'Longitude', type: 'number', description: 'e.g., 12.4568'},
      ],
    }),

    // ─── Legacy / Migration Fields (hidden in Studio) ─────────────────────────
    defineField({
      name: 'locationType',
      title: 'Location Type (legacy — use Content Type)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'historicalSummary',
      title: 'Historical Summary (legacy — use Context)',
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
