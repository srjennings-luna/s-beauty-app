/**
 * KALLOS — Backfill auditio.genre across journeyDay and dailyPrompt records
 *
 * Classifies genre using a composer lookup table + title heuristics.
 * Generates an HTML review report before touching any data.
 *
 * Usage:
 *   npx tsx scripts/backfill-auditio-genre.ts            → analyse + write review HTML
 *   npx tsx scripts/backfill-auditio-genre.ts --patch    → apply proposals to Sanity
 *
 * Workflow:
 *   1. Run without --patch. Open scripts/backups/genre-proposals.html.
 *   2. Check the REVIEW rows — fix any wrong proposals in genre-proposals.json.
 *   3. Run with --patch to write the approved genres to Sanity.
 *
 * Safety:
 *   - Only touches records that currently have no genre set.
 *   - Writes a backup of all auditio records before any patch.
 *   - --patch reads the proposals JSON, not the classifier — so your edits stick.
 */

import { createClient } from '@sanity/client';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const PATCH_MODE = process.argv.includes('--patch');

// ── Credentials ───────────────────────────────────────────────────────────────

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, 'utf8');
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnvLocal();

if (!process.env.SANITY_TOKEN) {
  console.error('ERROR: SANITY_TOKEN not set.');
  process.exit(1);
}

const client = createClient({
  projectId: 'em44j9m8',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
});

// ── Genre classification ───────────────────────────────────────────────────────

type GenreValue =
  | 'gregorian-chant'
  | 'sacred-polyphony'
  | 'classical-orchestral'
  | 'contemporary-sacred'
  | 'ambient-meditation'
  | 'folk'
  | 'world-music'
  | 'jazz'
  | 'secular';

type Confidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

