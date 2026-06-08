/**
 * Contueri — Seed the 30-day P&P Tradition Reflections from Cowork's HTML doc.
 *
 * Source pipeline (June 7, 2026):
 *   1. scripts/parse-tr-html.py extracts 30 per-day TR records from
 *      ~/Documents/CONTUERI-PP-TraditionReflections-30Day.html
 *      → writes /tmp/tr-extracted.json (intermediate, not committed)
 *   2. This script reads that JSON, plus /tmp/cowork-seed-resolved.json for
 *      the day-number → pp-content-slug mapping, and:
 *      a) createOrReplace a traditionReflection doc per day with deterministic
 *         _id = `tr-{trSlug}` (re-run safe; no orphans)
 *      b) patches each PP contentItem (_id = `pp-content-{ppSlug}`) to set
 *         `traditionReflections` to a single reference to that day's TR
 *
 * Field mapping HTML → Sanity traditionReflection:
 *   trSlug                  → deterministic _id (tr-{slug})
 *   authorName              → title         (e.g. "Thomas Aquinas")
 *   `{authorName}, {sourceWork}` → source   (full attribution)
 *   body                    → summary       (verbatim — 4 paragraphs preserved)
 *   shortQuote              → shortQuote
 *   authorType              → authorType    (already schema-valid)
 *   era                     → era           (mapped: patristic→fathers, early-modern→medieval)
 *   dayNumber               → order         (1..30 — drives Studio listing order)
 *
 * Editorial notes Sheri should review BEFORE seeding to production:
 *   - 139 em dashes in body/quote text. Cowork-authored editorial.
 *     Violates the standing rule. Faithful seed for now; do an editorial
 *     pass in Studio before launch.
 *   - Day 12 (John of the Cross) Cowork tagged `early-modern`. Schema has no
 *     such value. Coerced to `medieval` (late scholastic mysticism). Revise
 *     in Studio if Sheri prefers `modern`.
 *   - Day 6 Dorothy Day tagged `theologian` by Cowork. Schema-valid but
 *     Sheri may prefer `saint` (cause for canonization opened) or `philosopher`.
 *
 * Usage:
 *   npx tsx scripts/seed-tr-content.ts              → DRY RUN (no writes)
 *   npx tsx scripts/seed-tr-content.ts --patch      → actually create + link
 */

import {createClient} from '@sanity/client'
import {readFileSync, existsSync} from 'fs'
import {resolve} from 'path'

const PATCH_MODE = process.argv.includes('--patch')

// ─── Env loading (mirrors the other seed scripts) ────────────────────────────

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
  console.error('Missing SANITY_TOKEN in .env.local')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-06-01',
  token,
  useCdn: false,
})

// ─── Schema mappings ─────────────────────────────────────────────────────────

// Cowork's era labels → Sanity schema enum.
// Schema enum: ancient | fathers | medieval | modern
const ERA_MAP: Record<string, string> = {
  ancient: 'ancient',
  patristic: 'fathers',
  fathers: 'fathers',
  medieval: 'medieval',
  // John of the Cross sits 1542–1591 (Counter-Reformation). Schema has no
  // "early-modern" bucket; Sheri's call June 7, 2026: map to `modern`.
  // Medieval ends ~1500; Counter-Reformation belongs to `modern`.
  'early-modern': 'modern',
  modern: 'modern',
}

// Schema enum: church-father | saint | pope | doctor | theologian | mystic | philosopher
const VALID_AUTHOR_TYPES = new Set([
  'church-father',
  'saint',
  'pope',
  'doctor',
  'theologian',
  'mystic',
  'philosopher',
])

// ─── Em-dash strip ───────────────────────────────────────────────────────────
// User-facing content rule: no em dashes (they're an AI tell). Cowork's draft
// uses 139 of them — all U+2014, all with surrounding spaces for parenthetical
// or appositive content. Audit confirmed comma substitution reads naturally in
// every observed context. Applied at seed time, not at parse time, so the
// extracted JSON stays faithful to Cowork's draft.
function stripEmDashes(input: string): string {
  if (!input) return input
  // Collapse any whitespace + em dash + whitespace into a single comma + space.
  // Then collapse a leftover lone em dash (shouldn't exist after this audit) to
  // the same substitution.
  return input.replace(/\s*—\s*/g, ', ')
}

// ─── Types ───────────────────────────────────────────────────────────────────

type ParsedTr = {
  dayNumber: number
  contentTitle: string
  trSlug: string
  authorName: string
  sourceWork: string
  authorType: string
  era: string
  shortQuote: string
  shortQuoteAttribution: string
  body: string
  sourceUrl: string
}

type CoworkItem = {
  dayNumber: number
  slug: string
  image: {_sourcingStatus?: string}
}

// ─── Build helpers ───────────────────────────────────────────────────────────

function buildSource(rec: ParsedTr): string {
  // The author should appear once in the source attribution. If sourceWork
  // already leads with the author name (rare), don't double up.
  const work = rec.sourceWork.trim()
  const author = rec.authorName.trim()
  if (!work) return author
  if (work.toLowerCase().startsWith(author.toLowerCase())) return work
  return `${author}, ${work}`
}

function buildTraditionReflection(rec: ParsedTr) {
  const era = ERA_MAP[rec.era] || rec.era
  if (!VALID_AUTHOR_TYPES.has(rec.authorType)) {
    console.warn(
      `  ⚠ Day ${rec.dayNumber}: unknown authorType "${rec.authorType}" — passing through anyway`,
    )
  }
  if (era !== rec.era) {
    console.log(`  · Day ${rec.dayNumber}: era ${rec.era} → ${era}`)
  }
  const doc: Record<string, unknown> = {
    _id: `tr-${rec.trSlug}`,
    _type: 'traditionReflection',
    authorType: rec.authorType,
    title: rec.authorName,
    summary: stripEmDashes(rec.body),
    source: stripEmDashes(buildSource(rec)),
    order: rec.dayNumber,
  }
  if (rec.shortQuote) doc.shortQuote = stripEmDashes(rec.shortQuote)
  if (era) doc.era = era
  return doc
}

