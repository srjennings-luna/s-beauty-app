/**
 * Contueri — Move literature/philosophy quotes that were entered in the
 * scripture-attribution slot back to the philosophy slot on dailyPrompt.lectio.
 *
 * 4 days affected:
 *   - Day 11 (2026-03-27) — Hopkins, "Pied Beauty"
 *   - Day 14 (2026-04-07) — Roger Scruton, Beauty: A Very Short Introduction
 *   - Day 16 (2026-04-09) — W.B. Yeats, "The Lake Isle of Innisfree"
 *   - May 28 (2026-05-28) — Rainer Maria Rilke
 *
 * Move logic:
 *   lectio.text          → lectio.philosophyText
 *   lectio.attribution   → lectio.philosophyAttribution
 *   then unset lectio.text + lectio.attribution
 *
 * Side effect: Studio validation warning (text is Rule.required()). The
 * renderer at app/prompt/PromptClient.tsx handles missing scripture
 * gracefully — philosophy block renders, scripture block is hidden. Sheri
 * pairs scripture later.
 *
 * Usage:
 *   npx tsx scripts/move-misfiled-philosophy.ts            DRY RUN
 *   npx tsx scripts/move-misfiled-philosophy.ts --apply    write
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
  projectId: 'em44j9m8',
  dataset: 'production',
  apiVersion: '2025-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
})

const IDS = [
  'pp-prompt-day11',
  'pp-prompt-day14',
  'pp-prompt-day16',
  '1f1d1f28-8f35-4db9-ab25-a43059a45bbf',
]

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY (writes enabled)' : 'DRY RUN'}\n`)

  for (const id of IDS) {
    const d: any = await client.fetch(`*[_id == $id][0]{_id, date, lectio}`, {id})
    if (!d) {
      console.log(`  ! ${id} not found, skipping`)
      continue
    }
    const cur = d.lectio || {}

    console.log(`── ${d._id} (${d.date || 'no date'})`)

    if (cur.philosophyText || cur.philosophyAttribution) {
      console.log(`  ! Already has philosophy slot filled — skipping to avoid clobber.`)
      console.log(`    philosophyText: ${JSON.stringify(cur.philosophyText).slice(0, 80)}`)
      console.log(`    philosophyAttribution: ${JSON.stringify(cur.philosophyAttribution)}`)
      continue
    }
    if (!cur.text && !cur.attribution) {
      console.log(`  ! Both scripture slots already empty — nothing to move.`)
      continue
    }

    console.log(`  Move:`)
    console.log(`    text        → philosophyText        : ${JSON.stringify((cur.text || '').slice(0, 80))}`)
    console.log(`    attribution → philosophyAttribution : ${JSON.stringify(cur.attribution)}`)

    if (!APPLY) {
      console.log(`  (dry run — no write)`)
      continue
    }

    await client
      .patch(d._id)
      .set({
        'lectio.philosophyText': cur.text || '',
        'lectio.philosophyAttribution': cur.attribution || '',
      })
      .unset(['lectio.text', 'lectio.attribution'])
      .commit()
    console.log(`  ✓ Patched.`)
  }

  if (!APPLY) console.log(`\nRe-run with --apply to write.`)
}

main().catch((err) => {
  console.error('\nScript failed:', err)
  process.exit(1)
})
