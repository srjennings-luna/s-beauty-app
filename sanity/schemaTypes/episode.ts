/**
 * @deprecated — Episode schema is retired as part of the KALLOS rebrand (Phase 1).
 * This schema is kept to prevent data loss for existing Sanity documents with _type: 'episode'.
 * Do NOT create new episodes. New content goes into `contentItem`.
 * This schema will be removed from the Studio sidebar once `contentItem` is fully live.
 */
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'episode',
  title: 'Episode',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Full Title',
      type: 'string',
      description: 'e.g., "Seeking Beauty in Vatican City"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'shortTitle',
      title: 'Short Title',
      type: 'string',
      description: 'e.g., "Vatican City" (shown in navigation)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'season',
      title: 'Season Number',
      type: 'number',
      initialValue: 1,
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'episodeNumber',
      title: 'Episode Number',
      type: 'number',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'summary',
      title: 'Episode Summary',
      type: 'text',
      rows: 4,
      description: 'Brief description of the episode (2-3 sentences)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'locationLabel',
      title: 'Location Label',
      type: 'string',
      description: 'e.g., "Vatican City, Rome, Italy"',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      description: 'Main image for the episode (1200-1600px wide, JPEG)',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'durationMinutes',
      title: 'Duration (minutes)',
      type: 'number',
    }),
    defineField({
      name: 'airDate',
      title: 'Air Date',
      type: 'string',
      description: 'e.g., "January 19, 2026"',
    }),
    defineField({
      name: 'ewtnPlusUrl',
      title: 'EWTN+ URL',
      type: 'url',
      description: 'Link to watch on EWTN+',
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'YouTube URL',
      type: 'url',
      description: 'YouTube video link (e.g., https://youtu.be/y2eLdkXVQgg)',
    }),
    defineField({
      name: 'isReleased',
      title: 'Is Released?',
      type: 'boolean',
      description: 'Toggle on when episode is available to watch',
      initialValue: false,
    }),
    defineField({
      name: 'featuredExperts',
      title: 'Featured Experts',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'name', title: 'Name', type: 'string'},
            {name: 'role', title: 'Role', type: 'string'},
          ],
          preview: {
            select: {
              title: 'name',
              subtitle: 'role',
            },
          },
        },
      ],
    }),
    defineField({
      name: 'artworks',
      title: 'Artworks',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'contentItem'}]}],
      description: 'Add artworks featured in this episode',
    }),
    defineField({
      name: 'reflections',
      title: 'Episode Reflections',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'question',
              title: 'Reflection Question',
              type: 'text',
              rows: 2,
            },
            {
              name: 'suggestedUse',
              title: 'Suggested Use',
              type: 'string',
              options: {
                list: [
                  {title: 'Individual', value: 'individual'},
                  {title: 'Family', value: 'family'},
                  {title: 'Group', value: 'group'},
                ],
              },
            },
          ],
          preview: {
            select: {
              title: 'question',
              subtitle: 'suggestedUse',
            },
          },
        },
      ],
    }),
  ],
  orderings: [
    {
      title: 'Episode Number',
      name: 'episodeNumber',
      by: [{field: 'season', direction: 'asc'}, {field: 'episodeNumber', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      season: 'season',
      episode: 'episodeNumber',
      media: 'heroImage',
      isReleased: 'isReleased',
    },
    prepare({title, season, episode, media, isReleased}) {
      return {
        title: title,
        subtitle: `S${season}E${episode} ${isReleased ? '✓ Released' : '○ Coming Soon'}`,
        media: media,
      }
    },
  },
})
