/**
 * Upload images to Sanity and update artwork documents
 */

import { createClient } from '@sanity/client';
import * as fs from 'fs';
import * as path from 'path';

const client = createClient({
  projectId: 'em44j9m8',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
});

// Map of artwork IDs to their local image paths
const artworkImages: Record<string, string> = {
  's1e01-art01': 'st-peters-square.jpg',
  's1e01-art02': 'pieta.jpg',
  's1e01-art03': 'baldacchino.jpg',
  's1e01-art04': 'st-peters-basilica.jpg',
  's1e02-art01': 'calling-of-st-matthew.jpg',
  's1e02-art02': 'caravaggio-restoration.jpg',
  's1e02-art03': 'st-peters-dome.jpg',
  's1e03-art01': 'fra-angelico-annunciation.jpg',
  's1e03-art02': 'brunelleschi-dome.jpg',
  's1e03-art03': 'florentine-goldsmith.jpg',
};

// Map of episode IDs to their hero images
const episodeImages: Record<string, string> = {
  's1e01': 'st-peters-square.jpg',
  's1e02': 'calling-of-st-matthew.jpg',
  's1e03': 'brunelleschi-dome.jpg',
};

const imagesDir = path.join(process.cwd(), 'public', 'images', 'artworks');

async function uploadImage(filename: string): Promise<string | null> {
  const filepath = path.join(imagesDir, filename);

  if (!fs.existsSync(filepath)) {
    console.log(`   ⚠ File not found: ${filename}`);
    return null;
  }

  const imageBuffer = fs.readFileSync(filepath);

  try {
    const asset = await client.assets.upload('image', imageBuffer, {
      filename: filename,
    });
    return asset._id;
  } catch (error) {
    console.error(`   ✗ Error uploading ${filename}:`, error);
    return null;
  }
}

async function uploadAllImages() {
  console.log('🖼️  Uploading images to Sanity...\n');
  console.log(`📁 Looking for images in: ${imagesDir}\n`);

  // Check if directory exists
  if (!fs.existsSync(imagesDir)) {
    console.error(`❌ Images directory not found: ${imagesDir}`);
    return;
  }

  // List available images
  const availableImages = fs.readdirSync(imagesDir);
  console.log(`📸 Found ${availableImages.length} images: ${availableImages.join(', ')}\n`);

  // Upload artwork images
  console.log('--- Uploading Artwork Images ---\n');

  for (const [artworkId, filename] of Object.entries(artworkImages)) {
    console.log(`📸 ${artworkId}: ${filename}`);

    const assetId = await uploadImage(filename);

    if (assetId) {
      // Update the artwork document with the image reference
      try {
        await client
          .patch(artworkId)
          .set({
            image: {
              _type: 'image',
              asset: {
                _type: 'reference',
                _ref: assetId,
              },
            },
          })
          .commit();
        console.log(`   ✓ Uploaded and linked to ${artworkId}`);
      } catch (error) {
        console.error(`   ✗ Error linking image to ${artworkId}:`, error);
      }
    }
  }

  // Upload episode hero images
  console.log('\n--- Uploading Episode Hero Images ---\n');

  for (const [episodeId, filename] of Object.entries(episodeImages)) {
    console.log(`📺 ${episodeId}: ${filename}`);

    const assetId = await uploadImage(filename);

    if (assetId) {
      try {
        await client
          .patch(episodeId)
          .set({
            heroImage: {
              _type: 'image',
              asset: {
                _type: 'reference',
                _ref: assetId,
              },
            },
          })
          .commit();
        console.log(`   ✓ Uploaded and linked to ${episodeId}`);
      } catch (error) {
        console.error(`   ✗ Error linking image to ${episodeId}:`, error);
      }
    }
  }

  console.log('\n✅ Image upload complete!');
}

uploadAllImages().catch(console.error);
