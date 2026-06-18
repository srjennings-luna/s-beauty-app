/**
 * Contueri — Safely delete one P&P day (dailyPrompt + linked contentItem).
 *
 * Process per day:
 *   1. Pre-flight: report all incoming refs to BOTH the dailyPrompt and the
 *      contentItem. List linked TRs (informational only — TRs are reusable
 *      and NOT deleted by this script).
 *   2. If any UNEXPECTED inbound ref (other than the dailyPrompt → contentItem
 *      pair itself) is found on the contentItem, ABORT without writing.
 *   3. In --apply mode: delete the dailyPrompt FIRST (drops the inbound ref).
 *      Re-check the contentItem's incoming refs. If zero, delete the
 *      contentItem. If still > 0, leave it and report (it's used elsewhere).
 *
 * Images, TRs, themes referenced by the contentItem are NOT deleted. Sanity
 * handles orphan asset cleanup separately.
 *
 * Usage:
 *   npx tsx scripts/delete-pp-day.ts <date>            DRY RUN
 *   npx tsx scripts/delete-pp-day.ts <date> --apply    write
 *
 *   <date> = YYYY-MM-DD, e.g. 2026-07-11
 */

import {createClient} from '@sanity/client'
import {readFileSync, existsSync} from 'fs'
import {resolve} from 'path'

const APPLY = process.argv.includes('--apply')
const DATE = process.argv.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a))
if (!DATE) {
  console.error('Usage: npx tsx scripts/delete-pp-day.ts <YYYY-MM-DD> [--apply]')
  process.exit(1)
}

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
  projectId: 'em44j9m8',
  dataset: 'production',
  apiVersion: '2025-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
})

async function refsTo(id: string) {
  return client.fetch<any[]>(
    `*[references($id) && !(_id in path("drafts.**"))]{_id, _type, title, date, dayTitle}`,
    {id},
  )
}

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY (writes enabled)' : 'DRY RUN'}`)
  console.log(`Target date: ${DATE}\n`)

  // Find dailyPrompt for this date.
  const dp: any = await client.fetch(
    `*[_type == "dailyPrompt" && date == $d && !(_id in path("drafts.**"))][0]{
      _id, date, dayTitle,
      "contentRef": content._ref,
      "linkedContent": content->{_id, title, contentType, "trRefs": traditionReflections[]->{_id, title}}
    }`,
    {d: DATE},
  )
  if (!dp) {
    console.log(`No published dailyPrompt found for ${DATE}. Nothing to do.`)
    return
  }

  console.log(`── dailyPrompt`)
  console.log(`   _id:           ${dp._id}`)
  console.log(`   dayTitle:      "${dp.dayTitle || '(none)'}"`)
  console.log(`   linked content: ${dp.contentRef || '(none)'}`)

  if (dp.linkedContent) {
    console.log(`\n── contentItem`)
    console.log(`   _id:           ${dp.linkedContent._id}`)
    console.log(`   title:         "${dp.linkedContent.title}"`)
    console.log(`   contentType:   ${dp.linkedContent.contentType}`)
    const trs = dp.linkedContent.trRefs || []
    console.log(`   linked TRs:    ${trs.length} (will NOT be deleted)`)
    for (const tr of trs) console.log(`     · ${tr._id} ("${tr.title}")`)
  }

  // Pre-flight: incoming refs to both docs.
  console.log(`\n── Pre-flight: incoming references`)
  const dpRefs = await refsTo(dp._id)
  console.log(`   dailyPrompt:   ${dpRefs.length === 0 ? 'NO incoming refs' : ''}`)
  for (const r of dpRefs) console.log(`     ← ${r._type} ${r._id}`)

  let ciRefs: any[] = []
  if (dp.linkedContent) {
    ciRefs = await refsTo(dp.linkedContent._id)
    const otherRefs = ciRefs.filter((r) => r._id !== dp._id)
    console.log(`   contentItem:   ${ciRefs.length} ref(s) total`)
    for (const r of ciRefs) {
      const tag = r._id === dp._id ? ' (the dailyPrompt — expected)' : ' ⚠ UNEXPECTED'
      console.log(`     ← ${r._type} ${r._id}${tag}`)
    }
    if (otherRefs.length > 0) {
      console.log(`\n  ⚠ ABORTING: contentItem is referenced by ${otherRefs.length} other doc(s) beyond the dailyPrompt.`)
      console.log(`  These references would be broken by deletion. Inspect manually.`)
      process.exit(2)
    }
  }

  if (!APPLY) {
    console.log(`\nDry run complete. Re-run with --apply to delete.`)
    console.log(`Would delete: dailyPrompt ${dp._id}${dp.linkedContent ? ` + contentItem ${dp.linkedContent._id}` : ''}`)
    return
  }

  // Step 1: delete dailyPrompt (and any draft).
  console.log(`\nDeleting dailyPrompt ${dp._id}...`)
  await client
    .transaction()
    .delete(dp._id)
    .delete(`drafts.${dp._id}`)
    .commit({visibility: 'async'})
  console.log(`  ✓ Deleted dailyPrompt.`)

  if (!dp.linkedContent) {
    console.log(`\nNo linked contentItem. Done.`)
    return
  }

  // Step 2: re-check contentItem refs after dailyPrompt deletion.
  console.log(`\nChecking contentItem refs after dailyPrompt removal...`)
  // Brief delay to let the async deletion register in the read model.
  await new Promise((r) => setTimeout(r, 1500))
  const ciRefsAfter = await refsTo(dp.linkedContent._id)
  console.log(`  contentItem ${dp.linkedContent._id}: ${ciRefsAfter.length} incoming ref(s)`)

  if (ciRefsAfter.length > 0) {
    console.log(`  ⚠ contentItem is still referenced. Leaving it in place.`)
    for (const r of ciRefsAfter) console.log(`    ← ${r._type} ${r._id}`)
    return
  }

  console.log(`\nDeleting contentItem ${dp.linkedContent._id}...`)
  await client
    .transaction()
    .delete(dp.linkedContent._id)
    .delete(`drafts.${dp.linkedContent._id}`)
    .commit({visibility: 'async'})
  console.log(`  ✓ Deleted contentItem.`)
  console.log(`\nDone. Day ${DATE} fully retired.`)
}

main().catch((err) => {
  console.error('\nScript failed:', err)
  process.exit(1)
})
