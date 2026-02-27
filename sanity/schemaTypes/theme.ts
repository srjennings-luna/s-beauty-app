import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'theme',
  title: 'Theme',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Theme Name',
      type: 'string',
      description: 'e.g., "Light"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-safe version. e.g., "light"',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'question',
      title: 'Central Question',
      type: 'string',
      description: 'e.g., "What does light reveal that darkness hides?"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: '2–3 sentence description of the theme for the Explore/Journey UI',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'color',
      title: 'Color',
      type: 'string',
      description: 'Hex color for UI pills and theme cards. e.g., "#C19B5F"',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Display order in theme lists. Initial: 1–5.',
    }),
    defineField({
      name: 'image',
      title: 'Hero Image',
      type: 'image',
      description: 'Optional hero image for theme cards in Explore UI',
      options: {
        hotspot: true,
      },
    }),
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
    {
      title: 'Title A–Z',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      question: 'question',
      media: 'image',
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prepare({title, question, media}: {title?: string; question?: string; media?: any}) {
      return {
        title: title || 'Untitled Theme',
        subtitle: question,
        media,
      }
    },
  },
})
