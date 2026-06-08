/**
 * Contueri — Seed the 30-day Pause & Ponder launch arc from Cowork's handoff JSON.
 *
 * Reads /tmp/cowork-seed-resolved.json (the merged Cowork doc + my June 7 image
 * sourcing pass) and creates one contentItem + one dailyPrompt per day where
 * the image sourcing status is "sourced" or "ok_already" (20 of 30 days).
 *
 * Each Cowork record is SPLIT across two Sanity documents:
 *   - contentItem: the artwork / thinker / music piece / etc.
 *       title, image, contentType, themes, artworkHook, context,
 *       traditionalPrayer, plus content-type-specific fields
 *       (artist/thinkerName/author/composer)
 *   - dailyPrompt: the daily P&P wrapper that references the contentItem
 *       date, content ref, lectio (voices + scripture), actio
 *
 * Field mapping from Cowork → Sanity:
 *   slug                       → (deterministic _id for both docs)
 *   title                      → contentItem.title
 *   artistName/authorName/...  → contentItem.artist OR thinkerName OR author OR composer
 *                                (picked based on contentType)
 *   year                       → contentItem.year (string-coerced)
 *   medium                     → contentItem.medium
 *   contentType                → contentItem.contentType
 *   themes (slug array)        → contentItem.themes[] (resolved to refs via lookup)
 *   artworkHook                → contentItem.artworkHook
 *   context                    → contentItem.context
 *   traditionalPrayer          → contentItem.traditionalPrayer
 *   image.sourceUrl            → downloaded, uploaded as asset, ref on contentItem.image
 *   voicesQuote                → dailyPrompt.lectio.philosophyText
 *   voicesAttribution          → dailyPrompt.lectio.philosophyAttribution
 *   lectioVerse                → dailyPrompt.lectio.text
 *   lectioReference            → dailyPrompt.lectio.attribution
 *   actio                      → dailyPrompt.actio
 *   scheduledDate              → dailyPrompt.date
 *
 * NOT mapped this pass (Sheri adds in Studio later):
 *   - auditio for music days (requires audio upload first)
 *   - relatedJourney, theme refs on dailyPrompt
 *   - promptQuestion, curatorNote (no source in Cowork data)
 *   - traditionReflectionSlugs (TRs are a separate seed run)
 *
 * Usage:
 *   npx tsx scripts/seed-pp-content.ts              → DRY RUN (no writes)
 *   npx tsx scripts/seed-pp-content.ts --patch      → actually create
 *
 * Re-run safe: uses createOrReplace for contentItem + dailyPrompt with
 * deterministic _ids derived from slug. Re-running updates existing docs
 * rather than duplicating. Image assets get uploaded fresh each patch run
 * (Sanity dedupes by content hash so identical uploads return the existing
 * asset _id — no orphan asset spam).
 */

import {createClient} from '@sanity/client'
import {readFileSync, existsSync} from 'fs'
import {resolve} from 'path'

const PATCH_MODE = process.argv.includes('--patch')

// ─── Env loading (matches the pattern used by the other seed scripts) ────────

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

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'em44j9m8'
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

// ─── Theme slug → ref map ───────────────────────────────────────────────────

const COWORK_TO_SANITY_THEME: Record<string, string> = {
  light: 'light',
  silence: 'silence',
  home: 'home',
  creation: 'creation',
  // Cowork writes "suffering-beauty"; Sanity stores "suffering-and-beauty"
  'suffering-beauty': 'suffering-and-beauty',
}

// ─── Content-type creator field map ─────────────────────────────────────────
// Cowork's record has one of artistName / authorName / composerName /
// creatorName depending on type. ContentItem schema uses different field
// names depending on contentType.
function getCreatorField(contentType: string): string {
  switch (contentType) {
    case 'sacred-art':
    case 'photography':
    case 'pattern-proof':
      return 'artist'
    case 'thinker':
      return 'thinkerName'
    case 'literature':
      return 'author'
    case 'music':
      return 'composer'
    case 'landscape':
    case 'food-wine':
    case 'watch-listen':
      return 'artist' // generic fallback
    default:
      return 'artist'
  }
}

function getCreatorValue(item: any): string | null {
  return (
    item.artistName ||
    item.thinkerName ||
    item.authorName ||
    item.composerName ||
    item.creatorName ||
    null
  )
}

// ─── Image download + upload ────────────────────────────────────────────────

/**
 * Wikimedia serves /thumb/ URLs with a "800px-" prefix that the upload
 * endpoint rejects. Transform thumb URLs back to their original direct
 * file URLs before downloading.
 *
 * Thumb pattern:  /commons/thumb/a/bc/filename.jpg/800px-filename.jpg
 * Direct pattern: /commons/a/bc/filename.jpg
 */
