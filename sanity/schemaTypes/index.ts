import episode from './episode'
import splashPage from './splashPage'
import traditionReflection from './traditionReflection'
import theme from './theme'
import contentItem from './contentItem'
import journey from './journey'
import journeyDay from './journeyDay'
import dailyPrompt from './dailyPrompt'

export const schemaTypes = [
  // New schemas
  theme,
  contentItem,
  journey,
  journeyDay,
  dailyPrompt,
  // Kept schemas
  splashPage,
  traditionReflection,
  // Deprecated — kept to preserve existing Sanity data, hidden from sidebar
  episode,
]
