/**
 * Contueri — Retire original BTG, promote BTG II to canonical slug.
 *
 * Phase 1: Delete original BTG (3 journeyDays + the journey).
 * Phase 2: Rename BTG II — title drops " II", slug → "beauty-truth-and-goodness".
 * Phase 3: Update splash Screen 5 primaryCta linkPath to the canonical slug.
 *
 * Each phase prints what it will do; only writes when --apply is passed.
 *
 * Usage:
 *   npx tsx scripts/retire-original-btg.ts            DRY RUN
 *   npx tsx scripts/retire-original-btg.ts --apply    write
 */

import {createClient} from '@sanity/client'
import {readFileSync, existsSync} from 'fs'
import {resolve} from 'path'

const APPLY = process.argv.includes('--apply')

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

// Known IDs (from /tmp/journey-content-dump.json this morning)
const ORIGINAL_BTG_JOURNEY_ID = '4eb6649e-063e-4294-b830-7fbc7ee9c226'
const ORIGINAL_BTG_DAY_IDS = [
  'journeyDay-4eb6649e-063e-4294-b830-7fbc7ee9c226-day-1',
  'journeyDay-4eb6649e-063e-4294-b830-7fbc7ee9c226-day-2',
  'journeyDay-4eb6649e-063e-4294-b830-7fbc7ee9c226-day-3',
]
const BTG_II_JOURNEY_ID = 'a6d092ae-d7be-4445-b068-e2741563379f'
const SPLASH_DOC_ID = 'kallos-splash-5'

const OLD_LINK = '/journeys/beauty-truth-goodness-II'
const NEW_LINK = '/journeys/beauty-truth-and-goodness'
const OLD_SLUG = 'beauty-truth-goodness-II'
const NEW_SLUG = 'beauty-truth-and-goodness'
const OLD_TITLE = 'Beauty, Truth & Goodness II'
const NEW_TITLE = 'Beauty, Truth & Goodness'

async function phase1DeleteOriginalBtg() {
  console.log('\n━━━ Phase 1: delete original BTG ━━━')

  // Confirm the journey exists and matches expectations.
  const journey: any = await client.getDocument(ORIGINAL_BTG_JOURNEY_ID)
  if (!journey) {
    console.log(`  journey ${ORIGINAL_BTG_JOURNEY_ID} not found. Skipping phase 1 (already deleted?).`)
    return
  }
  if (journey.slug?.current !== 'beauty-truth-and-goodness') {
    console.log(`  ⚠️ journey ${ORIGINAL_BTG_JOURNEY_ID} has slug "${journey.slug?.current}", expected "beauty-truth-and-goodness". Aborting.`)
    process.exit(1)
  }
  console.log(`  Found original BTG journey: "${journey.title}" (slug: ${journey.slug.current})`)

  // Confirm child days.
  const days: any[] = await client.fetch(
    `*[_type == "journeyDay" && journey._ref == $jid && !(_id in path("drafts.**"))] | order(dayNumber asc)`,
    {jid: ORIGINAL_BTG_JOURNEY_ID},
  )
  console.log(`  Found ${days.length} child journeyDay(s):`)
  for (const d of days) {
    console.log(`    - ${d._id} (Day ${d.dayNumber}: "${d.dayTitle}")`)
  }

  if (days.length === 0) {
    console.log(`  No child days. Proceeding to journey delete only.`)
  }

  // Delete children first, then parent. Use a single transaction.
  if (!APPLY) {
    console.log(`  DRY RUN — would delete ${days.length} day(s) + 1 journey.`)
    return
  }

  // Step 1: clear days[] AND clear journey._ref on each day, so no inbound refs
  // remain between these 4 docs. Then delete.
  const stripTx = client.transaction()
  stripTx.patch(ORIGINAL_BTG_JOURNEY_ID, (p) => p.set({days: []}))
  // Drop the required `journey` ref on each day by unsetting the field. This
  // temporarily violates the journeyDay schema's Rule.required() on `journey`,
  // but we're about to delete the docs anyway — Sanity allows the unset.
  for (const d of days) {
    stripTx.patch(d._id, (p) => p.unset(['journey']))
  }
  await stripTx.commit({visibility: 'async'})
  console.log(`  ✓ Cleared cross-refs between journey and ${days.length} day(s).`)

  // Step 2: delete the docs (now refless).
  const deleteTx = client.transaction()
  for (const d of days) {
    deleteTx.delete(d._id)
    deleteTx.delete(`drafts.${d._id}`)
  }
  deleteTx.delete(ORIGINAL_BTG_JOURNEY_ID)
  deleteTx.delete(`drafts.${ORIGINAL_BTG_JOURNEY_ID}`)
  await deleteTx.commit({visibility: 'async'})
  console.log(`  ✓ Deleted ${days.length} day(s) + original BTG journey.`)
}

