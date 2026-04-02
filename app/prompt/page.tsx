import type { Metadata } from "next";
import { getDailyPrompt } from "@/lib/sanity";
import PromptClient from "./PromptClient";

// ── OG metadata — fetches Sanity image URL directly for reliable social sharing ─
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}): Promise<Metadata> {
  const { date } = (await searchParams) ?? {};
  const prompt = await getDailyPrompt(date).catch(() => null);

  // Use Sanity CDN URL directly — fast, globally cached, no generation timeout.
  // Append ?w=1200&fit=crop&auto=format so X/Facebook get a web-optimised image,
  // not a 4500px raw file.
  const rawImageUrl = prompt?.content?.imageUrl ?? "";
  const imageUrl = rawImageUrl
    ? `${rawImageUrl}?w=1200&fit=crop&auto=format`
    : "";

  return {
    title: "Pause & Ponder — KALLOS",
    openGraph: {
      title: "Pause & Ponder — KALLOS",
      ...(imageUrl && { images: [{ url: imageUrl, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: "Pause & Ponder — KALLOS",
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}

export default function DailyPromptPage() {
  return <PromptClient />;
}
