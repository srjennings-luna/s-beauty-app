/**
 * Contueri — Hide journeys that need editorial rewrites from testers.
 *
 * Per CONTUERI-Journey-Audit-2026-06-11.html (Tier 2 + Tier 3):
 *   - Light — missing Lectio on Days 2-7 + missing encounterNote on every day.
 *
 * Sets `isPublished: false` on the journey doc, which is the flag the public
 * Journeys-list query (`getJourneys()`, lib/sanity.ts:226) filters on. The
 * journey + its day docs remain in Sanity. Underlying contentItems are NOT
 * touched, so Explore / Library still surface their content.
 *
 * Direct slug URLs (/journeys/light) would still resolve since the detail
 * page query does not filter on isPublished. For internal testers using the
 * Journeys tab, the hide is sufficient.
 *
 * Re-publish later by toggling the "Published" checkbox in Studio.
 *
 * Usage:
 *   npx tsx scripts/unpublish-rewrite-pending.ts            DRY RUN
 *   npx tsx scripts/unpublish-rewrite-pending.ts --apply    write
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

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'em44j9m8',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
})

// Journey slugs flagged for editorial rewrite in the June 11 audit.
const REWRITE_PENDING_SLUGS = ['light']

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY (writes enabled)' : 'DRY RUN'}\n`)

  const journeys: any[] = await client.fetch(
    `*[_type == "journey" && slug.current in $slugs && !string::startsWith(_id, "drafts.")]{
      _id, title, isPublished, "slug": slug.current
    }`,
    {slugs: REWRITE_PENDING_SLUGS},
  )

  if (journeys.length === 0) {
    console.log(`No journeys matched. Slugs checked: ${REWRITE_PENDING_SLUGS.join(', ')}`)
    return
  }

  for (const j of journeys) {
    console.log(`${j.title} (${j.slug})`)
    console.log(`  _id:         ${j._id}`)
    console.log(`  isPublished: ${j.isPublished}`)
    if (j.isPublished === false) {
      console.log(`  → already unpublished, skipping`)
      continue
    }
    console.log(`  → will set isPublished: false`)
    if (!APPLY) continue
    await client.patch(j._id).set({isPublished: false}).commit()
    console.log(`  ✓ Patched.`)
  }

  console.log(`\nDone. ${APPLY ? '' : 'Re-run with --apply to write.'}`)
  console.log(`\nNot touched (per Sheri's instruction):`)
  console.log(`  - All contentItem docs`)
  console.log(`  - All journeyDay docs (just hidden via their parent journey)`)
  console.log(`  - All dailyPrompt / traditionReflection / auditio docs`)
}

main().catch((err) => {
  console.error('\nScript failed:', err)
  process.exit(1)
})
