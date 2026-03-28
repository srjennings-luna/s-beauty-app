import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

// Preview URL for the KALLOS app on Vercel
const APP_PREVIEW_URL = 'https://kallos-app.vercel.app'

// Custom document action: opens the P&P page in preview mode for the given date
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PreviewInAppAction(props: any) {
  const doc = props.draft || props.published
  const date = doc?.date as string | undefined

  return {
    label: 'Preview in app',
    onHandle: () => {
      if (date) {
        window.open(
          `${APP_PREVIEW_URL}/prompt?date=${date}&preview=1`,
          '_blank',
          'noopener,noreferrer'
        )
      } else {
        alert('Save the document with a date first, then use Preview in app.')
      }
    },
  }
}

export default defineConfig({
  name: 'default',
  title: 'KALLOS CMS',

  projectId: 'em44j9m8',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items(
            S.documentTypeListItems().filter(
              (listItem) => !['episode'].includes(listItem.getId() ?? ''),
            ),
          ),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    actions: (prev: any[], context: any) => {
      if (context.schemaType === 'dailyPrompt') {
        return [...prev, PreviewInAppAction]
      }
      return prev
    },
  },
})
