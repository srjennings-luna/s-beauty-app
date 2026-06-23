/**
 * Contueri, migrate pre-pivot P&P contentItem.title -> dailyPrompt.dayTitle.
 *
 * Background. The dayTitle field was added to dailyPrompt on June 7, 2026
 * (PP-DAYTITLE-01). Before that, contentItem.title was being used as both
 * the P&P's editorial framing AND the work's name. Now that dayTitle
 * exists for the editorial framing, we backfill it from the existing
 * contentItem.title so the data model is clean and a future P&P-render
 * change can promote dayTitle to the prominent title slot.
 *
 * Scope. dailyPrompts where date < 2026-06-12 AND dayTitle is empty.
 * Per the June 22 audit, that is 27 documents.
 *
 * Non-destructive: contentItem.title is NOT changed. Only the
 * dailyPrompt.dayTitle field is populated (with the SAME string as the
 * linked content item's title). A separate follow-on pass identifies
 * which contentItem.title values are editorial framings that should be
 * rewritten to the work's actual name (Bucket B + C from the audit).
 *
 * Em dashes stripped at write time per the standing rule.
 *
 * dayTitle has a Rule.max(80) validation. Any contentItem.title longer
 * than 80 chars is flagged in the dry run, not written, for Sheri to
 * handle by hand.
 *
 * Usage:
 *   npx tsx scripts/migrate-pp-content-title-to-daytitle.ts              DRY RUN
 *   npx tsx scripts/migrate-pp-content-title-to-daytitle.ts --apply      write
 */

import {createClient} from '@sanity/client'
import {readFileSync, existsSync} from 'fs'
import {resolve} from 'path'

const APPLY = process.argv.includes('--apply')
const PIVOT = '2026-06-12'
const MAX_DAYTITLE = 80

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), '.env.local')
  if (!existsSync(envPath)) return
  for (const raw of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const k = line.slice(0, eq).trim()
    let v = line.slice(eq + 1).trim()
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
    if (process.env[k] === undefined) process.env[k] = v
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

let emDashCount = 0
function stripEmDashes(s: string): string {
  if (!s) return s
  const matches = s.match(/—/g)
  if (matches) emDashCount += matches.length
  return s.replace(/\s*—\s*/g, ', ')
}

type Row = {
  _id: string
  date: string
  currentDayTitle: string | null
  contentTitle: string | null
}

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY (writes enabled)' : 'DRY RUN'}\n`)
  console.log(`Scope: dailyPrompts where date < ${PIVOT} AND dayTitle is empty\n`)

  const rows = await client.fetch<Row[]>(
    `*[_type=="dailyPrompt" && date < $pivot && !(_id in path("drafts.**")) && (!defined(dayTitle) || dayTitle == "")]{
      _id,
      date,
      "currentDayTitle": dayTitle,
      "contentTitle": content->title
    } | order(date asc)`,
    {pivot: PIVOT},
  )

  console.log(`Candidates found: ${rows.length}\n`)

  const writable: {_id: string; date: string; dayTitle: string}[] = []
  const tooLong: {_id: string; date: string; contentTitle: string; chars: number}[] = []
  const missingContent: {_id: string; date: string}[] = []

  console.log('--- Planned writes ---\n')
  for (const r of rows) {
    if (!r.contentTitle) {
      missingContent.push({_id: r._id, date: r.date})
      console.log(`${r.date}  ${r._id}  SKIP, linked contentItem has no title`)
      continue
    }
    const cleaned = stripEmDashes(r.contentTitle).trim()
    if (cleaned.length > MAX_DAYTITLE) {
      tooLong.push({_id: r._id, date: r.date, contentTitle: cleaned, chars: cleaned.length})
      console.log(`${r.date}  ${r._id}  SKIP, ${cleaned.length} chars > ${MAX_DAYTITLE} max`)
      console.log(`           "${cleaned}"`)
      continue
    }
    writable.push({_id: r._id, date: r.date, dayTitle: cleaned})
    console.log(`${r.date}  ${r._id}  dayTitle <- "${cleaned}"`)
  }

  console.log('\n--- Summary ---')
  console.log(`Candidates:        ${rows.length}`)
  console.log(`Will write:        ${writable.length}`)
  console.log(`Skipped (too long):${tooLong.length}`)
  console.log(`Skipped (no title):${missingContent.length}`)
  console.log(`Em dashes stripped at write time: ${emDashCount}\n`)

  if (tooLong.length > 0) {
    console.log('--- TOO LONG, manual entry needed ---')
    for (const t of tooLong) {
      console.log(`${t.date}  (${t.chars} chars)  "${t.contentTitle}"`)
    }
    console.log()
  }

  if (!APPLY) {
    console.log('Dry run complete. Re-run with --apply to write to Sanity.')
    return
  }

  if (writable.length === 0) {
    console.log('Nothing to write.')
    return
  }

  console.log('Writing to Sanity...\n')
  let tx = client.transaction()
  for (const w of writable) {
    tx = tx.patch(w._id, (p) => p.set({dayTitle: w.dayTitle}))
  }
  const result = await tx.commit({visibility: 'async'})
  console.log(`  Committed transaction, ${result.results.length} doc(s) patched.\n`)

  // Verify
  console.log('Verifying via GROQ...')
  await new Promise((r) => setTimeout(r, 1500))
  const ids = writable.map((w) => w._id)
  const after = await client.fetch<{_id: string; date: string; dayTitle: string}[]>(
    `*[_type=="dailyPrompt" && _id in $ids && !(_id in path("drafts.**"))]{_id, date, dayTitle} | order(date asc)`,
    {ids},
  )
  let ok = 0
  for (const a of after) {
    const expected = writable.find((w) => w._id === a._id)?.dayTitle
    if (a.dayTitle === expected) {
      ok++
    } else {
      console.log(`  MISMATCH: ${a._id} expected "${expected}" got "${a.dayTitle}"`)
    }
  }
  console.log(`  ${ok} of ${writable.length} dayTitle fields verified.\n`)
  console.log('Done.')
}

main().catch((err) => {
  console.error('\nScript failed:', err)
  process.exit(1)
})
