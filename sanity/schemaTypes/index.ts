import episode from './episode'
import splashPage from './splashPage'
import traditionReflection from './traditionReflection'
import theme from './theme'
import contentItem from './contentItem'
import auditio from './auditio'
import journey from './journey'
import journeyDay from './journeyDay'
import dailyPrompt from './dailyPrompt'

export const schemaTypes = [
  // Foundational — create these BEFORE journey days or P&P records
  theme,
  contentItem,
  traditionReflection,
  auditio,
  // Journey content — references foundational docs above
  journey,
  journeyDay,
  dailyPrompt,
  // Other
  splashPage,
  // Deprecated — kept to preserve existing Sanity data, hidden from sidebar
  episode,
]
