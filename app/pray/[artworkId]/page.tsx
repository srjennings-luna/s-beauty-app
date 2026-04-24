import { draftMode } from "next/headers";
import { getArtworkById, getArtworkByIdPreview } from "@/lib/sanity";
import PrayClient from "./PrayClient";

/**
 * Server wrapper for the Visio Divina "Pray" page. Reads Next.js draftMode
 * and picks between the published fetch and the preview-client fetch so
 * Sanity Presentation's "Enable Drafts" flow renders unsaved edits live
 * in the iframe. Both fetches use the same GROQ shape (see ARTWORK_QUERY
 * in lib/sanity.ts).
 *
 * PrayClient is now a pure render component — it receives `initialArtwork`
 * pre-fetched from here. Previous client-side `getArtworkById` + loading
 * state removed.
 */
async function fetchArtwork(id: string) {
  const isDraft = (await draftMode()).isEnabled;
  if (isDraft) {
    const draft = await getArtworkByIdPreview(id).catch(() => null);
    if (draft) return draft;
  }
  return getArtworkById(id);
}

export default async function PrayPage({
  params,
}: {
  params: Promise<{ artworkId: string }>;
}) {
  const { artworkId } = await params;
  const artwork = await fetchArtwork(artworkId);
  return <PrayClient initialArtwork={artwork} />;
}
