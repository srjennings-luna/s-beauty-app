import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'splashPage',
  title: 'Splash Page',
  type: 'document',
  fields: [
    defineField({
      name: 'pageNumber',
      title: 'Page Number',
      type: 'number',
      description: 'Order of the splash page (1, 2, etc.)',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'pageType',
      title: 'Page Type',
      type: 'string',
      options: {
        list: [
          {title: 'Image with Quote', value: 'image-quote'},
          {title: 'Text Content', value: 'text-content'},
        ],
        layout: 'radio',
      },
      initialValue: 'image-quote',
    }),
    // For Image with Quote pages (Page 1 style)
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      description: 'Full-width promo image (top 2/3 of screen)',
      options: {
        hotspot: true,
      },
      hidden: ({document}) => document?.pageType !== 'image-quote',
    }),
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 2,
      description: 'e.g., "Beauty will save the world"',
      hidden: ({document}) => document?.pageType !== 'image-quote',
    }),
    defineField({
      name: 'quoteAttribution',
      title: 'Quote Attribution',
      type: 'string',
      description: 'e.g., "Fyodor Dostoevsky"',
      hidden: ({document}) => document?.pageType !== 'image-quote',
    }),
    // For Text Content pages (Page 2 style)
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'e.g., "Your Companion for Contemplation"',
      hidden: ({document}) => document?.pageType !== 'text-content',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      description: 'Main description paragraph',
      hidden: ({document}) => document?.pageType !== 'text-content',
    }),
    defineField({
      name: 'buttonText',
      title: 'Button Text',
      type: 'string',
      description: 'e.g., "Let\'s explore"',
      hidden: ({document}) => document?.pageType !== 'text-content',
    }),
  ],
  preview: {
    select: {
      pageNumber: 'pageNumber',
      pageType: 'pageType',
      title: 'title',
      quote: 'quote',
    },
    prepare({pageNumber, pageType, title, quote}) {
      return {
        title: `Splash Page ${pageNumber}`,
        subtitle: pageType === 'text-content' ? title : quote?.substring(0, 40) + '...',
      }
    },
  },
  orderings: [
    {
      title: 'Page Order',
      name: 'pageOrder',
      by: [{field: 'pageNumber', direction: 'asc'}],
    },
  ],
})