// Composer name fragments → genre. Lowercase matching.
// Order matters: more specific entries first.
const COMPOSER_MAP: Array<{ fragments: string[]; genre: GenreValue }> = [
  // Gregorian chant — monophonic, usually anonymous or specific chant ensembles
  { fragments: ['gregorian', 'schola cantorum', 'monks of', 'benedictine', 'anonymous chant', 'choirmonks'], genre: 'gregorian-chant' },

  // Sacred polyphony — Renaissance / early Baroque choral
  { fragments: ['allegri', 'palestrina', 'victoria', 'byrd', 'tallis', 'lasso', 'di lasso', 'josquin', 'des prez', 'gesualdo', 'morales', 'guerrero', 'lobo', 'cardoso', 'ockeghem', 'dufay', 'binchois', 'dunstaple', 'compère', 'obrecht', 'gombert', 'willaert', 'lassus', 'marenzio', 'weelkes', 'gibbons', 'tomkins', 'victoria'], genre: 'sacred-polyphony' },
  // Monteverdi is tricky — sacred AND madrigals. Default to sacred-polyphony for KALLOS context.
  { fragments: ['monteverdi'], genre: 'sacred-polyphony' },

  // Contemporary sacred — 20th/21st century tonal/spiritual
  { fragments: ['pärt', 'part', 'arvo'], genre: 'contemporary-sacred' },
  { fragments: ['tavener', 'taverner john'], genre: 'contemporary-sacred' },
  { fragments: ['górecki', 'gorecki'], genre: 'contemporary-sacred' },
  { fragments: ['james macmillan', 'macmillan'], genre: 'contemporary-sacred' },
  { fragments: ['paul mealor', 'mealor'], genre: 'contemporary-sacred' },
  { fragments: ['ola gjeilo', 'gjeilo'], genre: 'contemporary-sacred' },
  { fragments: ['eric whitacre', 'whitacre'], genre: 'contemporary-sacred' },
  { fragments: ['john rutter', 'rutter'], genre: 'contemporary-sacred' },
  { fragments: ['taizé', 'taize'], genre: 'contemporary-sacred' },
  { fragments: ['hildegard', 'hildegard von bingen'], genre: 'contemporary-sacred' },
  { fragments: ['schnittke'], genre: 'contemporary-sacred' },
  { fragments: ['gubaidulina'], genre: 'contemporary-sacred' },

  // Ambient / meditation
  { fragments: ['brian eno', 'eno'], genre: 'ambient-meditation' },
  { fragments: ['max richter', 'richter'], genre: 'ambient-meditation' },
  { fragments: ['ólafur arnalds', 'olafur arnalds', 'arnalds'], genre: 'ambient-meditation' },
  { fragments: ['nils frahm', 'frahm'], genre: 'ambient-meditation' },
  { fragments: ['harold budd', 'budd'], genre: 'ambient-meditation' },
  { fragments: ['peter broderick', 'broderick'], genre: 'ambient-meditation' },
  { fragments: ['william basinski', 'basinski'], genre: 'ambient-meditation' },

  // Classical / orchestral — Baroque through late Romantic
  { fragments: ['bach', 'j.s. bach', 'j. s. bach', 'johann sebastian'], genre: 'classical-orchestral' },
  { fragments: ['handel', 'georg friedrich'], genre: 'classical-orchestral' },
  { fragments: ['vivaldi', 'antonio vivaldi'], genre: 'classical-orchestral' },
  { fragments: ['mozart', 'wolfgang amadeus'], genre: 'classical-orchestral' },
  { fragments: ['beethoven', 'ludwig van'], genre: 'classical-orchestral' },
  { fragments: ['haydn', 'joseph haydn'], genre: 'classical-orchestral' },
  { fragments: ['schubert', 'franz schubert'], genre: 'classical-orchestral' },
  { fragments: ['brahms', 'johannes brahms'], genre: 'classical-orchestral' },
  { fragments: ['chopin', 'frédéric chopin'], genre: 'classical-orchestral' },
  { fragments: ['liszt', 'franz liszt'], genre: 'classical-orchestral' },
  { fragments: ['debussy', 'claude debussy'], genre: 'classical-orchestral' },
  { fragments: ['ravel', 'maurice ravel'], genre: 'classical-orchestral' },
  { fragments: ['mendelssohn', 'felix mendelssohn'], genre: 'classical-orchestral' },
  { fragments: ['schumann', 'robert schumann'], genre: 'classical-orchestral' },
  { fragments: ['dvořák', 'dvorak', 'antonín dvořák'], genre: 'classical-orchestral' },
  { fragments: ['tchaikovsky', 'pyotr'], genre: 'classical-orchestral' },
  { fragments: ['mahler', 'gustav mahler'], genre: 'classical-orchestral' },
  { fragments: ['bruckner', 'anton bruckner'], genre: 'classical-orchestral' },
  { fragments: ['wagner', 'richard wagner'], genre: 'classical-orchestral' },
  { fragments: ['fauré', 'faure', 'gabriel fauré'], genre: 'classical-orchestral' },
  { fragments: ['saint-saëns', 'saint-saens', 'camille saint'], genre: 'classical-orchestral' },
  { fragments: ['franck', 'césar franck'], genre: 'classical-orchestral' },
  { fragments: ['verdi', 'giuseppe verdi'], genre: 'classical-orchestral' },
  { fragments: ['puccini', 'giacomo puccini'], genre: 'classical-orchestral' },
  { fragments: ['elgar', 'edward elgar'], genre: 'classical-orchestral' },
  { fragments: ['holst', 'gustav holst'], genre: 'classical-orchestral' },
  { fragments: ['vaughan williams', 'ralph vaughan'], genre: 'classical-orchestral' },
  { fragments: ['sibelius', 'jean sibelius'], genre: 'classical-orchestral' },
  { fragments: ['rachmaninoff', 'rachmaninov', 'sergei rach'], genre: 'classical-orchestral' },
  { fragments: ['stravinsky', 'igor stravinsky'], genre: 'classical-orchestral' },
  { fragments: ['prokofiev', 'sergei prokofiev'], genre: 'classical-orchestral' },
  { fragments: ['shostakovich', 'dmitri shostakovich'], genre: 'classical-orchestral' },
  { fragments: ['reger', 'max reger'], genre: 'classical-orchestral' },
  { fragments: ['buxtehude', 'dieterich buxtehude'], genre: 'classical-orchestral' },
  { fragments: ['pachelbel', 'johann pachelbel'], genre: 'classical-orchestral' },
  { fragments: ['purcell', 'henry purcell'], genre: 'classical-orchestral' },
  { fragments: ['corelli', 'arcangelo corelli'], genre: 'classical-orchestral' },
  { fragments: ['albinoni', 'tomaso albinoni'], genre: 'classical-orchestral' },
  { fragments: ['telemann', 'georg philipp'], genre: 'classical-orchestral' },
  { fragments: ['couperin', 'français couperin'], genre: 'classical-orchestral' },
  { fragments: ['rameau', 'jean-philippe rameau'], genre: 'classical-orchestral' },
  { fragments: ['scarlatti', 'domenico scarlatti', 'alessandro scarlatti'], genre: 'classical-orchestral' },

  // Jazz
  { fragments: ['coltrane', 'john coltrane'], genre: 'jazz' },
  { fragments: ['miles davis', 'davis'], genre: 'jazz' },
  { fragments: ['bill evans', 'evans'], genre: 'jazz' },
  { fragments: ['monk', 'thelonious'], genre: 'jazz' },
  { fragments: ['ellington', 'duke ellington'], genre: 'jazz' },
  { fragments: ['parker', 'charlie parker'], genre: 'jazz' },
  { fragments: ['mingus', 'charles mingus'], genre: 'jazz' },
  { fragments: ['brubeck', 'dave brubeck'], genre: 'jazz' },
];

