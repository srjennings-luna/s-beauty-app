import { Suspense } from "react";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { getJourney, getJourneyPreview } from "@/lib/sanity";
import JourneyDetailClient from "../../JourneyDetailClient";

async function fetchJourney(slug: string) {
  const isDraft = (await draftMode()).isEnabled;
  if (isDraft) {
    const draft = await getJourneyPreview(slug).catch(() => null);
    if (draft) return draft;
  }
  return getJourney(slug);
}

/**
 * Path-based alias for journey-day deep-links:
 *   /journeys/[slug]/day/[dayNumber]
 *
 * The canonical share URL stays `/journeys/[slug]?day=N` (used by the
 * Share-this-Day button and OG metadata). This path alias exists solely
 * so Sanity Presentation can navigate its iframe to a specific day —
 * query strings get URL-encoded into the pathname and 404 inside the
 * Presentation iframe.
 *
 * JourneyDetailClient accepts `initialDayNumber` which takes precedence
 * over `?day=N` query reading.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; dayNumber: string }>;
}): Promise<Metadata> {
  const { slug, dayNumber } = await params;
  const journey = await fetchJourney(slug);
  if (!journey) return { title: "Journey — CONTUERI" };

  const dayNum = parseInt(dayNumber, 10);
  const day = journey.days?.find((d: { dayNumber: number }) => d.dayNumber === dayNum);
  if (!day) return { title: `${journey.title} — CONTUERI` };

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://kallos.app";
  const imageUrl = day.openImageUrl ?? journey.heroImageUrl ?? null;
  return {
    title: `${day.dayTitle} — CONTUERI`,
    description: `Day ${dayNum} of ${journey.title}`,
    metadataBase: new URL(siteUrl),
    openGraph: {
      title: day.dayTitle,
      description: `Day ${dayNum} of ${journey.title}`,
      url: `${siteUrl}/journeys/${slug}/day/${dayNum}`,
      siteName: "CONTUERI",
      ...(imageUrl && { images: [{ url: imageUrl, width: 1200, height: 630 }] }),
    },
  };
}

export default async function JourneyDayPage({
  params,
}: {
  params: Promise<{ slug: string; dayNumber: string }>;
}) {
  const { slug, dayNumber } = await params;
  const journey = await fetchJourney(slug);

  if (!journey) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center px-5">
        <div className="text-center">
          <p className="text-sage text-xs tracking-widest uppercase mb-3">Not found</p>
          <h2 className="text-near-black text-xl font-bold mb-4">Journey not found</h2>
          <a href="/journeys" className="text-sage-muted text-sm hover:text-near-black transition-colors">
            ← Back to journeys
          </a>
        </div>
      </div>
    );
  }

  const dayNum = parseInt(dayNumber, 10);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-parchment flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-black/10 border-t-sage rounded-full animate-spin mb-2" />
            <p className="text-sage-muted text-sm">Loading journey…</p>
          </div>
        </div>
      }
    >
      <JourneyDetailClient
        journey={journey}
        slug={slug}
        initialDayNumber={Number.isFinite(dayNum) ? dayNum : undefined}
      />
    </Suspense>
  );
}
