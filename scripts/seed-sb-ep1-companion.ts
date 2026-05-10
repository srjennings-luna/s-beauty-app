/**
 * KALLOS — Seed Seeking Beauty Episode 1: Vatican City companion journey.
 *
 * Creates three Sanity DRAFT documents (no publish):
 *   1. contentItem (sacred-art) — Casino of Pius IV
 *   2. journey (companion) — Vatican City
 *   3. journeyDay — Day 1: The garden (refs the journey + contentItem)
 *
 * Source: content-docs/KALLOS-SeekingBeauty-Ep1-Companion.html (Day 1).
 * All text fields read verbatim from the source doc; no paraphrasing.
 *
 * Sheri publishes from Studio after uploading images for the journey
 * heroImage and the journeyDay openImage. The contentItem.image is also
 * left blank for Sheri to upload.
 *
 * Usage:
 *   npx tsx scripts/seed-sb-ep1-companion.ts --dry-run
 *   npx tsx scripts/seed-sb-ep1-companion.ts
 *
 * Idempotent: uses createIfNotExists, so re-runs are no-ops if drafts
 * already exist. To re-seed from scratch, delete the drafts in Studio
 * first (or change the _ids below).
 */

import { createClient } from '@sanity/client';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const DRY_RUN = process.argv.includes('--dry-run');

// Load .env.local manually (Node does not read it by default).
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

// ─── Deterministic _ids ─────────────────────────────────────────────────────
//
// References between drafts use the base _id BUT include `_strengthenOnPublish`
// + `_weak: true`. Sanity's reference validator otherwise rejects refs to docs
// whose base _id does not yet exist (only the draft.X form exists). On publish
// of the parent doc, Sanity auto-resolves the ref to the now-published target
// and drops the strengthen flag. Pattern matches what Sanity Studio writes
// natively when you build cross-draft references in the UI.

const CONTENT_ITEM_ID = 'contentItem-sb-ep1-casino-pius-iv';
const JOURNEY_ID = 'journey-sb-ep1-vatican-city';
const JOURNEY_DAY_ID = 'journeyDay-sb-ep1-day-1';

function draftRef(id: string, type: string, key?: string) {
  const ref: Record<string, unknown> = {
    _type: 'reference',
    _ref: id,
    _weak: true,
    _strengthenOnPublish: { type },
  };
  if (key) ref._key = key;
  return ref;
}

// Beauty, Truth & Goodness theme — verified against live Sanity dataset.
const THEME_BTG_ID = 'f6bd480e-b5f9-41fb-b145-1aae0df0bc5c';

// ─── Document drafts ────────────────────────────────────────────────────────

// 1. ContentItem — Casino of Pius IV
const contentItem = {
  _id: `drafts.${CONTENT_ITEM_ID}`,
  _type: 'contentItem',
  contentType: 'sacred-art',
  title: 'Casino of Pius IV',
  artist: 'Pirro Ligorio',
  year: '1558–1562',
  themes: [
    {
      _type: 'reference',
      _ref: THEME_BTG_ID,
      _key: 'theme-btg',
    },
  ],
  description:
    'A small Renaissance villa tucked inside the Vatican Gardens, invisible from the main streets of the complex. The exterior is covered entirely in stucco figures from the ancient world. The oval courtyard at the center opens to the sky.',
  context:
    'Ligorio had spent much of his career excavating ancient Roman ruins and cataloguing what he found. His choice of the classical program for the exterior was not decorative improvisation. It was the work of someone who had spent years recovering what the ancient world had made and understood exactly what it meant.\n\nThe building is now the headquarters of the Pontifical Academy of Sciences, founded in its current form in 1936. Its members include Nobel laureates in physics, biology, and chemistry from countries around the world. Borromeo came here to ask what beauty and philosophy could tell him about God. The building he left behind became the place where the church asks what science can offer, and what the church can offer science.',
  artworkHook:
    'The exterior of the Casino is covered in figures from ancient mythology: Neptune, the Muses, Apollo, satyrs. Walk through the door and everything changes. The interior walls are entirely Christian: the life of Jesus, scenes from Genesis, the Mystic Marriage of St. Catherine. Pirro Ligorio designed both. It was not a contradiction. The classical figures outside were allegories: the ancient world’s attempt to describe what it could see of the divine. The interior names what they were pointing at.',
  locationName: 'Vatican Gardens, Vatican City',
  // image: Sheri uploads from Studio.
};

// 2. Journey — Vatican City (companion)
const journey = {
  _id: `drafts.${JOURNEY_ID}`,
  _type: 'journey',
  title: 'Vatican City',
  slug: { _type: 'slug', current: 'seeking-beauty-ep1-vatican-city' },
  theme: {
    _type: 'reference',
    _ref: THEME_BTG_ID,
  },
  journeyType: 'companion',
  showName: 'Seeking Beauty',
  episodeLabel: 'Episode 1',
  description:
    'Four stops. Four days. From the Casino of Pius IV to the Baldachin, with art historian Elizabeth Lev.',
  estimatedMinutesPerDay: 12,
  totalDays: 4,
  isPublished: false,
  order: 100,
  days: [draftRef(JOURNEY_DAY_ID, 'journeyDay', 'day-1-ref')],
  // heroImage: Sheri uploads from Studio.
};

