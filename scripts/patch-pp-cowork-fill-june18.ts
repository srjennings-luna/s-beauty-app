/**
 * Contueri, patch the 8 P&P dailyPrompts missing curatorNote + promptQuestion.
 *
 * Source: Cowork's JSON output (June 18, 2026) at
 *   /tmp/cowork-pp-fill-2026-06-18.json
 *
 * Background. The original 30-day P&P seed (June 7-8, 2026) explicitly
 * skipped curatorNote and promptQuestion per the script docs at
 * scripts/seed-pp-content.ts:38-39 because Cowork's handoff JSON did not
 * include them. Sheri filled in three days during the June 12-17 editorial
 * sweep (Sacred Heart, Aquinas, Veni Creator). The remaining 8 keepers from
 * the audit (June 15 plus the 7 audit-keepers from June 16-July 11) were
 * still blank.
 *
 * This Cowork session (June 18) wrote the missing 16 fields using the new
 * foundational docs (PM Brief, Frameworks, Practical Guide, Cowork briefs).
 * Each curatorNote leads with a fact different from the artworkHook to
 * honor the hook-and-context-never-repeat rule.
 *
 * Em dashes are stripped at write time per the standing rule (replace
 * em dash with comma + space).
 *
 * Usage:
 *   npx tsx scripts/patch-pp-cowork-fill-june18.ts              DRY RUN
 *   npx tsx scripts/patch-pp-cowork-fill-june18.ts --apply      write
 */

import {createClient} from '@sanity/client'
import {readFileSync, existsSync} from 'fs'
import {resolve} from 'path'

const APPLY = process.argv.includes('--apply')

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), '.env.local')
  if (!existsSync(envPath)) return
  for (const raw of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let val = line.slice(eq + 1).trim()
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
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

type Entry = {
  _id: string
  date: string
  curatorNote: string
  promptQuestion: string
}

let emDashCount = 0
function stripEmDashes(s: string): string {
  if (!s) return s
  const matches = s.match(/—/g)
  if (matches) emDashCount += matches.length
  return s.replace(/\s*—\s*/g, ', ')
}

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY (writes enabled)' : 'DRY RUN'}\n`)

  const entries: Entry[] = JSON.parse(
    readFileSync('/tmp/cowork-pp-fill-2026-06-18.json', 'utf8'),
  )
  console.log(`Loaded ${entries.length} entries from JSON.\n`)

  // Pre-flight: verify all target _ids exist in Sanity.
  const ids = entries.map((e) => e._id)
  const existing = await client.fetch<{_id: string; date: string; curatorNote?: string; promptQuestion?: string}[]>(
    `*[_type == "dailyPrompt" && _id in $ids && !(_id in path("drafts.**"))]{_id, date, curatorNote, promptQuestion}`,
    {ids},
  )
  const found = new Set(existing.map((d) => d._id))
  const missing = ids.filter((id) => !found.has(id))
  if (missing.length > 0) {
    console.error(`ERROR: ${missing.length} _id(s) not found in Sanity:`)
    for (const id of missing) console.error(`  ${id}`)
    process.exit(2)
  }

  // Show what will change per day.
  console.log('--- Planned writes ---\n')
  for (const e of entries) {
    const target = existing.find((d) => d._id === e._id)!
    const dateMatch = target.date === e.date ? 'OK' : `MISMATCH (sanity has ${target.date})`
    const curNoteState = target.curatorNote ? 'OVERWRITE' : 'NEW'
    const promptQState = target.promptQuestion ? 'OVERWRITE' : 'NEW'
    const cleanedCurator = stripEmDashes(e.curatorNote)
    const cleanedPromptQ = stripEmDashes(e.promptQuestion)
    console.log(`${e.date} ${e._id}`)
    console.log(`  date match:       ${dateMatch}`)
    console.log(`  curatorNote:      ${curNoteState} (${cleanedCurator.length} chars)`)
    console.log(`  promptQuestion:   ${promptQState} (${cleanedPromptQ.length} chars)`)
    console.log()
  }
  console.log(`Em dashes stripped at write time: ${emDashCount} total\n`)

  if (!APPLY) {
    console.log('Dry run complete. Re-run with --apply to write to Sanity.')
    return
  }

  // Apply: patch curatorNote + promptQuestion on each.
  console.log('Writing to Sanity...\n')
  let tx = client.transaction()
  for (const e of entries) {
    tx = tx.patch(e._id, (p) =>
      p.set({
        curatorNote: stripEmDashes(e.curatorNote),
        promptQuestion: stripEmDashes(e.promptQuestion),
      }),
    )
  }
  const result = await tx.commit({visibility: 'async'})
  console.log(`  Committed transaction, ${result.results.length} doc(s) patched.`)

  // Verify.
  console.log('\nVerifying via GROQ...')
  await new Promise((r) => setTimeout(r, 1500))
  const after = await client.fetch<{_id: string; curatorNote?: string; promptQuestion?: string}[]>(
    `*[_type == "dailyPrompt" && _id in $ids && !(_id in path("drafts.**"))]{_id, curatorNote, promptQuestion}`,
    {ids},
  )
  let ok = 0
  for (const d of after) {
    if (d.curatorNote && d.promptQuestion) ok++
  }
  console.log(`  ${ok} of ${entries.length} now have curatorNote AND promptQuestion populated.`)
  if (ok < entries.length) {
    console.log('\nMISSING:')
    for (const d of after) {
      if (!d.curatorNote || !d.promptQuestion) {
        console.log(`  ${d._id}  curatorNote=${!!d.curatorNote}  promptQuestion=${!!d.promptQuestion}`)
      }
    }
  }
  console.log('\nDone.')
}

main().catch((err) => {
  console.error('\nScript failed:', err)
  process.exit(1)
})
