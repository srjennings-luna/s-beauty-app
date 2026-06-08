/**
 * Contueri — Patch the 20 seeded P&P content items with the fields
 * Cowork's first JSON dropped or left blank: description, dayTitle,
 * location data, workTitle (literature), mediaType/Url (watch-listen).
 *
 * Sources the patches from:
 *   - ~/Documents/CONTUERI-PP-Seed-Data.json (newer Cowork JSON with ppTitle)
 *   - ~/Documents/CONTUERI-CC-DataGaps-Brief.html (location table)
 *   - inline DESCRIPTIONS map below (drafted from existing hook + context
 *     per the brief's guidance — Sheri reviews dry-run output before patch)
 *
 * Usage:
 *   npx tsx scripts/patch-pp-content.ts          → dry run
 *   npx tsx scripts/patch-pp-content.ts --patch  → apply patches
 *
 * Re-run safe: only patches existing pp-content-* docs. Leaves the
 * `day##` legacy items untouched.
 */

import { createClient } from '@sanity/client'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const PATCH_MODE = process.argv.includes('--patch')

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), '.env.local')
  if (!existsSync(envPath)) return
  for (const raw of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    let val = line.slice(eq + 1).trim()
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
    if (process.env[line.slice(0, eq).trim()] === undefined) process.env[line.slice(0, eq).trim()] = val
  }
}

loadEnvLocal()

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'em44j9m8',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-06-01',
  token: process.env.SANITY_TOKEN!,
  useCdn: false,
})

// ─── Description drafts (Sheri reviews these in dry-run before patch) ───────
// One per slug. Drafted from each item's existing artworkHook + context per
// the brief's guidance. 1-2 sentences. No em dashes per voice rules.

const DESCRIPTIONS: Record<string, string> = {
  'salas-sacred-heart-1874':
    "Ecuador consecrated itself to the Sacred Heart in front of this 1874 painting. America did the same in 2026.",
  'aquinas-beauty-c1225':
    "Three things Aquinas said make something beautiful. He stopped writing because what he was after couldn't be.",
  'veni-creator-spiritus-9th-century':
    "The hymn sung at every papal conclave for a thousand years. It is a request, not a statement.",
  'camargue-southern-france':
    "Wild horses walking salt marshes since the Pleistocene. The silence here has texture.",
  'dante-inferno-canto-i-1308':
    "The opening lines of Inferno. T. S. Eliot called them the greatest in any European poem.",
  'kepler-mysterium-cosmographicum-1596':
    "Kepler tried to prove the universe was nested Platonic solids. He was wrong but the wrong idea led him to the right one.",
  'westvleteren-abbey-benedictine-brewing':
    "Trappist monks brew the world's most sought-after beer and refuse to advertise it. The work itself is the prayer.",
  'tarkovsky-andrei-rublev-bell-1966':
    "Tarkovsky's film about Andrei Rublev, the medieval icon painter. The Bell sequence is among the slowest, most religious moments in cinema.",
  'van-der-weyden-st-luke-drawing-virgin-1435':
    "A fifteenth-century altarpiece in which Saint Luke paints the Virgin. The painter has painted himself.",
  'hildegard-von-bingen-viriditas-1098':
    "Hildegard called the divine life-force viriditas, the greening power. She saw it in every leaf for eighty years.",
  'mont-saint-michel-tidal-flood':
    "A monastery built on a rock that becomes an island at high tide. It has been catching the sea for a thousand years.",
  'el-greco-burial-count-orgaz-1586':
    "El Greco saw two worlds at once. The lower half is a Toledo funeral. The upper half is the soul rising.",
  'alhambra-islamic-tilework-1238':
    "The Alhambra's geometric tilework proves the seventeen wallpaper symmetry groups of the plane. The math is in the walls.",
  'thomas-more-1478':
    "Thomas More served the king and refused to break with the Church. He died with the words \"the king's good servant, but God's first.\"",
  'dostoevsky-grand-inquisitor-1880':
    "Dostoevsky's one-chapter story that Christ never quite gets to answer. A century and a half later, readers are still answering it.",
  'pontormo-supper-at-emmaus-c1525':
    "Two disciples eating with a stranger who turns out to be Christ. The moment of recognition is in the bread.",
  'umbrian-hills-at-dusk':
    "The hills where Francis of Assisi walked. Olive groves and silence.",
  'chartres-west-rose-window-c1215':
    "A thirteenth-century stained-glass wheel that turns the cosmos into geometry.",
  'dom-perignon-benedictine-cellar-1668':
    "A seventeenth-century Benedictine monk in charge of his abbey's cellar. He did not invent champagne but spent forty-seven years perfecting it.",
  'restout-pentecost-1732':
    "Restout's 1732 Pentecost. Fire fell on all the disciples at once and they spoke languages they did not know.",
}

