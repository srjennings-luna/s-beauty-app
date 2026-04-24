/**
 * KALLOS — Migrate curatorNote → artworkHook on contentItem
 *
 * Implements R1 (Option C) from the Schema Design Brief. After the audit
 * in Task 2b produced a KEEP / REVIEW list:
 *   - KEEP items: move data from curatorNote → artworkHook (and
 *     curatorNoteAudio → artworkHookAudio), then unset the old keys.
 *   - REVIEW items: leave all content under curatorNote / curatorNoteAudio.
 *     The app reads them via the legacyCuratorNote GROQ alias during the
 *     rewrite window.
 *
 * Safety:
 *   - One transaction per document. Atomic per item.
 *   - Idempotent: re-running is a no-op for already-migrated items (they
 *     have artworkHook set and no curatorNote).
 *   - Backup written to scripts/backups/ before any write.
 *   - --dry-run mode prints the plan without committing.
 *
 * Usage:
 *   npx tsx scripts/migrate-artwork-hook-rename.ts --dry-run
 *   npx tsx scripts/migrate-artwork-hook-rename.ts
 */

import { createClient } from '@sanity/client';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const DRY_RUN = process.argv.includes('--dry-run');

// Audit decisions written by the interactive Task 2b process.
// Keyed by contentItem _id, value = { title, decision: 'KEEP' | 'REVIEW' }.
const AUDIT_FILE = '/tmp/audit_decisions.json';

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

interface AuditDecision {
  title: string;
  decision: 'KEEP' | 'REVIEW';
}

interface ContentItemForMigration {
  _id: string;
  title: string;
  curatorNote?: string | null;
  hasCuratorAudio: boolean;
  artworkHook?: string | null;
}

async function main() {
  console.log(`\n=== artworkHook rename ${DRY_RUN ? '(DRY RUN)' : '(LIVE)'} ===\n`);

  const audit: Record<string, AuditDecision> = JSON.parse(readFileSync(AUDIT_FILE, 'utf8'));
  const keepIds = Object.entries(audit)
    .filter(([, v]) => v.decision === 'KEEP')
    .map(([id]) => id);
  const reviewIds = Object.entries(audit)
    .filter(([, v]) => v.decision === 'REVIEW')
    .map(([id]) => id);

  console.log(`Audit decisions loaded: ${Object.keys(audit).length} total  (${keepIds.length} KEEP, ${reviewIds.length} REVIEW)\n`);

  // Fetch current state of each KEEP item
  const keepItems: ContentItemForMigration[] = await client.fetch(
    `*[_type == "contentItem" && _id in $ids]{
      _id, title, curatorNote,
      "hasCuratorAudio": defined(curatorNoteAudio.asset),
      artworkHook
    }`,
    { ids: keepIds }
  );

  // Backup all 47 items (KEEP + REVIEW) before mutating
  const allAuditedIds = Object.keys(audit);
  const backupItems = await client.fetch(
    `*[_type == "contentItem" && _id in $ids]{ ..., "_backupAt": now() }`,
    { ids: allAuditedIds }
  );
  const backupDir = resolve(process.cwd(), 'scripts/backups');
  if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = resolve(backupDir, `contentItems-pre-artworkHook-${stamp}.json`);
  writeFileSync(backupPath, JSON.stringify(backupItems, null, 2));
  console.log(`✓ Backup of all ${backupItems.length} audited items → ${backupPath}\n`);

  // Pre-flight classification
  type Action = 'migrate' | 'already-migrated' | 'no-content' | 'review-skip';
  const planned: Array<{ item: ContentItemForMigration; action: Action }> = [];
  for (const it of keepItems) {
    let action: Action;
    if (it.artworkHook && it.artworkHook.trim()) {
      action = 'already-migrated';
    } else if (!it.curatorNote || !it.curatorNote.trim()) {
      action = 'no-content';
    } else {
      action = 'migrate';
    }
    planned.push({ item: it, action });
  }

  const toMigrate = planned.filter((p) => p.action === 'migrate');
  const already = planned.filter((p) => p.action === 'already-migrated');
  const empty = planned.filter((p) => p.action === 'no-content');

  console.log(`KEEP items fetched: ${keepItems.length}`);
  console.log(`  will migrate:      ${toMigrate.length}`);
  console.log(`  already migrated:  ${already.length}`);
  console.log(`  empty curatorNote: ${empty.length}\n`);
  console.log(`REVIEW items (left under curatorNote, not touched): ${reviewIds.length}\n`);

  if (DRY_RUN) {
    console.log('DRY RUN — planned migrations:');
    for (const p of toMigrate) {
      console.log(`  ${p.item._id.padEnd(44)} "${p.item.title}"`);
    }
    console.log('\nNo writes performed. Re-run without --dry-run to migrate.\n');
    return;
  }

  // Execute per-item: set artworkHook from curatorNote, set artworkHookAudio
  // from curatorNoteAudio (copying the whole file object preserves the asset
  // _ref), then unset the legacy keys in the same transaction.
  let migrated = 0;
  const errors: Array<{ id: string; err: string }> = [];
  for (const { item } of toMigrate) {
    try {
      let patch = client.patch(item._id).set({ artworkHook: item.curatorNote });
      if (item.hasCuratorAudio) {
        // Need to copy the full curatorNoteAudio object. Fetch it first.
        const full = await client.getDocument(item._id);
        const audioObj = (full as unknown as { curatorNoteAudio?: unknown })?.curatorNoteAudio;
        if (audioObj) {
          patch = patch.set({ artworkHookAudio: audioObj });
        }
      }
      patch = patch.unset(['curatorNote', 'curatorNoteAudio']);
      await patch.commit();
      migrated++;
      console.log(`✓ ${item.title}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push({ id: item._id, err: msg });
      console.error(`✗ ${item.title}: ${msg}`);
    }
  }

  console.log(`\n=== Result: ${migrated}/${toMigrate.length} migrated ===`);
  if (errors.length > 0) {
    console.log('Errors:');
    errors.forEach((e) => console.log(`  ${e.id}: ${e.err}`));
    process.exit(1);
  }

  // Validate
  console.log('\nValidating…');
  const remaining = await client.fetch<number>(
    `count(*[_type == "contentItem" && _id in $ids && defined(curatorNote) && length(curatorNote) > 0])`,
    { ids: keepIds }
  );
  const withHook = await client.fetch<number>(
    `count(*[_type == "contentItem" && _id in $ids && defined(artworkHook) && length(artworkHook) > 0])`,
    { ids: keepIds }
  );
  console.log(`  KEEP items still with legacy curatorNote:   ${remaining} (expected 0)`);
  console.log(`  KEEP items with artworkHook populated:      ${withHook} (expected ${toMigrate.length + already.length})`);

  const reviewStillIntact = await client.fetch<number>(
    `count(*[_type == "contentItem" && _id in $ids && defined(curatorNote) && length(curatorNote) > 0])`,
    { ids: reviewIds }
  );
  console.log(`  REVIEW items with curatorNote untouched:    ${reviewStillIntact} (expected ${reviewIds.length})`);

  console.log('\nDone.\n');
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
