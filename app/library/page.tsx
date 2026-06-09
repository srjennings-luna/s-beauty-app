"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useFavorites } from "@/hooks/useFavorites";
import { getContentItemById, getDailyPromptById, getAllPrompts } from "@/lib/sanity";
import type { ContentItem, Artwork, ContentType, DailyPrompt, LocationType } from "@/lib/types";
import ArtworkViewer from "@/components/ArtworkViewer";
import PageTransition from "@/components/ui/PageTransition";
import { PromptCard } from "./PromptCard";

// Format a "2026-05" key as "MAY 2026" for the section divider.
function formatMonthLabel(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split("-");
  const d = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, 1);
  return d
    .toLocaleDateString("en-US", { month: "long", year: "numeric" })
    .toUpperCase();
}

// Visible Saved section cap on the Library landing. When saved prompts
// exceed this, the landing shows this many most-recent + a "View all
// saved (N)" link to /library/saved.
const SAVED_PREVIEW_CAP = 10;

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

// PromptCard + formatPromptDate live in ./PromptCard.tsx so the
// dedicated /library/saved page can reuse them. Keep visual changes
// there to stay in sync across both surfaces.

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

  // Group archive prompts by year-month, sorted reverse-chronological.
  // Each entry is [monthKey, prompts] e.g. ["2026-05", [...]]
  const promptsByMonth = useMemo(() => {
    const groups = new Map<string, DailyPrompt[]>();
    for (const p of allPrompts) {
      if (!p.date) continue;
      const monthKey = p.date.slice(0, 7); // "2026-05" from "2026-05-28"
      if (!groups.has(monthKey)) groups.set(monthKey, []);
      groups.get(monthKey)!.push(p);
    }
    return Array.from(groups.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [allPrompts]);

  const allMonthKeys = useMemo(
    () => promptsByMonth.map(([key]) => key),
    [promptsByMonth],
  );

  // Per-month collapse state. Default empty (all expanded) on every mount,
  // so Library always opens fully expanded. Sheri's call: predictability
  // beats efficiency at the contemplative register. No localStorage.
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());

  const toggleMonth = (key: string) => {
    setCollapsedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const allCollapsed =
    allMonthKeys.length > 0 && collapsedMonths.size === allMonthKeys.length;
  const toggleAll = () => {
    setCollapsedMonths(allCollapsed ? new Set() : new Set(allMonthKeys));
  };

  const isLoading = promptsLoading || !isLoaded || favoritesLoading;

  // ── URL-driven navigation: ?expand=june-2026#june-12 ────────────────────────
  // Used by the Explore detail card's contextual P&P link to send users
  // directly to a specific date entry in the archive. Two responsibilities:
  //   1. ?expand=<month-year> → force that accordion open even if it would
  //      otherwise be collapsed (defensive: today's default is all-expanded,
  //      but this future-proofs against any state-persistence later).
  //   2. #<month-day> hash → scroll to the matching PromptCard after async
  //      content load completes. Next.js does NOT auto-scroll to hashes once
  //      content lazy-loads via useEffect, so we do it programmatically here.
  // Read via window.location to skip the useSearchParams + Suspense dance.
  // Helper: derive "2026-06" from "june-2026".
  const monthYearToKey = (input: string): string | null => {
    const m = input.match(/^([a-z]+)-(\d{4})$/i);
    if (!m) return null;
    const [, monthName, year] = m;
    const d = new Date(`${monthName} 1, ${year}`);
    if (isNaN(d.getTime())) return null;
    const monthNum = String(d.getMonth() + 1).padStart(2, "0");
    return `${year}-${monthNum}`;
  };

  // (1) Apply ?expand once month groups are known (after prompts load).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (allMonthKeys.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const expand = params.get("expand");
    if (!expand) return;
    const key = monthYearToKey(expand);
    if (!key || !allMonthKeys.includes(key)) return;
    setCollapsedMonths((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, [allMonthKeys]);

  // (2) Programmatic hash scroll after content is in the DOM. Double rAF so
  // layout settles after the prompt list mounts; smooth scroll because the
  // jump from the top of Library to a mid-archive entry can be jarring.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isLoading) return;
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [isLoading, collapsedMonths]);

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

          {/* ── Saved P&P prompts (capped, View all link if over the cap) ─── */}
          {savedPrompts.length > 0 && (
            <section>
              <p className="text-xs tracking-widest uppercase text-sacred-gold mb-3">
                Saved
              </p>
              <div>
                {savedPrompts.slice(0, SAVED_PREVIEW_CAP).map((prompt) => (
                  <PromptCard
                    key={`saved-${prompt._id}`}
                    prompt={prompt}
                    isSaved={true}
                  />
                ))}
              </div>
              {savedPrompts.length > SAVED_PREVIEW_CAP && (
                <Link
                  href="/library/saved"
                  className="block px-5 pt-3 pb-1 text-right"
                  style={{
                    fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#C19B5F",
                  }}
                >
                  View all saved ({savedPrompts.length}) ›
                </Link>
              )}
            </section>
          )}

          {/* ── Pause & Ponder archive (grouped by month, collapsible) ─────── */}
          {allPrompts.length > 0 && (
            <section>
              {/* Section eyebrow + Collapse/Expand all link. The link only
                  surfaces once there are at least 2 months in the archive;
                  with a single month there is nothing to collapse against. */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs tracking-widest uppercase text-sacred-gold">
                  Pause &amp; Ponder
                </p>
                {allMonthKeys.length > 1 && (
                  <button
                    onClick={toggleAll}
                    className="text-[10px] tracking-widest uppercase transition-colors"
                    style={{
                      color: "rgba(193,155,95,0.7)",
                      fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                      fontWeight: 600,
                      letterSpacing: "0.16em",
                    }}
                    aria-label={allCollapsed ? "Expand all months" : "Collapse all months"}
                  >
                    {allCollapsed ? "Expand all" : "Collapse all"}
                  </button>
                )}
              </div>

              {promptsByMonth.map(([monthKey, prompts]) => {
                const isCollapsed = collapsedMonths.has(monthKey);
                return (
                  <div key={monthKey}>
                    {/* Month divider header — tappable, chevron rotates on
                        state. Hairline border on top anchors the section
                        visually without a heavy treatment. */}
                    <button
                      onClick={() => toggleMonth(monthKey)}
                      className="w-full flex items-center justify-between text-left"
                      style={{
                        padding: "16px 4px 12px",
                        background: "transparent",
                        border: "none",
                        borderTop: "0.5px solid rgba(22,17,13,0.10)",
                        cursor: "pointer",
                      }}
                      aria-expanded={!isCollapsed}
                      aria-label={`${formatMonthLabel(monthKey)}, ${isCollapsed ? "expand" : "collapse"} month`}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                          fontSize: 10,
                          fontWeight: 600,
                          letterSpacing: "0.22em",
                          textTransform: "uppercase",
                          color: "#978b7d",
                        }}
                      >
                        {formatMonthLabel(monthKey)}
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        width="14"
                        height="14"
                        style={{
                          color: "rgba(22,17,13,0.45)",
                          transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
                          transition: "transform 200ms ease",
                        }}
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>

                    {!isCollapsed && (
                      <div>
                        {prompts.map((prompt) => (
                          <PromptCard
                            key={prompt._id}
                            prompt={prompt}
                            isSaved={savedPromptIds.has(prompt._id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
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
