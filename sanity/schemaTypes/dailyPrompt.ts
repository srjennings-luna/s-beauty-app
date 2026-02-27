import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'dailyPrompt',
  title: 'Daily Prompt',
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
      description: 'The single reflection question for the day. Curated specifically for this pairing.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'curatorNote',
      title: 'Curator Note',
      type: 'text',
      rows: 3,
      description: 'Optional: why this was chosen for today. The human editorial voice.',
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
