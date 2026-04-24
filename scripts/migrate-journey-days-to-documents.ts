/**
 * KALLOS — Migrate journey.days[] from inline objects to standalone documents
 *
 * Implements R5 from KALLOS-Schema-Audit.html (April 23, 2026). See
 * content-docs/KALLOS-CC-Schema-Design-Brief.html Task 1 for the full spec.
 *
 * What this does:
 *   1. Fetches every journey and its inline days[] array from Sanity (raw —
 *      no dereference, so image/file/reference pointers come through intact).
 *   2. Writes a pre-migration JSON backup to scripts/backups/.
 *   3. For each journey: in a single transaction, creates one `journeyDay`
 *      document per inline day and rewrites the parent journey's `days` array
 *      to hold references instead of inline objects.
 *
 * Safety properties:
 *   - Deterministic _ids: journeyDay-<journey._id>-day-<dayNumber>. Re-runs
 *     cleanly via createOrReplace. Easy to diff/verify.
 *   - One atomic transaction per journey: partial failures leave that journey
 *     untouched; already-migrated journeys stay migrated.
 *   - No dereferencing during read → no asset re-upload, no ref rewriting.
 *   - Dry-run mode (--dry-run) prints the planned writes without committing.
 *   - Backup JSON written before any write. Restore via seed script if needed.
 *
 * Prerequisites:
 *   - SANITY_TOKEN env var (write-scope token). Available in .env.local.
 *   - The new `journeyDay` schema must already be deployed to Sanity Studio,
 *     OR at minimum present in sanity/schemaTypes/index.ts and accessible to
 *     the data layer. The Sanity data layer does not enforce schema at write
 *     time, so writes succeed either way, but Studio UI will only render
 *     journeyDay docs correctly once deployed.
 *
 * Usage:
 *   npx tsx scripts/migrate-journey-days-to-documents.ts --dry-run
 *   npx tsx scripts/migrate-journey-days-to-documents.ts
 */

import { createClient } from '@sanity/client';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';

const DRY_RUN = process.argv.includes('--dry-run');

// Load .env.local manually — Node does not read it by default.
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
  console.error('ERROR: SANITY_TOKEN not set. Expected in .env.local or environment.');
  process.exit(1);
}

const client = createClient({
  projectId: 'em44j9m8',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
});

// ─── Types ──────────────────────────────────────────────────────────────────

// Raw inline day — has _key and _type='journeyDay' from the inline array entry.
// We strip _key/_type when promoting to a document.
interface RawInlineDay {
  _key?: string;
  _type?: string;
  dayNumber: number;
  dayTitle?: string;
  [field: string]: unknown;
}

