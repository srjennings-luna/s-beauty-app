/**
 * Contueri — Seed the visioDefaults singleton document
 *
 * Creates the one-and-only visioDefaults document in Sanity with the
 * initial copy preserved from PrayClient.tsx's hardcoded strings. Once
 * this document exists, editors can tune Visio Divina's contemplative
 * prompts from Studio without a code change (VD-ACTION-01, June 6 2026).
 *
 * Usage:
 *   npx tsx scripts/seed-visio-defaults.ts          → dry run (no writes)
 *   npx tsx scripts/seed-visio-defaults.ts --patch  → create the document
 *
 * Safety:
 *   - Refuses to overwrite an existing visioDefaults document. Run this
 *     once per dataset; subsequent edits should happen in Studio.
 *   - The document _id is deterministic ("visioDefaults") so the singleton
 *     is easy to reference + impossible to accidentally duplicate.
 */

import { createClient } from '@sanity/client';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const PATCH_MODE = process.argv.includes('--patch');

// ── Credentials (hand-rolled .env.local reader to match the rest of the suite) ─

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
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvLocal();

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'em44j9m8';
const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_TOKEN;

if (!token) {
  console.error(
    'Missing SANITY_TOKEN in .env.local. Provision a write-enabled token from sanity.io/manage and try again.',
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-06-01',
  token,
  useCdn: false,
});

// ── Seed values (preserved verbatim from PrayClient.tsx pre-VD-ACTION-01) ─────

const SEED = {
  _id: 'visioDefaults',
  _type: 'visioDefaults',
  defaultActioHeadline: 'How will you live this out?',
  defaultActioInstruction:
    "Ask yourself and God: How will you apply what you've received in prayer to your life?",
  defaultPrayerPrompt:
    'Respond to God in prayer—thanksgiving, intercession, or simply conversation about what you notice.',
  defaultTraditionalPrayer: [
    'Lord, as I look upon this image, I am reminded of your glory made visible.',
    'Open the eyes of my heart. Let what I see lead me beyond what I see.',
    '',
    'Glory be to the Father, and to the Son, and to the Holy Spirit.',
    'As it was in the beginning, is now, and ever shall be,',
    'world without end. Amen.',
  ].join('\n'),
  defaultTraditionalPrayerSource: 'Traditional',
};

async function main() {
  console.log(`\nContueri · seed-visio-defaults`);
  console.log(`Project: ${projectId}   Dataset: ${dataset}`);
  console.log(`Mode: ${PATCH_MODE ? 'PATCH (writes)' : 'DRY RUN'}\n`);

  const existing = await client.fetch(
    `*[_type == "visioDefaults"][0] { _id }`,
  );

  if (existing) {
    console.log(
      `Existing visioDefaults document found (_id="${existing._id}"). Refusing to overwrite.`,
    );
    console.log('Edit it in Studio instead, or delete + re-run if you want to reseed.');
    return;
  }

  console.log('No visioDefaults document exists. Will create:');
  console.log(JSON.stringify(SEED, null, 2));
  console.log('');

  if (!PATCH_MODE) {
    console.log('Dry run — no changes written. Re-run with --patch to apply.\n');
    return;
  }

  await client.createIfNotExists(SEED);
  console.log(`✓ Created visioDefaults singleton (_id="visioDefaults").\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