function normalizeWikimediaUrl(url: string): string {
  if (!url.includes('upload.wikimedia.org')) return url
  if (!url.includes('/thumb/')) return url
  // Strip the /thumb/ segment and drop the final "/NNNpx-filename.jpg"
  // (which is everything after the last "/" — i.e., the rendered size).
  const stripped = url.replace('/thumb/', '/')
  const lastSlash = stripped.lastIndexOf('/')
  return stripped.slice(0, lastSlash)
}

const FETCH_HEADERS = {
  'User-Agent':
    'Contueri-Seeder/1.0 (Mozilla/5.0 compatible; Macintosh; mailto:hello@contueri.app)',
}

async function fetchImageOnce(url: string): Promise<Response> {
  return fetch(url, {headers: FETCH_HEADERS})
}

async function fetchImage(url: string): Promise<Buffer | null> {
  const target = normalizeWikimediaUrl(url)
  let attempt = 0
  const maxAttempts = 4
  while (attempt < maxAttempts) {
    attempt++
    try {
      const res = await fetchImageOnce(target)
      if (res.ok) {
        const arr = await res.arrayBuffer()
        return Buffer.from(arr)
      }
      if (res.status === 429 || res.status === 503) {
        // Rate-limited — back off then retry
        const delay = 2000 * attempt
        console.warn(`  ⚠ ${res.status} on attempt ${attempt}/${maxAttempts}; backing off ${delay}ms`)
        await new Promise((r) => setTimeout(r, delay))
        continue
      }
      console.warn(`  ✗ fetch failed ${res.status} for ${target}`)
      return null
    } catch (e) {
      console.warn(`  ✗ fetch error attempt ${attempt}: ${e}`)
      if (attempt >= maxAttempts) return null
      await new Promise((r) => setTimeout(r, 2000 * attempt))
    }
  }
  return null
}

async function uploadImageAsset(buffer: Buffer, filename: string) {
  const contentType = filename.toLowerCase().endsWith('.png')
    ? 'image/png'
    : 'image/jpeg'
  const asset = await client.assets.upload('image', buffer, {
    filename,
    contentType,
  })
  return asset._id
}

// ─── Theme refs lookup ──────────────────────────────────────────────────────

async function loadThemeRefs(): Promise<Record<string, string>> {
  const themes: Array<{_id: string; slug: string}> = await client.fetch(
    `*[_type == "theme"]{ _id, "slug": slug.current }`,
  )
  const map: Record<string, string> = {}
  for (const t of themes) {
    if (t.slug) map[t.slug] = t._id
  }
  return map
}

function resolveThemes(coworkThemes: string[], themeRefMap: Record<string, string>) {
  const refs: Array<{_type: 'reference'; _ref: string; _key: string}> = []
  for (const slug of coworkThemes || []) {
    const sanitySlug = COWORK_TO_SANITY_THEME[slug] || slug
    const ref = themeRefMap[sanitySlug]
    if (ref) {
      refs.push({
        _type: 'reference',
        _ref: ref,
        _key: `theme-${sanitySlug}`,
      })
    } else {
      console.warn(`    ⚠ unknown theme slug: ${slug} (mapped to ${sanitySlug})`)
    }
  }
  return refs
}

// ─── Build documents from a Cowork record ───────────────────────────────────

function buildContentItem(
  item: any,
  imageAssetId: string,
  themeRefs: ReturnType<typeof resolveThemes>,
) {
  const contentItemId = `pp-content-${item.slug}`
  const creatorField = getCreatorField(item.contentType)
  const creatorValue = getCreatorValue(item)

  const doc: any = {
    _id: contentItemId,
    _type: 'contentItem',
    title: item.title,
    contentType: item.contentType,
    themes: themeRefs,
    image: {
      _type: 'image',
      asset: {_type: 'reference', _ref: imageAssetId},
      alt: item.image?.altText || item.title,
    },
    artworkHook: item.artworkHook || undefined,
    context: item.context || undefined,
    year: item.year !== undefined && item.year !== null ? String(item.year) : undefined,
    medium: item.medium || undefined,
    traditionalPrayer: item.traditionalPrayer || undefined,
  }
  if (creatorValue) {
    doc[creatorField] = creatorValue
  }
  // Strip undefined values
  for (const k of Object.keys(doc)) {
    if (doc[k] === undefined) delete doc[k]
  }
  return doc
}

