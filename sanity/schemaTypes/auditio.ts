import {defineField, defineType} from 'sanity'

/**
 * auditio — standalone document type (April 2026, Schema R7).
 *
 * Previously an embedded object inside journeyDay and dailyPrompt.
 * Promoted to a standalone document to enable:
 *   - Reuse across multiple journeys / P&P records without data duplication
 *   - A standalone "Music Library" feature in the app
 *   - Content-repeat analysis at the work level (same piece used twice)
 *   - Consistent attribution across every reference
 *
 * Entry workflow: create this document BEFORE the journeyDay or dailyPrompt
 * that references it. Same pattern as contentItem and traditionReflection.
 *
 * Field consolidation vs. the old embedded objects:
 *   - `composer` (journeyDay) and `artist` (dailyPrompt) are removed.
 *     Use `composerArtist` for the canonical structured name.
 *   - `audioUrl.audioFile` / `audioUrl.audioUrl` (dailyPrompt nested object)
 *     are flattened to top-level `audioFile` / `audioUrl`.
 *   - `url` (dailyPrompt external link) is renamed `externalUrl` to match
 *     journeyDay and the review grid column.
 *   - `verbaOriginal` (was dailyPrompt-only) is now available on all auditio
 *     documents so any P&P or journey day can show lyrics.
 */
export default defineType({
  name: 'auditio',
  title: 'Auditio',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Name of the piece, e.g. "Miserere Mei, Deus" or "Gymnopédies No. 1".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'composerArtist',
      title: 'Composer / Artist',
      type: 'string',
      description: 'Just the name, e.g. "Gregorio Allegri" or "Arvo Pärt". Used for dedup and content-repeat analysis.',
    }),
    defineField({
      name: 'workTitle',
      title: 'Work Title (structured)',
      type: 'string',
      description: 'Just the piece title, e.g. "Miserere Mei, Deus". Used for dedup — same composer twice is fine; same work twice is repetition.',
    }),
    defineField({
      name: 'genre',
      title: 'Genre',
      type: 'string',
      description: 'Select the closest genre. Used to track variety and prevent over-reliance on any single register.',
      options: {
        list: [
          {title: 'Gregorian Chant',        value: 'gregorian-chant'},
          {title: 'Sacred Polyphony',        value: 'sacred-polyphony'},
          {title: 'Classical / Orchestral',  value: 'classical-orchestral'},
          {title: 'Contemporary Sacred',     value: 'contemporary-sacred'},
          {title: 'Ambient / Meditation',    value: 'ambient-meditation'},
          {title: 'Folk',                    value: 'folk'},
          {title: 'World Music',             value: 'world-music'},
          {title: 'Jazz',                    value: 'jazz'},
          {title: 'Secular',                 value: 'secular'},
        ],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'licensingNote',
      title: 'Licensing Note',
      type: 'string',
      description: 'e.g. "Public domain — multiple recordings on Musopen and Internet Archive"',
    }),
    defineField({
      name: 'audioFile',
      title: 'Audio File (in-app playback)',
      type: 'file',
      description: 'Upload an MP3 — plays directly in KALLOS.',
      options: {accept: 'audio/*'},
    }),
    defineField({
      name: 'audioUrl',
      title: 'Audio URL (in-app playback)',
      type: 'string',
      description: 'Direct MP3 link (e.g. archive.org) — plays in-app. Use this OR the file upload, not both.',
    }),
    defineField({
      name: 'externalUrl',
      title: 'External Link (reference only — opens outside app)',
      type: 'url',
      description: 'YouTube, Spotify, or Apple Music. Only use if no Audio File or Audio URL is provided above. Opens outside KALLOS and breaks the in-app experience.',
    }),
    defineField({
      name: 'verbaOriginal',
      title: 'Verba — Text',
      type: 'text',
      rows: 10,
      description: 'Optional. Paste lyrics or text here in any format — Latin only, English only, or both together (interleaved or stacked). Shown in a scrollable expandable panel below the audio player, labelled VERBA.',
    }),
  ],
  orderings: [
    {
      title: 'Composer then Title',
      name: 'composerTitleAsc',
      by: [
        {field: 'composerArtist', direction: 'asc'},
        {field: 'title', direction: 'asc'},
      ],
    },
    {
      title: 'Genre then Composer',
      name: 'genreComposerAsc',
      by: [
        {field: 'genre', direction: 'asc'},
        {field: 'composerArtist', direction: 'asc'},
      ],
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
      composerArtist: 'composerArtist',
      genre: 'genre',
    },
    prepare({title, composerArtist, genre}: {title?: string; composerArtist?: string; genre?: string}) {
      return {
        title: title || 'Untitled',
        subtitle: [composerArtist, genre].filter(Boolean).join(' · '),
      }
    },
  },
})
