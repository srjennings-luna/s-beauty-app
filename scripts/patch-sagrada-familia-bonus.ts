/**
 * Contueri — Sagrada Família bonus day patch (June 11, 2026).
 *
 * Applies the post-seed corrections from CONTUERI-SagradaFamilia-CC-PatchBrief.html:
 *   Task 1 — contentItem field updates (description, artworkHook, context, reflectionQuestions)
 *   Task 2 — dailyPrompt lectio reshape (philosophy + scripture pairing with John 8:12)
 *   Task 3 — new Tradition Reflection + link from dailyPrompt
 *
 * Usage:
 *   npx tsx scripts/patch-sagrada-familia-bonus.ts            DRY RUN
 *   npx tsx scripts/patch-sagrada-familia-bonus.ts --patch    actually write
 *
 * Re-run safe: .patch().set() on existing docs, createOrReplace on TR.
 * Em-dash strip applied at write layer.
 */

import {createClient} from '@sanity/client'
import {readFileSync, existsSync} from 'fs'
import {resolve} from 'path'

const PATCH_MODE = process.argv.includes('--patch')

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
  console.error('SANITY_TOKEN missing.')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2025-01-01',
  token,
  useCdn: false,
})

const CONTENT_ID = 'pp-content-sagrada-familia-tower'
const PROMPT_ID = 'pp-prompt-sagrada-familia-tower'
const TR_ID = 'tr-sagrada-familia-gaudi-architect'

// ─── Defensive em-dash strip (per the standing rule on user-facing copy) ─────
function strip(s: string): string {
  return s.replace(/\s*—\s*/g, ', ')
}

// ─── Task 1: contentItem updates ─────────────────────────────────────────────

const DESCRIPTION = strip(
  "Now the tallest church in the world, the Sagrada Família was begun in 1882 and blessed in its final form by Pope Leo XIV on June 10, 2026, the centenary of Gaudí's death. Gaudí designed its central tower to stand exactly one meter shorter than Barcelona's highest hill, saying no human creation should exceed the work of God.",
)

const ARTWORK_HOOK = strip(
  'The bookseller who commissioned the Sagrada Família had a religious vision that it would be built by a man with blue eyes. When he met Gaudí for the first time in 1883, he saw those eyes and announced on the spot: "This young man will be the architect of the Sagrada Família." Gaudí was 31.',
)

const CONTEXT = [
  'The first stone was laid March 19, 1882, the Feast of St. Joseph, by the original architect, Francisco de Paula del Villar. He was gone within a year, dismissed after a dispute. Gaudí, 31 years old, took over and remade it entirely: columns like forest trees, windows like stained-glass canopies, geometry pulled from nature rather than from historical precedent. He said his client was not in a hurry.',
  'To solve the structural problem that Gothic cathedrals solved with flying buttresses, Gaudí built his entire design model upside down. He hung chains and bags of lead shot from the ceiling and photographed the result in a mirror below. What gravity shaped in tension, he flipped into compression. The catenary arches needed no external support. No computer. No software. Gravity calculated the building.',
  'In 1936, three days into the Spanish Civil War, anarchists broke into Gaudí\'s workshop and burned his models. The architects who came after worked from photographs and plaster fragments. The building standing today is partly an educated guess, which somehow makes it more meaningful.',
  'The central tower stands exactly one meter shorter than Montjuïc, Barcelona\'s highest hill. Gaudí chose that height deliberately: no human creation should surpass the work of God. At 172.5 meters, it is now the tallest church in the world.',
  'The church was begun under Pope Leo XIII in 1882. It was completed under Pope Leo XIV in 2026. The same name, 144 years apart. Pope Leo XIV visited Gaudí\'s tomb in the crypt before celebrating Mass. The architect is buried in the building he spent 43 years building.',
  'As of April 2025, Gaudí has been declared Venerable by Pope Francis, who recognized his "heroic virtue." He needs one verified miracle to be beatified, two to be canonized. The man who built the world\'s tallest church may one day be declared a saint of the Catholic Church.',
]
  .map(strip)
  .join('\n\n')

const REFLECTION_QUESTIONS = [
  'Bocabella recognized the right person by his eyes before a word was spoken. Have you ever known something was right before you could explain why?',
  'Gaudí held back one meter out of reverence, not fear. What have you chosen not to exceed, and why?',
  'What beauty have you received from someone who did not live to see it given?',
].map(strip)

// ─── Task 2: dailyPrompt lectio reshape ──────────────────────────────────────

const LECTIO = {
  philosophyText: strip('Originality consists in returning to the origin.'),
  philosophyAttribution: 'Antoni Gaudí',
  text: strip(
    'I am the light of the world; he who follows me will not walk in darkness, but will have the light of life.',
  ),
  attribution: 'John 8:12',
}

