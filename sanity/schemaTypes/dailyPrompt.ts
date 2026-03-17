import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'dailyPrompt',
  title: 'Pause & Ponder',
  type: 'document',
  fields: [
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      description: 'The date this prompt appears. One per day. Format: YYYY-MM-DD.',
      options: {
        dateFormat: 'YYYY-MM-DD',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Featured Content',
      type: 'reference',
      to: [{type: 'contentItem'}],
      description: 'The featured content for this day.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'promptQuestion',
      title: 'Prompt Question',
      type: 'text',
      rows: 2,
      description: 'Optional: shown on the Today page card as the teaser. Not shown inside the prompt practice.',
    }),
    defineField({
      name: 'curatorNote',
      title: 'Curator Note',
      type: 'text',
      rows: 3,
      description: 'Optional: why this was chosen for today. The human editorial voice.',
    }),
    defineField({
      name: 'lectio',
      title: 'Reading (Lectio)',
      type: 'object',
      description: 'Optional: a quote, scripture passage, or short text for the day.',
      fields: [
        defineField({
          name: 'text',
          title: 'Text',
          type: 'text',
          rows: 4,
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'attribution',
          title: 'Attribution',
          type: 'string',
          description: 'e.g. "Matthew 5:8" or "Thomas Aquinas, Summa Theologica I.39.8"',
        }),
      ],
    }),
    defineField({
      name: 'auditio',
      title: 'Music (Auditio)',
      type: 'object',
      description: 'Optional: a piece of music to accompany the practice.',
      fields: [
        defineField({
          name: 'title',
          title: 'Title',
          type: 'string',
          description: 'Name of the piece, e.g. "Kommt, ihr Töchter, helft mir klagen"',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'artist',
          title: 'Artist / Composer',
          type: 'string',
        }),
        defineField({
          name: 'audioUrl',
          title: 'Audio Source (in-app playback)',
          type: 'object',
          description: 'Use either the file upload or the URL — not both.',
          fields: [
            defineField({
              name: 'audioFile',
              title: 'Audio File Upload',
              type: 'file',
              options: { accept: 'audio/*' },
            }),
            defineField({
              name: 'audioUrl',
              title: 'Audio URL',
              type: 'string',
              description: 'Direct MP3 link for in-app playback — use archive.org or another hosted source.',
            }),
          ],
        }),
        defineField({
          name: 'url',
          title: 'External Link (reference only — opens outside app)',
          type: 'url',
          description: 'YouTube, Spotify, or Apple Music. Only use if no Audio File or Audio URL is provided above. This opens outside KALLOS and breaks the in-app experience.',
        }),
      ],
    }),
    defineField({
      name: 'actio',
      title: 'Action (Actio)',
      type: 'text',
      rows: 3,
      description: 'An invitation to carry something into the day. One concrete, gentle action.',
    }),
    defineField({
      name: 'relatedJourney',
      title: 'Related Journey',
      type: 'reference',
      to: [{type: 'journey'}],
      description: 'Optional: if a Journey deepens this prompt, link it here. Shown as a quiet CTA at the bottom of the prompt.',
    }),
    defineField({
      name: 'theme',
      title: 'Theme',
      type: 'reference',
      to: [{type: 'theme'}],
      description: 'Optional theme tag. Helps users on a Journey see the connection.',
    }),
  ],
  orderings: [
    {
      title: 'Date (newest first)',
      name: 'dateDesc',
      by: [{field: 'date', direction: 'desc'}],
    },
    {
      title: 'Date (oldest first)',
      name: 'dateAsc',
      by: [{field: 'date', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      date: 'date',
      promptQuestion: 'promptQuestion',
    },
    prepare({date, promptQuestion}: {date?: string; promptQuestion?: string}) {
      return {
        title: date || 'No date',
        subtitle: promptQuestion,
      }
    },
  },
})
