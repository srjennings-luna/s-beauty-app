/**
 * Build a calendar + content-type planning surface for the full P&P corpus.
 *
 * Pulls every dailyPrompt from Sanity, joins its linked contentItem, and
 * produces an HTML doc with:
 *
 *   1. State summary stats (counts by status)
 *   2. Content type distribution (rotation analysis)
 *   3. Calendar table (every P&P, chronological, with status + field health)
 *   4. Republish punch list (pre-pivot items that need new editorial pass)
 *
 * Status flagging:
 *   - Pre-pivot, not Holy Week:   "Republish"  (orange) — gets new editorial pass for launch
 *   - Holy Week (Mar 29 to Apr 5): "Keep"       (sage)   — sacred liturgical sequence
 *   - Post-pivot (Jun 12 onward):  "Launch"     (gold)   — current launch corpus
 *
 * Output: ~/Documents/CONTUERI-PP-Corpus-Calendar-2026-06-22.html
 * Read-only on Sanity.
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

const PIVOT_DATE = '2026-06-12'
const HOLY_WEEK_START = '2026-03-29'
const HOLY_WEEK_END = '2026-04-05'

type Row = {
  _id: string
  date: string
  dayTitle: string | null
  promptQuestion: string | null
  hasCuratorNote: boolean
  hasLectio: boolean
  hasAuditio: boolean
  hasActio: boolean
  contentId: string
  contentTitle: string | null
  contentType: string | null
  identity: string | null
  hasYear: boolean
  hasLocation: boolean
  hasContext: boolean
  hasImage: boolean
}

type Status = 'Republish' | 'Keep' | 'Launch'

const TYPE_COLORS: Record<string, string> = {
  'sacred-art': '#7ba2b8',
  music: '#9a8a9e',
  literature: '#c9a07c',
  landscape: '#a8ae9a',
  'food-wine': '#c68a77',
  'math-science': '#84a9a2',
  thinker: '#E4C371',
  'watch-listen': '#b8869a',
  photography: '#a49898',
}

const TYPE_LABEL: Record<string, string> = {
  'sacred-art': 'Sacred Art',
  music: 'Music',
  literature: 'Literature',
  landscape: 'Landscape',
  'food-wine': 'Food & Wine',
  'math-science': 'Pattern & Proof',
  thinker: 'Thinker',
  'watch-listen': 'Watch & Listen',
  photography: 'Photography',
}

function statusFor(date: string): Status {
  if (date >= HOLY_WEEK_START && date <= HOLY_WEEK_END) return 'Keep'
  if (date < PIVOT_DATE) return 'Republish'
  return 'Launch'
}

function esc(s: string | null | undefined): string {
  if (s == null) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function studioUrl(id: string): string {
  return `https://seeking-beauty.sanity.studio/structure/contentItem;${id}`
}

function studioPromptUrl(id: string): string {
  return `https://seeking-beauty.sanity.studio/structure/dailyPrompt;${id}`
}

async function main() {
  const rows = await c.fetch<Row[]>(
    `*[_type=="dailyPrompt" && !(_id in path("drafts.**"))]{
      _id,
      date,
      dayTitle,
      promptQuestion,
      "hasCuratorNote": length(coalesce(curatorNote, "")) > 0,
      "hasLectio": defined(lectio.text) && length(lectio.text) > 0,
      "hasAuditio": defined(auditio),
      "hasActio": length(coalesce(actio, "")) > 0,
      "contentId": content._ref,
      "contentTitle": content->title,
      "contentType": content->contentType,
      "identity": coalesce(content->artist, content->thinkerName, content->author, content->composer),
      "hasYear": length(coalesce(content->year, "")) > 0,
      "hasLocation": length(coalesce(content->location.locationName, "")) > 0,
      "hasContext": length(coalesce(content->context, "")) > 0,
      "hasImage": defined(content->image.asset)
    } | order(date asc)`,
  )

  // Group by status
  const republish: Row[] = []
  const keep: Row[] = []
  const launch: Row[] = []
  for (const r of rows) {
    const s = statusFor(r.date)
    if (s === 'Republish') republish.push(r)
    else if (s === 'Keep') keep.push(r)
    else launch.push(r)
  }

  // Content-type distribution per status group
  const typeCount = (group: Row[]) => {
    const m: Record<string, number> = {}
    for (const r of group) {
      const t = r.contentType || 'unknown'
      m[t] = (m[t] || 0) + 1
    }
    return m
  }
  const republishTypes = typeCount(republish)
  const keepTypes = typeCount(keep)
  const launchTypes = typeCount(launch)
  const totalTypes = typeCount(rows)

  // Field-health helpers
  const checkmark = (b: boolean) => (b ? '<span class="ck ok">✓</span>' : '<span class="ck no">·</span>')

  const renderRow = (r: Row) => {
    const status = statusFor(r.date)
    const statusClass = status === 'Republish' ? 'st-republish' : status === 'Keep' ? 'st-keep' : 'st-launch'
    const typeColor = TYPE_COLORS[r.contentType || ''] || '#888'
    const typeLabel = TYPE_LABEL[r.contentType || ''] || r.contentType || '?'
    return `
        <tr class="${statusClass}">
          <td class="date">${esc(r.date)}</td>
          <td><span class="status-pill ${statusClass}">${status}</span></td>
          <td><span class="type-pill" style="background:${typeColor};">${esc(typeLabel)}</span></td>
          <td class="day-title"><strong>${esc(r.dayTitle || '(none)')}</strong></td>
          <td class="ci-title">${esc(r.contentTitle || '(none)')}</td>
          <td class="identity">${esc(r.identity || '')}</td>
          <td class="health">
            ${checkmark(r.hasImage)}<span class="lbl">img</span>
            ${checkmark(r.hasCuratorNote)}<span class="lbl">hook</span>
            ${checkmark(r.hasContext)}<span class="lbl">ctx</span>
            ${checkmark(r.hasLectio)}<span class="lbl">lec</span>
            ${checkmark(r.hasAuditio)}<span class="lbl">aud</span>
            ${checkmark(r.hasActio)}<span class="lbl">act</span>
            ${checkmark(r.hasYear)}<span class="lbl">yr</span>
            ${checkmark(r.hasLocation)}<span class="lbl">loc</span>
          </td>
          <td class="actions">
            <a href="${studioUrl(r.contentId)}" target="_blank" title="Edit contentItem">ci</a>
            <a href="${studioPromptUrl(r._id)}" target="_blank" title="Edit dailyPrompt">pp</a>
          </td>
        </tr>`
  }

  const renderTypeBar = (counts: Record<string, number>, total: number) => {
    const types = Object.keys(TYPE_COLORS)
    return types
      .map((t) => {
        const n = counts[t] || 0
        if (n === 0) return ''
        const pct = total > 0 ? Math.round((n / total) * 100) : 0
        return `<div class="type-row"><span class="type-pill" style="background:${TYPE_COLORS[t]};">${TYPE_LABEL[t]}</span><span class="type-count">${n}</span><span class="type-bar"><span class="type-fill" style="width:${pct * 2}px; background:${TYPE_COLORS[t]};"></span></span><span class="type-pct">${pct}%</span></div>`
      })
      .join('')
  }

  const today = '2026-06-22'

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Contueri, P&amp;P Corpus Calendar, June 22, 2026</title>
<style>
  body { font-family: 'SF Pro Text', -apple-system, system-ui, sans-serif; background: #fdf6e9; color: #1a1410; line-height: 1.5; max-width: 1500px; margin: 0 auto; padding: 28px; }
  h1 { font-size: 1.6rem; font-weight: 600; margin: 0 0 6px; }
  h2 { font-size: 1.15rem; margin: 32px 0 10px; padding-bottom: 4px; border-bottom: 2px solid #d9cbb3; }
  h3 { font-size: 1rem; margin: 18px 0 6px; color: #5a4636; }
  p.meta { color: #6b4d2c; margin: 0 0 18px; font-size: 0.85rem; }
  p.intro { color: #4a3a2a; margin: 0 0 20px; font-size: 0.92rem; }

  .summary-row { display: flex; gap: 14px; margin: 18px 0 28px; flex-wrap: wrap; }
  .summary-card { background: #fff; border: 1px solid #d9cbb3; padding: 14px 18px; min-width: 180px; }
  .summary-card .label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: #8a7560; font-weight: 700; margin-bottom: 4px; }
  .summary-card .num { font-size: 2rem; font-weight: 700; color: #16110d; line-height: 1; }
  .summary-card .sub { color: #6b4d2c; font-size: 0.78rem; margin-top: 4px; }

  table { border-collapse: collapse; width: 100%; font-size: 0.84rem; margin-bottom: 20px; }
  th, td { border: 1px solid #d9cbb3; padding: 6px 9px; vertical-align: top; text-align: left; }
  thead th { background: #16110d; color: #fdf6e9; font-weight: 600; position: sticky; top: 0; z-index: 1; font-size: 0.74rem; text-transform: uppercase; letter-spacing: 0.04em; }
  tbody tr.st-republish { background: rgba(184,80,63,0.04); }
  tbody tr.st-keep { background: rgba(74,122,98,0.05); }
  tbody tr.st-launch { background: rgba(193,155,95,0.04); }

  td.date { font-family: 'SF Mono', Menlo, monospace; font-size: 0.78rem; color: #5a4636; white-space: nowrap; }
  td.day-title strong { color: #16110d; }
  td.ci-title { color: #4a3a2a; font-size: 0.82rem; }
  td.identity { color: #5a4636; font-size: 0.8rem; font-style: italic; }

  .status-pill { display: inline-block; padding: 2px 8px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: #fff; }
  .status-pill.st-republish { background: #b8503f; }
  .status-pill.st-keep { background: #4a7a62; }
  .status-pill.st-launch { background: #C19B5F; }

  .type-pill { display: inline-block; padding: 2px 7px; font-size: 0.72rem; font-weight: 600; color: #1a1410; letter-spacing: 0.02em; }

  .health { font-family: 'SF Mono', Menlo, monospace; font-size: 0.72rem; white-space: nowrap; }
  .ck { display: inline-block; width: 12px; text-align: center; font-weight: 700; }
  .ck.ok { color: #4a7a62; }
  .ck.no { color: #c89a3a; }
  .lbl { color: #6b4d2c; font-size: 0.65rem; margin-right: 6px; }

  td.actions a { display: inline-block; padding: 2px 8px; background: #16110d; color: #fdf6e9; text-decoration: none; font-weight: 600; font-size: 0.7rem; letter-spacing: 0.04em; text-transform: uppercase; margin-right: 4px; }
  td.actions a:hover { background: #C19B5F; color: #16110d; }

  .type-row { display: flex; align-items: center; gap: 10px; margin: 4px 0; font-size: 0.82rem; }
  .type-row .type-pill { min-width: 110px; text-align: center; }
  .type-row .type-count { font-family: 'SF Mono', Menlo, monospace; min-width: 24px; text-align: right; font-weight: 700; }
  .type-bar { display: inline-block; height: 12px; background: #f0e6cf; min-width: 200px; }
  .type-fill { display: inline-block; height: 100%; }
  .type-pct { color: #6b4d2c; font-size: 0.78rem; min-width: 36px; }

  col.col-date { width: 6%; }
  col.col-status { width: 7%; }
  col.col-type { width: 8%; }
  col.col-day-title { width: 16%; }
  col.col-ci-title { width: 18%; }
  col.col-identity { width: 12%; }
  col.col-health { width: 25%; }
  col.col-actions { width: 8%; }
</style>
</head>
<body>

<h1>P&amp;P Corpus Calendar</h1>
<p class="meta">Generated ${today} from live Sanity data. Includes every published dailyPrompt with its linked contentItem. Status flags: Republish (pre-pivot, get fresh editorial for launch), Keep (Holy Week sequence, sacred and stays), Launch (post-2026-06-12, current launch corpus).</p>

<div class="summary-row">
  <div class="summary-card">
    <div class="label">Total Published P&amp;P</div>
    <div class="num">${rows.length}</div>
    <div class="sub">all dailyPrompts in production</div>
  </div>
  <div class="summary-card" style="border-color:#b8503f;">
    <div class="label" style="color:#b8503f;">Republish</div>
    <div class="num" style="color:#b8503f;">${republish.length}</div>
    <div class="sub">pre-pivot, needs new editorial pass</div>
  </div>
  <div class="summary-card" style="border-color:#4a7a62;">
    <div class="label" style="color:#4a7a62;">Keep, Holy Week</div>
    <div class="num" style="color:#4a7a62;">${keep.length}</div>
    <div class="sub">liturgical sequence, stays as-is</div>
  </div>
  <div class="summary-card" style="border-color:#C19B5F;">
    <div class="label" style="color:#a87f3e;">Launch</div>
    <div class="num" style="color:#a87f3e;">${launch.length}</div>
    <div class="sub">post-pivot, current launch corpus</div>
  </div>
</div>

<h2>Content-type rotation</h2>

<h3>Across the full corpus (${rows.length} P&amp;Ps)</h3>
${renderTypeBar(totalTypes, rows.length)}

<h3>Launch corpus only (${launch.length} P&amp;Ps, post-2026-06-12)</h3>
${renderTypeBar(launchTypes, launch.length)}

<h3>Republish candidates (${republish.length} P&amp;Ps, pre-pivot non-Holy-Week)</h3>
${renderTypeBar(republishTypes, republish.length)}

<h2>Calendar (every P&amp;P, chronological)</h2>
<p class="intro">Field health: img / hook / ctx / lec / aud / act / yr / loc. Green check = present, yellow dot = empty. Click <code>ci</code> to edit the contentItem, <code>pp</code> to edit the dailyPrompt.</p>

<table>
  <colgroup>
    <col class="col-date"><col class="col-status"><col class="col-type"><col class="col-day-title"><col class="col-ci-title"><col class="col-identity"><col class="col-health"><col class="col-actions">
  </colgroup>
  <thead>
    <tr><th>Date</th><th>Status</th><th>Type</th><th>Day Title</th><th>ContentItem Title</th><th>Identity</th><th>Field Health</th><th>Edit</th></tr>
  </thead>
  <tbody>${rows.map(renderRow).join('')}
  </tbody>
</table>

<h2>Republish punch list, by month</h2>
<p class="intro">These ${republish.length} P&amp;Ps will get fresh editorial content for the launch corpus. Group by month so you can plan the new arc.</p>
${(() => {
  const byMonth: Record<string, Row[]> = {}
  for (const r of republish) {
    const m = r.date.slice(0, 7)
    if (!byMonth[m]) byMonth[m] = []
    byMonth[m].push(r)
  }
  return Object.keys(byMonth)
    .sort()
    .map((m) => {
      const items = byMonth[m]
      return `
<h3>${m} (${items.length} P&amp;Ps)</h3>
<ul style="margin-left: 20px;">
${items
  .map(
    (r) => `  <li>${esc(r.date)}: <strong>${esc(r.dayTitle || '(none)')}</strong> <span style="color:#5a4636;">[${TYPE_LABEL[r.contentType || ''] || '?'}]</span> ${r.identity ? `, ${esc(r.identity)}` : ''}</li>`,
  )
  .join('\n')}
</ul>`
    })
    .join('')
})()}

<h2>Field-health gaps in the Launch corpus</h2>
<p class="intro">Items in the LAUNCH section above (post-pivot) with any missing field. These are gaps to close before broader distribution.</p>
${(() => {
  const gaps = launch.filter(
    (r) => !r.hasCuratorNote || !r.hasLectio || !r.hasAuditio || !r.hasActio || !r.hasYear || !r.hasLocation,
  )
  if (gaps.length === 0) return `<p>No gaps in the launch corpus, all fields populated.</p>`
  return `<ul style="margin-left: 20px;">${gaps
    .map((r) => {
      const missing: string[] = []
      if (!r.hasCuratorNote) missing.push('hook')
      if (!r.hasLectio) missing.push('lectio')
      if (!r.hasAuditio) missing.push('auditio')
      if (!r.hasActio) missing.push('actio')
      if (!r.hasYear) missing.push('year')
      if (!r.hasLocation) missing.push('location')
      return `  <li>${esc(r.date)}: <strong>${esc(r.dayTitle || '(none)')}</strong>, missing: ${missing.join(', ')}</li>`
    })
    .join('\n')}</ul>`
})()}

</body>
</html>
`

  const outPath = resolve(
    process.env.HOME || '',
    'Documents',
    'CONTUERI-PP-Corpus-Calendar-2026-06-22.html',
  )
  writeFileSync(outPath, html, 'utf8')
  console.log(`Wrote ${outPath}`)
  console.log(``)
  console.log(`Total:      ${rows.length}`)
  console.log(`Republish:  ${republish.length} (pre-pivot, not Holy Week)`)
  console.log(`Keep:       ${keep.length} (Holy Week)`)
  console.log(`Launch:     ${launch.length} (post-pivot)`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
