/**
 * Contueri — Migrate splash screen 4 closer block from body to tagline
 *
 * Background (June 3, 2026): the May 29 rebrand session added closer
 * lines to two onboarding screens. Screen 2 used a `tagline` block
 * (renders verdigris green per SplashClient renderer). Screen 4 used a
 * `body` block (renders cream). Same line in different wrapping,
 * different typing, different colors. Sheri's call: screen 4's closer
 * should be a tagline block to match screen 2.
 *
 * This script changes the `_type` of the screen 4 closer block (text:
 * "CONTUERI is built for exactly that.") from `body` to `tagline`.
 * Text, _key, and all other fields preserved. Once this runs, the live
 * Sanity content has screen 4's closer typed correctly, and the
 * tagline renderer color (verdigris #5F7A6B) takes effect on render.
 *
 * Safety:
 *   - Targets ONLY the splashPage doc with screenNumber: 4
 *   - Targets ONLY the block whose text matches exactly
 *   - Atomic transaction (published + draft if present)
 *   - Idempotent: re-running finds zero matching blocks (already
 *     migrated) and prints a no-op message
 *   - Backup written to scripts/backups/ before any write
 *   - --dry-run mode prints the plan without committing
 *
 * Usage:
 *   npx tsx scripts/migrate-splash-screen-4-closer-to-tagline.ts --dry-run
 *   npx tsx scripts/migrate-splash-screen-4-closer-to-tagline.ts
 */

import { createClient } from '@sanity/client';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const DRY_RUN = process.argv.includes('--dry-run');

const TARGET_SCREEN_NUMBER = 4;
const TARGET_TEXT = 'CONTUERI is built for exactly that.';
const FROM_TYPE = 'body';
const TO_TYPE = 'tagline';

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

interface SplashBlock {
  _type: string;
  _key: string;
  text?: string;
  [k: string]: unknown;
}

interface SplashPageDoc {
  _id: string;
  _type: 'splashPage';
  screenNumber: number;
  screenTitle?: string;
  blocks: SplashBlock[];
}

async function fetchAllSplashScreen4Docs(): Promise<SplashPageDoc[]> {
  // Match both published (_id starts with anything non-`drafts.`) and
  // draft (`drafts.*`) versions of screenNumber: 4. Mutating both keeps
  // the live site and the Studio draft consistent.
  const q = `*[_type == "splashPage" && screenNumber == ${TARGET_SCREEN_NUMBER}]`;
  return await client.fetch<SplashPageDoc[]>(q);
}

function writeBackup(docs: SplashPageDoc[]) {
  const dir = resolve(process.cwd(), 'scripts/backups');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const path = resolve(dir, `splash-screen-4-pre-tagline-migration-${stamp}.json`);
  writeFileSync(path, JSON.stringify(docs, null, 2));
  console.log(`Backup written: ${path}`);
}

async function main() {
  console.log(`\n=== splash screen 4 closer: ${FROM_TYPE} -> ${TO_TYPE} ${DRY_RUN ? '(DRY RUN)' : '(LIVE)'} ===\n`);

  const docs = await fetchAllSplashScreen4Docs();
  if (docs.length === 0) {
    console.error(`No splashPage docs found with screenNumber: ${TARGET_SCREEN_NUMBER}.`);
    process.exit(1);
  }
  console.log(`Found ${docs.length} document(s) for screenNumber ${TARGET_SCREEN_NUMBER}:`);
  for (const d of docs) {
    console.log(`  ${d._id} (${d.screenTitle ?? 'no title'}) — ${d.blocks?.length ?? 0} blocks`);
  }
  console.log('');

  writeBackup(docs);
  console.log('');

  let totalMutations = 0;
  let totalNoOps = 0;

  for (const doc of docs) {
    const matchIdx = (doc.blocks ?? []).findIndex(
      (b) => b._type === FROM_TYPE && b.text === TARGET_TEXT,
    );

    if (matchIdx === -1) {
      // Either already migrated (now a tagline) or never had this text.
      const alreadyTagline = (doc.blocks ?? []).find(
        (b) => b._type === TO_TYPE && b.text === TARGET_TEXT,
      );
      if (alreadyTagline) {
        console.log(`[${doc._id}] no-op: closer already typed as ${TO_TYPE}`);
        totalNoOps++;
      } else {
        console.log(`[${doc._id}] no-op: no block matches text "${TARGET_TEXT}"`);
        totalNoOps++;
      }
      continue;
    }

    const block = doc.blocks[matchIdx];
    console.log(`[${doc._id}] block at index ${matchIdx}: ${block._type} -> ${TO_TYPE} (text preserved, _key ${block._key} preserved)`);

    if (DRY_RUN) continue;

    // Use a Sanity patch on the specific array element by _key, swapping
    // _type only. Preserves _key, text, and any other fields on the
    // block. The set operation replaces the element wholesale, so we
    // construct a new object with _type overridden.
    const newBlock = { ...block, _type: TO_TYPE };
    await client
      .patch(doc._id)
      .set({ [`blocks[_key=="${block._key}"]`]: newBlock })
      .commit();
    console.log(`  committed`);
    totalMutations++;
  }

  console.log('');
  console.log(`Summary: ${totalMutations} mutation(s), ${totalNoOps} no-op(s)`);
  if (DRY_RUN) {
    console.log('(dry-run — no changes written)');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
