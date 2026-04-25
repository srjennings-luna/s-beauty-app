/**
 * KALLOS — Migrate embedded auditio objects → standalone auditio documents (R7)
 *
 * Reads every journeyDay and dailyPrompt that has an embedded auditio object,
 * creates a standalone auditio document for each, then patches the parent
 * record to hold a reference instead.
 *
 * Deduplication: if two records share the same composerArtist + workTitle,
 * they get the same auditio document (one piece, two references). Records
 * without structured workTitle each get their own document.
 *
 * Safety:
 *   - --dry-run prints the plan without writing anything.
 *   - Backup written to scripts/backups/ before any write.
 *   - Idempotent: re-running skips records whose auditio field is already a
 *     reference (has _ref rather than embedded object data).
 *
 * Usage:
 *   npx tsx scripts/migrate-auditio-to-document.ts --dry-run
 *   npx tsx scripts/migrate-auditio-to-document.ts
 */

import { createClient } from '@sanity/client';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const DRY_RUN = process.argv.includes('--dry-run');

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

// ── Types ──────────────────────────────────────────────────────────────────────

interface EmbeddedAuditio {
  title?: string;
  composer?: string;       // journeyDay legacy field
  artist?: string;         // dailyPrompt legacy field
  composerArtist?: string;
  workTitle?: string;
  genre?: string;
  licensingNote?: string;
  audioFile?: { asset?: { _ref?: string } };
  audioUrl?: string | { audioFile?: unknown; audioUrl?: string }; // dailyPrompt had nested object
  externalUrl?: string;
  url?: string;            // dailyPrompt legacy field for externalUrl
  verbaOriginal?: string;
  // If auditio is already a reference (migration already ran), it will have _ref
  _ref?: string;
  _type?: string;
}

interface ParentRecord {
  _id: string;
  _type: 'journeyDay' | 'dailyPrompt';
  label: string;
  auditio: EmbeddedAuditio;
}

// ── Dedup key ──────────────────────────────────────────────────────────────────
// Two records with the same composer + work get the same auditio document.

function dedupKey(a: EmbeddedAuditio): string | null {
  const composer = (a.composerArtist ?? a.composer ?? a.artist ?? '').trim().toLowerCase();
  const work = (a.workTitle ?? '').trim().toLowerCase();
  if (composer && work) return `${composer}|||${work}`;
  return null; // no structured data — each gets its own doc
}

