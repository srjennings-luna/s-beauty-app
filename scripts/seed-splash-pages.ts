/**
 * KALLOS — Seed Splash Screens in Sanity
 *
 * Replaces all existing `splashPage` documents with five block-based
 * screens that match the hardcoded content in app/splash/fallback.ts.
 * Each splashPage document is ONE screen; `blocks[]` is the ordered
 * array of content pieces rendered top-to-bottom.
 *
 * Idempotent: deletes existing splashPage docs (both published and
 * drafts) before creating fresh ones with deterministic IDs.
 *
 * Usage:
 *   SANITY_TOKEN=<editor-token> npx tsx scripts/seed-splash-pages.ts
 *   SANITY_TOKEN=<editor-token> npx tsx scripts/seed-splash-pages.ts --dry-run
 *
 * Token must have write permission. Get one at:
 *   https://www.sanity.io/manage/personal/project/em44j9m8/api
 */

import { createClient } from '@sanity/client';
import { randomUUID } from 'node:crypto';

const DRY_RUN = process.argv.includes('--dry-run');

const client = createClient({
  projectId: 'em44j9m8',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
});

type SplashBlock =
  | { _type: 'wordmark'; _key: string; text: string }
  | { _type: 'pronunciation'; _key: string; text: string }
  | { _type: 'goldRule'; _key: string }
  | { _type: 'quote'; _key: string; text: string }
  | { _type: 'heading'; _key: string; text: string }
  | { _type: 'body'; _key: string; text: string }
  | { _type: 'tagline'; _key: string; text: string }
  | { _type: 'featureCard'; _key: string; label: string; body: string }
  | { _type: 'primaryCta'; _key: string; label: string; linkPath: string }
  | { _type: 'secondaryCta'; _key: string; label: string; linkPath: string };

type SplashDoc = {
  _id: string;
  _type: 'splashPage';
  screenNumber: number;
  screenTitle: string;
  blocks: SplashBlock[];
};

const k = () => randomUUID().replace(/-/g, '').slice(0, 12);

const screens: SplashDoc[] = [
  {
    _id: 'kallos-splash-1',
    _type: 'splashPage',
    screenNumber: 1,
    screenTitle: 'Brand Identity',
    blocks: [
      { _type: 'wordmark', _key: k(), text: 'KALLOS' },
      { _type: 'pronunciation', _key: k(), text: 'kal · os' },
      { _type: 'goldRule', _key: k() },
      { _type: 'quote', _key: k(), text: 'Beauty will save the world.' },
      {
        _type: 'body',
        _key: k(),
        text: 'Rediscover beauty, truth and goodness through tradition. The Greeks called it KALLOS, and they believed the three were inseparable.',
      },
      { _type: 'tagline', _key: k(), text: 'Your daily dose of what is beautiful. true. good.' },
    ],
  },
  {
    _id: 'kallos-splash-2',
    _type: 'splashPage',
    screenNumber: 2,
    screenTitle: 'The Three',
    blocks: [
      { _type: 'heading', _key: k(), text: 'Beauty. Truth. Goodness.' },
      { _type: 'goldRule', _key: k() },
      {
        _type: 'body',
        _key: k(),
        text: 'Ancient philosophers called them the transcendentals: beauty, truth, goodness. Three things woven together that finding one means brushing against the divine.',
      },
      {
        _type: 'body',
        _key: k(),
        text: 'The tradition that produced the greatest art in the Western world kept all three in the same room.',
      },
      { _type: 'tagline', _key: k(), text: 'KALLOS is built on that.' },
    ],
  },
  {
    _id: 'kallos-splash-3',
    _type: 'splashPage',
    screenNumber: 3,
    screenTitle: 'Feature Tour',
    blocks: [
      { _type: 'heading', _key: k(), text: 'Two ways to explore.' },
      {
        _type: 'featureCard',
        _key: k(),
        label: 'Pause & Ponder',
        body: 'Every day, a piece of art and a question to sit with.',
      },
      {
        _type: 'featureCard',
        _key: k(),
        label: 'Journeys',
        body: 'Or go deeper. A theme, an artist, a question. One day at a time.',
      },
    ],
  },
  {
    _id: 'kallos-splash-4',
    _type: 'splashPage',
    screenNumber: 4,
    screenTitle: 'Hook',
    blocks: [
      { _type: 'heading', _key: k(), text: 'You already know this feeling.' },
      { _type: 'goldRule', _key: k() },
      {
        _type: 'body',
        _key: k(),
        text: 'The painting you can’t look away from. The piece of music that opens something in you. The line from a book you’ve carried for years.',
      },
      { _type: 'body', _key: k(), text: 'KALLOS is built for exactly that.' },
    ],
  },
  {
    _id: 'kallos-splash-5',
    _type: 'splashPage',
    screenNumber: 5,
    screenTitle: 'Invitation',
    blocks: [
      { _type: 'heading', _key: k(), text: 'Start where you are.' },
      { _type: 'goldRule', _key: k() },
      {
        _type: 'body',
        _key: k(),
        text: 'No preparation needed. No right way to begin. Start a 3-day journey into beauty, truth and goodness. Something new every day.',
      },
      {
        _type: 'primaryCta',
        _key: k(),
        label: 'Start here →',
        linkPath: '/journeys/beauty-truth-and-goodness',
      },
      {
        _type: 'secondaryCta',
        _key: k(),
        label: 'See today’s Pause & Ponder →',
        linkPath: '/prompt',
      },
    ],
  },
];

