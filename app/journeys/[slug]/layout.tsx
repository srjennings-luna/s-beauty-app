import type { Metadata } from "next";
import { getJourney } from "@/lib/sanity";

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const journey = await getJourney(slug);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://kallos.app";

  if (!journey) {
    return {
      title: "Journey — KALLOS",
      description:
        "A contemplative journey through beauty, truth, and goodness.",
    };
  }

  const pageUrl = `${siteUrl}/journeys/${slug}`;
  const imageUrl = journey.heroImageUrl ?? null;

  return {
    title: `${journey.title} — KALLOS`,
    description: journey.description,
    metadataBase: new URL(siteUrl),
    openGraph: {
      title: journey.title,
      description: journey.description,
      url: pageUrl,
      siteName: "KALLOS",
      type: "website",
      ...(imageUrl && {
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: journey.title,
          },
        ],
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

export default function JourneyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