// ── Build the auditio document payload from embedded data ─────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildAuditioDoc(a: EmbeddedAuditio, parentType: string): Record<string, any> {
  // Resolve audio fields — dailyPrompt had a nested audioUrl object
  let audioUrl: string | undefined;
  let audioFileRef: string | undefined;

  if (parentType === 'dailyPrompt' && typeof a.audioUrl === 'object' && a.audioUrl !== null) {
    const nested = a.audioUrl as { audioFile?: { asset?: { _ref?: string } }; audioUrl?: string };
    audioUrl = nested.audioUrl;
    audioFileRef = nested.audioFile?.asset?._ref;
  } else if (typeof a.audioUrl === 'string') {
    audioUrl = a.audioUrl;
  }

  if (!audioFileRef && a.audioFile?.asset?._ref) {
    audioFileRef = a.audioFile.asset._ref;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc: Record<string, any> = {
    _type: 'auditio',
    title: a.title ?? 'Untitled',
    composerArtist: a.composerArtist ?? a.composer ?? a.artist ?? undefined,
    workTitle: a.workTitle ?? undefined,
    genre: a.genre ?? undefined,
    licensingNote: a.licensingNote ?? undefined,
    audioUrl: audioUrl ?? undefined,
    externalUrl: a.externalUrl ?? a.url ?? undefined,
    verbaOriginal: a.verbaOriginal ?? undefined,
  };

  // Re-attach the audio file asset reference if present
  if (audioFileRef) {
    doc.audioFile = { _type: 'file', asset: { _type: 'reference', _ref: audioFileRef } };
  }

  // Remove undefined keys (Sanity ignores them but keeps the doc clean)
  for (const key of Object.keys(doc)) {
    if (doc[key] === undefined) delete doc[key];
  }

  return doc;
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n=== KALLOS Auditio → Document Migration ${DRY_RUN ? '(DRY RUN)' : '(LIVE)'} ===\n`);

  const backupDir = resolve(process.cwd(), 'scripts/backups');
  if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true });

  // Fetch all records. We use raw GROQ to get the embedded auditio object
  // as-is — not the new reference projection. We detect already-migrated
  // records by checking whether auditio._ref is set.
  console.log('Fetching records from Sanity...');

  const [jdRaw, dpRaw] = await Promise.all([
    client.fetch<ParentRecord[]>(`
      *[_type == "journeyDay" && defined(auditio)] {
        _id, _type,
        "label": "Journey Day – " + journey->title + " / Day " + string(dayNumber) + ": " + dayTitle,
        auditio
      }
    `),
    client.fetch<ParentRecord[]>(`
      *[_type == "dailyPrompt" && defined(auditio)] {
        _id, _type,
        "label": "Pause & Ponder – " + date,
        auditio
      }
    `),
  ]);

  const all = [...jdRaw, ...dpRaw];

  // Split: already migrated (auditio._ref set) vs still embedded
  const alreadyMigrated = all.filter(r => r.auditio?._ref);
  const toMigrate = all.filter(r => !r.auditio?._ref && r.auditio?.title);

  console.log(`Total records with auditio: ${all.length}`);
  console.log(`Already migrated:           ${alreadyMigrated.length}`);
  console.log(`To migrate:                 ${toMigrate.length}\n`);

  if (toMigrate.length === 0) {
    console.log('Nothing to migrate. All done.');
    return;
  }

  // Backup
  const backupPath = resolve(backupDir, 'auditio-migration-backup.json');
  writeFileSync(backupPath, JSON.stringify(toMigrate, null, 2));
  console.log(`Backup written: scripts/backups/auditio-migration-backup.json\n`);

  // Build dedup map: key → auditio doc payload
  const dedupMap = new Map<string, { doc: Record<string, unknown>; createdId?: string }>();
  const plan: Array<{ record: ParentRecord; dedupKey: string | null }> = [];

  for (const record of toMigrate) {
    const key = dedupKey(record.auditio);
    if (key && !dedupMap.has(key)) {
      dedupMap.set(key, { doc: buildAuditioDoc(record.auditio, record._type) });
    }
    plan.push({ record, dedupKey: key });
  }

  const uniqueDocs = dedupMap.size + toMigrate.filter(r => dedupKey(r.auditio) === null).length;
  console.log(`Unique auditio documents to create: ${uniqueDocs}`);
  console.log(`Deduplicated (shared references):   ${toMigrate.length - uniqueDocs}\n`);

  // Print plan
  for (const { record, dedupKey: key } of plan) {
    const docTitle = record.auditio.title ?? '(no title)';
    const composer = record.auditio.composerArtist ?? record.auditio.composer ?? record.auditio.artist ?? '—';
    const shared = key && (plan.filter(p => p.dedupKey === key).length > 1) ? ' [SHARED]' : '';
    console.log(`  ${record.label}`);
    console.log(`    → "${docTitle}" by ${composer}${shared}`);
  }

  if (DRY_RUN) {
    console.log('\n[DRY RUN] No changes written. Remove --dry-run to apply.\n');
    return;
  }

  console.log('\nCreating auditio documents and patching parent records...\n');

  let created = 0;
  let patched = 0;
  let failed = 0;

  // Single-doc map for non-deduped records (key = record._id)
  const singleDocIds = new Map<string, string>();

  // Create deduped docs first
  for (const [key, entry] of dedupMap.entries()) {
    try {
      const result = await client.create(entry.doc as Parameters<typeof client.create>[0]);
      entry.createdId = result._id;
      created++;
      console.log(`  ✓ Created auditio doc ${result._id} for "${entry.doc.title}" (deduped key: ${key.split('|||')[0]} / ${key.split('|||')[1]})`);
    } catch (err) {
      console.error(`  ✗ Failed to create auditio doc for key "${key}": ${err}`);
      failed++;
    }
  }

  // Create non-deduped docs (unique per record)
  for (const { record, dedupKey: key } of plan) {
    if (key !== null) continue; // handled above
    try {
      const doc = buildAuditioDoc(record.auditio, record._type);
      const result = await client.create(doc as Parameters<typeof client.create>[0]);
      singleDocIds.set(record._id, result._id);
      created++;
      console.log(`  ✓ Created auditio doc ${result._id} for "${doc.title}" (${record.label})`);
    } catch (err) {
      console.error(`  ✗ Failed to create auditio doc for ${record.label}: ${err}`);
      failed++;
    }
  }

  // Patch parent records to use reference
  console.log('\nPatching parent records...\n');

  for (const { record, dedupKey: key } of plan) {
    let auditioId: string | undefined;

    if (key !== null) {
      auditioId = dedupMap.get(key)?.createdId;
    } else {
      auditioId = singleDocIds.get(record._id);
    }

    if (!auditioId) {
      console.error(`  ✗ Skipping ${record.label} — no auditio doc ID (creation may have failed)`);
      failed++;
      continue;
    }

    try {
      await client
        .patch(record._id)
        .set({ auditio: { _type: 'reference', _ref: auditioId } })
        .commit();
      patched++;
      console.log(`  ✓ Patched ${record.label} → auditio ref ${auditioId}`);
    } catch (err) {
      console.error(`  ✗ Failed to patch ${record.label}: ${err}`);
      failed++;
    }
  }

  console.log(`\n=== Migration complete ===`);
  console.log(`Auditio documents created: ${created}`);
  console.log(`Parent records patched:    ${patched}`);
  console.log(`Failures:                  ${failed}`);
  if (failed > 0) {
    console.log('\nCheck output above for failed records. Re-running is safe — already-migrated records are skipped.');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
