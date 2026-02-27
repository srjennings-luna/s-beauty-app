import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

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
})