async function phase2RenameBtgII() {
  console.log('\n━━━ Phase 2: rename BTG II → canonical ━━━')

  const journey: any = await client.getDocument(BTG_II_JOURNEY_ID)
  if (!journey) {
    console.log(`  BTG II journey ${BTG_II_JOURNEY_ID} not found. Aborting.`)
    process.exit(1)
  }
  console.log(`  Current title: "${journey.title}"`)
  console.log(`  Current slug:  "${journey.slug?.current}"`)

  if (journey.slug?.current === NEW_SLUG && journey.title === NEW_TITLE) {
    console.log(`  Already canonical. Skipping.`)
    return
  }

  console.log(`  Will set:`)
  console.log(`    title → "${NEW_TITLE}"`)
  console.log(`    slug.current → "${NEW_SLUG}"`)

  if (!APPLY) {
    console.log(`  DRY RUN — would patch BTG II.`)
    return
  }

  await client
    .patch(BTG_II_JOURNEY_ID)
    .set({
      title: NEW_TITLE,
      slug: {_type: 'slug', current: NEW_SLUG},
    })
    .commit()
  console.log(`  ✓ Renamed BTG II.`)
}

async function phase3UpdateSplashCta() {
  console.log('\n━━━ Phase 3: splash CTA linkPath → canonical ━━━')

  const doc: any = await client.getDocument(SPLASH_DOC_ID)
  if (!doc) {
    console.log(`  ${SPLASH_DOC_ID} not found. Aborting.`)
    process.exit(1)
  }
  const blocks: any[] = doc.blocks || []
  const idx = blocks.findIndex((b) => b?._type === 'primaryCta')
  if (idx === -1) {
    console.log(`  No primaryCta block. Aborting.`)
    process.exit(1)
  }
  const current = blocks[idx].linkPath
  console.log(`  Current linkPath: "${current}"`)

  if (current === NEW_LINK) {
    console.log(`  Already canonical. Skipping.`)
    return
  }
  if (current !== OLD_LINK) {
    console.log(`  ⚠️ Unexpected linkPath. Expected "${OLD_LINK}". Aborting.`)
    process.exit(1)
  }

  console.log(`  Will set linkPath → "${NEW_LINK}"`)

  if (!APPLY) {
    console.log(`  DRY RUN — would patch splash CTA.`)
    return
  }

  await client
    .patch(SPLASH_DOC_ID)
    .set({[`blocks[${idx}].linkPath`]: NEW_LINK})
    .commit()
  console.log(`  ✓ Patched splash CTA.`)
}

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY (writes enabled)' : 'DRY RUN'}`)
  await phase1DeleteOriginalBtg()
  await phase2RenameBtgII()
  await phase3UpdateSplashCta()
  console.log(`\nDone. ${APPLY ? '' : 'Re-run with --apply to write.'}`)
}

main().catch((err) => {
  console.error('\nScript failed:', err)
  process.exit(1)
})
