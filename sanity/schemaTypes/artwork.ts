import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'artwork',
  title: 'Artwork',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Artwork Title',
      type: 'string',
      description: 'e.g., "Pietà" or "The Calling of St. Matthew"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'artist',
      title: 'Artist',
      type: 'string',
      description: 'e.g., "Michelangelo Buonarroti"',
    }),
    defineField({
      name: 'year',
      title: 'Year / Date Range',
      type: 'string',
      description: 'e.g., "1498-1499" or "c. 1600"',
    }),
    defineField({
      name: 'image',
      title: 'Artwork Image',
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
      description: 'Short description shown in artwork cards',
    }),
    defineField({
      name: 'historicalSummary',
      title: 'Historical Context',
      type: 'text',
      rows: 5,
      description: 'Detailed history shown in the Reflections panel',
    }),
    defineField({
      name: 'scripturePairing',
      title: 'Scripture Pairing',
      type: 'object',
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
      description: 'e.g., "St. Peter\'s Basilica - North Aisle"',
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
      description: 'For the Artwalk map',
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
  ],
  preview: {
    select: {
      title: 'title',
      artist: 'artist',
      location: 'locationName',
      media: 'image',
    },
    prepare({title, artist, location, media}) {
      return {
        title: title,
        subtitle: artist ? `${artist} • ${location || ''}` : location,
        media: media,
      }
    },
  },
})