function buildDailyPrompt(item: any, contentItemId: string) {
  const dailyPromptId = `pp-prompt-${item.slug}`
  const lectio: any = {}
  if (item.voicesQuote) lectio.philosophyText = item.voicesQuote
  if (item.voicesAttribution) lectio.philosophyAttribution = item.voicesAttribution
  if (item.lectioVerse) lectio.text = item.lectioVerse
  if (item.lectioReference) lectio.attribution = item.lectioReference

  const doc: any = {
    _id: dailyPromptId,
    _type: 'dailyPrompt',
    date: item.scheduledDate,
    content: {_type: 'reference', _ref: contentItemId},
    lectio: Object.keys(lectio).length ? lectio : undefined,
    actio: item.actio || undefined,
  }
  for (const k of Object.keys(doc)) {
    if (doc[k] === undefined) delete doc[k]
  }
  return doc
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nContueri · seed-pp-content`)
  console.log(`Project: ${projectId}   Dataset: ${dataset}`)
  console.log(`Mode: ${PATCH_MODE ? 'PATCH (writes)' : 'DRY RUN'}\n`)

  const resolved = JSON.parse(readFileSync('/tmp/cowork-seed-resolved.json', 'utf8'))
  const items: any[] = resolved.contentItems || []

  // Filter to items that are ready (sourced OR original Cowork URL was good)
  const ready = items.filter((it) => {
    const status = it.image?._sourcingStatus
    return status === 'sourced' || status === 'ok_already'
  })
  const skipped = items.filter((it) => {
    const status = it.image?._sourcingStatus
    return status !== 'sourced' && status !== 'ok_already'
  })

  console.log(`Ready to seed: ${ready.length}`)
  console.log(`Skipped: ${skipped.length} (rights/needs-cowork/review)`)
  for (const it of skipped) {
    console.log(`  ✕ Day ${it.dayNumber} ${it.slug}: ${it.image._sourcingStatus}`)
  }
  console.log()

  const themeRefMap = await loadThemeRefs()
  console.log(`Loaded ${Object.keys(themeRefMap).length} themes from Sanity\n`)

  let successCount = 0
  let failCount = 0

  // Pause between items so we don't trip Wikimedia rate limits when
  // fetching ~20 images in sequence.
  const PER_ITEM_DELAY_MS = 1500

  for (const item of ready) {
    if (PATCH_MODE) {
      await new Promise((r) => setTimeout(r, PER_ITEM_DELAY_MS))
    }
    console.log(`━━ Day ${item.dayNumber}: ${item.slug} ━━`)
    const url = item.image?.sourceUrl
    if (!url) {
      console.warn(`  ✗ no sourceUrl — skipping`)
      failCount++
      continue
    }

    // Download + upload image
    let imageAssetId: string
    if (PATCH_MODE) {
      console.log(`  ↓ downloading ${url.slice(0, 90)}...`)
      const buf = await fetchImage(url)
      if (!buf) {
        failCount++
        continue
      }
      const ext = url.toLowerCase().includes('.png') ? '.png' : '.jpg'
      const filename = `${item.slug}${ext}`
      console.log(`  ↑ uploading ${filename} (${(buf.length / 1024).toFixed(0)} KB)`)
      try {
        imageAssetId = await uploadImageAsset(buf, filename)
        console.log(`  ✓ asset _id: ${imageAssetId}`)
      } catch (e) {
        console.error(`  ✗ upload failed: ${e}`)
        failCount++
        continue
      }
    } else {
      imageAssetId = `image-DRYRUN-${item.slug}`
      console.log(`  ↓ [dry] would download + upload ${url.slice(0, 70)}...`)
    }

    // Resolve theme refs
    const themeRefs = resolveThemes(item.themes || [], themeRefMap)

    // Build docs
    const contentItem = buildContentItem(item, imageAssetId, themeRefs)
    const dailyPrompt = buildDailyPrompt(item, contentItem._id)

    if (PATCH_MODE) {
      try {
        await client.createOrReplace(contentItem)
        console.log(`  ✓ contentItem ${contentItem._id}`)
        await client.createOrReplace(dailyPrompt)
        console.log(`  ✓ dailyPrompt ${dailyPrompt._id} (date: ${dailyPrompt.date})`)
        successCount++
      } catch (e) {
        console.error(`  ✗ Sanity write failed: ${e}`)
        failCount++
      }
    } else {
      console.log(`  [dry] would createOrReplace contentItem ${contentItem._id}`)
      console.log(`  [dry] would createOrReplace dailyPrompt ${dailyPrompt._id} (date: ${dailyPrompt.date})`)
      console.log(`  fields: title=${contentItem.title.slice(0, 50)}, themes=${themeRefs.length}, creator=${(contentItem as any).artist || (contentItem as any).thinkerName || (contentItem as any).author || (contentItem as any).composer || '(none)'}`)
      successCount++
    }
    console.log()
  }

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`Success: ${successCount}  Failed: ${failCount}  Skipped: ${skipped.length}`)
  if (!PATCH_MODE) {
    console.log(`\nDry run complete. Re-run with --patch to actually create documents.\n`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