// Title / work heuristics — used only when composer lookup fails
const TITLE_RULES: Array<{ patterns: RegExp[]; genre: GenreValue; note: string }> = [
  {
    patterns: [/\b(kyrie|gloria|credo|sanctus|agnus dei|benedictu)\b/i],
    genre: 'sacred-polyphony',
    note: 'Mass ordinary movement',
  },
  {
    patterns: [/\bmissa\b/i],
    genre: 'sacred-polyphony',
    note: 'Mass setting',
  },
  {
    patterns: [/\brequiem\b/i],
    genre: 'classical-orchestral',
    note: 'Requiem — may be polyphony or orchestral depending on period',
  },
  {
    patterns: [/\b(magnificat|te deum|vespers|compline|lauds)\b/i],
    genre: 'sacred-polyphony',
    note: 'Liturgical office',
  },
  {
    patterns: [/\b(antiphon|responsory|introit|gradual|offertory|communion)\b/i],
    genre: 'gregorian-chant',
    note: 'Liturgical chant form',
  },
  {
    patterns: [/\b(motet|madrigal)\b/i],
    genre: 'sacred-polyphony',
    note: 'Motet or madrigal form',
  },
  {
    patterns: [/\b(cantata|oratorio|passion|chorale)\b/i],
    genre: 'classical-orchestral',
    note: 'Baroque/Classical large form',
  },
  {
    patterns: [/\b(symphony|concerto|sonata|suite|fugue|prelude|nocturne|étude|waltz)\b/i],
    genre: 'classical-orchestral',
    note: 'Instrumental form',
  },
];

