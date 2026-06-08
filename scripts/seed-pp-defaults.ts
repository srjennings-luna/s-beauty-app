/**
 * Contueri — Seed the ppDefaults singleton document.
 *
 * Creates the one-and-only ppDefaults document with the default Actio
 * that displays on any P&P day where dailyPrompt.actio is blank
 * (PP-DEFAULTS-01, June 7, 2026).
 *
 * Mirrors scripts/seed-visio-defaults.ts. Refuses to overwrite an
 * existing document — re-running is a no-op once the singleton lives
 * in the dataset. Edit in Studio after the initial seed; subsequent
 * runs report and exit.
 *
 * Usage:
 *   npx tsx scripts/seed-pp-defaults.ts          → dry run (no writes)
 *   npx tsx scripts/seed-pp-defaults.ts --patch  → create the document
 */

import { createClient } from '@sanity/client';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const PATCH_MODE = process.argv.includes('--patch');

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

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'em44j9m8';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_TOKEN;

if (!token) {
  console.error('Missing SANITY_TOKEN in .env.local.');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-06-01',
  token,
  useCdn: false,
});

// Initial default — Sheri's draft: "actively look for beauty in others, nature,
// your surroundings", Contueri-polished. Editable in Studio after seed.
const SEED = {
  _id: 'ppDefaults',
  _type: 'ppDefaults',
  defaultActio:
    'Look for beauty today, in a person, in the ordinary, in what would have passed unnoticed.',
};

async function main() {
  console.log(`\nContueri · seed-pp-defaults`);
  console.log(`Project: ${projectId}   Dataset: ${dataset}`);
  console.log(`Mode: ${PATCH_MODE ? 'PATCH (writes)' : 'DRY RUN'}\n`);

  const existing = await client.fetch(`*[_type == "ppDefaults"][0] { _id }`);

  if (existing) {
    console.log(
      `Existing ppDefaults document found (_id="${existing._id}"). Refusing to overwrite.`,
    );
    console.log('Edit it in Studio instead.');
    return;
  }

  console.log('No ppDefaults document exists. Will create:');
  console.log(JSON.stringify(SEED, null, 2));
  console.log('');

  if (!PATCH_MODE) {
    console.log('Dry run — no changes written. Re-run with --patch to apply.\n');
    return;
  }

  await client.createIfNotExists(SEED);
  console.log(`✓ Created ppDefaults singleton (_id="ppDefaults").\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
