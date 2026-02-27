import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'em44j9m8',
    dataset: 'production'
  },
  deployment: {
    appId: 'st6582bbfjk77wyhbb1n2nkb',
    autoUpdates: true,
  },
})
