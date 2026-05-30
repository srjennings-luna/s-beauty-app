"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useFavorites } from "@/hooks/useFavorites";
import { getContentItemById, getDailyPromptById, getAllPrompts } from "@/lib/sanity";
import type { ContentItem, Artwork, ContentType, DailyPrompt, LocationType } from "@/lib/types";
import ArtworkViewer from "@/components/ArtworkViewer";
import PageTransition from "@/components/ui/PageTransition";
import { CONTENT_TYPE_COLORS } from "@/lib/contentTypeColors";

const CONTENT_TYPE_TO_LOCATION: Record<ContentType, LocationType> = {
  "sacred-art": "sacred-art",
  "photography": "cultural",
  "thinker": "architecture",
  "literature": "cultural",
  "music": "workshop",
  "food-wine": "workshop",
  "landscape": "landscape",
  "watch-listen": "cultural",
  "math-science": "architecture",
};

function toArtwork(item: ContentItem): Artwork {
  return {
    id: item._id,
    title: item.title,
    artist: item.artist,
    year: item.year,
    imageUrl: item.imageUrl,
    description: item.description,
    historicalSummary: item.context,
    scripturePairing: item.scripturePairing,
    quote: item.quote
      ? { text: item.quote.text ?? "", attribution: item.quote.source ?? item.quote.attribution ?? "" }
      : undefined,
    locationType: CONTENT_TYPE_TO_LOCATION[item.contentType] ?? "sacred-art",
    reflectionQuestions: item.reflectionQuestions ?? [],
    locationName: item.locationName ?? "",
    city: item.city ?? "",
    country: item.country ?? "",
    coordinates: item.coordinates ?? { lat: 0, lng: 0 },
    order: 0,
  };
}

function formatPromptDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const day = d.getDate();
  return `${month} ${day}`;
}

