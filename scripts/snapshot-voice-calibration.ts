/**
 * Contueri voice-calibration snapshot.
 *
 * Pulls the two canonical voice exemplars from live Sanity (When Myth
 * Became Fact journey + "They Were Early" Justin Martyr P&P) and writes
 * them as a single readable HTML doc to:
 *
 *   content-docs/CONTUERI-Voice-Calibration.html
 *
 * Why this script exists. CLAUDE.md and the four foundational docs
 * abstract the voice in rules. The published exemplars carry the voice
 * itself. Both Claude Code and Cowork need to read them before drafting
 * content; querying live Sanity at every session start costs tokens, has
 * network risk, and (for Cowork) requires writing a query script each
 * session. The snapshot pattern: pull once, save to repo, point every
 * session at the snapshot.
 *
 * REFRESH TRIGGERS (re-run this script when any of these happen):
 *   - WMBF gets new days seeded (Days 5-7) or existing days edited
 *   - "They Were Early" gets edited
 *   - Either piece is superseded by a stronger voice exemplar
 *
 * Usage:
 *   npx tsx scripts/snapshot-voice-calibration.ts              fetch + print stats
 *   npx tsx scripts/snapshot-voice-calibration.ts --write      fetch + write HTML
 */

import {createClient} from '@sanity/client'
import {readFileSync, writeFileSync, existsSync} from 'fs'
import {resolve} from 'path'

const WRITE = process.argv.includes('--write')

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

type ContentItem = {
  title?: string
  artist?: string
  year?: string
  medium?: string
  artworkHook?: string
  context?: string
  description?: string
  locationName?: string
  city?: string
  country?: string
}

type Lectio = {
  philosophyQuote?: string
  philosophySource?: string
  scriptureVerse?: string
  scriptureReference?: string
  connectionNote?: string
  philosophyText?: string
  philosophyAttribution?: string
  text?: string
  attribution?: string
}

type Auditio = {
  title?: string
  composerArtist?: string
  workTitle?: string
  composer?: string
  artist?: string
  genre?: string
  mediaUrl?: string
  mediaType?: string
  verbaOriginal?: string
}

type GoDeeperRef = {
  title?: string
  shortQuote?: string
  summary?: string
  source?: string
  authorType?: string
  era?: string
}

type JourneyDay = {
  dayNumber?: number
  dayTitle?: string
  openText?: string
  encounterContent?: ContentItem
  encounterGuidance?: string
  encounterNote?: string
  auditio?: Auditio
  lectio?: Lectio
  reflectionQuestions?: string[]
  connectThread?: string
  goDeeper?: GoDeeperRef[]
}

type JourneyDoc = {
  title?: string
  description?: string
  totalDays?: number
  days?: JourneyDay[]
}

type DailyPromptDoc = {
  date?: string
  dayTitle?: string
  promptQuestion?: string
  curatorNote?: string
  content?: ContentItem
  lectio?: Lectio
  auditio?: Auditio
  actio?: string
}

