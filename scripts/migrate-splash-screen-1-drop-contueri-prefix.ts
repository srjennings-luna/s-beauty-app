/**
 * Contueri — Drop "Contueri:" prefix from Splash Screen 1 tagline
 *
 * Background (June 5, 2026): Sheri's on-device video shows Screen 1
 * rendering the tagline as "Contueri: To gaze on, behold, contemplate
 * with purpose" — with the "Contueri:" prefix that CLAUDE.md June 3
 * night entry said was already dropped. The fallback (app/splash/
 * fallback.ts) has the correct stripped form ("To gaze on, behold,
 * contemplate with purpose."). So the prefix must still be live in
 * Sanity — the June 3 edit either reverted, never published, or
 * targeted a different doc.
 *
 * This script normalizes the Screen 1 tagline text in Sanity to
 * match the fallback. Wordmark + pronunciation above the tagline
 * already name the word twice; repeating it a third time before
 * the definition reads anxious.
 *
 * Safety:
 *   - Targets ONLY the splashPage doc with screenNumber: 1
 *   - Targets ONLY the tagline block within that screen
 *   - Idempotent: if the prefix is already gone, prints no-op and exits
 *   - Backup of the affected doc written to scripts/backups/ before any
 *     write
 *   - --dry-run mode prints the plan without committing
 *
 * Usage:
 *   npx tsx scripts/migrate-splash-screen-1-drop-contueri-prefix.ts --dry-run
 *   npx tsx scripts/migrate-splash-screen-1-drop-contueri-prefix.ts
 */

import { createClient } from '@sanity/client';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

// Hand-rolled .env.local loader (same pattern as
// migrate-splash-screen-4-closer-to-tagline.ts — no dotenv dependency).
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

const DRY_RUN = process.argv.includes('--dry-run');

const TARGET_SCREEN_NUMBER = 1;
const CANONICAL_TEXT = 'To gaze on, behold, contemplate with purpose.';
// Match "Contueri:" or "contueri:" (any case) followed by optional whitespace
const PREFIX_PATTERN = /^contueri\s*:\s*/i;

type Block = {
  _type: string;
  _key: string;
  text?: string;
};

type SplashDoc = {
  _id: string;
  _rev: string;
  _type: 'splashPage';
  screenNumber: number;
  blocks: Block[];
};

if (!process.env.SANITY_TOKEN) {
  console.error('ERROR: SANITY_TOKEN not set in .env.local.');
  process.exit(1);
}

const client = createClient({
  projectId: 'em44j9m8',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
});

async function main() {
  console.log(`\n${DRY_RUN ? '[DRY RUN] ' : ''}Splash Screen 1 — drop "Contueri:" prefix\n`);

  // Fetch both published and draft versions; we want to know about both.
  const docs = await client.fetch<SplashDoc[]>(
    `*[_type == "splashPage" && screenNumber == $n]`,
    { n: TARGET_SCREEN_NUMBER },
  );

  if (docs.length === 0) {
    console.log(`No splashPage docs found with screenNumber=${TARGET_SCREEN_NUMBER}. Nothing to do.`);
    return;
  }

  console.log(`Found ${docs.length} doc(s) for screenNumber=${TARGET_SCREEN_NUMBER}:`);
  for (const d of docs) console.log(`  - _id=${d._id}  rev=${d._rev}`);
  console.log();

  let totalMutations = 0;

  for (const doc of docs) {
    const taglineBlocks = (doc.blocks || []).filter((b) => b._type === 'tagline');
    if (taglineBlocks.length === 0) {
      console.log(`[${doc._id}] no tagline blocks — skip`);
      continue;
    }

    for (const block of taglineBlocks) {
      const currentText = (block.text ?? '').trim();
      const needsFix = PREFIX_PATTERN.test(currentText);

      console.log(`[${doc._id}] tagline _key=${block._key}`);
      console.log(`  current: ${JSON.stringify(currentText)}`);

      if (!needsFix) {
        console.log(`  status: ✅ already clean — no change needed`);
        continue;
      }

      const cleaned = currentText.replace(PREFIX_PATTERN, '');
      // Normalize to canonical text if the cleaned version matches it
      // case-insensitively after stripping whitespace AND trailing
      // punctuation. This catches the case where Sanity has the text
      // without a trailing period while the fallback has one. We want
      // both surfaces (live + fallback) to match exactly post-migration.
      const norm = (s: string) =>
        s.toLowerCase().replace(/\s+/g, ' ').replace(/[.\s]+$/, '').trim();
      const final =
        norm(cleaned) === norm(CANONICAL_TEXT) ? CANONICAL_TEXT : cleaned;

      console.log(`  new:     ${JSON.stringify(final)}`);

      if (DRY_RUN) {
        console.log(`  status: [DRY RUN] would patch`);
        totalMutations++;
        continue;
      }

      // Backup before write (per-doc backup, scripts/backups/)
      const backupDir = resolve(process.cwd(), 'scripts/backups');
      if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true });
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = resolve(
        backupDir,
        `splash-screen-1-pre-prefix-strip-${doc._id}-${stamp}.json`,
      );
      writeFileSync(backupPath, JSON.stringify(doc, null, 2));
      console.log(`  backup:  ${backupPath}`);

      // Apply patch
      await client
        .patch(doc._id)
        .set({ [`blocks[_key=="${block._key}"].text`]: final })
        .commit();

      console.log(`  status: ✅ patched`);
      totalMutations++;
    }
  }

  console.log(
    `\n${DRY_RUN ? '[DRY RUN] ' : ''}Done. Mutations: ${totalMutations}.`,
  );
  if (DRY_RUN && totalMutations > 0) {
    console.log(`Re-run without --dry-run to commit.`);
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