// 3. JourneyDay — Day 1: The garden
const journeyDay = {
  _id: `drafts.${JOURNEY_DAY_ID}`,
  _type: 'journeyDay',
  journey: draftRef(JOURNEY_ID, 'journey'),
  dayNumber: 1,
  dayTitle: 'The garden',
  // openImage: Sheri uploads from Studio.
  openText:
    'Charles Borromeo was one of the most productive men in 16th-century Rome.\n\nAs Cardinal-Secretary of State to his uncle Pope Pius IV, he ran the committees of the Council of Trent during its final sessions. The Counter-Reformation was a bureaucratic project as much as a theological one: new decrees on doctrine, new standards for seminaries, new guidelines for liturgy, new expectations for bishops. Borromeo, in his mid-twenties, administered much of it.\n\nHe worked all day.\n\nAt night, he wanted to feed his soul.\n\nPius IV built his nephew a small villa in the Vatican Gardens. Not a palace. Not a residence. A place to think, to walk in the gardens with people he trusted and talk about beauty and philosophy and about God. The design was given to Pirro Ligorio, who was simultaneously serving as architect of St. Peter’s Basilica. The building was completed in 1562. Its name, in Italian, means simply: the little house.\n\nThis is where the companion journey begins. Elizabeth Lev stood here with David Henrie at the opening of the episode and said something easy to miss: beauty is not the destination. It is the calibration. A way of adjusting the eye so that what you could not see before becomes visible. Borromeo did not come to the Casino to rest from the committees. He came here to remember what the committees were for. The beauty was the reminder.',
  encounterContent: draftRef(CONTENT_ITEM_ID, 'contentItem'),
  encounterGuidance:
    'Find one classical figure on the exterior. Then step inside and look at what Ligorio put on the walls.',
  encounterNote:
    'What Borromeo and his guests practiced here belongs to a tradition most people have lost entirely: stepping out of the noise of daily work into silence and beauty, and then into conversation. Not small talk. The Socratic kind: testing ideas together, following a thought wherever it led, reasoning toward what is true and good and beautiful. The space was built for listening, for drawing closer, for asking the kind of questions about creation and the Creator that the noise of daily life makes impossible.',
  lectio: {
    philosophyQuote:
      'The encounter with the beautiful can become the wound of the arrow that strikes the heart and in this way opens our eyes, so that later, from this experience, we take the criteria for judgment and can correctly evaluate the arguments.',
    philosophySource:
      'Joseph Ratzinger (Pope Benedict XVI), "The Feeling of Things, the Contemplation of Beauty" (2002)',
    scriptureVerse:
      'One thing have I asked of the LORD, that will I seek after; that I may dwell in the house of the LORD all the days of my life, to behold the beauty of the LORD, and to inquire in his temple.',
    scriptureReference: 'Psalm 27:4, RSV-2CE',
    connectionNote:
      'Ratzinger wrote this address in 2002 for a meeting of the Pontifical Council for Culture. The word he chooses is "wound." Not "experience" or "impression" but a wound, something that enters before you have decided whether to let it. Borromeo did not come to the Casino to study beauty. He came to be changed by it, which is a different thing. The Psalm, written three thousand years before either of them, names this movement as a prayer: one desire, not many, aimed at beholding. Not analyzing, not arguing, not managing. Beholding. The word in Hebrew is chazah, which means to see with intensity. The Casino was built for that kind of seeing. This journey begins here for the same reason.',
  },
  reflectionQuestions: [
    'Borromeo worked all day on the argument for the church and came here at night for something the argument could not give him. Is there something in your own life that you work at all day but can only actually encounter in a different register?',
    'Borromeo started with beauty and arrived, eventually, at God. Think of something beautiful you have encountered, a place, a piece of music, a work of art, that opened a door you did not expect to walk through. Where did it take you?',
  ],
  connectThread:
    'Borromeo never got to see what would be built outside these walls. He died in 1584. The man who would build the most famous public space in the Western world was not born until 1598. But the question Borromeo was asking in this garden is the same question Bernini answered in stone.',
  // auditio: left blank — Sheri creates the auditio doc in Studio (Arvo Pärt
  // "Für Alina" primary or Hildegard "O Viridissima Virga" alternative,
  // per the source brief) and references it from the journeyDay.
  // goDeeper: tradition reflections come in a separate seeding pass.
};

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n=== Seed SB Ep1: Vatican City companion ${DRY_RUN ? '(DRY RUN)' : '(LIVE)'} ===\n`);

  const docs: Array<{ label: string; doc: Record<string, unknown> }> = [
    { label: 'contentItem · Casino of Pius IV', doc: contentItem },
    { label: 'journey · Vatican City', doc: journey },
    { label: 'journeyDay · Day 1 (The garden)', doc: journeyDay },
  ];

  for (const { label, doc } of docs) {
    console.log(`[${label}]`);
    console.log(`  _id: ${doc._id}`);
    if (DRY_RUN) {
      console.log('  (dry run — no write)\n');
      continue;
    }
    try {
      const result = await client.createIfNotExists(
        doc as Parameters<typeof client.createIfNotExists>[0]
      );
      console.log(`  ✓ Created (or already existed): ${result._id}\n`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ Failed: ${msg}\n`);
      throw err;
    }
  }

  console.log('=== Done ===');
  console.log('\nNext steps for Sheri (in Sanity Studio):');
  console.log('  1. Open the Vatican City journey draft, upload heroImage, set order/sort if needed.');
  console.log('  2. Open the Casino of Pius IV contentItem draft, upload image.');
  console.log('  3. Open the Day 1 journeyDay draft, upload openImage.');
  console.log('  4. Optionally create the Auditio doc (Arvo Pärt "Für Alina") and reference it from the journeyDay.');
  console.log('  5. Publish in this order: contentItem → journeyDay → journey.\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
