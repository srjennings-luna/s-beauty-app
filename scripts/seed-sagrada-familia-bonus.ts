/**
 * Contueri — Seed the Sagrada Família bonus P&P day (June 11, 2026).
 *
 * Bonus day outside the 30-day plan, timed to Pope Leo XIV's June 10, 2026
 * blessing of the Tower of Jesus Christ on the centenary of Antoni Gaudí's
 * death. Source: CONTUERI-SagradaFamilia-EntryGuide.html (Cowork-updated).
 *
 * Creates:
 *   - contentItem  _id = pp-content-sagrada-familia-tower
 *   - dailyPrompt  _id = pp-prompt-sagrada-familia-tower
 *
 * No Tradition Reflections for this day (per entry guide).
 *
 * Usage:
 *   npx tsx scripts/seed-sagrada-familia-bonus.ts            DRY RUN
 *   npx tsx scripts/seed-sagrada-familia-bonus.ts --patch    actually write
 *
 * Re-run safe: createOrReplace on both docs with deterministic _ids.
 */

import {createClient} from '@sanity/client'
import {readFileSync, existsSync} from 'fs'
import {resolve} from 'path'

const PATCH_MODE = process.argv.includes('--patch')

// ─── env ─────────────────────────────────────────────────────────────────────

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), '.env.local')
  if (!existsSync(envPath)) return
  const text = readFileSync(envPath, 'utf8')
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let val = line.slice(eq + 1).trim()
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1)
    if (process.env[key] === undefined) process.env[key] = val
  }
}
loadEnvLocal()

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'em44j9m8'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_TOKEN
if (!token) {
  console.error('SANITY_TOKEN missing. Set it in .env.local.')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2025-01-01',
  token,
  useCdn: false,
})

// ─── data (verbatim from CONTUERI-SagradaFamilia-EntryGuide.html) ─────────────

const SLUG = 'sagrada-familia-tower'
const CONTENT_ID = `pp-content-${SLUG}`
const PROMPT_ID = `pp-prompt-${SLUG}`
const IMAGE_PATH = '/Users/sherijennings/Documents/p&p 31 days june_12_2026/Basílica_i_Temple_Expiatori_de_la_Sagrada_Família.jpg'

const TITLE = 'Tower of Jesus Christ, Sagrada Família'
const ARTIST = 'Antoni Gaudí'
const YEAR = '1882–2026'

const DESCRIPTION =
  "Gaudí designed the Sagrada Família's central tower as a beacon of light over Barcelona. Construction began in 1882. The Tower of Jesus Christ was completed and blessed by Pope Leo XIV on June 10, 2026, one hundred years after Gaudí's death."

const ARTWORK_HOOK =
  "Gaudí's original models for the Sagrada Família were burned by anarchists in 1936. The architects who came after rebuilt his vision from photographs and plaster fragments. The tower completed in 2026 is partly a resurrection from ash."

const CONTEXT = [
  "The Sagrada Família's first stone was laid March 19, 1882. Gaudí took over in 1883 and remade it entirely, pulling nature's geometry into stone and making columns like forest trees, windows like stained-glass canopies. He said his client was not in a hurry.",
  "Gaudí's models for the building were burned in the Spanish Civil War in 1936. The architects who came after worked from photographs and fragments. The completed building is, in part, an educated guess, which somehow makes it truer.",
  'The cross atop the central tower (17 meters of glass and white ceramic, designed to radiate light outward over the city) was installed in February 2026 and blessed by Pope Leo XIV on June 10, the centenary of Gaudí\'s death.',
].join('\n\n')

const REFLECTION_QUESTIONS = [
  'What in this building makes you want to look up?',
  'Gaudí said his client was not in a hurry. What would you build differently if you had more time?',
  'What beauty have you received from someone who did not live to see it given?',
]

const THEME_SLUGS = ['light', 'creation']

const LOCATION = {
  locationName: 'Basilica de la Sagrada Família',
  city: 'Barcelona',
  country: 'Spain',
  coordinates: {lat: 41.4036, lng: 2.1744},
}

const PROMPT_DATE = '2026-06-11'

const CURATOR_NOTE =
  "On June 7, 1926, Antoni Gaudí stepped out of the Sagrada Família crypt where he had been living and was struck by a tram on the Gran Via. Bystanders gathered but did not recognize him. Lean from years of fasting, wearing threadbare clothes, the city's most famous architect lay unidentified in the street. He was taken to a pauper's hospital. He died three days later. Yesterday was that day, one hundred years on."