async function main() {
  if (!process.env.SANITY_TOKEN && !DRY_RUN) {
    console.error('❌ SANITY_TOKEN env var is required (or pass --dry-run).');
    process.exit(1);
  }

  console.log(DRY_RUN ? '🔍 DRY RUN — no changes will be made\n' : '🚀 Seeding splash screens in Sanity…\n');

  // ── List existing docs so the operator sees what's about to be replaced ─
  const existing = await client.fetch<Array<{ _id: string; screenNumber?: number; pageNumber?: number }>>(
    `*[_type == "splashPage"] { _id, screenNumber, pageNumber }`,
  );
  console.log(`Found ${existing.length} existing splashPage document(s):`);
  existing.forEach((d) => {
    const n = d.screenNumber ?? d.pageNumber ?? '?';
    console.log(`  ${d._id} (screen/page ${n})`);
  });
  console.log('');

  if (DRY_RUN) {
    console.log('📄 Would replace existing docs with these 5 screens:\n');
    screens.forEach((s) => {
      console.log(`  Screen ${s.screenNumber} — ${s.screenTitle} (${s.blocks.length} blocks)`);
      s.blocks.forEach((b) => {
        let summary: string;
        if (b._type === 'goldRule') summary = '(gold rule)';
        else if (b._type === 'featureCard') summary = `${b.label} — "${b.body.slice(0, 40)}"`;
        else if (b._type === 'primaryCta' || b._type === 'secondaryCta')
          summary = `"${b.label}" → ${b.linkPath}`;
        else summary = `"${b.text.slice(0, 60)}"`;
        console.log(`    - ${b._type}: ${summary}`);
      });
      console.log('');
    });
    console.log('✅ Dry run complete. Run without --dry-run to apply.');
    return;
  }

  // ── Delete existing (published + drafts) so the run is fully idempotent ─
  // Use a transaction so we don't leave a half-deleted state if anything fails.
  if (existing.length > 0) {
    const tx = client.transaction();
    for (const d of existing) {
      tx.delete(d._id);
      // Also clear any matching draft.
      if (!d._id.startsWith('drafts.')) tx.delete(`drafts.${d._id}`);
    }
    await tx.commit({ visibility: 'async' });
    console.log(`🗑  Deleted ${existing.length} existing splashPage doc(s).`);
  }

  // ── Create the 5 new screens ────────────────────────────────────────────
  const tx = client.transaction();
  screens.forEach((s) => tx.createOrReplace(s));
  await tx.commit();

  console.log(`✅ Seeded ${screens.length} splash screens:`);
  screens.forEach((s) => console.log(`   • ${s._id} — ${s.screenTitle}`));
  console.log('\n🎉 Done. Refresh /splash to see the Sanity-driven content.');
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
