import { defineField, defineType } from 'sanity'

// Pause & Ponder defaults — singleton document.
//
// Holds the global default copy for the daily Actio (action) prompt
// shown on the Today / Pause & Ponder surface. Before this schema
// existed (PP-DEFAULTS-01, June 7, 2026), the fallback was hardcoded
// into app/prompt/PromptClient.tsx — every day with no per-prompt
// actio showed the same React-JSX string and there was no way to
// tune editorial voice without a code change.
//
// Mirrors the visioDefaults pattern from VD-ACTION-01:
//   1. Per-day prompt actio on `dailyPrompt.actio` — wins if set
//   2. ppDefaults singleton (this document) — applies otherwise
//   3. Hardcoded last-resort in PromptClient.tsx — only if the
//      singleton doesn't exist (defensive; should never happen)
//
// Singleton — Studio should expose one document, not a list.
// lib/sanity.ts `getPpDefaults()` reads the first document and
// ignores any duplicates.

export default defineType({
  name: 'ppDefaults',
  title: 'Pause & Ponder Defaults',
  type: 'document',
  fields: [
    defineField({
      name: 'defaultActio',
      title: 'Default Actio',
      type: 'text',
      rows: 3,
      description:
        "The fallback Actio shown on any P&P day where the dailyPrompt's own actio field is blank. Edit here to change the voice across every default-actio day at once. Replaces the previously hardcoded \"Carry one image of beauty with you today. Let it be a question, not an answer.\"",
      validation: (Rule) => Rule.required().max(280),
    }),
  ],
  preview: {
    select: { title: 'defaultActio' },
    prepare: ({ title }) => ({
      title: 'Pause & Ponder Defaults',
      subtitle: title ? title.slice(0, 80) + (title.length > 80 ? '…' : '') : '(not set)',
    }),
  },
})
