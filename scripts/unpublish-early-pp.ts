/**
 * Contueri — Hide pre-June-2026 P&P (early dailyPrompts) from testers.
 *
 * Filter: any `dailyPrompt` document whose `_id` does NOT start with
 *   `pp-prompt-` (the deterministic ID pattern for the June 7 30-day seed).
 * These are the legacy prompts drafted before the editorial standard was
 * locked: Holy Week (March-April 2026), Days 1-18 (March), one-offs, etc.
 *
 * "Unpublish" here = document-level: move the published doc to drafts.{id}
 * via a single transaction (createIfNotExists draft, then delete published).
 * Sanity's standard behavior: drafts are excluded from public GROQ queries
 * (which all the app's read paths use), so testers stop seeing them.
 * Republish later from Studio with a single click if needed.
 *
 * Does NOT touch:
 *   - contentItem docs (Explore / Library still surface their art + content)
 *   - traditionReflection docs
 *   - the 30-day seed prompts (`pp-prompt-*`, dates June 12 - July 11)
 *
 * Usage:
 *   npx tsx scripts/unpublish-early-pp.ts            DRY RUN
 *   npx tsx scripts/unpublish-early-pp.ts --apply    write
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

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY (writes enabled)' : 'DRY RUN'}\n`)

  const legacy: any[] = await client.fetch(`
    *[_type == "dailyPrompt"
      && !string::startsWith(_id, "drafts.")
      && !string::startsWith(_id, "pp-prompt-")
    ] | order(date asc)
  `)

  const seedCount: number = await client.fetch(`
    count(*[_type == "dailyPrompt"
      && !string::startsWith(_id, "drafts.")
      && string::startsWith(_id, "pp-prompt-")
    ])
  `)

  console.log(`30-day seed (pp-prompt-*) staying published: ${seedCount}`)
  console.log(`Legacy P&P to unpublish: ${legacy.length}\n`)

  if (legacy.length === 0) {
    console.log(`Nothing to do.`)
    return
  }

  console.log(`── Will move to drafts ──`)
  for (const d of legacy) {
    const date = d.date || '(no date)'
    const title = (d.dayTitle || d.promptQuestion || '(no title)').slice(0, 64)
    console.log(`  ${date}  ${d._id.padEnd(40)}  ${title}`)
  }

  if (!APPLY) {
    console.log(`\nRe-run with --apply to write.`)
    return
  }

  console.log(`\nApplying...`)
  let unpublished = 0
  for (const doc of legacy) {
    const draftId = `drafts.${doc._id}`
    const draft = {...doc, _id: draftId}
    // Transaction: ensure draft exists with current content, then delete published.
    await client.transaction()
      .createOrReplace(draft)
      .delete(doc._id)
      .commit({visibility: 'async'})
    unpublished++
    console.log(`  ✓ Unpublished ${doc._id} (${doc.date || 'no date'})`)
  }
  console.log(`\nDone. Unpublished ${unpublished} legacy dailyPrompt(s).`)
}

main().catch((err) => {
  console.error('\nScript failed:', err)
  process.exit(1)
})
