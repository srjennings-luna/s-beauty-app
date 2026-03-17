/**
 * KALLOS — Update Splash Pages in Sanity
 *
 * Updates the existing splashPage documents with new KALLOS content,
 * replacing the old "Seeking Beauty" copy.
 *
 * Usage:
 *   SANITY_TOKEN=your-token npx tsx scripts/seed-splash-pages.ts
 *   SANITY_TOKEN=your-token npx tsx scripts/seed-splash-pages.ts --dry-run
 */

import { createClient } from '@sanity/client';

const DRY_RUN = process.argv.includes('--dry-run');

const client = createClient({
  projectId: 'em44j9m8',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
});

async function main() {
  console.log(DRY_RUN ? '🔍 DRY RUN — no changes will be made\n' : '🚀 Updating splash pages in Sanity...\n');

  // ── Step 1: Find existing splash page documents ──────────────────────────
  const existing = await client.fetch(`*[_type == "splashPage"] | order(pageNumber asc) { _id, pageNumber, pageType, title, quote }`);
  console.log(`Found ${existing.length} existing splash page(s):`);
  existing.forEach((p: { pageNumber: number; _id: string; pageType: string; title?: string; quote?: string }) => {
    console.log(`  Page ${p.pageNumber} (${p._id}): ${p.pageType} — "${p.title || p.quote || 'no title/quote'}"`);
  });
  console.log('');

  // ── New content ──────────────────────────────────────────────────────────

  const page1Content = {
    _type: 'splashPage',
    pageNumber: 1,
    pageType: 'image-quote',
    // heroImage: intentionally not set here — upload in Sanity Studio
    // (Replace the old Seeking Beauty promo image with a KALLOS image)
    quote: 'Beauty will save the world',
    quoteAttribution: 'Fyodor Dostoevsky',
    quoteFont: 'italic',
    // Colors — espresso mode
    bottomBackgroundColor: '#16110d',
    quoteColor: 'rgba(255,255,255,0.85)',
    attributionColor: '#C19B5F',
  };

  const page2Content = {
    _type: 'splashPage',
    pageNumber: 2,
    pageType: 'text-content',
    title: "There's a question beauty keeps asking.",
    description: "Sacred art. Music. Poetry. Storied places. A daily encounter with what's beautiful and true — and what it might be saying to you.",
    buttonText: 'Begin',
    // Colors — pure espresso, no purple gradient
    backgroundGradientStart: '#16110d',
    backgroundGradientEnd: '#16110d',
    titleColor: 'rgba(255,255,255,0.92)',
    descriptionColor: 'rgba(255,255,255,0.55)',
    buttonBackgroundColor: '#C19B5F',
    buttonTextColor: '#16110d',
  };

  if (DRY_RUN) {
    console.log('📄 Page 1 would be updated to:');
    console.log(JSON.stringify(page1Content, null, 2));
    console.log('\n📄 Page 2 would be updated to:');
    console.log(JSON.stringify(page2Content, null, 2));
    console.log('\n✅ Dry run complete. Run without --dry-run to apply.');
    return;
  }

  // ── Step 2: Update or create each page ──────────────────────────────────

  const existingPage1 = existing.find((p: { pageNumber: number }) => p.pageNumber === 1);
  const existingPage2 = existing.find((p: { pageNumber: number }) => p.pageNumber === 2);

  if (existingPage1) {
    // Patch existing — preserve heroImage if set
    await client.patch(existingPage1._id).set({
      quote: page1Content.quote,
      quoteAttribution: page1Content.quoteAttribution,
      quoteFont: page1Content.quoteFont,
      bottomBackgroundColor: page1Content.bottomBackgroundColor,
      quoteColor: page1Content.quoteColor,
      attributionColor: page1Content.attributionColor,
    }).commit();
    console.log(`✅ Page 1 updated (${existingPage1._id}) — hero image preserved`);
  } else {
    const result = await client.create({ ...page1Content, _id: 'kallos-splash-page-1' });
    console.log(`✅ Page 1 created (${result._id})`);
  }

  if (existingPage2) {
    // Replace all text fields
    await client.patch(existingPage2._id).set({
      pageType: page2Content.pageType,
      title: page2Content.title,
      description: page2Content.description,
      buttonText: page2Content.buttonText,
      backgroundGradientStart: page2Content.backgroundGradientStart,
      backgroundGradientEnd: page2Content.backgroundGradientEnd,
      titleColor: page2Content.titleColor,
      descriptionColor: page2Content.descriptionColor,
      buttonBackgroundColor: page2Content.buttonBackgroundColor,
      buttonTextColor: page2Content.buttonTextColor,
    }).commit();
    console.log(`✅ Page 2 updated (${existingPage2._id})`);
  } else {
    const result = await client.create({ ...page2Content, _id: 'kallos-splash-page-2' });
    console.log(`✅ Page 2 created (${result._id})`);
  }

  console.log('\n🎉 Done. Refresh the app to see the updated splash pages.');
  console.log('\n📌 Reminder: Upload a new hero image for Page 1 in Sanity Studio.');
  console.log('   The old Seeking Beauty promo image still needs to be replaced.');
}

main().catch(console.error);
