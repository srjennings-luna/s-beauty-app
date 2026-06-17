/**
 * Contueri — Republish P&P from Holy Week 2026 onward.
 *
 * Correction to scripts/unpublish-early-pp.ts run earlier today:
 * Sheri's instruction: "unpublish content BEFORE Holy Week, the rest stays."
 *
 * Holy Week 2026 starts Palm Sunday, March 29, 2026.
 *
 * This script:
 *   - Finds drafts of dailyPrompt with date >= 2026-03-29
 *   - For each, promotes the draft back to published (createOrReplace at
 *     published _id, then delete the draft)
 *
 * Leaves alone:
 *   - 2026-03-17 (St. Patrick, pre-Holy Week) — stays as draft
 *   - The 30-day seed pp-prompt-* docs (already published)
 *
 * Usage:
 *   npx tsx scripts/republish-pp-holy-week-onward.ts            DRY RUN
 *   npx tsx scripts/republish-pp-holy-week-onward.ts --apply    write
 */

import {createClient} from '@sanity/client'
import {readFileSync, existsSync} from 'fs'
import {resolve} from 'path'

const APPLY = process.argv.includes('--apply')
const HOLY_WEEK_START = '2026-03-29' // Palm Sunday 2026

// Explicit allowlist: the exact doc IDs from earlier today's
// `unpublish-early-pp.ts --apply` run, minus St. Patrick (2026-03-17). This
// guards against accidentally republishing a pre-existing draft Sheri kept
// intentionally (e.g., the 2026-04-30 no-title draft).
const REPUBLISH_PUBLISHED_IDS = new Set([
  'a4f70ac7-5c9c-403c-b242-b155e71b8515', // 2026-03-29 Palm Sunday
  '72df724a-36df-46b2-8a80-fc47fd238469', // 2026-03-30 Holy Monday
  '5538abd0-370f-44c1-8da1-1a765b79e2ae', // 2026-03-31 Holy Tuesday
  '7f5f676a-d06b-4e8f-bde6-fb6fa76f6dc6', // 2026-04-01 Holy Wednesday
  'b7e5d948-c647-4b63-a603-4d57e66e20b0', // 2026-04-02 Holy Thursday
  '5e086c30-48c0-4702-9ff8-bfad31c9d2a6', // 2026-04-03 Good Friday
  '7cd37025-55fa-4ea4-8d2e-bc932785d670', // 2026-04-04 Holy Saturday
  '3ebebb50-6da6-4096-8ec3-9e286699e2e4', // 2026-04-05 Easter Sunday
  '1f1d1f28-8f35-4db9-ab25-a43059a45bbf', // 2026-05-28 Light theme
  'b302cecc-ce57-467f-88ae-ff3f7a474406', // 2026-06-01 surprising-true
])

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

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY (writes enabled)' : 'DRY RUN'}\n`)
  console.log(`Holy Week 2026 cutoff: ${HOLY_WEEK_START}\n`)

  // Find drafts of dailyPrompt dated on or after Holy Week. We also exclude
  // pp-prompt-* (the 30-day seed) — but those should not be in drafts state
  // anyway. Belt + suspenders.
  const draftIds = [...REPUBLISH_PUBLISHED_IDS].map((id) => `drafts.${id}`)
  const drafts: any[] = await client.fetch(
    `*[_id in $ids] | order(date asc)`,
    {ids: draftIds},
  )

  console.log(`Found ${drafts.length} draft(s) to republish:\n`)
  for (const d of drafts) {
    const title = (d.dayTitle || d.promptQuestion || '(no title)').slice(0, 64)
    console.log(`  ${d.date}  ${d._id.padEnd(48)}  ${title}`)
  }

  // Sanity-check: any draft dated BEFORE Holy Week that we should leave alone?
  const preHoly: any[] = await client.fetch(`
    *[_type == "dailyPrompt"
      && string::startsWith(_id, "drafts.")
      && date < $cutoff
      && !string::startsWith(_id, "drafts.pp-prompt-")
    ]{ _id, date, dayTitle, promptQuestion }
  `, {cutoff: HOLY_WEEK_START})
  if (preHoly.length > 0) {
    console.log(`\nLeaving these drafts AS-IS (dated before Holy Week):`)
    for (const d of preHoly) {
      const title = (d.dayTitle || d.promptQuestion || '(no title)').slice(0, 64)
      console.log(`  ${d.date}  ${d._id.padEnd(48)}  ${title}`)
    }
  }

  if (drafts.length === 0) {
    console.log(`\nNothing to republish.`)
    return
  }

  if (!APPLY) {
    console.log(`\nRe-run with --apply to write.`)
    return
  }

  console.log(`\nApplying...`)
  for (const draft of drafts) {
    const publishedId = draft._id.replace(/^drafts\./, '')
    // Build the published version: same content minus the drafts. prefix.
    const published = {...draft, _id: publishedId}
    await client.transaction()
      .createOrReplace(published)
      .delete(draft._id)
      .commit({visibility: 'async'})
    console.log(`  ✓ Republished ${publishedId} (${draft.date})`)
  }
  console.log(`\nDone. Republished ${drafts.length} P&P doc(s).`)
}

main().catch((err) => {
  console.error('\nScript failed:', err)
  process.exit(1)
})
