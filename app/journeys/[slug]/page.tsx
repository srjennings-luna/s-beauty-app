import { Suspense } from "react";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { getJourney, getJourneyPreview } from "@/lib/sanity";
import JourneyDetailClient from "./JourneyDetailClient";

/**
 * Pick between published and draft-reading fetch based on Next.js draft
 * mode. Draft mode is enabled via /api/draft when Sanity Presentation
 * calls it with a valid preview secret. If the preview fetch returns
 * null (no drafts yet), fall back to the published version so the iframe
 * doesn't show "Not found" mid-edit.
 */
async function fetchJourney(slug: string) {
  const isDraft = (await draftMode()).isEnabled;
  if (isDraft) {
    const draft = await getJourneyPreview(slug).catch(() => null);
    if (draft) return draft;
  }
  return getJourney(slug);
}

// ── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ day?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { day: dayParam } = await searchParams;
  const journey = await fetchJourney(slug);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://kallos.app";

  if (!journey) {
    return {
      title: "Journey — CONTUERI",
      description: "A contemplative journey through beauty, truth, and goodness.",
    };
  }

  // Per-day metadata when ?day=N is present
  if (dayParam) {
    const dayNum = parseInt(dayParam, 10);
    const day = journey.days?.find((d: { dayNumber: number }) => d.dayNumber === dayNum);
    if (day) {
      const pageUrl = `${siteUrl}/journeys/${slug}?day=${dayNum}`;
      const imageUrl = day.openImageUrl ?? journey.heroImageUrl ?? null;
      const description = `Day ${dayNum} of ${journey.title}`;
      return {
        title: `${day.dayTitle} — CONTUERI`,
        description,
        metadataBase: new URL(siteUrl),
        openGraph: {
          title: day.dayTitle,
          description,
          url: pageUrl,
          siteName: "CONTUERI",
          type: "website",
          ...(imageUrl && {
            images: [{ url: imageUrl, width: 1200, height: 630, alt: day.dayTitle }],
          }),
        },
        twitter: {
          card: "summary_large_image",
          title: day.dayTitle,
          description,
          ...(imageUrl && { images: [imageUrl] }),
        },
      };
    }
  }

  // Journey-level metadata
  const pageUrl = `${siteUrl}/journeys/${slug}`;
  const imageUrl = journey.heroImageUrl ?? null;
  return {
    title: `${journey.title} — CONTUERI`,
    description: journey.description,
    metadataBase: new URL(siteUrl),
    openGraph: {
      title: journey.title,
      description: journey.description,
      url: pageUrl,
      siteName: "CONTUERI",
      type: "website",
      ...(imageUrl && {
        images: [{ url: imageUrl, width: 1200, height: 630, alt: journey.title }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: journey.title,
      description: journey.description,
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function JourneyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const journey = await fetchJourney(slug);

  if (!journey) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center px-5">
        <div className="text-center">
          <p className="text-sage text-xs tracking-widest uppercase mb-3">
            Not found
          </p>
          <h2 className="text-near-black text-xl font-bold mb-4">Journey not found</h2>
          <a href="/journeys" className="text-sage-muted text-sm hover:text-near-black transition-colors">
            ← Back to journeys
          </a>
        </div>
      </div>
    );
  }

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
      <JourneyDetailClient journey={journey} slug={slug} />
    </Suspense>
  );
}
