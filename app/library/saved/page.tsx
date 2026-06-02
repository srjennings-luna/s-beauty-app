"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useFavorites } from "@/hooks/useFavorites";
import { getAllPrompts } from "@/lib/sanity";
import type { DailyPrompt } from "@/lib/types";
import PageTransition from "@/components/ui/PageTransition";
import { PromptCard } from "../PromptCard";

// Dedicated page for the user's full saved Pause & Ponder list.
// Reached from the Library landing's "View all saved (N) ›" link when
// the user has more than SAVED_PREVIEW_CAP saved prompts. Renders a
// flat reverse-chronological list (by prompt date, inherited from the
// allPrompts ordering). Month grouping is intentionally not used here
// because saved prompts are a curated set, not a temporal archive.
export default function SavedLibraryPage() {
  const { favorites, isLoaded } = useFavorites();

  const [allPrompts, setAllPrompts] = useState<DailyPrompt[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getAllPrompts()
      .then(setAllPrompts)
      .catch((err) => {
        console.error("Error fetching prompts for saved page:", err);
        setError(true);
      })
      .finally(() => setPromptsLoading(false));
  }, []);

  const savedPromptIds = new Set(
    favorites.filter((f) => f.type === "dailyPrompt").map((f) => f.itemId),
  );
  const savedPrompts = allPrompts.filter((p) => savedPromptIds.has(p._id));

  const isLoading = promptsLoading || !isLoaded;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-black/10 border-t-sage rounded-full animate-spin mb-2" />
          <p className="text-sage-muted">Loading…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-sage-muted mb-4">Couldn&apos;t load your saved prompts.</p>
          <Link href="/library" className="btn-primary">
            Back to Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-parchment">
        {/* Header: back chevron + page title. The chrome row stays slim
            so the focus is the saved list below. */}
        <div
          className="px-5 pb-6"
          style={{ paddingTop: "env(safe-area-inset-top, 16px)" }}
        >
          <Link
            href="/library"
            className="inline-flex items-center gap-1 mb-3"
            style={{
              fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#7a9a8a",
            }}
            aria-label="Back to Library"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-3 h-3"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z"
                clipRule="evenodd"
              />
            </svg>
            Library
          </Link>
          <h1 className="text-3xl font-bold text-near-black">Saved</h1>
        </div>

        <div className="pb-28">
          {savedPrompts.length === 0 ? (
            <div className="text-center py-16 px-6">
              <p className="text-sage-muted text-sm">
                You haven&apos;t saved any prompts yet.
              </p>
              <Link
                href="/library"
                className="inline-block mt-4 text-sacred-gold text-xs tracking-widest uppercase font-semibold"
              >
                Back to Library ›
              </Link>
            </div>
          ) : (
            savedPrompts.map((prompt) => (
              <PromptCard key={prompt._id} prompt={prompt} isSaved={true} />
            ))
          )}
        </div>
      </div>
    </PageTransition>
  );
}