// ─── Location data per slug (from Sheri's brief CONTUERI-CC-DataGaps) ───────

type Location = { locationName: string; city: string; country: string; lat: number | null; lng: number | null }

const LOCATIONS: Record<string, Location> = {
  'salas-sacred-heart-1874':              { locationName: 'Basilica of the National Vow', city: 'Quito', country: 'Ecuador', lat: -0.2201, lng: -78.5123 },
  'aquinas-beauty-c1225':                  { locationName: 'College of Saint-Jacques (where Aquinas taught)', city: 'Paris', country: 'France', lat: 48.8481, lng: 2.3522 },
  'veni-creator-spiritus-9th-century':     { locationName: 'Abbaye Saint-Pierre de Solesmes', city: 'Solesmes', country: 'France', lat: 47.8522, lng: -0.2958 },
  'camargue-southern-france':              { locationName: 'Camargue Nature Reserve', city: 'Arles', country: 'France', lat: 43.5252, lng: 4.5767 },
  'dante-inferno-canto-i-1308':            { locationName: 'Casa di Dante', city: 'Florence', country: 'Italy', lat: 43.7738, lng: 11.2565 },
  'kepler-mysterium-cosmographicum-1596':  { locationName: 'University of Tübingen (Kepler)', city: 'Tübingen', country: 'Germany', lat: 48.5216, lng: 9.0576 },
  'westvleteren-abbey-benedictine-brewing':{ locationName: 'Sint-Sixtus Abbey', city: 'Westvleteren', country: 'Belgium', lat: 50.9067, lng: 2.7226 },
  'tarkovsky-andrei-rublev-bell-1966':     { locationName: 'Spaso-Andronikov Monastery (Rublev\'s monastery)', city: 'Moscow', country: 'Russia', lat: 55.7517, lng: 37.6862 },
  'van-der-weyden-st-luke-drawing-virgin-1435': { locationName: 'Museum of Fine Arts', city: 'Boston', country: 'United States', lat: 42.3394, lng: -71.0940 },
  'hildegard-von-bingen-viriditas-1098':   { locationName: 'Abtei St. Hildegard', city: 'Rüdesheim am Rhein', country: 'Germany', lat: 49.9842, lng: 7.9306 },
  'mont-saint-michel-tidal-flood':         { locationName: 'Mont Saint-Michel', city: 'Mont Saint-Michel', country: 'France', lat: 48.6361, lng: -1.5115 },
  'el-greco-burial-count-orgaz-1586':      { locationName: 'Iglesia de Santo Tomé', city: 'Toledo', country: 'Spain', lat: 39.8571, lng: -4.0261 },
  'alhambra-islamic-tilework-1238':        { locationName: 'Alhambra', city: 'Granada', country: 'Spain', lat: 37.1760, lng: -3.5881 },
  'thomas-more-1478':                       { locationName: 'Tower of London', city: 'London', country: 'United Kingdom', lat: 51.5081, lng: -0.0759 },
  'dostoevsky-grand-inquisitor-1880':       { locationName: 'Dostoevsky Literary Museum', city: 'St. Petersburg', country: 'Russia', lat: 59.9311, lng: 30.3322 },
  'pontormo-supper-at-emmaus-c1525':        { locationName: 'Uffizi Gallery', city: 'Florence', country: 'Italy', lat: 43.7687, lng: 11.2554 },
  'umbrian-hills-at-dusk':                  { locationName: 'Umbria (region)', city: 'Perugia', country: 'Italy', lat: 43.1107, lng: 12.3908 },
  'chartres-west-rose-window-c1215':        { locationName: 'Chartres Cathedral', city: 'Chartres', country: 'France', lat: 48.4475, lng: 1.4878 },
  'dom-perignon-benedictine-cellar-1668':   { locationName: 'Abbey of Hautvillers', city: 'Hautvillers, Champagne', country: 'France', lat: 49.0833, lng: 3.9667 },
  'restout-pentecost-1732':                 { locationName: 'Musée du Louvre', city: 'Paris', country: 'France', lat: 48.8606, lng: 2.3376 },
}

// ─── dayTitle (Cowork's ppTitle) per slug from newer JSON ────────────────────

