import { draftMode } from "next/headers";
import {
  getArtworkById,
  getArtworkByIdPreview,
  getVisioDefaults,
  getVisioDefaultsPreview,
} from "@/lib/sanity";
import PrayClient from "./PrayClient";

/**
 * Server wrapper for the Visio Divina "Pray" page. Reads Next.js draftMode
 * and picks between the published fetch and the preview-client fetch so
 * Sanity Presentation's "Enable Drafts" flow renders unsaved edits live
 * in the iframe.
 *
 * Fetches both the artwork itself AND the visioDefaults singleton in
 * parallel — PrayClient uses the cascade artwork.customX → defaults.defaultX
 * → hardcoded last-resort to resolve the contemplative prompts on the
 * Pray + Action steps. Added June 6, 2026 (VD-ACTION-01).
 */
async function fetchArtwork(id: string) {
  const isDraft = (await draftMode()).isEnabled;
  if (isDraft) {
    const draft = await getArtworkByIdPreview(id).catch(() => null);
    if (draft) return draft;
  }
  return getArtworkById(id);
}

async function fetchVisioDefaults() {
  const isDraft = (await draftMode()).isEnabled;
  if (isDraft) {
    const draft = await getVisioDefaultsPreview().catch(() => null);
    if (draft) return draft;
  }
  return getVisioDefaults().catch(() => null);
}

export default async function PrayPage({
  params,
}: {
  params: Promise<{ artworkId: string }>;
}) {
  const { artworkId } = await params;
  // Parallel fetch — artwork + defaults are independent. defaults may be
  // null on a brand-new dataset where the singleton hasn't been created;
  // PrayClient handles that case with its hardcoded last-resort fallback.
  const [artwork, visioDefaults] = await Promise.all([
    fetchArtwork(artworkId),
    fetchVisioDefaults(),
  ]);
  return <PrayClient initialArtwork={artwork} visioDefaults={visioDefaults} />;
}
