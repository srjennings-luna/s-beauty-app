/**
 * Contueri — Find every em dash in user-facing Sanity content.
 *
 * Scans every published document of types we render in the app and reports
 * which fields contain U+2014 (em dash). Per CLAUDE.md voice rule, em dashes
 * are banned in user-facing copy.
 *
 * Usage:
 *   npx tsx scripts/find-em-dashes.ts            DRY RUN — print report
 *   npx tsx scripts/find-em-dashes.ts --patch    auto-replace em dashes
 *                                                with comma + space at the
 *                                                write layer (same pattern
 *                                                as scripts/seed-tr-content.ts)
 *
 * Re-runnable. Patch mode does not touch fields without em dashes.
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

const EM_DASH = '—'
const EM_DASH_REGEX = /\s*—\s*/g
const REPLACEMENT = ', '

// User-facing string / text fields per document type. Skip Studio-internal
// fields like `slug`, `_id`, `_rev`, `_type`, references, etc.
const SCAN_RULES: Record<string, string[]> = {
  contentItem: [
    'title',
    'description',
    'artworkHook',
    'context',
    'traditionalPrayer',
    'reflectionQuestions', // array of strings
    'locationName',
  ],
  dailyPrompt: [
    'dayTitle',
    'curatorNote',
    'promptQuestion',
    'actio',
    'lectio.philosophyText',
    'lectio.philosophyAttribution',
    'lectio.text',
    'lectio.attribution',
  ],
  traditionReflection: ['title', 'summary', 'shortQuote', 'source'],
  journeyDay: [
    'dayTitle',
    'openText',
    'encounterNote',
    'encounterGuidance',
    'connectThread',
    'lectio.philosophyText',
    'lectio.philosophyAttribution',
    'lectio.text',
    'lectio.attribution',
    'reflectionQuestions',
  ],
  journey: ['title', 'description'],
  splashPage: [], // block content; skip for now
}

type Finding = {
  docType: string
  docId: string
  docTitle: string
  fieldPath: string
  snippet: string
  fullValue: string
  arrayIndex?: number
}

function getNested(obj: any, path: string): any {
  return path.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj)
}

function snippetAround(text: string, idx: number, around = 40): string {
  const start = Math.max(0, idx - around)
  const end = Math.min(text.length, idx + 1 + around)
  let s = text.slice(start, end)
  if (start > 0) s = '…' + s
  if (end < text.length) s = s + '…'
  return s.replace(/—/g, '⟦—⟧')
}

function scanString(
  docType: string,
  docId: string,
  docTitle: string,
  fieldPath: string,
  value: string,
  arrayIndex?: number,
): Finding[] {
  const findings: Finding[] = []
  let m: RegExpExecArray | null
  const re = /—/g
  while ((m = re.exec(value)) !== null) {
    findings.push({
      docType,
      docId,
      docTitle,
      fieldPath,
      snippet: snippetAround(value, m.index),
      fullValue: value,
      arrayIndex,
    })
  }
  return findings
}

async function fetchAndScan() {
  const allFindings: Finding[] = []
  const seenDocsByType: Record<string, number> = {}

  for (const [docType, fields] of Object.entries(SCAN_RULES)) {
    if (fields.length === 0) continue
    const docs: any[] = await client.fetch(
      `*[_type == $type && !(_id in path("drafts.**"))]`,
      {type: docType},
    )
    seenDocsByType[docType] = docs.length

    for (const doc of docs) {
      const title = doc.title || doc.dayTitle || doc._id
      for (const fieldPath of fields) {
        const v = getNested(doc, fieldPath)
        if (v == null) continue
        if (typeof v === 'string') {
          allFindings.push(...scanString(docType, doc._id, title, fieldPath, v))
        } else if (Array.isArray(v)) {
          v.forEach((entry, i) => {
            if (typeof entry === 'string') {
              allFindings.push(
                ...scanString(docType, doc._id, title, fieldPath, entry, i),
              )
            }
          })
        }
      }
    }
  }

  return {findings: allFindings, seenDocsByType}
}

function stripEmDashes(value: string): string {
  return value.replace(EM_DASH_REGEX, REPLACEMENT)
}

async function patchDocs(findings: Finding[]) {
  // Group findings by doc + field so we apply each patch once
  const grouped = new Map<string, Finding[]>()
  for (const f of findings) {
    const key = `${f.docId}|${f.fieldPath}`
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(f)
  }

  let patched = 0
  for (const [, group] of grouped) {
    const first = group[0]
    const isArrayField = group.some((g) => g.arrayIndex !== undefined)
    if (isArrayField) {
      // Array of strings — read all entries, strip each, write whole array
      const doc: any = await client.getDocument(first.docId)
      const arr: any[] | undefined = getNested(doc, first.fieldPath)
      if (!Array.isArray(arr)) continue
      const cleaned = arr.map((entry) =>
        typeof entry === 'string' ? stripEmDashes(entry) : entry,
      )
      await client
        .patch(first.docId)
        .set({[first.fieldPath]: cleaned})
        .commit()
      patched++
      console.log(`  ✓ ${first.docType} ${first.docTitle} → ${first.fieldPath}[] (array)`)
    } else {
      // Single string field
      const cleaned = stripEmDashes(first.fullValue)
      await client
        .patch(first.docId)
        .set({[first.fieldPath]: cleaned})
        .commit()
      patched++
      console.log(`  ✓ ${first.docType} ${first.docTitle} → ${first.fieldPath}`)
    }
  }
  return patched
}

async function main() {
  console.log(`Mode: ${PATCH_MODE ? 'PATCH (writes enabled)' : 'DRY RUN — report only'}\n`)

  console.log('Scanning Sanity for em dashes…')
  const {findings, seenDocsByType} = await fetchAndScan()

  console.log('\nDocs scanned:')
  for (const [type, n] of Object.entries(seenDocsByType)) {
    console.log(`  ${type}: ${n}`)
  }

  console.log(`\nFound ${findings.length} em dash occurrence(s) across ${
    new Set(findings.map((f) => `${f.docId}|${f.fieldPath}`)).size
  } field(s).\n`)

  if (findings.length === 0) {
    console.log('Nothing to fix. Content is em-dash-free.')
    return
  }

  // Report grouped by doc
  const byDoc = new Map<string, Finding[]>()
  for (const f of findings) {
    if (!byDoc.has(f.docId)) byDoc.set(f.docId, [])
    byDoc.get(f.docId)!.push(f)
  }

  for (const [, group] of byDoc) {
    const first = group[0]
    console.log(`\n── ${first.docType} · ${first.docTitle}`)
    console.log(`   _id: ${first.docId}`)
    for (const f of group) {
      const where = f.arrayIndex !== undefined ? `${f.fieldPath}[${f.arrayIndex}]` : f.fieldPath
      console.log(`   • ${where}`)
      console.log(`     ${f.snippet}`)
    }
  }

  if (!PATCH_MODE) {
    console.log('\nRe-run with --patch to auto-replace em dashes with ", " (comma + space).')
    console.log('Same substitution pattern as scripts/seed-tr-content.ts.')
    return
  }

  console.log('\nPatching…')
  const patched = await patchDocs(findings)
  console.log(`\nDone. Patched ${patched} field(s) across ${byDoc.size} document(s).`)
}

main().catch((err) => {
  console.error('Scan failed:', err)
  process.exit(1)
})