const DAY_TITLES: Record<string, string> = {
  'salas-sacred-heart-1874': 'God Does Not Die',
  'aquinas-beauty-c1225': 'Beauty Is a Fact',
  'veni-creator-spiritus-9th-century': 'Come, Creator',
  'camargue-southern-france': 'White Horses in the Salt Marsh',
  'dante-inferno-canto-i-1308': 'Halfway Through',
  'kepler-mysterium-cosmographicum-1596': 'Kepler Thought the Universe Was Music',
  'westvleteren-abbey-benedictine-brewing': 'The Work Is the Prayer',
  'tarkovsky-andrei-rublev-bell-1966': 'The Bell Rings for Someone',
  'van-der-weyden-st-luke-drawing-virgin-1435': 'He Painted Her from Memory',
  'hildegard-von-bingen-viriditas-1098': 'Everything Green Is Alive',
  'mont-saint-michel-tidal-flood': 'The Sea Has Been Rising for a Thousand Years',
  'el-greco-burial-count-orgaz-1586': 'Two Worlds, One Moment',
  'alhambra-islamic-tilework-1238': 'What the Pattern Knows',
  'thomas-more-1478': 'A Man Who Would Not Bend',
  'dostoevsky-grand-inquisitor-1880': 'The Question That Does Not Go Away',
  'pontormo-supper-at-emmaus-c1525': 'They Recognized Him When He Broke the Bread',
  'umbrian-hills-at-dusk': 'He Called It Sister',
  'chartres-west-rose-window-c1215': 'The Window Tells You What Time It Is',
  'dom-perignon-benedictine-cellar-1668': 'He Did Not Expect This',
  'restout-pentecost-1732': 'Fire Fell on Everyone Equally',
}

// ─── workTitle for literature contentType ───────────────────────────────────

const WORK_TITLES: Record<string, string> = {
  'dante-inferno-canto-i-1308': 'Inferno, Canto I',
  'dostoevsky-grand-inquisitor-1880': 'The Brothers Karamazov (The Grand Inquisitor chapter)',
}

// ─── mediaType/mediaUrl for watch-listen contentType ────────────────────────
// Day 9 needs a real video URL; flagged for Sheri to supply.

const MEDIA: Record<string, { mediaType: string; mediaUrl: string }> = {
  // Day 9 — Andrei Rublev (1966). Deeplinks to t=9960s (2h 46min) which is
  // where Episode 8 "The Bell" (Boriska bell-casting) begins in this YouTube
  // upload (confirmed by Sheri June 7, 2026).
  'tarkovsky-andrei-rublev-bell-1966': {
    mediaType: 'video',
    mediaUrl: 'https://youtu.be/je75FDjcUP4?t=9960',
  },
}

async function main() {
  console.log(`\nContueri · patch-pp-content`)
  console.log(`Mode: ${PATCH_MODE ? 'PATCH (writes)' : 'DRY RUN'}\n`)

  const slugs = Object.keys(DESCRIPTIONS)
  let patched = 0
  let skipped = 0
  let missingMedia: string[] = []

  for (const slug of slugs) {
    const id = `pp-content-${slug}`
    const set: Record<string, any> = {}

    if (DESCRIPTIONS[slug]) set.description = DESCRIPTIONS[slug]
    if (DAY_TITLES[slug]) {
      // dayTitle lives on the dailyPrompt, not the contentItem — we patch
      // both docs in the same pass below.
    }
    const loc = LOCATIONS[slug]
    if (loc) {
      set.locationName = loc.locationName
      set.city = loc.city
      set.country = loc.country
      if (loc.lat !== null && loc.lng !== null) {
        set.coordinates = { _type: 'geopoint', lat: loc.lat, lng: loc.lng }
      }
    }
    if (WORK_TITLES[slug]) set.workTitle = WORK_TITLES[slug]
    if (MEDIA[slug]) {
      set.mediaType = MEDIA[slug].mediaType
      set.mediaUrl = MEDIA[slug].mediaUrl
    }

    // Flag watch-listen items still missing media
    const existing = await client.fetch(`*[_id == $id][0]{contentType}`, { id })
    if (existing?.contentType === 'watch-listen' && !MEDIA[slug]) {
      missingMedia.push(slug)
    }

    console.log(`━━ ${slug} ━━`)
    console.log(`  contentItem fields: ${Object.keys(set).join(', ') || '(none)'}`)
    if (DAY_TITLES[slug]) {
      console.log(`  dailyPrompt.dayTitle: "${DAY_TITLES[slug]}"`)
    }

    if (PATCH_MODE) {
      if (Object.keys(set).length > 0) {
        await client.patch(id).set(set).commit()
        console.log(`  ✓ patched contentItem ${id}`)
      }
      if (DAY_TITLES[slug]) {
        const promptId = `pp-prompt-${slug}`
        await client.patch(promptId).set({ dayTitle: DAY_TITLES[slug] }).commit()
        console.log(`  ✓ patched dailyPrompt ${promptId} dayTitle`)
      }
      patched++
    } else {
      console.log(`  [dry] would patch`)
      patched++
    }
    console.log()
  }

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`Items patched: ${patched}`)
  if (missingMedia.length > 0) {
    console.log(`\n⚠ Watch-Listen still missing mediaType/mediaUrl:`)
    for (const s of missingMedia) console.log(`  - ${s}`)
    console.log(`  Add to MEDIA map in this script + re-run, or enter in Studio.`)
  }
  if (!PATCH_MODE) {
    console.log(`\nDry run — review the descriptions above. Re-run with --patch to apply.\n`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
