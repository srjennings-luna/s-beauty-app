import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'artwork',
  title: 'Artwork / Location',
  type: 'document',
  fields: [
    defineField({
      name: 'locationType',
      title: 'Location Type',
      type: 'string',
      description: 'What type of location is this?',
      options: {
        list: [
          {title: 'Sacred Art', value: 'sacred-art'},
          {title: 'Architecture', value: 'architecture'},
          {title: 'Workshop/Studio', value: 'workshop'},
          {title: 'Cultural', value: 'cultural'},
          {title: 'Landscape', value: 'landscape'},
        ],
        layout: 'radio',
      },
      initialValue: 'sacred-art',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'e.g., "Pietà" or "Florence Art School"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'artist',
      title: 'Artist / Creator',
      type: 'string',
      description: 'e.g., "Michelangelo Buonarroti" (optional for non-art locations)',
      hidden: ({document}) => document?.locationType !== 'sacred-art' && document?.locationType !== 'architecture',
    }),
    defineField({
      name: 'year',
      title: 'Year / Date Range',
      type: 'string',
      description: 'e.g., "1498-1499" or "c. 1600"',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      description: 'High quality image (1200-1600px wide, JPEG, under 500KB)',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Brief Description',
      type: 'text',
      rows: 3,
      description: 'Short description shown in cards',
    }),
    defineField({
      name: 'historicalSummary',
      title: 'Historical Context / About',
      type: 'text',
      rows: 5,
      description: 'Detailed history or background shown in the details panel',
    }),
    // Scripture - shown for Sacred Art
    defineField({
      name: 'scripturePairing',
      title: 'Scripture Pairing',
      type: 'object',
      description: 'For Sacred Art locations',
      hidden: ({document}) => document?.locationType !== 'sacred-art' && document?.locationType !== undefined && document?.locationType !== 'architecture',
      fields: [
        {
          name: 'verse',
          title: 'Scripture Verse',
          type: 'text',
          rows: 3,
          description: 'The scripture text (without quotes)',
        },
        {
          name: 'reference',
          title: 'Scripture Reference',
          type: 'string',
          description: 'e.g., "Matthew 23:37" or "Lamentations 1:12"',
        },
      ],
    }),
    // Quote - shown for non-Sacred Art types
    defineField({
      name: 'quote',
      title: 'Featured Quote',
      type: 'object',
      description: 'A meaningful quote about this location',
      hidden: ({document}) => document?.locationType === 'sacred-art' || document?.locationType === undefined || document?.locationType === 'architecture',
      fields: [
        {
          name: 'text',
          title: 'Quote Text',
          type: 'text',
          rows: 3,
          description: 'The quote (without quotes)',
        },
        {
          name: 'attribution',
          title: 'Attribution',
          type: 'string',
          description: 'e.g., "Dr. Elizabeth Lev" or "Local Artisan"',
        },
      ],
    }),
    defineField({
      name: 'reflectionQuestions',
      title: 'Reflection Questions',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Questions for contemplation',
    }),
    defineField({
      name: 'locationName',
      title: 'Location Name',
      type: 'string',
      description: 'e.g., "St. Peter\'s Basilica" or "Via Margutta"',
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
      description: 'e.g., "Vatican City" or "Rome"',
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
      initialValue: 'Italy',
    }),
    defineField({
      name: 'coordinates',
      title: 'Map Coordinates',
      type: 'object',
      description: 'For the Artwalk map. Tip: Right-click in Google Maps → "What\'s here?" to get coordinates',
      fields: [
        {
          name: 'lat',
          title: 'Latitude',
          type: 'number',
          description: 'e.g., 41.9022',
        },
        {
          name: 'lng',
          title: 'Longitude',
          type: 'number',
          description: 'e.g., 12.4568',
        },
      ],
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order within the episode (1, 2, 3...)',
      initialValue: 1,
    }),
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'order',
      by: [{field: 'order', direction: 'asc'}],
    },
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}],
    },
    {
      title: 'Location Type',
      name: 'locationType',
      by: [{field: 'locationType', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      artist: 'artist',
      location: 'locationName',
      locationType: 'locationType',
      media: 'image',
    },
    prepare({title, artist, location, locationType, media}) {
      const typeLabels: Record<string, string> = {
        'sacred-art': '🎨',
        'architecture': '⛪',
        'workshop': '🔨',
        'cultural': '🍷',
        'landscape': '🌿',
      }
      const icon = typeLabels[locationType] || '🎨'
      return {
        title: `${icon} ${title}`,
        subtitle: artist ? `${artist} • ${location || ''}` : location,
        media: media,
      }
    },
  },
})
