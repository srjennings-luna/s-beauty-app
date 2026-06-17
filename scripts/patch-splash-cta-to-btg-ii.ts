/**
 * Contueri — Point onboarding Screen 5 primary CTA at BTG II.
 *
 * Swaps the linkPath on the `primaryCta` block in splashPage `kallos-splash-5`
 * from `/journeys/beauty-truth-and-goodness` (original BTG, pre-rewrite) to
 * `/journeys/beauty-truth-goodness-II` (BTG II, the post-rewrite intro).
 *
 * After Sheri renames the BTG II journey slug to drop the "II" suffix and
 * deletes the original BTG, this script's target slug can be updated to
 * `/journeys/beauty-truth-and-goodness` (the freed slug). That's a Studio
 * step, not a code step.
 *
 * Usage:
 *   npx tsx scripts/patch-splash-cta-to-btg-ii.ts            DRY RUN
 *   npx tsx scripts/patch-splash-cta-to-btg-ii.ts --patch    write
 *
 * Idempotent: rerunning after the patch finds nothing to change.
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

const DOC_ID = 'kallos-splash-5'
const OLD_LINK = '/journeys/beauty-truth-and-goodness'
const NEW_LINK = '/journeys/beauty-truth-goodness-II'

async function main() {
  console.log(`Mode: ${PATCH_MODE ? 'PATCH (writes enabled)' : 'DRY RUN'}\n`)

  const doc: any = await client.getDocument(DOC_ID)
  if (!doc) {
    console.error(`Document ${DOC_ID} not found in Sanity. Aborting.`)
    process.exit(1)
  }

  const blocks: any[] = doc.blocks || []
  let primaryIdx = -1
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i]?._type === 'primaryCta') {
      primaryIdx = i
      break
    }
  }
  if (primaryIdx === -1) {
    console.error(`No primaryCta block on ${DOC_ID}. Aborting.`)
    process.exit(1)
  }

  const current = blocks[primaryIdx].linkPath
  console.log(`Found primaryCta at blocks[${primaryIdx}]`)
  console.log(`  label:    "${blocks[primaryIdx].label}"`)
  console.log(`  linkPath: "${current}"`)

  if (current === NEW_LINK) {
    console.log(`\nAlready points at ${NEW_LINK}. Nothing to do.`)
    return
  }
  if (current !== OLD_LINK) {
    console.log(`\nUnexpected current linkPath. Expected "${OLD_LINK}", saw "${current}".`)
    console.log(`Refusing to patch. Inspect the document in Studio.`)
    process.exit(1)
  }

  console.log(`\nWill change linkPath:`)
  console.log(`  from: "${OLD_LINK}"`)
  console.log(`  to:   "${NEW_LINK}"`)

  if (!PATCH_MODE) {
    console.log(`\nRe-run with --patch to write.`)
    return
  }

  await client
    .patch(DOC_ID)
    .set({[`blocks[${primaryIdx}].linkPath`]: NEW_LINK})
    .commit()

  console.log(`\nDone. Patched ${DOC_ID}.`)
}

main().catch((err) => {
  console.error('Patch failed:', err)
  process.exit(1)
})
