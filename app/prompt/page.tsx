import { headers } from "next/headers";
import type { Metadata } from "next";
import PromptClient from "./PromptClient";

// ── OG metadata — date-aware so social shares always show the correct artwork ─
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}): Promise<Metadata> {
  const { date } = (await searchParams) ?? {};
  const headersList = await headers();
  const host = headersList.get("host") ?? "s-beauty-app.vercel.app";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;
  // Include the date param so every day gets its own OG image (not cached across days)
  const ogImageUrl = `${baseUrl}/prompt/opengraph-image${date ? `?date=${date}` : ""}`;

  return {
    title: "Pause & Ponder — KALLOS",
    openGraph: {
      title: "Pause & Ponder — KALLOS",
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Pause & Ponder — KALLOS",
      images: [ogImageUrl],
    },
  };
}

export default function DailyPromptPage() {
  return <PromptClient />;
}
