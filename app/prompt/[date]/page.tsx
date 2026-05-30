import type { Metadata } from "next";
import { getDailyPrompt } from "@/lib/sanity";
import PromptClient from "../PromptClient";

/**
 * Path-based alias for the P&P page: /prompt/2026-04-30.
 * The canonical user-facing URL stays /prompt?date=X (used by shared links
 * and OG metadata), but Sanity Presentation's iframe can only extract route
 * parameters from path segments — not query strings — so we expose a
 * path-based route for previewing specific drafts.
 *
 * PromptClient reads the date from `useSearchParams().get("date")` today,
 * so we redirect-free alias by not calling useSearchParams here and instead
 * letting PromptClient fall back on "today's date" is wrong. Pass the date
 * through via a URL rewrite pattern by making this component a thin wrapper
 * that pre-fills PromptClient's initial date via URL params — easiest:
 * render the client component with searchParams-style props.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string }>;
}): Promise<Metadata> {
  const { date } = await params;
  const prompt = await getDailyPrompt(date).catch(() => null);
  const rawImageUrl = prompt?.content?.imageUrl ?? "";
  const imageUrl = rawImageUrl
    ? `${rawImageUrl}?w=1200&fit=crop&auto=format`
    : "";

  return {
    title: "Pause & Ponder — CONTUERI",
    openGraph: {
      title: "Pause & Ponder — CONTUERI",
      ...(imageUrl && { images: [{ url: imageUrl, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: "Pause & Ponder — CONTUERI",
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}

export default async function DailyPromptByDatePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  return <PromptClient initialDate={date} />;
}
