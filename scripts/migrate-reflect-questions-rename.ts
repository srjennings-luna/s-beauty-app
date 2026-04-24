/**
 * KALLOS — Rename reflectQuestions → reflectionQuestions on journeyDay documents
 *
 * Implements R6 from KALLOS-Schema-Audit.html. Aligns the journeyDay field
 * name with contentItem.reflectionQuestions, removing the singular/plural typo
 * hazard flagged in the April 23 audit.
 *
 * Per-doc transaction: set reflectionQuestions from reflectQuestions, then
 * unset reflectQuestions. Idempotent — re-running is a no-op for already-
 * migrated docs.
 *
 * Usage:
 *   npx tsx scripts/migrate-reflect-questions-rename.ts --dry-run
 *   npx tsx scripts/migrate-reflect-questions-rename.ts
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

interface JourneyDayRow {
  _id: string;
  dayTitle?: string;
  reflectQuestions?: string[] | null;
  reflectionQuestions?: string[] | null;
}

async function main() {
  console.log(`\n=== reflectQuestions → reflectionQuestions ${DRY_RUN ? '(DRY RUN)' : '(LIVE)'} ===\n`);

  const days: JourneyDayRow[] = await client.fetch(
    `*[_type == "journeyDay" && !string::startsWith(_id, "drafts.")] | order(dayNumber asc){
      _id, dayTitle, reflectQuestions, reflectionQuestions
    }`
  );
  console.log(`Found ${days.length} journeyDay documents`);

  const backupDir = resolve(process.cwd(), 'scripts/backups');
  if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = resolve(backupDir, `journeyDays-pre-reflectRename-${stamp}.json`);
  writeFileSync(backupPath, JSON.stringify(days, null, 2));
  console.log(`✓ Backup → ${backupPath}\n`);

  type Action = 'rename' | 'already-renamed' | 'missing';
  const planned: Array<{ doc: JourneyDayRow; action: Action }> = days.map((d) => {
    const hasNew = Array.isArray(d.reflectionQuestions) && d.reflectionQuestions.length > 0;
    const hasOld = Array.isArray(d.reflectQuestions) && d.reflectQuestions.length > 0;
    if (hasNew) return { doc: d, action: 'already-renamed' as Action };
    if (hasOld) return { doc: d, action: 'rename' as Action };
    return { doc: d, action: 'missing' as Action };
  });

  const toRename = planned.filter((p) => p.action === 'rename');
  const already = planned.filter((p) => p.action === 'already-renamed');
  const missing = planned.filter((p) => p.action === 'missing');

  console.log(`Plan: rename ${toRename.length}, already-renamed ${already.length}, missing ${missing.length}\n`);
  if (missing.length > 0) {
    console.log('Docs with neither field populated (should be 0 — reflection is required):');
    missing.forEach((p) => console.log(`  ${p.doc._id} ${p.doc.dayTitle ?? ''}`));
    console.log();
  }

  if (DRY_RUN) {
    console.log('DRY RUN sample of rename plan:');
    toRename.slice(0, 3).forEach((p) => {
      console.log(`  ${p.doc._id}  "${p.doc.dayTitle}"  ${JSON.stringify(p.doc.reflectQuestions)}`);
    });
    console.log('\nNo writes performed.\n');
    return;
  }

  let done = 0;
  const errors: Array<{ id: string; err: string }> = [];
  for (const { doc } of toRename) {
    try {
      await client
        .patch(doc._id)
        .set({ reflectionQuestions: doc.reflectQuestions })
        .unset(['reflectQuestions'])
        .commit();
      done++;
      console.log(`✓ ${doc.dayTitle ?? doc._id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push({ id: doc._id, err: msg });
      console.error(`✗ ${doc._id}: ${msg}`);
    }
  }

  console.log(`\n=== Result: ${done}/${toRename.length} renamed ===`);
  if (errors.length > 0) {
    errors.forEach((e) => console.log(`  ${e.id}: ${e.err}`));
    process.exit(1);
  }

  const stillOld = await client.fetch<number>(
    `count(*[_type == "journeyDay" && defined(reflectQuestions)])`
  );
  const onNewField = await client.fetch<number>(
    `count(*[_type == "journeyDay" && defined(reflectionQuestions) && length(reflectionQuestions) > 0])`
  );
  console.log(`\nValidation:`);
  console.log(`  journeyDay docs still with reflectQuestions:      ${stillOld} (expected 0)`);
  console.log(`  journeyDay docs with reflectionQuestions set:     ${onNewField} (expected ${days.length})`);
  console.log('\nDone.\n');
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
