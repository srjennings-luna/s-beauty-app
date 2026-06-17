/**
 * Contueri — Dump every journey + journeyDay in production Sanity to JSON.
 *
 * Output: /tmp/journey-content-dump.json
 *
 * Structure: { journeys: [{ ...journeyFields, days: [{ ...dayFields, encounterContent: {...} }] }] }
 *
 * Used by the June 11, 2026 journey content audit to feed an editorial
 * AI-pattern audit without round-tripping through Sanity Studio.
 */

import {createClient} from '@sanity/client'
import {readFileSync, existsSync, writeFileSync} from 'fs'
import {resolve} from 'path'

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

async function main() {
  // All journeys, ordered by display order then title
  const journeys: any[] = await client.fetch(`
    *[_type == "journey" && !(_id in path("drafts.**"))] | order(order asc, title asc) {
      _id,
      title,
      slug,
      journeyType,
      description,
      isPublished,
      order,
      totalDays,
      "days": days[]->{
        _id,
        dayNumber,
        dayTitle,
        openText,
        encounterGuidance,
        encounterNote,
        lectio,
        reflectionQuestions,
        connectThread,
        "encounterContent": encounterContent->{
          _id,
          contentType,
          title,
          artworkHook,
          context,
          description,
          attribution,
          locationName
        }
      } | order(dayNumber asc)
    }
  `)

  const out = {
    generatedAt: '2026-06-11',
    journeyCount: journeys.length,
    totalDays: journeys.reduce((sum, j) => sum + (j.days?.length ?? 0), 0),
    journeys,
  }

  const outPath = '/tmp/journey-content-dump.json'
  writeFileSync(outPath, JSON.stringify(out, null, 2))

  console.log(`Wrote ${outPath}`)
  console.log(`Journeys: ${out.journeyCount}`)
  console.log(`Days: ${out.totalDays}`)
  for (const j of journeys) {
    console.log(`  - ${j.title} (${j.days?.length ?? 0} days, type=${j.journeyType || 'standard'}, published=${j.isPublished})`)
  }
}

main().catch((err) => {
  console.error('Dump failed:', err)
  process.exit(1)
})