function esc(s: string | undefined | null): string {
  if (s == null) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderContentItem(c: ContentItem | undefined): string {
  if (!c) return '<p class="empty">(no content item)</p>'
  const loc =
    c.locationName || c.city || c.country
      ? `<p><span class="label">Location:</span> ${esc([c.locationName, c.city, c.country].filter(Boolean).join(', '))}</p>`
      : ''
  return `
    <p><span class="label">Title:</span> ${esc(c.title)}</p>
    <p><span class="label">Artist:</span> ${esc(c.artist)}</p>
    ${c.year ? `<p><span class="label">Year:</span> ${esc(c.year)}</p>` : ''}
    ${c.medium ? `<p><span class="label">Medium:</span> ${esc(c.medium)}</p>` : ''}
    ${loc}
    ${c.artworkHook ? `<div class="block"><p class="label">Hook (Encounter, 1st text):</p><p>${esc(c.artworkHook)}</p></div>` : ''}
    ${c.context ? `<div class="block"><p class="label">Context:</p><p>${esc(c.context).replace(/\n+/g, '</p><p>')}</p></div>` : ''}
    ${c.description ? `<div class="block"><p class="label">Description:</p><p>${esc(c.description)}</p></div>` : ''}
  `
}

function renderLectio(l: Lectio | undefined, schemaShape: 'journey' | 'prompt'): string {
  if (!l) return '<p class="empty">(no lectio)</p>'
  if (schemaShape === 'journey') {
    return `
      ${l.philosophyQuote ? `<p><span class="label">Philosophy:</span> "${esc(l.philosophyQuote)}"</p>` : ''}
      ${l.philosophySource ? `<p class="src">, ${esc(l.philosophySource)}</p>` : ''}
      ${l.scriptureVerse ? `<p><span class="label">Scripture:</span> "${esc(l.scriptureVerse)}"</p>` : ''}
      ${l.scriptureReference ? `<p class="src">, ${esc(l.scriptureReference)}</p>` : ''}
      ${l.connectionNote ? `<div class="block"><p class="label">Connection note:</p><p>${esc(l.connectionNote)}</p></div>` : ''}
    `
  }
  return `
    ${l.philosophyText ? `<p><span class="label">Philosophy:</span> "${esc(l.philosophyText)}"</p>` : ''}
    ${l.philosophyAttribution ? `<p class="src">, ${esc(l.philosophyAttribution)}</p>` : ''}
    ${l.text ? `<p><span class="label">Scripture:</span> "${esc(l.text)}"</p>` : ''}
    ${l.attribution ? `<p class="src">, ${esc(l.attribution)}</p>` : ''}
  `
}

function renderAuditio(a: Auditio | undefined): string {
  if (!a) return '<p class="empty">(no auditio)</p>'
  const composer = a.composerArtist || a.composer || a.artist || ''
  const work = a.workTitle || a.title || ''
  return `
    ${work ? `<p><span class="label">Work:</span> ${esc(work)}</p>` : ''}
    ${composer ? `<p><span class="label">Composer/Artist:</span> ${esc(composer)}</p>` : ''}
    ${a.genre ? `<p><span class="label">Genre:</span> ${esc(a.genre)}</p>` : ''}
    ${a.verbaOriginal ? `<div class="block"><p class="label">Verba:</p><pre>${esc(a.verbaOriginal)}</pre></div>` : ''}
  `
}

function renderGoDeeper(arr: GoDeeperRef[] | undefined): string {
  if (!arr || arr.length === 0) return '<p class="empty">(no Go Deeper entries)</p>'
  return arr
    .map(
      (g) => `
    <div class="gd">
      <p><span class="label">${esc(g.title)}</span>${g.authorType || g.era ? ` <span class="meta">(${esc([g.authorType, g.era].filter(Boolean).join(', '))})</span>` : ''}</p>
      ${g.shortQuote ? `<p class="quote">"${esc(g.shortQuote)}"</p>` : ''}
      ${g.summary ? `<p>${esc(g.summary).replace(/\n+/g, '</p><p>')}</p>` : ''}
      ${g.source ? `<p class="src">Source: ${esc(g.source)}</p>` : ''}
    </div>
  `,
    )
    .join('\n')
}

async function main() {
  console.log(`Mode: ${WRITE ? 'WRITE (snapshot will be saved)' : 'FETCH + STATS (dry run)'}\n`)

  // --- Pull WMBF journey ---
  console.log('Pulling When Myth Became Fact journey...')
  const wmbf = await client.fetch<JourneyDoc | null>(
    `*[_type == "journey" && slug.current == "when-myth-became-fact" && !(_id in path("drafts.**"))][0]{
      title,
      description,
      totalDays,
      "days": days[]->{
        dayNumber,
        dayTitle,
        openText,
        "encounterContent": encounterContent->{
          title, artist, year, medium, artworkHook, context, description,
          "locationName": location.locationName, "city": location.city, "country": location.country
        },
        encounterGuidance,
        encounterNote,
        auditio,
        lectio,
        reflectionQuestions,
        connectThread,
        "goDeeper": goDeeper[]->{title, shortQuote, summary, source, authorType, era}
      } | order(dayNumber asc)
    }`,
  )
  if (!wmbf) {
    console.error('ERROR: When Myth Became Fact journey not found.')
    process.exit(2)
  }
  console.log(`  Found: "${wmbf.title}" with ${wmbf.days?.length || 0} days`)

  // --- Pull "They Were Early" P&P ---
  // The dailyPrompt's dayTitle is null on this older entry; the "They Were Early"
  // title lives on the referenced contentItem. Look it up via the content reference.
  console.log('\nPulling "They Were Early" Pause & Ponder (via contentItem title)...')
  const twe = await client.fetch<DailyPromptDoc | null>(
    `*[_type == "dailyPrompt" && content->title == "They Were Early" && !(_id in path("drafts.**"))][0]{
      date,
      dayTitle,
      promptQuestion,
      curatorNote,
      "content": content->{
        title, artist, year, medium, artworkHook, context, description,
        "locationName": location.locationName, "city": location.city, "country": location.country
      },
      lectio,
      auditio,
      actio
    }`,
  )
  if (!twe) {
    console.error('ERROR: "They Were Early" P&P not found.')
    process.exit(2)
  }
  console.log(`  Found: "${twe.dayTitle}" (date ${twe.date})`)

  // --- Stats ---
  console.log('\n--- Snapshot stats ---')
  console.log(`WMBF days fetched:           ${wmbf.days?.length || 0}`)
  console.log(`WMBF totalDays in Sanity:    ${wmbf.totalDays || '(unset)'}`)
  console.log(`They Were Early date:        ${twe.date}`)
  console.log(`They Were Early artworkHook: ${twe.content?.artworkHook ? twe.content.artworkHook.slice(0, 60) + '...' : '(empty)'}`)
  console.log(`They Were Early curatorNote: ${twe.curatorNote ? twe.curatorNote.slice(0, 60) + '...' : '(empty)'}`)

  if (!WRITE) {
    console.log('\nDry run complete. Re-run with --write to save the HTML snapshot.')
    return
  }

  // --- Compose HTML ---
  const snapshotDateUtc = new Date().toISOString().slice(0, 10)
  const wmbfDaysHtml =
    (wmbf.days || [])
      .map(
        (d) => `
  <details open class="day">
    <summary>Day ${d.dayNumber || '?'}, ${esc(d.dayTitle)}</summary>
    <div class="dayBody">
      ${d.openText ? `<div class="block"><p class="label">Open Text:</p><p>${esc(d.openText).replace(/\n+/g, '</p><p>')}</p></div>` : ''}
      <div class="block">
        <p class="label">Encounter Content (contentItem):</p>
        ${renderContentItem(d.encounterContent)}
      </div>
      ${d.encounterGuidance ? `<div class="block"><p class="label">Encounter Guidance:</p><p>${esc(d.encounterGuidance)}</p></div>` : ''}
      ${d.encounterNote ? `<div class="block"><p class="label">Encounter Note ("Look Closer"):</p><p>${esc(d.encounterNote).replace(/\n+/g, '</p><p>')}</p></div>` : ''}
      <div class="block">
        <p class="label">Auditio:</p>
        ${renderAuditio(d.auditio)}
      </div>
      <div class="block">
        <p class="label">Lectio:</p>
        ${renderLectio(d.lectio, 'journey')}
      </div>
      ${d.reflectionQuestions && d.reflectionQuestions.length > 0 ? `<div class="block"><p class="label">Reflection Questions:</p><ul>${d.reflectionQuestions.map((q) => `<li>${esc(q)}</li>`).join('')}</ul></div>` : ''}
      ${d.connectThread ? `<div class="block"><p class="label">Connect Thread:</p><p>${esc(d.connectThread).replace(/\n+/g, '</p><p>')}</p></div>` : ''}
      <div class="block">
        <p class="label">Go Deeper (Tradition Reflections):</p>
        ${renderGoDeeper(d.goDeeper)}
      </div>
    </div>
  </details>
  `,
      )
      .join('\n') || '<p class="empty">(no days)</p>'

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Contueri, Voice Calibration Snapshot</title>
<style>
  body { font-family: Georgia, "Iowan Old Style", serif; line-height: 1.55; max-width: 900px; margin: 0 auto; padding: 32px; color: #2a201a; background: #fdf6e9; }
  h1 { font-size: 1.7rem; border-bottom: 2px solid #c19b5f; padding-bottom: 8px; }
  h2 { font-size: 1.3rem; color: #5a4636; margin-top: 36px; border-bottom: 1px solid #d9cbb3; padding-bottom: 4px; }
  h3 { font-size: 1.05rem; margin-top: 22px; color: #6b4d2c; }
  details.day { border-left: 3px solid #c19b5f; padding-left: 16px; margin: 20px 0; background: #fbf7ef; padding: 12px 16px; border-radius: 0; }
  details.day summary { font-weight: 600; cursor: pointer; padding: 4px 0; font-size: 1.05rem; }
  .dayBody { padding-top: 12px; }
  .block { margin: 14px 0; }
  .label { font-variant: small-caps; letter-spacing: 0.04em; color: #c19b5f; font-weight: 600; font-size: 0.9rem; margin-bottom: 4px; }
  .src { color: #6b4d2c; font-size: 0.85rem; margin-top: -8px; font-style: italic; }
  .empty { color: #9a8b78; font-style: italic; }
  .quote { font-style: italic; color: #4a3a2a; padding-left: 16px; border-left: 1px solid #c19b5f; margin: 8px 0; }
  .gd { background: #f5edd9; padding: 10px 14px; margin: 8px 0; border-radius: 0; }
  .meta { color: #6b4d2c; font-size: 0.85rem; font-style: italic; }
  .header-meta { color: #6b4d2c; font-size: 0.9rem; margin-top: -8px; }
  .intro { background: #f0e4cb; padding: 14px 18px; margin: 18px 0; border-left: 3px solid #c19b5f; }
  pre { background: #f5edd9; padding: 10px; white-space: pre-wrap; word-wrap: break-word; font-family: Georgia, serif; }
</style>
</head>
<body>

<h1>Contueri, Voice Calibration Snapshot</h1>
<p class="header-meta"><strong>Snapshot date:</strong> ${snapshotDateUtc} &middot; <strong>Source:</strong> Sanity project <code>em44j9m8</code>, dataset <code>production</code>, perspective <code>published</code> &middot; <strong>Script:</strong> <code>scripts/snapshot-voice-calibration.ts</code></p>

<div class="intro">
<p><strong>What this is.</strong> The two canonical voice exemplars for Contueri content, pulled from live published Sanity at the snapshot date above. CLAUDE.md and the four foundational editorial docs ABSTRACT the voice in rules. This document CARRIES the voice itself. Any session drafting Contueri content reads this file before writing.</p>

<p><strong>Why a snapshot, not a live query.</strong> The calibration material is meant to be stable. Pulling it live on every session start costs tokens, has network risk, and (for Cowork) requires writing a query script each session. Snapshot once, point every session at the snapshot. Re-run the script when the underlying pieces change.</p>

<p><strong>Refresh triggers.</strong> Re-run <code>npx tsx scripts/snapshot-voice-calibration.ts --write</code> when any of the following happens:</p>
<ul>
  <li>When Myth Became Fact gets new days seeded (Days 5-7 currently pending), or existing days edited</li>
  <li>"They Were Early" gets edited</li>
  <li>Either piece is superseded by a stronger voice exemplar</li>
</ul>

<p><strong>Source of truth.</strong> The published content in Sanity. This file is a point-in-time copy for fast agent reading; if it conflicts with what is currently in Sanity, Sanity wins and this file is stale.</p>
</div>

<h2>Part A. When Myth Became Fact (the journey-form voice exemplar)</h2>
<p><strong>Title:</strong> ${esc(wmbf.title)}</p>
${wmbf.description ? `<p><strong>Description:</strong> ${esc(wmbf.description)}</p>` : ''}
<p><strong>Total days planned:</strong> ${wmbf.totalDays || '(unset)'} &middot; <strong>Days seeded:</strong> ${wmbf.days?.length || 0}</p>

${wmbfDaysHtml}

<h2>Part B. "They Were Early" (the P&P-form voice exemplar)</h2>
<p><strong>Date:</strong> ${esc(twe.date)} &middot; <strong>Day Title:</strong> ${esc(twe.dayTitle)}</p>

<div class="block">
  <p class="label">Content Item (the painting + hook):</p>
  ${renderContentItem(twe.content)}
</div>

${twe.curatorNote ? `<div class="block"><p class="label">Curator Note (P&P-specific hook):</p><p>${esc(twe.curatorNote).replace(/\n+/g, '</p><p>')}</p></div>` : ''}
${twe.promptQuestion ? `<div class="block"><p class="label">Prompt Question:</p><p>${esc(twe.promptQuestion)}</p></div>` : ''}
<div class="block">
  <p class="label">Lectio:</p>
  ${renderLectio(twe.lectio, 'prompt')}
</div>
<div class="block">
  <p class="label">Auditio:</p>
  ${renderAuditio(twe.auditio)}
</div>
${twe.actio ? `<div class="block"><p class="label">Actio:</p><p>${esc(twe.actio)}</p></div>` : ''}

<h2>How to read this file as a model</h2>
<p>Internalize the SHAPE of these pieces, not their specific facts:</p>
<ul>
  <li>The hook lands as one arresting fact, delivered flat, on a quiet turn. It does not announce itself.</li>
  <li>Context is a single converging story with names, dates, and specific moments. Never a glossary or a tour. Meaning rises out of the narrative; it is not stated.</li>
  <li>Reading a painting's hidden language is the CLIMAX of the story, not the setup.</li>
  <li>Precious-material-as-meaning lives inside narrative (spikenard at 300 denarii ~ year's wages), never as a price lecture.</li>
  <li>Closers do not summarize. The reader assembles the conclusion.</li>
  <li>No modern-consumer winks. No "in our world today" framing. No survey-and-compare structures.</li>
  <li>Open Sans for regular prose. Cormorant Garamond italic only for quoted material 1.3rem and above. (This affects how you imagine the rendering; the field text itself is plain.)</li>
</ul>

<p><em>If you read text saying "the artworkHook must be about the artwork itself" anywhere in the older content docs, that is superseded. The field carries the story hook, the surprising fact about the work or its subject. See the Hook Rule in CLAUDE.md for the current framing.</em></p>

</body>
</html>
`

  const outPath = resolve(process.cwd(), 'content-docs', 'CONTUERI-Voice-Calibration.html')
  writeFileSync(outPath, html, 'utf8')
  console.log(`\n  Wrote snapshot to ${outPath}`)
  console.log(`  Size: ${html.length} chars`)
  console.log('\nDone.')
}

main().catch((err) => {
  console.error('\nScript failed:', err)
  process.exit(1)
})