function classifyGenre(
  composerArtist: string | null | undefined,
  title: string | null | undefined,
  workTitle: string | null | undefined,
): { genre: GenreValue | null; confidence: Confidence; note: string } {
  const haystack = [composerArtist, title, workTitle]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const composerHaystack = (composerArtist ?? '').toLowerCase();

  // 1. Composer lookup — HIGH confidence
  for (const { fragments, genre } of COMPOSER_MAP) {
    for (const frag of fragments) {
      if (composerHaystack.includes(frag)) {
        return { genre, confidence: 'HIGH', note: `Composer match: "${frag}"` };
      }
    }
  }

  // 2. Composer lookup against full haystack (catches composer in title field) — MEDIUM
  for (const { fragments, genre } of COMPOSER_MAP) {
    for (const frag of fragments) {
      if (haystack.includes(frag)) {
        return { genre, confidence: 'MEDIUM', note: `Title/work match for "${frag}"` };
      }
    }
  }

  // 3. Title heuristics — MEDIUM
  const titleHaystack = [title, workTitle].filter(Boolean).join(' ');
  for (const { patterns, genre, note } of TITLE_RULES) {
    if (patterns.some((p) => p.test(titleHaystack))) {
      return { genre, confidence: 'MEDIUM', note };
    }
  }

  return { genre: null, confidence: 'UNKNOWN', note: 'No match — needs manual entry' };
}

// ── Sanity query ───────────────────────────────────────────────────────────────

interface AuditioRecord {
  _id: string;
  _type: 'journeyDay' | 'dailyPrompt';
  label: string;          // human-readable identifier for the report
  auditioTitle: string | null;
  composerArtist: string | null;
  workTitle: string | null;
  currentGenre: string | null;
  // For patching — the exact path differs between document types
  genrePath: string;
}

async function fetchAllAuditio(): Promise<AuditioRecord[]> {
  const [jdRows, dpRows] = await Promise.all([
    client.fetch<AuditioRecord[]>(`
      *[_type == "journeyDay" && defined(auditio)]{
        _id,
        "_type": "journeyDay",
        "label": "Journey Day – " + journey->title + " / Day " + string(dayNumber) + ": " + dayTitle,
        "auditioTitle": auditio.title,
        "composerArtist": coalesce(auditio.composerArtist, auditio.composer),
        "workTitle": auditio.workTitle,
        "currentGenre": auditio.genre,
        "genrePath": "auditio.genre"
      }
    `),
    client.fetch<AuditioRecord[]>(`
      *[_type == "dailyPrompt" && defined(auditio)]{
        _id,
        "_type": "dailyPrompt",
        "label": "Pause & Ponder – " + date,
        "auditioTitle": auditio.title,
        "composerArtist": coalesce(auditio.composerArtist, auditio.artist),
        "workTitle": auditio.workTitle,
        "currentGenre": auditio.genre,
        "genrePath": "auditio.genre"
      }
    `),
  ]);

  return [...jdRows, ...dpRows];
}

// ── Types for proposals file ───────────────────────────────────────────────────

interface Proposal {
  _id: string;
  _type: string;
  label: string;
  auditioTitle: string | null;
  composerArtist: string | null;
  workTitle: string | null;
  proposedGenre: GenreValue;
  confidence: Confidence;
  note: string;
  approved: boolean;  // edit to false to skip a record in --patch mode
}

// ── HTML report generator ──────────────────────────────────────────────────────

const GENRE_LABELS: Record<string, string> = {
  'gregorian-chant':     'Gregorian Chant',
  'sacred-polyphony':    'Sacred Polyphony',
  'classical-orchestral':'Classical / Orchestral',
  'contemporary-sacred': 'Contemporary Sacred',
  'ambient-meditation':  'Ambient / Meditation',
  'folk':                'Folk',
  'world-music':         'World Music',
  'jazz':                'Jazz',
  'secular':             'Secular',
};

const CONFIDENCE_COLOR: Record<Confidence, string> = {
  HIGH:    '#2d6a2d',
  MEDIUM:  '#7a6200',
  LOW:     '#a84200',
  UNKNOWN: '#8b0000',
};

