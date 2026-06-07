import { defineField, defineType } from 'sanity'

// Visio Divina defaults — singleton document.
//
// Holds the default copy for the contemplative prompts on the
// Visio Divina (Pray + Action) steps. Before this schema existed
// (VD-ACTION-01, June 6, 2026), those prompts were hardcoded into
// app/pray/[artworkId]/PrayClient.tsx — every artwork showed the
// same React-JSX string and there was no way to tune editorial
// voice without a code change.
//
// The cascade the app uses:
//   1. Per-artwork override on `contentItem` (customActioHeadline,
//      customActioInstruction, customPrayerPrompt) — wins if set.
//   2. visioDefaults singleton (this document) — applies otherwise.
//   3. Hardcoded last-resort fallback in PrayClient.tsx — only if
//      the singleton doesn't exist yet (e.g. brand-new dataset,
//      migration not run).
//
// Intended as a SINGLETON. Studio structure should expose one
// document, not a list. lib/sanity.ts `getVisioDefaults()` reads
// the first document of this type and ignores any duplicates that
// might appear from a Studio mishap.

export default defineType({
  name: 'visioDefaults',
  title: 'Visio Divina Defaults',
  type: 'document',
  fields: [
    defineField({
      name: 'defaultActioHeadline',
      title: 'Default Actio headline',
      type: 'string',
      description:
        'The italic Cormorant prompt shown centered on the Visio Divina Action step. The current hardcoded value is "How will you live this out?" — used as the default for all artworks unless overridden per-content-item.',
      validation: (Rule) => Rule.required().max(140),
    }),
    defineField({
      name: 'defaultActioInstruction',
      title: 'Default Actio instruction',
      type: 'text',
      rows: 3,
      description:
        'The supporting prompt shown below the headline on the Action step. Current hardcoded value: "Ask yourself and God: How will you apply what you\'ve received in prayer to your life?"',
      validation: (Rule) => Rule.required().max(280),
    }),
    defineField({
      name: 'defaultPrayerPrompt',
      title: 'Default Pray prompt',
      type: 'text',
      rows: 3,
      description:
        'The instruction sentence above the Traditional Prayer drawer on the Pray step. Current hardcoded value: "Respond to God in prayer—thanksgiving, intercession, or simply conversation about what you notice."',
      validation: (Rule) => Rule.required().max(280),
    }),
    defineField({
      name: 'defaultTraditionalPrayer',
      title: 'Default Traditional Prayer',
      type: 'text',
      rows: 8,
      description:
        'The traditional prayer shown in the expandable drawer when the artwork does not have its own `traditionalPrayer` value. Replaces the previously hardcoded FALLBACK_PRAYER in PrayClient.tsx.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'defaultTraditionalPrayerSource',
      title: 'Default Traditional Prayer — Source',
      type: 'string',
      description: 'Attribution for the default prayer above. Hidden in app when blank.',
    }),
  ],
  preview: {
    select: { title: 'defaultActioHeadline' },
    prepare: ({ title }) => ({
      title: 'Visio Divina Defaults',
      subtitle: title ?? '(not set)',
    }),
  },
})