// ─── Stable key generator (Sanity array items need _key) ─────────────────────
function makeKey(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return `tr-${Math.abs(hash).toString(36)}`
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\nContueri · seed-tr-content')
  console.log(`Project: ${projectId}   Dataset: ${dataset}`)
  console.log(`Mode: ${PATCH_MODE ? 'PATCH (writes)' : 'DRY RUN'}\n`)

  // Load parsed TR records
  const trPath = '/tmp/tr-extracted.json'
  if (!existsSync(trPath)) {
    console.error(`Missing ${trPath}. Run: python3 scripts/parse-tr-html.py`)
    process.exit(1)
  }
  const trRecords: ParsedTr[] = JSON.parse(readFileSync(trPath, 'utf8'))
  console.log(`Loaded ${trRecords.length} TR records from ${trPath}`)

  // Load Cowork seed for day → pp slug mapping
  const coworkPath = '/tmp/cowork-seed-resolved.json'
  if (!existsSync(coworkPath)) {
    console.error(`Missing ${coworkPath}.`)
    process.exit(1)
  }
  const coworkData = JSON.parse(readFileSync(coworkPath, 'utf8'))
  const coworkItems: CoworkItem[] =
    coworkData.contentItems || coworkData.items || (Array.isArray(coworkData) ? coworkData : [])
  const dayToPpSlug = new Map<number, string>()
  const seededStatuses = new Set(['sourced', 'ok_already'])
  for (const it of coworkItems) {
    if (seededStatuses.has(it.image?._sourcingStatus || '')) {
      dayToPpSlug.set(it.dayNumber, it.slug)
    }
  }
  console.log(
    `Day → PP-content slug map: ${dayToPpSlug.size} entries (only seeded contentItems)\n`,
  )

  // Editorial flags
  const emDashesIn = trRecords.reduce(
    (n, r) =>
      n + (r.body.match(/—/g) || []).length + (r.shortQuote.match(/—/g) || []).length,
    0,
  )
  // Apply the same transform we use in buildTraditionReflection so the count
  // is honest about what's about to be written.
  const emDashesOut = trRecords.reduce((n, r) => {
    return (
      n +
      (stripEmDashes(r.body).match(/—/g) || []).length +
      (stripEmDashes(r.shortQuote).match(/—/g) || []).length
    )
  }, 0)
  console.log(`Editorial flags:`)
  console.log(`  · Em dashes in Cowork draft: ${emDashesIn}`)
  console.log(
    `  · Em dashes in seeded text after stripEmDashes(): ${emDashesOut}` +
      (emDashesOut === 0 ? ' ✓ rule-compliant' : ' ⚠ residue — investigate'),
  )

  // Build all TR docs
  console.log(`\nBuilding TR docs:`)
  const trDocs = trRecords.map((rec) => {
    const doc = buildTraditionReflection(rec)
    return {rec, doc}
  })

  // Build per-day patches
  const patches: Array<{contentId: string; trId: string; dayNumber: number}> = []
  const skipped: number[] = []
  for (const rec of trRecords) {
    const ppSlug = dayToPpSlug.get(rec.dayNumber)
    if (!ppSlug) {
      skipped.push(rec.dayNumber)
      continue
    }
    patches.push({
      contentId: `pp-content-${ppSlug}`,
      trId: `tr-${rec.trSlug}`,
      dayNumber: rec.dayNumber,
    })
  }

  console.log(`\nPlan summary:`)
  console.log(`  · createOrReplace traditionReflection × ${trDocs.length}`)
  console.log(`  · patch contentItem.traditionReflections × ${patches.length}`)
  if (skipped.length) {
    console.log(
      `  · skipped (no seeded PP contentItem): days ${skipped.join(', ')} (TR still created, just not linked)`,
    )
  }

  if (!PATCH_MODE) {
    console.log(`\nDry run — no writes. Re-run with --patch to apply.\n`)
    // Print first record fully as a sanity check
    console.log(`Sample TR doc (Day ${trDocs[0].rec.dayNumber}):`)
    console.log(JSON.stringify(trDocs[0].doc, null, 2))
    return
  }

  // ─── Apply ─────────────────────────────────────────────────────────────────
  console.log(`\nApplying changes…\n`)

  // 1) Create / replace all TR docs in one transaction
  let tx = client.transaction()
  for (const {doc} of trDocs) {
    tx = tx.createOrReplace(doc as any)
  }
  await tx.commit()
  console.log(`✓ Wrote ${trDocs.length} traditionReflection docs`)

  // 2) Patch contentItems with the reference array
  let patched = 0
  let missing = 0
  for (const p of patches) {
    const existing = await client.fetch(
      `*[_id == $id][0]{_id}`,
      {id: p.contentId},
    )
    if (!existing) {
      console.warn(`  ⚠ Day ${p.dayNumber}: contentItem ${p.contentId} not found — skipped link`)
      missing++
      continue
    }
    await client
      .patch(p.contentId)
      .set({
        traditionReflections: [
          {
            _type: 'reference',
            _ref: p.trId,
            _key: makeKey(p.trId),
          },
        ],
      })
      .commit()
    patched++
  }
  console.log(`✓ Patched ${patched} contentItems with TR references`)
  if (missing) console.log(`  (${missing} contentItems not found — they were not seeded yet)`)
  console.log(`\nDone.\n`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