function buildHtml(
  proposals: Proposal[],
  alreadyTagged: AuditioRecord[],
  unclassified: AuditioRecord[],
): string {
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const genreCount: Record<string, number> = {};
  for (const p of proposals) genreCount[p.proposedGenre] = (genreCount[p.proposedGenre] ?? 0) + 1;
  for (const r of alreadyTagged) if (r.currentGenre) genreCount[r.currentGenre] = (genreCount[r.currentGenre] ?? 0) + 1;

  const sortedGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]);

  function proposalRow(p: Proposal) {
    const cc = CONFIDENCE_COLOR[p.confidence];
    return `
      <tr>
        <td>${p.label}</td>
        <td>${p.auditioTitle ?? '—'}</td>
        <td>${p.composerArtist ?? '—'}</td>
        <td><span style="background:${cc};color:#fff;padding:2px 8px;border-radius:4px;font-size:12px;">${p.confidence}</span></td>
        <td>${GENRE_LABELS[p.proposedGenre] ?? p.proposedGenre}</td>
        <td style="color:#666;font-size:12px;">${p.note}</td>
      </tr>`;
  }

  function unclassifiedRow(r: AuditioRecord) {
    return `
      <tr style="background:#fff8f8;">
        <td>${r.label}</td>
        <td>${r.auditioTitle ?? '—'}</td>
        <td>${r.composerArtist ?? '—'}</td>
        <td colspan="3" style="color:#8b0000;font-size:12px;">⚠ Could not classify — add genre manually in Sanity</td>
      </tr>`;
  }

  function alreadyTaggedRow(r: AuditioRecord) {
    return `
      <tr style="background:#f6f9f6;color:#555;">
        <td>${r.label}</td>
        <td>${r.auditioTitle ?? '—'}</td>
        <td>${r.composerArtist ?? '—'}</td>
        <td><span style="background:#bbb;color:#fff;padding:2px 8px;border-radius:4px;font-size:12px;">SET</span></td>
        <td>${GENRE_LABELS[r.currentGenre ?? ''] ?? r.currentGenre ?? '—'}</td>
        <td style="color:#999;font-size:12px;">Already tagged</td>
      </tr>`;
  }

  const highRows = proposals.filter(p => p.confidence === 'HIGH').map(proposalRow).join('');
  const mediumRows = proposals.filter(p => p.confidence === 'MEDIUM').map(proposalRow).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>KALLOS — Auditio Genre Proposals</title>
