import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'splashPage',
  title: 'Splash Page',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'styling', title: 'Styling'},
  ],
  fields: [
    // === CONTENT GROUP ===
    defineField({
      name: 'pageNumber',
      title: 'Page Number',
      type: 'number',
      description: 'Order of the splash page (1, 2, etc.)',
      validation: (Rule) => Rule.required().min(1),
      group: 'content',
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
      group: 'content',
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
      group: 'content',
    }),
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 2,
      description: 'e.g., "Beauty will save the world"',
      hidden: ({document}) => document?.pageType !== 'image-quote',
      group: 'content',
    }),
    defineField({
      name: 'quoteAttribution',
      title: 'Quote Attribution',
      type: 'string',
      description: 'e.g., "Fyodor Dostoevsky"',
      hidden: ({document}) => document?.pageType !== 'image-quote',
      group: 'content',
    }),
    // For Text Content pages (Page 2 style)
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'e.g., "Your Companion for Contemplation"',
      hidden: ({document}) => document?.pageType !== 'text-content',
      group: 'content',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      description: 'Main description paragraph',
      hidden: ({document}) => document?.pageType !== 'text-content',
      group: 'content',
    }),
    defineField({
      name: 'buttonText',
      title: 'Button Text',
      type: 'string',
      description: 'e.g., "Let\'s explore"',
      hidden: ({document}) => document?.pageType !== 'text-content',
      group: 'content',
    }),

    // === STYLING GROUP ===
    // Image with Quote styling
    defineField({
      name: 'quoteColor',
      title: 'Quote Text Color',
      type: 'string',
      description: 'Hex color (e.g., #FFFFFF). Default: white at 70% opacity',
      hidden: ({document}) => document?.pageType !== 'image-quote',
      group: 'styling',
    }),
    defineField({
      name: 'quoteFont',
      title: 'Quote Font Style',
      type: 'string',
      options: {
        list: [
          {title: 'Italic (default)', value: 'italic'},
          {title: 'Normal', value: 'normal'},
        ],
        layout: 'radio',
      },
      initialValue: 'italic',
      hidden: ({document}) => document?.pageType !== 'image-quote',
      group: 'styling',
    }),
    defineField({
      name: 'attributionColor',
      title: 'Attribution Text Color',
      type: 'string',
      description: 'Hex color. Default: white at 40% opacity',
      hidden: ({document}) => document?.pageType !== 'image-quote',
      group: 'styling',
    }),
    defineField({
      name: 'bottomBackgroundColor',
      title: 'Bottom Section Background',
      type: 'string',
      description: 'Hex color. Default: #203545 (dark teal)',
      hidden: ({document}) => document?.pageType !== 'image-quote',
      group: 'styling',
    }),

    // Text Content styling
    defineField({
      name: 'titleColor',
      title: 'Title Color',
      type: 'string',
      description: 'Hex color. Default: white at 90% opacity',
      hidden: ({document}) => document?.pageType !== 'text-content',
      group: 'styling',
    }),
    defineField({
      name: 'titleSize',
      title: 'Title Size',
      type: 'string',
      options: {
        list: [
          {title: 'Small', value: 'text-xl'},
          {title: 'Medium (default)', value: 'text-2xl'},
          {title: 'Large', value: 'text-3xl'},
        ],
        layout: 'radio',
      },
      initialValue: 'text-2xl',
      hidden: ({document}) => document?.pageType !== 'text-content',
      group: 'styling',
    }),
    defineField({
      name: 'descriptionColor',
      title: 'Description Color',
      type: 'string',
      description: 'Hex color. Default: white at 50% opacity',
      hidden: ({document}) => document?.pageType !== 'text-content',
      group: 'styling',
    }),
    defineField({
      name: 'buttonBackgroundColor',
      title: 'Button Background Color',
      type: 'string',
      description: 'Hex color. Default: #C19B5F (gold)',
      hidden: ({document}) => document?.pageType !== 'text-content',
      group: 'styling',
    }),
    defineField({
      name: 'buttonTextColor',
      title: 'Button Text Color',
      type: 'string',
      description: 'Hex color. Default: #FFFFFF (white)',
      hidden: ({document}) => document?.pageType !== 'text-content',
      group: 'styling',
    }),
    defineField({
      name: 'backgroundGradientStart',
      title: 'Background Gradient Start',
      type: 'string',
      description: 'Hex color for top-left. Default: #4C3759 (purple)',
      hidden: ({document}) => document?.pageType !== 'text-content',
      group: 'styling',
    }),
    defineField({
      name: 'backgroundGradientEnd',
      title: 'Background Gradient End',
      type: 'string',
      description: 'Hex color for bottom-right. Default: #203545 (dark teal)',
      hidden: ({document}) => document?.pageType !== 'text-content',
      group: 'styling',
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