interface RawJourney {
  _id: string;
  title: string;
  days?: RawInlineDay[];
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n=== journeyDay migration ${DRY_RUN ? '(DRY RUN)' : '(LIVE)'} ===\n`);

  // Fetch raw journeys with inline days — NO dereference, preserves all nested
  // asset refs and document refs exactly as stored.
  const journeys: RawJourney[] = await client.fetch(
    `*[_type == "journey"] | order(order asc) { _id, title, days }`
  );

  if (journeys.length === 0) {
    console.log('No journeys found. Nothing to migrate.');
    return;
  }

  // ─── Backup ──────────────────────────────────────────────────────────────
  const backupDir = resolve(process.cwd(), 'scripts/backups');
  if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = resolve(backupDir, `journeys-pre-migration-${stamp}.json`);
  writeFileSync(backupPath, JSON.stringify(journeys, null, 2));
  console.log(`✓ Backup written: ${backupPath}\n`);

  // ─── Pre-flight summary ──────────────────────────────────────────────────
  let totalDays = 0;
  console.log('Plan:');
  for (const j of journeys) {
    const count = j.days?.length ?? 0;
    totalDays += count;
    console.log(`  ${j.title.padEnd(35)} ${String(count).padStart(2)} inline day(s) → ${count} journeyDay docs`);
  }
  console.log(`  ${'—'.repeat(50)}`);
  console.log(`  Total: ${totalDays} inline days → ${totalDays} journeyDay documents\n`);

  if (DRY_RUN) {
    console.log('DRY RUN — sample output for first journey:\n');
    const firstWithDays = journeys.find((j) => j.days && j.days.length > 0);
    if (firstWithDays && firstWithDays.days && firstWithDays.days[0]) {
      const sampleDay = firstWithDays.days[0];
      const sampleDoc = buildDocFromInline(firstWithDays._id, sampleDay);
      console.log(`  Parent journey: ${firstWithDays.title} (${firstWithDays._id})`);
      console.log(`  First day _id: ${sampleDoc._id}`);
      console.log(`  First day keys: ${Object.keys(sampleDoc).sort().join(', ')}`);
      console.log(`\n  New journey.days ref shape:`);
      console.log(
        JSON.stringify(
          (firstWithDays.days || []).map((d) => buildRefFromDay(firstWithDays._id, d)),
          null,
          2
        ).split('\n').slice(0, 15).join('\n')
      );
    }
    console.log('\nNo writes performed. Re-run without --dry-run to migrate.\n');
    return;
  }

  // ─── Migrate, one transaction per journey ────────────────────────────────
  let migrated = 0;
  const errors: Array<{ journey: string; error: string }> = [];

  for (const journey of journeys) {
    const days = journey.days ?? [];
    if (days.length === 0) {
      console.log(`→ ${journey.title}: no days, skipping`);
      continue;
    }

    try {
      const tx = client.transaction();
      for (const inline of days) {
        const newDoc = buildDocFromInline(journey._id, inline);
        tx.createOrReplace(newDoc);
      }
      const newRefs = days
        .slice()
        .sort((a, b) => (a.dayNumber ?? 0) - (b.dayNumber ?? 0))
        .map((d) => buildRefFromDay(journey._id, d));
      tx.patch(journey._id, (p) => p.set({ days: newRefs }));
      await tx.commit();
      migrated += days.length;
      console.log(`✓ ${journey.title}: ${days.length} days migrated`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push({ journey: journey.title, error: msg });
      console.error(`✗ ${journey.title}: FAILED — ${msg}`);
    }
  }

  console.log(`\n=== Result: ${migrated}/${totalDays} days migrated ===`);
  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach((e) => console.log(`  ${e.journey}: ${e.error}`));
    process.exit(1);
  }

  // ─── Post-migration validation ───────────────────────────────────────────
  console.log('\nValidating…');
  const journeyDayCount = await client.fetch<number>(`count(*[_type == "journeyDay"])`);
  console.log(`  *[_type == "journeyDay"] → ${journeyDayCount} (expected ${totalDays})`);

  const refIntegrity = await client.fetch<Array<{ title: string; refs: number; derefOk: number }>>(
    `*[_type == "journey"]{ title, "refs": count(days), "derefOk": count(days[]->) }`
  );
  for (const row of refIntegrity) {
    const ok = row.refs === row.derefOk;
    console.log(`  ${row.title.padEnd(35)} refs=${row.refs}  derefOk=${row.derefOk}  ${ok ? '✓' : '✗ MISMATCH'}`);
  }

  const missingJourneyRef = await client.fetch<Array<{ _id: string }>>(
    `*[_type == "journeyDay" && !defined(journey._ref)]{ _id }`
  );
  if (missingJourneyRef.length > 0) {
    console.log(`  WARNING: ${missingJourneyRef.length} journeyDay doc(s) missing journey._ref`);
  } else {
    console.log(`  All journeyDay docs have a journey._ref ✓`);
  }

  console.log('\nMigration complete. Next steps:');
  console.log('  1. Update journey.ts to make days an array of references');
  console.log('  2. Update GROQ in lib/sanity.ts (days[]{...} → days[]->{...})');
  console.log('  3. Deploy Sanity Studio: cd sanity && npm run deploy');
  console.log('  4. Build and deploy the app\n');
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function deterministicDayId(journeyId: string, dayNumber: number): string {
  return `journeyDay-${journeyId}-day-${dayNumber}`;
}

/**
 * Build a journeyDay document from an inline day object.
 * Strips _key and the inline _type discriminator. Adds _id, _type: 'journeyDay',
 * and the back-reference to the parent journey. Nested objects (auditio, lectio),
 * arrays (goDeeper refs, reflectQuestions), and asset refs (openImage,
 * openTextAudio, encounterNoteAudio, auditio.audioFile) all pass through
 * unchanged because we never dereferenced them on read.
 */
function buildDocFromInline(journeyId: string, inline: RawInlineDay) {
  const _id = deterministicDayId(journeyId, inline.dayNumber);
  // Copy all fields except _key and _type
  const { _key: _omitKey, _type: _omitType, ...fields } = inline;
  return {
    _id,
    _type: 'journeyDay' as const,
    journey: {
      _type: 'reference' as const,
      _ref: journeyId,
    },
    ...fields,
  };
}

function buildRefFromDay(journeyId: string, inline: RawInlineDay) {
  const _id = deterministicDayId(journeyId, inline.dayNumber);
  return {
    _type: 'reference' as const,
    _ref: _id,
    _key: _id, // stable array key — Sanity requires _key per array item
  };
}

main().catch((err) => {
  console.error('\nFATAL:', err);
  process.exit(1);
});
