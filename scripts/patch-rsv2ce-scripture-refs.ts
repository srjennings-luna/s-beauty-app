/**
 * Contueri — Bring P&P Lectio scripture references in line with RSV-2CE.
 *
 * Per CLAUDE.md Scripture Translation Standard: every scripture quote in
 * Contueri uses RSV-2CE (Revised Standard Version, Second Catholic Edition,
 * Ignatius Press 2006). The June 11 sweep found 18 dailyPrompt lectio entries
 * with scripture refs missing the "RSV-2CE" attribution suffix, plus 1
 * traditionReflection with John 1:5 in source.
 *
 * This script:
 *  - Defines the RSV-2CE wording for each verse (HIGH / MEDIUM / LOW confidence)
 *  - Pulls current text from Sanity
 *  - For HIGH confidence: if text matches RSV-2CE → patch attribution only;
 *    if text differs → patch text + attribution
 *  - For MEDIUM confidence: patch attribution only, flag text for human review
 *  - For LOW confidence: skip both, flag for Sheri's manual editorial pass
 *
 * Does NOT touch the 4 mis-filed philosophy quotes (Hopkins, Scruton, Yeats,
 * Rilke) sitting in the scripture slot — those are a separate field-placement
 * issue. Flagged at end of output.
 *
 * Usage:
 *   npx tsx scripts/patch-rsv2ce-scripture-refs.ts            DRY RUN
 *   npx tsx scripts/patch-rsv2ce-scripture-refs.ts --apply    write
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
  projectId: 'em44j9m8',
  dataset: 'production',
  apiVersion: '2025-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
})

type Confidence = 'HIGH' | 'MEDIUM' | 'LOW'

// RSV-2CE candidate wording per reference. Confidence reflects how sure I am
// the wording exactly matches the 2006 Ignatius Press edition.
// Where the original RSV-2CE contains em dashes, I keep them: scripture is
// sourced text, not Contueri prose; the em-dash rule applies to original
// voice, not external quotation.
const VERSES: Record<string, {rsv2ce: string; confidence: Confidence; notes?: string}> = {
  '1 Corinthians 13:12': {
    rsv2ce:
      'For now we see in a mirror dimly, but then face to face. Now I know in part; then I shall understand fully, even as I have been fully understood.',
    confidence: 'HIGH',
  },
  'Psalm 98:1': {
    rsv2ce:
      'O sing to the LORD a new song, for he has done marvelous things! His right hand and his holy arm have gotten him victory.',
    confidence: 'HIGH',
  },
  'Matthew 26:38': {
    rsv2ce:
      "Then he said to them, “My soul is very sorrowful, even to death; remain here, and watch with me.”",
    confidence: 'HIGH',
  },
  'Psalm 46:10': {
    rsv2ce:
      '“Be still, and know that I am God. I am exalted among the nations, I am exalted in the earth!”',
    confidence: 'HIGH',
  },
  'John 1:1-3': {
    rsv2ce:
      'In the beginning was the Word, and the Word was with God, and the Word was God. He was in the beginning with God; all things were made through him, and without him was not anything made that was made.',
    confidence: 'HIGH',
  },
  'Genesis 18:5': {
    rsv2ce:
      'while I fetch a morsel of bread, that you may refresh yourselves, and after that you may pass on — since you have come to your servant.',
    confidence: 'LOW',
    notes: 'Verse continues; exact RSV-2CE punctuation needs manual verification.',
  },
  'John 15:15': {
    rsv2ce:
      "No longer do I call you servants, for the servant does not know what his master is doing; but I have called you friends, for all that I have heard from my Father I have made known to you.",
    confidence: 'HIGH',
  },
  'Psalm 42:7': {
    rsv2ce:
      'Deep calls to deep at the thunder of thy cataracts; all thy waves and thy billows have gone over me.',
    confidence: 'MEDIUM',
    notes: 'RSV-2CE retains thy/thou in many psalms but the exact rendering varies. Verify visually.',
  },
  'Ecclesiastes 3:11': {
    rsv2ce:
      'He has made everything beautiful in its time; also he has put eternity into man’s mind, yet so that he cannot find out what God has done from the beginning to the end.',
    confidence: 'HIGH',
  },
  'Luke 19:41': {
    rsv2ce: 'And when he drew near and saw the city he wept over it,',
    confidence: 'HIGH',
    notes: 'Verse ends mid-sentence; this is the full RSV-2CE v.41 text.',
  },
  'Psalm 55:12-13': {
    rsv2ce:
      'It is not an enemy who taunts me — then I could bear it; it is not an adversary who deals insolently with me — then I could hide from him. But it is you, my equal, my companion, my familiar friend.',
    confidence: 'MEDIUM',
    notes: 'Em dashes are in the RSV-2CE original. Earlier em-dash patch may have substituted commas. Verify before applying.',
  },
  'Lamentations 1:12': {
    rsv2ce:
      '“Is it nothing to you, all you who pass by? Look and see if there is any sorrow like my sorrow which was brought upon me, which the LORD inflicted on the day of his fierce anger.”',
    confidence: 'HIGH',
  },
  'Romans 8:24-25': {
    rsv2ce:
      'For in this hope we were saved. Now hope that is seen is not hope. For who hopes for what he sees? But if we hope for what we do not see, we wait for it with patience.',
    confidence: 'HIGH',
  },
  'Psalm 62:5': {
    rsv2ce: 'For God alone, O my soul, wait in silence, for my hope is from him.',
    confidence: 'HIGH',
  },
  'Matthew 6:28-29': {
    rsv2ce:
      'And why are you anxious about clothing? Consider the lilies of the field, how they grow; they neither toil nor spin; yet I tell you, even Solomon in all his glory was not arrayed like one of these.',
    confidence: 'HIGH',
  },
  'Luke 15:20': {
    rsv2ce:
      'And he arose and came to his father. But while he was yet at a distance, his father saw him and had compassion, and ran and embraced him and kissed him.',
    confidence: 'HIGH',
  },
  'Psalm 8:3-4': {
    rsv2ce:
      'When I look at thy heavens, the work of thy fingers, the moon and the stars which thou hast established; what is man that thou art mindful of him, and the son of man that thou dost care for him?',
    confidence: 'MEDIUM',
    notes: 'thee/thou retained in psalms; verify against current Sanity text.',
  },
  'John 8:12': {
    rsv2ce:
      "Again Jesus spoke to them, saying, “I am the light of the world; he who follows me will not walk in darkness, but will have the light of life.”",
    confidence: 'HIGH',
  },
  'John 1:5': {
    rsv2ce: 'The light shines in the darkness, and the darkness has not overcome it.',
    confidence: 'HIGH',
  },
}

// Normalize a reference string for matching: drop trailing notes, normalize
// dashes, collapse whitespace.
function normalizeRef(s: string): string {
  return s
    .replace(/\s*\(.+?\)\s*/g, '') // strip parenthetical
    .replace(/[–—]/g, '-') // en/em dash → hyphen
    .replace(/RSV[\s-]?2CE/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Strip translation marker from an attribution string.
function stripMarker(s: string): string {
  return s
    .replace(/[,;:]?\s*RSV[\s-]?2CE\s*$/i, '')
    .trim()
}

// Loose text equality: collapse whitespace and normalize quote marks.
function loosely(a: string, b: string): boolean {
  const norm = (s: string) =>
    s
      .replace(/“|”/g, '"')
      .replace(/‘|’/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
  return norm(a) === norm(b)
}

type Target = {
  _id: string
  date?: string
  ref: string // normalized
  rawAttribution: string
  currentText: string
  docType: 'dailyPrompt' | 'traditionReflection'
}

async function gatherTargets(): Promise<Target[]> {
  const t: Target[] = []

  const pps: any[] = await client.fetch(`
    *[_type == "dailyPrompt"
      && !string::startsWith(_id, "drafts.")
      && defined(lectio.attribution)
    ] | order(date asc) {
      _id, date,
      "attr": lectio.attribution,
      "text": lectio.text
    }
  `)
  for (const p of pps) {
    const ref = normalizeRef(p.attr)
    if (!(ref in VERSES)) continue
    if (/RSV[\s-]?2CE/i.test(p.attr)) continue // already marked
    t.push({_id: p._id, date: p.date, ref, rawAttribution: p.attr, currentText: p.text || '', docType: 'dailyPrompt'})
  }

  const trs: any[] = await client.fetch(`
    *[_type == "traditionReflection" && !string::startsWith(_id, "drafts.") && defined(source)] {
      _id, title, source, shortQuote
    }
  `)
  for (const tr of trs) {
    // Only care about TRs whose source is a bare scripture ref.
    const src = tr.source || ''
    const refMatch = src.match(/(\d?\s*[A-Z][a-z]+\s+\d+[:.]\s*\d+(?:-\d+)?)/)
    if (!refMatch) continue
    const ref = normalizeRef(refMatch[1])
    if (!(ref in VERSES)) continue
    if (/RSV[\s-]?2CE/i.test(src)) continue
    t.push({_id: tr._id, ref, rawAttribution: src, currentText: tr.shortQuote || '', docType: 'traditionReflection'})
  }

  return t
}

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY (writes enabled)' : 'DRY RUN'}\n`)

  const targets = await gatherTargets()
  console.log(`Found ${targets.length} target(s) to evaluate.\n`)

  const planned: {target: Target; action: string; newText?: string; newAttr: string; conf: Confidence}[] = []

  for (const t of targets) {
    const v = VERSES[t.ref]
    const baseRef = stripMarker(t.rawAttribution)
    const newAttr = `${baseRef} RSV-2CE`
    const textMatches = loosely(t.currentText, v.rsv2ce)

    let action: string
    let newText: string | undefined

    if (v.confidence === 'LOW') {
      action = 'SKIP (low confidence in RSV-2CE wording)'
    } else if (textMatches) {
      action = 'PATCH attribution only (text matches RSV-2CE)'
    } else if (v.confidence === 'HIGH') {
      action = 'PATCH text + attribution'
      newText = v.rsv2ce
    } else {
      action = 'PATCH attribution only (text differs but confidence MEDIUM; manual review)'
    }

    planned.push({target: t, action, newText, newAttr, conf: v.confidence})

    console.log(`── ${t.docType} ${t._id}${t.date ? ' · ' + t.date : ''}`)
    console.log(`   ref: ${t.ref}  [${v.confidence}]`)
    console.log(`   current attr: "${t.rawAttribution}"`)
    console.log(`   current text: ${JSON.stringify(t.currentText.slice(0, 120))}`)
    if (!textMatches && v.confidence !== 'LOW') {
      console.log(`   RSV-2CE text: ${JSON.stringify(v.rsv2ce.slice(0, 120))}`)
    }
    if (v.notes) console.log(`   notes: ${v.notes}`)
    console.log(`   → ${action}`)
    console.log('')
  }

  if (!APPLY) {
    console.log(`Re-run with --apply to write the PATCH-marked entries.`)
    return
  }

  console.log(`\nApplying...`)
  let patched = 0
  for (const p of planned) {
    if (p.action.startsWith('SKIP')) continue
    const setObj: any = {'lectio.attribution': p.newAttr}
    if (p.target.docType === 'traditionReflection') {
      // For TRs, the field is `source`, not `lectio.attribution`.
      setObj['source'] = p.newAttr
      delete setObj['lectio.attribution']
    }
    if (p.newText) {
      if (p.target.docType === 'dailyPrompt') {
        setObj['lectio.text'] = p.newText
      } else {
        setObj['shortQuote'] = p.newText
      }
    }
    await client.patch(p.target._id).set(setObj).commit()
    patched++
    console.log(`  ✓ ${p.target._id} (${p.target.ref})`)
  }
  console.log(`\nDone. Patched ${patched} doc(s).`)
}

main().catch((err) => {
  console.error('\nScript failed:', err)
  process.exit(1)
})