const PROMPT_QUESTION =
  'What would you give yourself to completely, if completion were not the point?'

const LECTIO_TEXT = 'Originality consists in returning to the origin.'
const LECTIO_ATTRIBUTION = 'Antoni Gaudí'

const ACTIO =
  'Name one thing you are tending that you will not finish. A relationship, a practice, something you are building or trying to heal. Write it down in a single sentence. Then set it down, as if what matters is not your finishing it, but your having been part of it.'

// ─── helpers ─────────────────────────────────────────────────────────────────

async function resolveThemeRefs(slugs: string[]): Promise<{_ref: string; _type: 'reference'; _key: string}[]> {
  const themes: Array<{_id: string; slug: string}> = await client.fetch(
    `*[_type == "theme" && slug.current in $slugs]{ _id, "slug": slug.current }`,
    {slugs},
  )
  const missing = slugs.filter((s) => !themes.find((t) => t.slug === s))
  if (missing.length) {
    throw new Error(`Theme slugs not found in Sanity: ${missing.join(', ')}`)
  }
  return themes.map((t) => ({_ref: t._id, _type: 'reference' as const, _key: t.slug}))
}

async function uploadImageAsset(path: string) {
  if (!existsSync(path)) throw new Error(`Image not found: ${path}`)
  const buf = readFileSync(path)
  const filename = path.split('/').pop() || 'sagrada-familia.jpg'
  const asset = await client.assets.upload('image', buf, {filename})
  return asset._id
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Mode: ${PATCH_MODE ? 'PATCH (writes enabled)' : 'DRY RUN'}\n`)

  console.log('1. Resolving theme refs…')
  const themeRefs = await resolveThemeRefs(THEME_SLUGS)
  console.log(`   ✓ ${themeRefs.length} themes: ${THEME_SLUGS.join(', ')}\n`)

  let imageAssetId: string | null = null
  if (PATCH_MODE) {
    console.log('2. Uploading image asset…')
    imageAssetId = await uploadImageAsset(IMAGE_PATH)
    console.log(`   ✓ ${imageAssetId}\n`)
  } else {
    console.log('2. Would upload image asset (dry run)\n')
  }

  const contentDoc = {
    _id: CONTENT_ID,
    _type: 'contentItem',
    contentType: 'sacred-art',
    title: TITLE,
    artist: ARTIST,
    year: YEAR,
    themes: themeRefs,
    description: DESCRIPTION,
    artworkHook: ARTWORK_HOOK,
    context: CONTEXT,
    reflectionQuestions: REFLECTION_QUESTIONS,
    ...LOCATION,
    ...(imageAssetId
      ? {image: {_type: 'image', asset: {_type: 'reference', _ref: imageAssetId}}}
      : {}),
  }

  const promptDoc = {
    _id: PROMPT_ID,
    _type: 'dailyPrompt',
    date: PROMPT_DATE,
    content: {_type: 'reference', _ref: CONTENT_ID},
    curatorNote: CURATOR_NOTE,
    promptQuestion: PROMPT_QUESTION,
    lectio: {text: LECTIO_TEXT, attribution: LECTIO_ATTRIBUTION},
    actio: ACTIO,
  }

  console.log('3. contentItem:')
  console.log(`   _id: ${contentDoc._id}`)
  console.log(`   title: ${contentDoc.title}`)
  console.log(`   themes: ${themeRefs.map((r) => r._key).join(', ')}`)
  console.log(`   year: ${contentDoc.year}`)
  console.log(`   image: ${imageAssetId ?? '(skipped in dry run)'}\n`)

  console.log('4. dailyPrompt:')
  console.log(`   _id: ${promptDoc._id}`)
  console.log(`   date: ${promptDoc.date}`)
  console.log(`   content ref → ${CONTENT_ID}`)
  console.log(`   promptQuestion: ${PROMPT_QUESTION.slice(0, 60)}…\n`)

  if (!PATCH_MODE) {
    console.log('Dry run complete. Re-run with --patch to write.')
    return
  }

  console.log('5. Writing to Sanity…')
  await client.createOrReplace(contentDoc)
  console.log(`   ✓ contentItem ${CONTENT_ID}`)
  await client.createOrReplace(promptDoc)
  console.log(`   ✓ dailyPrompt ${PROMPT_ID}\n`)
  console.log('Done. Visit Studio to verify.')
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