// ─── Task 3: new Tradition Reflection ────────────────────────────────────────

const TR_BODY = [
  'In 1894, before Gaudí began work on the Nativity Façade, he undertook a forty-day Lenten fast. He ate almost nothing. The fast nearly killed him. When he recovered, he began drawing the stone faces of angels, shepherds, and the infant Christ.',
  'He had been living this way since his thirties. As the building grew, Gaudí shrank. He sold his fine suits and wore work clothes. He gave away most of what he owned. He moved into the workshop on the building site and lived there for the last years of his life. He attended Mass every day, confessed regularly, and received Communion daily at the church of Sant Felip Neri, a short walk from the site. The same church still carries bullet holes in its walls from the Civil War. He died before the war. His workshop did not.',
  '"The man without religion," he said, "is a mutilated man."',
  'He did not mean it as judgment. He meant it as anatomy. He believed everything that existed: the branching of a column, the curve of a vault, the angle at which morning light enters a window, was already designed by God, and that his job was to find it. "Those who look for the laws of Nature as a support for their new works collaborate with the creator." The straight line belongs to men, he said. The curved line belongs to God. He drew as few straight lines as possible.',
  'He died without a wallet, without an address, identified only by the rosary in his pocket. He is buried in the crypt of the building he spent 43 years building. As of April 2025, Pope Francis has declared him Venerable, recognizing his heroic virtue. He is one verified miracle from beatification. Two from sainthood.',
  'The architect of the world\'s tallest church may one day be its patron saint.',
]
  .map(strip)
  .join('\n\n')

const TR_DOC = {
  _id: TR_ID,
  _type: 'traditionReflection',
  authorType: 'mystic', // Pope Francis explicitly called Gaudí "a great mystic"
  title: "God's Architect: The Inner Life of Antoni Gaudí",
  source: strip(
    "Canonical Association for the Beatification of Antoni Gaudí, Antoni Gaudí: God's Architect (beatification dossier, 2025)",
  ),
  shortQuote: 'The straight line belongs to men, the curved one to God.',
  summary: TR_BODY,
  era: 'modern',
  order: 311, // bonus-day sentinel (date 6/11)
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Mode: ${PATCH_MODE ? 'PATCH (writes enabled)' : 'DRY RUN'}\n`)

  console.log('Task 1 — contentItem updates:')
  console.log(`  description (${DESCRIPTION.length} chars)`)
  console.log(`  artworkHook (${ARTWORK_HOOK.length} chars)`)
  console.log(`  context (${CONTEXT.split('\n\n').length} paragraphs, ${CONTEXT.length} chars)`)
  console.log(`  reflectionQuestions: ${REFLECTION_QUESTIONS.length}`)

  console.log('\nTask 2 — dailyPrompt lectio:')
  console.log(`  philosophyText: "${LECTIO.philosophyText.slice(0, 50)}..."`)
  console.log(`  philosophyAttribution: ${LECTIO.philosophyAttribution}`)
  console.log(`  text: "${LECTIO.text.slice(0, 50)}..."`)
  console.log(`  attribution: ${LECTIO.attribution}`)

  console.log('\nTask 3 — new TR:')
  console.log(`  _id: ${TR_ID}`)
  console.log(`  title: ${TR_DOC.title}`)
  console.log(`  authorType: ${TR_DOC.authorType} (schema-mapped from "Thinker")`)
  console.log(`  shortQuote: ${TR_DOC.shortQuote}`)
  console.log(`  summary: ${TR_DOC.summary.split('\n\n').length} paragraphs`)
  console.log(`  link → dailyPrompt.traditionReflections`)

  if (!PATCH_MODE) {
    console.log('\nDry run complete. Re-run with --patch to write.')
    return
  }

  console.log('\nWriting…')
  await client
    .patch(CONTENT_ID)
    .set({
      description: DESCRIPTION,
      artworkHook: ARTWORK_HOOK,
      context: CONTEXT,
      reflectionQuestions: REFLECTION_QUESTIONS,
    })
    .commit()
  console.log(`  ✓ contentItem ${CONTENT_ID} updated`)

  await client.patch(PROMPT_ID).set({lectio: LECTIO}).commit()
  console.log(`  ✓ dailyPrompt ${PROMPT_ID} lectio reshaped`)

  await client.createOrReplace(TR_DOC)
  console.log(`  ✓ traditionReflection ${TR_ID} created`)

  await client
    .patch(PROMPT_ID)
    .set({
      traditionReflections: [
        {_ref: TR_ID, _type: 'reference', _key: 'gaudi-architect'},
      ],
    })
    .commit()
  console.log(`  ✓ dailyPrompt → TR ref linked`)

  console.log('\nDone. Verify in Studio.')
}

main().catch((err) => {
  console.error('Patch failed:', err)
  process.exit(1)
})
