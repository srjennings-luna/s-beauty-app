/**
 * Build a clean HTML reference table for the contentItem.title cleanup.
 * Pulls current Sanity data for accuracy, emits one row per item with the
 * canonical artwork data prefilled from the lookup tables below.
 *
 * Output:
 *   ~/Documents/CONTUERI-ContentItem-Title-Cleanup-2026-06-22.html
 *
 * Read-only on Sanity. No writes.
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

type Override = {
  canonicalTitle: string
  suggestedDayTitle: string // "(keep current)" to leave alone; specific string to edit dayTitle too
  artist: string
  year: string
  location: string
  note?: string
}

// Lookup keyed by contentItem.title (current value in Sanity). For Bucket B
// items where I have authoritative data from entry guides; for the few research
// items the canonicalTitle is a parenthetical instruction.
const BUCKET_B: Record<string, Override> = {
  'Palm Sunday': {
    canonicalTitle: 'Entry into Jerusalem',
    suggestedDayTitle: '(keep "Palm Sunday")',
    artist: 'Giotto di Bondone',
    year: 'c. 1304–1306',
    location: 'Scrovegni Chapel, Padua, Italy',
  },
  'Holy Monday': {
    canonicalTitle: 'The Anointing at Bethany',
    suggestedDayTitle: '(keep "Holy Monday")',
    artist: 'Fra Angelico',
    year: 'c. 1440',
    location: 'San Marco Museum, Florence, Italy',
  },
  'Holy Tuesday': {
    canonicalTitle: 'Christ Driving the Money Changers from the Temple',
    suggestedDayTitle: '(keep "Holy Tuesday")',
    artist: 'El Greco (Domenikos Theotokopoulos)',
    year: 'c. 1600',
    location: 'National Gallery, London (NG1457)',
  },
  'Spy Wednesday': {
    canonicalTitle: 'The Taking of Christ',
    suggestedDayTitle: '(keep "Spy Wednesday")',
    artist: 'Caravaggio (Michelangelo Merisi da Caravaggio)',
    year: '1602',
    location: 'National Gallery of Ireland, Dublin',
  },
  'Holy Thursday': {
    canonicalTitle: 'The Last Supper',
    suggestedDayTitle: '(keep "Holy Thursday")',
    artist: 'Leonardo da Vinci',
    year: 'c. 1495–1498',
    location: 'Santa Maria delle Grazie, Milan, Italy',
    note: 'Tempera on dry wall, not a true fresco',
  },
  'Good Friday': {
    canonicalTitle: 'Christ Crucified',
    suggestedDayTitle: '(keep "Good Friday")',
    artist: 'Diego Velázquez',
    year: 'c. 1632',
    location: 'Museo del Prado, Madrid, Spain',
  },
  'Holy Saturday': {
    canonicalTitle: 'The Anastasis (Harrowing of Hell)',
    suggestedDayTitle: '(keep "Holy Saturday")',
    artist: 'Byzantine icon, artist unknown',
    year: 'c. 1315–1321',
    location: 'Chora Church (Kariye), Istanbul, Turkey',
  },
  'Easter Sunday': {
    canonicalTitle: 'The Resurrection',
    suggestedDayTitle: '(keep "Easter Sunday")',
    artist: 'Andrea Mantegna',
    year: 'c. 1457–1459',
    location: 'Musée des Beaux-Arts de Tours, France',
    note: 'Predella panel from the San Zeno Altarpiece, Verona',
  },
  'The Double Helix: Code Written Before Language': {
    canonicalTitle: 'The Double Helix',
    suggestedDayTitle: 'The Code Written Before Language',
    artist: '(concept, no creator)',
    year: '1953 (Watson, Crick, Franklin)',
    location: '',
    note: 'Split the colon-form: subject in contentItem.title, editorial framing in dayTitle. Both fields currently hold the full string.',
  },
  'The Fibonacci Spiral: Mathematics the Eye Already Knows': {
    canonicalTitle: 'The Fibonacci Spiral',
    suggestedDayTitle: 'Mathematics the Eye Already Knows',
    artist: '(concept, no creator)',
    year: '',
    location: '',
    note: 'Split the colon-form: subject in contentItem.title, editorial framing in dayTitle.',
  },
  'Roger Scruton on the Sacred and the Beautiful': {
    canonicalTitle: 'Beauty: A Very Short Introduction',
    suggestedDayTitle: 'Scruton on the Sacred and the Beautiful',
    artist: 'Roger Scruton',
    year: '2011',
    location: '',
    note: 'contentItem becomes the work; dayTitle becomes the editorial framing (drop "Roger" since the work attribution carries the name). Alt: keep contentItem as "Roger Scruton" and dayTitle as the current "...on the Sacred and the Beautiful".',
  },
  'They Were Early': {
    canonicalTitle: '(RESEARCH: which catacomb fresco)',
    suggestedDayTitle: '(keep "They Were Early")',
    artist: 'Anonymous, Catacomb of Priscilla',
    year: '2nd–4th century AD',
    location: 'Catacomb of Priscilla, Rome',
    note: 'Open in Studio, identify which fresco image is uploaded, use its proper name (Good Shepherd, Priscilla Madonna, etc.). "They Were Early" stays as the powerful editorial dayTitle.',
  },
  'What do a priest, a scientist, and a telescope have in common?': {
    canonicalTitle: '(RESEARCH: which deep-field image)',
    suggestedDayTitle: '(keep the question as dayTitle)',
    artist: 'NASA / ESA',
    year: '2022 or earlier',
    location: '',
    note: 'The question IS the editorial framing, keep it on dayTitle. contentItem.title becomes the actual image subject (e.g. "Webb First Deep Field, SMACS 0723").',
  },
}

const BUCKET_B_NEAR_FINE: Record<string, Override> = {
  'The Adoration of the Magi (Triptych)': {
    canonicalTitle: 'The Adoration of the Magi (Triptych)',
    suggestedDayTitle: '(keep current)',
    artist: 'Hieronymus Bosch',
    year: 'c. 1490–1495',
    location: 'Museo del Prado, Madrid (verify)',
    note: 'Already correct, optional simplification only',
  },
}

const BUCKET_C: Record<string, Override> = {
  'Missa Papae Marcelli': {
    canonicalTitle: 'Missa Papae Marcelli',
    suggestedDayTitle: '(keep current)',
    artist: 'Giovanni Pierluigi da Palestrina',
    year: 'c. 1562',
    location: '',
    note: 'Keep as is, real work title',
  },
  'Christ in Gethsemane (Agony in the Garden)': {
    canonicalTitle: 'Christ in Gethsemane (Agony in the Garden)',
    suggestedDayTitle: '(keep current)',
    artist: 'El Greco',
    year: 'c. 1590–1605',
    location: 'National Gallery, London (and other versions)',
    note: 'Keep as is, real painting title',
  },
  'The Atacama Desert at Dawn': {
    canonicalTitle: 'The Atacama Desert at Dawn',
    suggestedDayTitle: '(keep current)',
    artist: '(landscape, no creator)',
    year: '',
    location: 'Atacama Desert, Chile',
    note: 'Keep as is, descriptive place name',
  },
  'The Bread Ovens of Tuscany': {
    canonicalTitle: 'The Bread Ovens of Tuscany',
    suggestedDayTitle: '(keep current)',
    artist: '(food-wine, no creator)',
    year: '',
    location: 'Tuscany, Italy',
    note: 'Keep as is, descriptive subject',
  },
  'The Trinity (Troitsa)': {
    canonicalTitle: 'The Trinity (Troitsa)',
    suggestedDayTitle: '(keep current)',
    artist: 'Andrei Rublev',
    year: 'c. 1411–1425',
    location: 'Tretyakov Gallery, Moscow',
    note: 'Keep as is, canonical title',
  },
  'Skógafoss Waterfall, Iceland': {
    canonicalTitle: 'Skógafoss Waterfall, Iceland',
    suggestedDayTitle: '(keep current)',
    artist: '(landscape)',
    year: '',
    location: 'Skógafoss, Iceland',
    note: 'Keep as is',
  },
  'Pied Beauty': {
    canonicalTitle: 'Pied Beauty',
    suggestedDayTitle: '(keep current)',
    artist: 'Gerard Manley Hopkins',
    year: '1877',
    location: '',
    note: 'Keep as is, real poem title',
  },
  'Spiegel im Spiegel': {
    canonicalTitle: 'Spiegel im Spiegel',
    suggestedDayTitle: '(keep current)',
    artist: 'Arvo Pärt',
    year: '1978',
    location: '',
    note: 'Keep as is, real piece title',
  },
  'My Octopus Teacher': {
    canonicalTitle: 'My Octopus Teacher',
    suggestedDayTitle: '(keep current)',
    artist: 'Pippa Ehrlich, James Reed (directors)',
    year: '2020',
    location: 'Netflix',
    note: 'Keep as is, real documentary title',
  },
  'The Lake Isle of Innisfree': {
    canonicalTitle: 'The Lake Isle of Innisfree',
    suggestedDayTitle: '(keep current)',
    artist: 'William Butler Yeats',
    year: '1888',
    location: '',
    note: 'Keep as is, real poem title',
  },
  'The Return of the Prodigal Son': {
    canonicalTitle: 'The Return of the Prodigal Son',
    suggestedDayTitle: '(keep current)',
    artist: 'Rembrandt van Rijn',
    year: 'c. 1661–1669',
    location: 'The Hermitage, St. Petersburg',
    note: 'Keep as is, real painting title',
  },
  'The Calling of Saint Matthew': {
    canonicalTitle: 'The Calling of Saint Matthew',
    suggestedDayTitle: '(keep current)',
    artist: 'Caravaggio',
    year: 'c. 1599–1600',
    location: 'Contarelli Chapel, San Luigi dei Francesi, Rome',
    note: 'Keep as is. Also linked from Light journey Day 2',
  },
  'Tower of Jesus Christ, Sagrada Família': {
    canonicalTitle: 'Tower of Jesus Christ, Sagrada Família',
    suggestedDayTitle: '(keep current)',
    artist: 'Antoni Gaudí (architect)',
    year: 'begun 2014, topped out 2026',
    location: 'Sagrada Família, Barcelona',
    note: 'Keep as is',
  },
}

type Row = {
  _id: string
  title: string
  ppDates: string[]
}

function studioUrl(id: string): string {
  return `https://seeking-beauty.sanity.studio/structure/contentItem;${id}`
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function main() {
  const rows = await c.fetch<Row[]>(
    `*[_type=="contentItem" && !(_id in path("drafts.**"))]{
      _id,
      title,
      "ppDates": *[_type=="dailyPrompt" && content._ref == ^._id]{date}.date
    }`,
  )

  const featured = rows.filter((r) => r.ppDates && r.ppDates.length > 0)

  type Combined = Row & Override & {section: 'B' | 'BNF' | 'C'}
  const combined: Combined[] = []
  for (const r of featured) {
    if (BUCKET_B[r.title]) combined.push({...r, ...BUCKET_B[r.title], section: 'B'})
    else if (BUCKET_B_NEAR_FINE[r.title]) combined.push({...r, ...BUCKET_B_NEAR_FINE[r.title], section: 'BNF'})
    else if (BUCKET_C[r.title]) combined.push({...r, ...BUCKET_C[r.title], section: 'C'})
  }

  combined.sort((a, b) => {
    const ad = a.ppDates[0] || ''
    const bd = b.ppDates[0] || ''
    return ad < bd ? -1 : 1
  })

  const bucketB = combined.filter((x) => x.section === 'B')
  const bucketBNF = combined.filter((x) => x.section === 'BNF')
  const bucketC = combined.filter((x) => x.section === 'C')

  const renderRow = (r: Combined) => `
        <tr>
          <td class="date">${esc(r.ppDates[0] || '')}</td>
          <td class="canonical"><strong>${esc(r.canonicalTitle)}</strong></td>
          <td class="daytitle">${esc(r.suggestedDayTitle)}</td>
          <td>${esc(r.artist)}</td>
          <td class="year">${esc(r.year)}</td>
          <td>${esc(r.location)}</td>
          <td class="current"><span class="strike">${esc(r.title)}</span></td>
          <td class="note">${esc(r.note || '')}</td>
          <td class="action"><a href="${studioUrl(r._id)}" target="_blank">Edit</a></td>
        </tr>`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Contueri, ContentItem Title Cleanup, June 22 2026</title>
<style>
  body { font-family: 'SF Pro Text', -apple-system, system-ui, sans-serif; background: #fdf6e9; color: #1a1410; line-height: 1.5; max-width: 1500px; margin: 0 auto; padding: 28px; }
  h1 { font-size: 1.6rem; font-weight: 600; margin: 0 0 6px; }
  h2 { font-size: 1.1rem; margin: 28px 0 10px; padding-bottom: 4px; border-bottom: 2px solid #d9cbb3; }
  p.meta { color: #6b4d2c; margin: 0 0 18px; font-size: 0.85rem; }
  p.intro { color: #4a3a2a; margin: 0 0 20px; font-size: 0.92rem; }
  table { border-collapse: collapse; width: 100%; font-size: 0.86rem; margin-bottom: 12px; }
  th, td { border: 1px solid #d9cbb3; padding: 8px 10px; vertical-align: top; text-align: left; }
  thead th { background: #16110d; color: #fdf6e9; font-weight: 600; position: sticky; top: 0; z-index: 1; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em; }
  tbody tr:nth-child(even) { background: rgba(193,155,95,0.05); }
  tbody tr:hover { background: rgba(193,155,95,0.12); }
  td.date { font-family: 'SF Mono', Menlo, monospace; font-size: 0.78rem; color: #6b4d2c; white-space: nowrap; }
  td.canonical { color: #1a1410; }
  td.canonical strong { color: #16110d; }
  td.year { font-family: 'SF Mono', Menlo, monospace; font-size: 0.78rem; color: #5a4636; white-space: nowrap; }
  td.current { color: #b8503f; }
  td.current .strike { text-decoration: line-through; opacity: 0.6; }
  td.note { color: #5a4636; font-size: 0.8rem; font-style: italic; }
  td.action a { display: inline-block; padding: 4px 10px; background: #C19B5F; color: #16110d; text-decoration: none; font-weight: 600; font-size: 0.78rem; letter-spacing: 0.02em; }
  td.action a:hover { background: #a87f3e; }
  col.col-date { width: 6%; }
  col.col-canonical { width: 15%; }
  col.col-daytitle { width: 13%; }
  col.col-artist { width: 12%; }
  col.col-year { width: 7%; }
  col.col-location { width: 13%; }
  col.col-current { width: 11%; }
  col.col-note { width: 18%; }
  col.col-action { width: 5%; }
  td.daytitle { color: #4a7a62; font-size: 0.85rem; }
  .section-summary { color: #5a4636; font-size: 0.85rem; margin-bottom: 8px; }
</style>
</head>
<body>

<h1>ContentItem.title Cleanup, June 22, 2026</h1>
<p class="meta">Reference table for correcting contentItem.title from editorial framings to canonical work / subject names. Per-item Edit links open Sanity Studio.</p>
<p class="intro">After the June 22 PromptClient swap, contentItem.title renders only in the small museum caption below the image (sacred-art + photography) and in Library / Explore cards. dailyPrompt.dayTitle carries the editorial framing as the big P&amp;P title. These corrections anchor the canonical attribution for each piece.</p>

<h2>Bucket B, clearly needs rewriting (${bucketB.length})</h2>
<p class="section-summary">Holy Week sequence + math-science colon-form titles + research items. Highest value to fix.</p>
<table>
  <colgroup>
    <col class="col-date"><col class="col-canonical"><col class="col-daytitle"><col class="col-artist"><col class="col-year"><col class="col-location"><col class="col-current"><col class="col-note"><col class="col-action">
  </colgroup>
  <thead>
    <tr><th>P&P Date</th><th>Canonical Title (contentItem.title)</th><th>Suggested dayTitle (dailyPrompt.dayTitle)</th><th>Artist / Creator</th><th>Year</th><th>Location</th><th>Currently in Sanity</th><th>Note</th><th></th></tr>
  </thead>
  <tbody>${bucketB.map(renderRow).join('')}
  </tbody>
</table>

<h2>Bucket B near-fine (${bucketBNF.length})</h2>
<p class="section-summary">Already correct or minor optional simplification only.</p>
<table>
  <colgroup>
    <col class="col-date"><col class="col-canonical"><col class="col-daytitle"><col class="col-artist"><col class="col-year"><col class="col-location"><col class="col-current"><col class="col-note"><col class="col-action">
  </colgroup>
  <thead>
    <tr><th>P&P Date</th><th>Canonical Title (contentItem.title)</th><th>Suggested dayTitle (dailyPrompt.dayTitle)</th><th>Artist / Creator</th><th>Year</th><th>Location</th><th>Currently in Sanity</th><th>Note</th><th></th></tr>
  </thead>
  <tbody>${bucketBNF.map(renderRow).join('')}
  </tbody>
</table>

<h2>Bucket C, descriptive labels (${bucketC.length})</h2>
<p class="section-summary">Likely fine, listed for completeness so you can verify the year / location data while you are at it.</p>
<table>
  <colgroup>
    <col class="col-date"><col class="col-canonical"><col class="col-daytitle"><col class="col-artist"><col class="col-year"><col class="col-location"><col class="col-current"><col class="col-note"><col class="col-action">
  </colgroup>
  <thead>
    <tr><th>P&P Date</th><th>Title in Sanity</th><th>dayTitle</th><th>Artist / Subject</th><th>Year</th><th>Location</th><th>(Same)</th><th>Recommendation</th><th></th></tr>
  </thead>
  <tbody>${bucketC.map(renderRow).join('')}
  </tbody>
</table>

</body>
</html>
`

  const outPath = resolve(
    process.env.HOME || '',
    'Documents',
    'CONTUERI-ContentItem-Title-Cleanup-2026-06-22.html',
  )
  writeFileSync(outPath, html, 'utf8')
  console.log(`Wrote ${outPath}`)
  console.log(`Bucket B (rewrite): ${bucketB.length}`)
  console.log(`Bucket B near-fine: ${bucketBNF.length}`)
  console.log(`Bucket C (review):  ${bucketC.length}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
