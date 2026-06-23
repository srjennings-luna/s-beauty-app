/**
 * Contueri, surface contentItems whose title is an editorial framing rather
 * than a real work name. After the June 22 dayTitle migration, the editorial
 * framing lives on dailyPrompt.dayTitle and contentItem.title is supposed to
 * be the work's actual name (or the subject's name for non-art types).
 *
 * For the 27 pre-pivot P&Ps where dayTitle was just copied from
 * contentItem.title, many contentItem.title values are still editorial
 * framings ("Spy Wednesday", "They Were Early", "The Fibonacci Spiral...")
 * and need rewriting to real work / subject names.
 *
 * This script categorizes each into one of three buckets so Sheri has a
 * punch list to work from in Studio. Output:
 *   ~/Documents/CONTUERI-ContentItem-Title-Cleanup-Punchlist-2026-06-22.md
 *
 * Read-only. No writes.
 *
 * Usage:
 *   npx tsx scripts/audit-content-title-cleanup.ts
 */
import {createClient} from '@sanity/client'
import {readFileSync, writeFileSync, existsSync} from 'fs'
import {resolve} from 'path'

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

const c = createClient({
  projectId: 'em44j9m8',
  dataset: 'production',
  apiVersion: '2025-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
})

type Row = {
  _id: string
  title: string | null
  contentType: string | null
  artist: string | null
  thinkerName: string | null
  author: string | null
  composer: string | null
  ppDates: string[]
  journeyRefs: number
}

const LITURGICAL_DAYS = new Set([
  'palm sunday',
  'holy monday',
  'holy tuesday',
  'spy wednesday',
  'holy wednesday',
  'holy thursday',
  'good friday',
  'holy saturday',
  'easter sunday',
])

type Bucket = 'A' | 'B' | 'C'
type Verdict = {
  bucket: Bucket
  reason: string
  suggestedAction: string
}

function classify(r: Row): Verdict {
  const title = (r.title || '').trim()
  const lower = title.toLowerCase()
  const type = r.contentType || ''
  const identity =
    r.artist?.trim() || r.thinkerName?.trim() || r.author?.trim() || r.composer?.trim() || ''

  if (LITURGICAL_DAYS.has(lower)) {
    return {
      bucket: 'B',
      reason: 'Liturgical day name used as contentItem.title; the actual artwork has a different proper name',
      suggestedAction: `Rewrite contentItem.title to the actual painting name (e.g. Caravaggio's "Spy Wednesday" is "The Taking of Christ"; Velazquez's "Good Friday" is "Christ Crucified")`,
    }
  }

  if (title.includes('?')) {
    return {
      bucket: 'B',
      reason: 'Question-form title is editorial framing, not a work/subject name',
      suggestedAction: 'Rewrite contentItem.title to the actual subject (a thinker name, a topic name, a piece name)',
    }
  }

  if (title.includes(':') && type === 'math-science') {
    return {
      bucket: 'B',
      reason: 'Subtitle-form title ("Concept: editorial framing") is half-editorial; the concept name alone is the subject',
      suggestedAction: 'Rewrite contentItem.title to just the subject ("The Double Helix", "The Fibonacci Spiral"); move the colon-and-after framing to dayTitle if not already there',
    }
  }

  if (type === 'thinker' && r.thinkerName && lower !== r.thinkerName.toLowerCase()) {
    return {
      bucket: 'B',
      reason: `Thinker P&P, but contentItem.title ("${title}") is not the thinker's name ("${r.thinkerName}")`,
      suggestedAction: 'Rewrite contentItem.title to the thinker name + key work, e.g. "Justin Martyr, First Apology"',
    }
  }

  if (type === 'sacred-art' && identity) {
    return {
      bucket: 'A',
      reason: `Sacred-art with artist populated, title appears to be the work name`,
      suggestedAction: 'Likely fine, scan to confirm title matches the actual painting',
    }
  }

  if (type === 'literature' && identity) {
    return {
      bucket: 'A',
      reason: `Literature with author populated, title appears to be the work name`,
      suggestedAction: 'Likely fine',
    }
  }

  if (type === 'music' && identity) {
    return {
      bucket: 'A',
      reason: `Music with composer populated, title appears to be the piece name`,
      suggestedAction: 'Likely fine',
    }
  }

  if (type === 'watch-listen') {
    return {
      bucket: 'A',
      reason: 'Watch & Listen, title is typically the media title',
      suggestedAction: 'Likely fine',
    }
  }

  if (type === 'landscape' || type === 'food-wine' || type === 'photography') {
    return {
      bucket: 'C',
      reason: `${type} content, title is the subject/place/work name`,
      suggestedAction: 'Review, is this the actual subject name a Lewis-register editor would use?',
    }
  }

  return {
    bucket: 'C',
    reason: 'No clear classification, manual review needed',
    suggestedAction: 'Review, decide whether title needs to be reframed as a real work/subject name',
  }
}

