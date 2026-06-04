import {defineField, defineType, defineArrayMember} from 'sanity'

// Block-based splash schema. Each splashPage document is ONE screen.
// `blocks[]` is an ordered array of polymorphic block objects rendered
// top-to-bottom by app/splash/SplashClient.tsx. Brand colors and fonts
// live in the component, not here. Editors choose which blocks appear
// and in what order; visual treatment is a fixed function of block type.

export default defineType({
  name: 'splashPage',
  title: 'Splash Screen',
  type: 'document',
  fields: [
    defineField({
      name: 'screenNumber',
      title: 'Screen Number',
      type: 'number',
      description: 'Order in the splash sequence (1, 2, 3…). Lower numbers shown first.',
      validation: (Rule) => Rule.required().min(1).integer(),
    }),
    defineField({
      name: 'screenTitle',
      title: 'Screen Title (admin only)',
      type: 'string',
      description: 'A short label for this screen in Studio (e.g. "Brand Identity"). Not shown to users.',
    }),
    defineField({
      name: 'blocks',
      title: 'Blocks',
      type: 'array',
      description:
        'Content blocks rendered top-to-bottom. Choose one block per piece of content; visual treatment is fixed by block type.',
      of: [
        defineArrayMember({
          name: 'wordmark',
          title: 'Wordmark',
          type: 'object',
          fields: [
            defineField({
              name: 'text',
              title: 'Text',
              type: 'string',
              description: 'Brand wordmark, e.g. "KALLOS". Rendered in Montserrat uppercase, wide tracking.',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {select: {title: 'text'}, prepare: ({title}) => ({title: `Wordmark — ${title ?? ''}`})},
        }),
        defineArrayMember({
          name: 'pronunciation',
          title: 'Pronunciation',
          type: 'object',
          fields: [
            defineField({
              name: 'text',
              title: 'Text',
              type: 'string',
              description: 'Pronunciation guide, e.g. "kal · os". Rendered in Cormorant italic, small.',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {select: {title: 'text'}, prepare: ({title}) => ({title: `Pronunciation — ${title ?? ''}`})},
        }),
        defineArrayMember({
          name: 'goldRule',
          title: 'Gold Rule',
          type: 'object',
          fields: [
            defineField({
              name: 'note',
              title: 'Note (admin only)',
              type: 'string',
              description: 'Optional note for editors. Not displayed.',
            }),
          ],
          preview: {prepare: () => ({title: 'Gold Rule —'})},
        }),
        defineArrayMember({
          name: 'quote',
          title: 'Quote',
          type: 'object',
          fields: [
            defineField({
              name: 'text',
              title: 'Text',
              type: 'text',
              rows: 2,
              description: 'Display quote. Rendered in Cormorant italic, large. Quotation marks are added automatically.',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {select: {title: 'text'}, prepare: ({title}) => ({title: `Quote — ${(title ?? '').slice(0, 50)}`})},
        }),
        defineArrayMember({
          name: 'heading',
          title: 'Heading',
          type: 'object',
          fields: [
            defineField({
              name: 'text',
              title: 'Text',
              type: 'string',
              description: 'Screen heading. Rendered in Cormorant italic, large.',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {select: {title: 'text'}, prepare: ({title}) => ({title: `Heading — ${title ?? ''}`})},
        }),
        defineArrayMember({
          name: 'body',
          title: 'Body',
          type: 'object',
          fields: [
            defineField({
              name: 'text',
              title: 'Text',
              type: 'text',
              rows: 4,
              description: 'Body paragraph. Rendered in Open Sans light, line height 1.8.',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {select: {title: 'text'}, prepare: ({title}) => ({title: `Body — ${(title ?? '').slice(0, 60)}`})},
        }),
        defineArrayMember({
          name: 'tagline',
          title: 'Tagline',
          type: 'object',
          fields: [
            defineField({
              name: 'text',
              title: 'Text',
              type: 'string',
              description:
                'Short closing line. Rendered in Montserrat verdigris (#5F7A6B), small. Optional — leave empty to keep the block as a placeholder for future text without rendering anything on the screen.',
              // Optional (June 3, 2026). Sheri wants the ability to
              // clear the text in Studio while keeping the tagline
              // block in place as a structural placeholder, so future
              // closer text can be added back without re-creating the
              // block. Renderer skips empty taglines so no visual gap.
            }),
          ],
          preview: {
            select: {title: 'text'},
            prepare: ({title}) => ({title: `Tagline — ${title || '(empty)'}`}),
          },
        }),
        defineArrayMember({
          name: 'featureCard',
          title: 'Feature Card',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              description: 'Small caps label at the top of the card (e.g. "Pause & Ponder").',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'text',
              rows: 2,
              description: 'One-sentence description for the card.',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {title: 'label', subtitle: 'body'},
            prepare: ({title, subtitle}) => ({title: `Card — ${title ?? ''}`, subtitle: subtitle ?? ''}),
          },
        }),
        defineArrayMember({
          name: 'primaryCta',
          title: 'Primary CTA',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Button Label',
              type: 'string',
              description: 'e.g. "Start here →". Rendered as a gold filled button.',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'linkPath',
              title: 'Link Path',
              type: 'string',
              description:
                'App route to navigate to (e.g. /journeys/beauty-truth-and-goodness or /prompt). When tapped, marks onboarding complete.',
              validation: (Rule) => Rule.required().regex(/^\//, {name: 'leading slash'}),
            }),
          ],
          preview: {select: {title: 'label', subtitle: 'linkPath'}, prepare: ({title, subtitle}) => ({title: `Primary CTA — ${title ?? ''}`, subtitle: subtitle ?? ''})},
        }),
        defineArrayMember({
          name: 'secondaryCta',
          title: 'Secondary CTA',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Button Label',
              type: 'string',
              description: 'e.g. "See today\'s Pause & Ponder →". Rendered as a small text link.',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'linkPath',
              title: 'Link Path',
              type: 'string',
              description: 'App route to navigate to. When tapped, marks onboarding complete.',
              validation: (Rule) => Rule.required().regex(/^\//, {name: 'leading slash'}),
            }),
          ],
          preview: {select: {title: 'label', subtitle: 'linkPath'}, prepare: ({title, subtitle}) => ({title: `Secondary CTA — ${title ?? ''}`, subtitle: subtitle ?? ''})},
        }),
      ],
      validation: (Rule) => Rule.min(1),
    }),
  ],
  preview: {
    select: {
      screenNumber: 'screenNumber',
      screenTitle: 'screenTitle',
      blocks: 'blocks',
    },
    prepare({screenNumber, screenTitle, blocks}) {
      // Surface the first text-carrying block so the list row has a useful subtitle.
      const arr = (blocks as Array<{_type: string; text?: string; label?: string}> | undefined) ?? []
      const firstTextBlock = arr.find((b) => typeof b?.text === 'string' && b.text.length > 0)
      const fallbackLabel = arr.find((b) => typeof b?.label === 'string' && b.label.length > 0)?.label
      const subtitle = (firstTextBlock?.text ?? fallbackLabel ?? '').slice(0, 60)
      return {
        title: `Screen ${screenNumber ?? '?'}${screenTitle ? ` — ${screenTitle}` : ''}`,
        subtitle,
      }
    },
  },
  orderings: [
    {
      title: 'Screen Order',
      name: 'screenOrder',
      by: [{field: 'screenNumber', direction: 'asc'}],
    },
  ],
})