<style>
  body { font-family: Georgia, serif; margin: 0; padding: 32px 48px; background: #fafaf8; color: #1a1a1a; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .meta { font-size: 13px; color: #888; margin-bottom: 32px; }
  h2 { font-size: 16px; font-weight: normal; letter-spacing: 0.04em; text-transform: uppercase; color: #555; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin: 32px 0 12px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px; }
  th { text-align: left; padding: 8px 10px; background: #f0ede8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; }
  td { padding: 8px 10px; border-bottom: 1px solid #eee; vertical-align: top; }
  tr:hover td { background: #f5f2ee; }
  .summary { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 32px; }
  .stat { background: #fff; border: 1px solid #ddd; border-radius: 6px; padding: 12px 20px; text-align: center; }
  .stat-n { font-size: 28px; font-weight: bold; }
  .stat-l { font-size: 12px; color: #888; }
  .genre-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 13px; }
  .bar { height: 14px; background: #8b6f47; border-radius: 3px; min-width: 4px; }
  .instructions { background: #fffbe6; border: 1px solid #e6d800; border-radius: 6px; padding: 16px 20px; font-size: 13px; margin-bottom: 32px; line-height: 1.7; }
  code { background: #f0ede8; padding: 2px 6px; border-radius: 3px; font-size: 12px; }
</style>
</head>
<body>
<h1>KALLOS — Auditio Genre Proposals</h1>
<div class="meta">Generated ${now} · ${proposals.length} records to backfill · ${alreadyTagged.length} already tagged · ${unclassified.length} unclassified</div>

<div class="instructions">
  <strong>Review, then patch:</strong><br>
  1. Check the proposals below, especially the <span style="background:#7a6200;color:#fff;padding:1px 6px;border-radius:3px;font-size:11px;">MEDIUM</span> rows — those are title/work heuristics, not composer lookups.<br>
  2. If any proposal is wrong, open <code>scripts/backups/genre-proposals.json</code> and change <code>proposedGenre</code> or set <code>"approved": false</code> to skip it.<br>
  3. Run <code>npx tsx scripts/backfill-auditio-genre.ts --patch</code> to write the approved genres to Sanity.<br>
  4. Manually enter genres for any ⚠ unclassified rows below.
</div>

<div class="summary">
  <div class="stat"><div class="stat-n">${proposals.length}</div><div class="stat-l">To backfill</div></div>
  <div class="stat"><div class="stat-n">${proposals.filter(p => p.confidence === 'HIGH').length}</div><div class="stat-l">High confidence</div></div>
  <div class="stat"><div class="stat-n">${proposals.filter(p => p.confidence === 'MEDIUM').length}</div><div class="stat-l">Medium confidence</div></div>
  <div class="stat"><div class="stat-n">${unclassified.length}</div><div class="stat-l">Unclassified</div></div>
  <div class="stat"><div class="stat-n">${alreadyTagged.length}</div><div class="stat-l">Already tagged</div></div>
</div>

<h2>Genre distribution (after backfill)</h2>
${sortedGenres.map(([g, n]) => {
  const maxN = sortedGenres[0][1];
  const w = Math.round((n / maxN) * 200);
  return `<div class="genre-bar"><div class="bar" style="width:${w}px;"></div><strong>${GENRE_LABELS[g] ?? g}</strong> — ${n}</div>`;
}).join('')}

${highRows ? `
<h2>✅ High confidence proposals (${proposals.filter(p => p.confidence === 'HIGH').length} records)</h2>
<table>
  <thead><tr><th>Record</th><th>Auditio Title</th><th>Composer / Artist</th><th>Confidence</th><th>Proposed Genre</th><th>Basis</th></tr></thead>
  <tbody>${highRows}</tbody>
</table>` : ''}

${mediumRows ? `
<h2>⚠ Medium confidence proposals — please verify (${proposals.filter(p => p.confidence === 'MEDIUM').length} records)</h2>
<table>
  <thead><tr><th>Record</th><th>Auditio Title</th><th>Composer / Artist</th><th>Confidence</th><th>Proposed Genre</th><th>Basis</th></tr></thead>
  <tbody>${mediumRows}</tbody>
</table>` : ''}

${unclassified.length > 0 ? `
<h2>❌ Unclassified — needs manual Sanity entry (${unclassified.length} records)</h2>
<table>
  <thead><tr><th>Record</th><th>Auditio Title</th><th>Composer / Artist</th><th colspan="3">Status</th></tr></thead>
  <tbody>${unclassified.map(unclassifiedRow).join('')}</tbody>
</table>` : ''}

${alreadyTagged.length > 0 ? `
<h2>Already tagged (${alreadyTagged.length} records)</h2>
<table>
  <thead><tr><th>Record</th><th>Auditio Title</th><th>Composer / Artist</th><th>Confidence</th><th>Current Genre</th><th>Note</th></tr></thead>
  <tbody>${alreadyTagged.map(alreadyTaggedRow).join('')}</tbody>
</table>` : ''}

</body>
</html>`;
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  const mode = PATCH_MODE ? 'PATCH' : 'ANALYSE';
  console.log(`\n=== KALLOS Auditio Genre Backfill — ${mode} ===\n`);

  const backupDir = resolve(process.cwd(), 'scripts/backups');
  if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true });

  if (PATCH_MODE) {
    // ── Patch mode: read proposals JSON and write to Sanity ─────────────────
    const proposalsPath = resolve(backupDir, 'genre-proposals.json');
    if (!existsSync(proposalsPath)) {
      console.error('ERROR: No proposals file found. Run without --patch first.');
      process.exit(1);
    }
    const proposals: Proposal[] = JSON.parse(readFileSync(proposalsPath, 'utf8'));
    const toApply = proposals.filter(p => p.approved !== false);

    console.log(`Applying ${toApply.length} of ${proposals.length} proposals (${proposals.length - toApply.length} skipped)...\n`);

    let patched = 0;
    let failed = 0;
    for (const p of toApply) {
      try {
        await client.patch(p._id).set({ 'auditio.genre': p.proposedGenre }).commit();
        console.log(`  ✓ ${p.label} → ${p.proposedGenre}`);
        patched++;
      } catch (err) {
        console.error(`  ✗ ${p.label}: ${err}`);
        failed++;
      }
    }

    console.log(`\nDone. Patched: ${patched}  Failed: ${failed}`);
    return;
  }

  // ── Analyse mode: classify and write report ────────────────────────────────
  console.log('Fetching all auditio records from Sanity...');
  const all = await fetchAllAuditio();
  console.log(`Found ${all.length} records with auditio data.\n`);

  const alreadyTagged = all.filter(r => r.currentGenre);
  const untagged = all.filter(r => !r.currentGenre);

  const proposals: Proposal[] = [];
  const unclassified: AuditioRecord[] = [];

  for (const r of untagged) {
    const { genre, confidence, note } = classifyGenre(r.composerArtist, r.auditioTitle, r.workTitle);
    if (genre) {
      proposals.push({
        _id: r._id,
        _type: r._type,
        label: r.label,
        auditioTitle: r.auditioTitle,
        composerArtist: r.composerArtist,
        workTitle: r.workTitle,
        proposedGenre: genre,
        confidence,
        note,
        approved: true,
      });
    } else {
      unclassified.push(r);
    }
  }

  // Print summary
  console.log(`Already tagged:  ${alreadyTagged.length}`);
  console.log(`To backfill:     ${proposals.length}  (${proposals.filter(p => p.confidence === 'HIGH').length} high, ${proposals.filter(p => p.confidence === 'MEDIUM').length} medium)`);
  console.log(`Unclassified:    ${unclassified.length}  (need manual entry)\n`);

  // Print proposals table
  for (const p of proposals) {
    const tag = p.confidence === 'HIGH' ? '✓' : '?';
    console.log(`  ${tag} [${p.confidence.padEnd(6)}] ${(p.label).substring(0, 50).padEnd(50)}  →  ${p.proposedGenre}  (${p.note})`);
  }
  if (unclassified.length > 0) {
    console.log('\n  Unclassified (needs manual Sanity entry):');
    for (const r of unclassified) {
      console.log(`  ✗           ${r.label.substring(0, 50).padEnd(50)}     title: ${r.auditioTitle ?? '—'}  composer: ${r.composerArtist ?? '—'}`);
    }
  }

  // Write backup of current state
  const backupPath = resolve(backupDir, 'genre-backfill-backup.json');
  writeFileSync(backupPath, JSON.stringify(all, null, 2));
  console.log(`\nBackup written: scripts/backups/genre-backfill-backup.json`);

  // Write proposals JSON (user can edit approved/proposedGenre before --patch)
  const proposalsPath = resolve(backupDir, 'genre-proposals.json');
  writeFileSync(proposalsPath, JSON.stringify(proposals, null, 2));
  console.log(`Proposals written: scripts/backups/genre-proposals.json`);

  // Write HTML report
  const html = buildHtml(proposals, alreadyTagged, unclassified);
  const htmlPath = resolve(backupDir, 'genre-proposals.html');
  writeFileSync(htmlPath, html);
  console.log(`Report written: scripts/backups/genre-proposals.html\n`);
  console.log('Next: open scripts/backups/genre-proposals.html, review the proposals,');
  console.log('then run: npx tsx scripts/backfill-auditio-genre.ts --patch\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