function studioUrl(id: string): string {
  return `https://seeking-beauty.sanity.studio/structure/contentItem;${id}`
}

async function main() {
  const rows = await c.fetch<Row[]>(
    `*[_type=="contentItem" && !(_id in path("drafts.**"))]{
      _id,
      title,
      contentType,
      artist,
      thinkerName,
      author,
      composer,
      "ppDates": *[_type=="dailyPrompt" && content._ref == ^._id]{date}.date,
      "journeyRefs": count(*[_type=="journeyDay" && encounterContent._ref == ^._id])
    } | order(title asc)`,
  )

  // Only consider contentItems that are actually featured on a P&P
  // (otherwise they're not in scope for the dayTitle migration aftermath).
  const featured = rows.filter((r) => r.ppDates && r.ppDates.length > 0)

  const byBucket: Record<Bucket, (Row & Verdict)[]> = {A: [], B: [], C: []}
  for (const r of featured) {
    const v = classify(r)
    byBucket[v.bucket].push({...r, ...v})
  }

  // Sort within each bucket by date ascending of first P&P, then title
  for (const k of ['A', 'B', 'C'] as const) {
    byBucket[k].sort((a, b) => {
      const ad = a.ppDates[0] || ''
      const bd = b.ppDates[0] || ''
      if (ad !== bd) return ad < bd ? -1 : 1
      return (a.title || '').localeCompare(b.title || '')
    })
  }

  const today = '2026-06-22'
  const lines: string[] = []
  lines.push(`# Contueri, contentItem.title cleanup punchlist`)
  lines.push(``)
  lines.push(`Generated ${today}. Source: every contentItem currently featured on at least one P&P, grouped by my heuristic classification. Sheri scans, decides per item, edits in Studio.`)
  lines.push(``)
  lines.push(`**Total contentItems featured on a P&P:** ${featured.length}`)
  lines.push(`- Bucket A (looks fine, scan to confirm): ${byBucket.A.length}`)
  lines.push(`- Bucket B (clearly editorial framing, rewrite needed): ${byBucket.B.length}`)
  lines.push(`- Bucket C (ambiguous, review): ${byBucket.C.length}`)
  lines.push(``)
  lines.push(`Doctrine reminder: contentItem.title = the work's actual name or the subject's name. dailyPrompt.dayTitle = the day's editorial framing. After the June 22 PromptClient swap, dayTitle is what renders BIG on the P&P; contentItem.title now renders only in the small museum caption below the image (for sacred-art and photography only) and in Library / Explore cards. Fixing the editorial framings to real work names primarily improves Library / Explore browsing.`)
  lines.push(``)
  lines.push(`---`)
  lines.push(``)

  // ── Bucket B first (the urgent ones) ──
  lines.push(`## Bucket B, clearly editorial framing, rewrite needed`)
  lines.push(``)
  lines.push(`These contentItem.title values are editorial framings (liturgical day names, question forms, subtitle-form). The work has a different proper name that should live here instead. After fixing each, the editorial framing remains on dailyPrompt.dayTitle (which was already populated by the migration).`)
  lines.push(``)
  for (const r of byBucket.B) {
    lines.push(`### ${r.title}`)
    lines.push(``)
    lines.push(`- **contentType:** ${r.contentType}`)
    const identity =
      r.artist?.trim() || r.thinkerName?.trim() || r.author?.trim() || r.composer?.trim() || '(no identity field populated)'
    lines.push(`- **Identity (artist / thinker / author / composer):** ${identity}`)
    lines.push(`- **P&P date(s):** ${r.ppDates.join(', ')}`)
    if (r.journeyRefs > 0) {
      lines.push(`- **Journey references:** ${r.journeyRefs} (correction propagates to journey rendering too)`)
    }
    lines.push(`- **Why flagged:** ${r.reason}`)
    lines.push(`- **Suggested action:** ${r.suggestedAction}`)
    lines.push(`- **Edit in Studio:** ${studioUrl(r._id)}`)
    lines.push(``)
  }

  lines.push(`---`)
  lines.push(``)

  // ── Bucket C (ambiguous) ──
  lines.push(`## Bucket C, ambiguous, review`)
  lines.push(``)
  lines.push(`These titles are not clearly editorial nor clearly the work's proper name. Often descriptive labels for places, foods, or photographs that may or may not be the canonical subject name a Lewis-register editor would use.`)
  lines.push(``)
  for (const r of byBucket.C) {
    lines.push(`### ${r.title}`)
    lines.push(``)
    lines.push(`- **contentType:** ${r.contentType}`)
    const identity =
      r.artist?.trim() || r.thinkerName?.trim() || r.author?.trim() || r.composer?.trim() || '(no identity field populated)'
    lines.push(`- **Identity:** ${identity}`)
    lines.push(`- **P&P date(s):** ${r.ppDates.join(', ')}`)
    if (r.journeyRefs > 0) {
      lines.push(`- **Journey references:** ${r.journeyRefs}`)
    }
    lines.push(`- **Why flagged:** ${r.reason}`)
    lines.push(`- **Suggested action:** ${r.suggestedAction}`)
    lines.push(`- **Edit in Studio:** ${studioUrl(r._id)}`)
    lines.push(``)
  }

  lines.push(`---`)
  lines.push(``)

  // ── Bucket A (looks fine, listed for completeness) ──
  lines.push(`## Bucket A, looks fine, scan to confirm`)
  lines.push(``)
  lines.push(`These contentItem.titles match the standard pattern for their content type (work name with author / artist / composer present). Listed in compact form for a final scan.`)
  lines.push(``)
  lines.push(`| Title | Type | Identity | P&P date(s) |`)
  lines.push(`|---|---|---|---|`)
  for (const r of byBucket.A) {
    const identity =
      r.artist?.trim() || r.thinkerName?.trim() || r.author?.trim() || r.composer?.trim() || ''
    lines.push(`| ${r.title} | ${r.contentType} | ${identity} | ${r.ppDates.join(', ')} |`)
  }
  lines.push(``)

  lines.push(`---`)
  lines.push(``)
  lines.push(`*Punchlist generated by scripts/audit-content-title-cleanup.ts on ${today}. Re-run as needed.*`)
  lines.push(``)

  const outPath = resolve(
    process.env.HOME || '',
    'Documents',
    'CONTUERI-ContentItem-Title-Cleanup-Punchlist-2026-06-22.md',
  )
  writeFileSync(outPath, lines.join('\n'), 'utf8')

  console.log(`Total contentItems featured on a P&P: ${featured.length}`)
  console.log(`Bucket A (likely fine):              ${byBucket.A.length}`)
  console.log(`Bucket B (needs rewriting):          ${byBucket.B.length}`)
  console.log(`Bucket C (ambiguous, review):        ${byBucket.C.length}`)
  console.log(``)
  console.log(`Wrote punchlist to ${outPath}`)
  console.log(`Open in Markdown viewer or any text editor.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