// ── Pause & Ponder archive card ───────────────────────────────────────────────
function PromptCard({ prompt, isSaved }: { prompt: DailyPrompt; isSaved: boolean }) {
  const typeColor = CONTENT_TYPE_COLORS[prompt.content?.contentType ?? ""] ?? "#C19B5F";

  return (
    <Link
      href={prompt.date ? `/prompt?date=${prompt.date}` : "/prompt"}
      className="flex items-start gap-3 px-5 py-3"
      style={{ borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}
    >
      {prompt.content?.imageUrl && (
        <div className="flex-shrink-0 w-14 h-14 overflow-hidden">
          <img
            src={prompt.content.imageUrl}
            alt={prompt.content.title ?? ""}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {/* Date + thin right-side rule */}
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-[10px] font-semibold tracking-widest uppercase flex-shrink-0"
            style={{ color: typeColor }}
          >
            {prompt.date ? formatPromptDate(prompt.date) : "Daily Prompt"}
          </span>
          <span
            className="flex-1 h-px"
            style={{ background: typeColor, opacity: 0.35 }}
          />
          {isSaved && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-3 h-3 flex-shrink-0"
              style={{ color: typeColor }}
            >
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          )}
        </div>
        <p
          className="text-sm text-near-black line-clamp-1"
          style={{
            fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
            fontWeight: 600,
          }}
        >
          {prompt.content?.title ?? "Pause & Ponder"}
        </p>
        {prompt.promptQuestion && (
          <p
            className="text-xs text-sage-muted mt-0.5 line-clamp-2 italic"
            style={{
              fontFamily: "var(--font-open-sans), 'Open Sans', sans-serif",
            }}
          >
            {prompt.promptQuestion}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function LibraryPage() {
  const { favorites, isLoaded } = useFavorites();

  // All P&P prompts — loads independently of favorites
  const [allPrompts, setAllPrompts] = useState<DailyPrompt[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(true);

  // Saved content items (favorites only)
  const [savedItems, setSavedItems] = useState<ContentItem[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);

  const [selectedItem, setSelectedItem] = useState<Artwork | null>(null);
  const [error, setError] = useState(false);

  // Load all P&P prompts on mount
  useEffect(() => {
    getAllPrompts()
      .then(setAllPrompts)
      .catch((err) => {
        console.error("Error fetching prompts archive:", err);
      })
      .finally(() => setPromptsLoading(false));
  }, []);

  // Load favorited content items once favorites are ready
  useEffect(() => {
    if (!isLoaded) return;

    const contentIds = favorites
      .filter((f) => f.type === "contentItem" || f.type === "artwork")
      .map((f) => f.itemId);

    if (contentIds.length === 0) {
      setFavoritesLoading(false);
      return;
    }

    Promise.all(contentIds.map((id) => getContentItemById(id)))
      .then((results) => {
        setSavedItems(results.filter((item): item is ContentItem => item != null));
      })
      .catch((err) => {
        console.error("Error fetching saved content:", err);
        setError(true);
      })
      .finally(() => setFavoritesLoading(false));
  }, [isLoaded, favorites]);

  // IDs of favorited prompts
  const savedPromptIds = new Set(
    favorites.filter((f) => f.type === "dailyPrompt").map((f) => f.itemId)
  );

  const savedPrompts = allPrompts.filter((p) => savedPromptIds.has(p._id));

  // Filter state for P&P section
  const [promptFilter, setPromptFilter] = useState<"all" | "saved">("all");
  const visiblePrompts = promptFilter === "saved" ? savedPrompts : allPrompts;

  const isLoading = promptsLoading || !isLoaded || favoritesLoading;

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
          <p className="text-sage-muted mb-4">Couldn&apos;t load your library.</p>
          <button
            onClick={() => { setError(false); setFavoritesLoading(true); }}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-parchment">
        {/* Header */}
        <div
          className="px-5 pb-6"
          style={{ paddingTop: "env(safe-area-inset-top, 16px)" }}
        >
          <h1 className="text-3xl font-bold text-near-black mb-1">Library</h1>
          <p className="text-sage-muted text-sm">{" "}</p>
        </div>

        <div className="px-5 pb-28 space-y-10">

          {/* ── Pause & Ponder archive ─────────────────────────────────────── */}
          {allPrompts.length > 0 && (
            <section>
              {/* Section header + All / Saved filter */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs tracking-widest uppercase text-sacred-gold">
                  Pause &amp; Ponder
                </p>
                {savedPrompts.length > 0 && (
                  <div className="flex" style={{ border: "1px solid #e8dfc8" }}>
                    <button
                      onClick={() => setPromptFilter("all")}
                      className="px-3 py-1 text-xs tracking-widest uppercase transition-colors"
                      style={{
                        background: promptFilter === "all" ? "var(--color-gold)" : "transparent",
                        color: promptFilter === "all" ? "var(--color-parchment)" : "#9a9488",
                      }}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setPromptFilter("saved")}
                      className="px-3 py-1 text-xs tracking-widest uppercase transition-colors"
                      style={{
                        background: promptFilter === "saved" ? "var(--color-gold)" : "transparent",
                        color: promptFilter === "saved" ? "var(--color-parchment)" : "#9a9488",
                      }}
                    >
                      Saved
                    </button>
                  </div>
                )}
              </div>

              {visiblePrompts.length > 0 ? (
                <div>
                  {visiblePrompts.map((prompt) => (
                    <PromptCard
                      key={prompt._id}
                      prompt={prompt}
                      isSaved={savedPromptIds.has(prompt._id)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-sage-muted py-6 text-center">
                  No saved prompts yet — tap the heart on any prompt to save it.
                </p>
              )}
            </section>
          )}

          {/* ── Saved content items ────────────────────────────────────────── */}
          {savedItems.length > 0 && (
            <section>
              <p className="text-xs tracking-widest uppercase text-sage mb-3">
                Saved Content
              </p>
              <div className="grid grid-cols-2 gap-3">
                {savedItems.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => setSelectedItem(toArtwork(item))}
                    className="text-left artwork-card"
                    aria-label={`View ${item.title}`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <h3 className="text-white text-xs font-medium line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-white/60 text-[10px] mt-0.5 line-clamp-1">
                          {item.artist ?? item.author ?? item.composer ?? item.thinkerName ?? item.locationName ?? ""}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* ── Empty state (no prompts AND no saved content) ──────────────── */}
          {allPrompts.length === 0 && savedItems.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-black/5 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-sage-muted"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-near-black mb-2">
                Your library is empty
              </h2>
              <p className="text-sage-muted mb-6 text-sm">
                Tap the heart icon on any content or daily prompt to save it here.
              </p>
              <Link href="/explore" className="inline-block cta-inline">
                Explore Content →
              </Link>
            </div>
          )}

        </div>

        {selectedItem && (
          <ArtworkViewer artwork={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
      </div>
    </PageTransition>
  );
}
