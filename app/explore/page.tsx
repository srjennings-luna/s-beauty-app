"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getAllContentItems, getThemes } from "@/lib/sanity";
import type { ContentItem, Theme, ContentType, Artwork, LocationType } from "@/lib/types";
import ArtworkViewer from "@/components/ArtworkViewer";

// Dynamically import map (no SSR)
const GlobalMap = dynamic(() => import("@/components/GlobalMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#fdf6e8]">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-black/10 border-t-[#4a7a62] rounded-full animate-spin mb-2" />
        <p className="text-[#7a9a8a] text-sm">Loading map…</p>
      </div>
    </div>
  ),
});

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  "sacred-art": "Sacred Art",
  "thinker": "Thinkers",
  "literature": "Literature",
  "music": "Music",
  "food-wine": "Food & Wine",
  "landscape": "Landscape",
  "watch-listen": "Watch & Listen",
  "math-science": "Pattern & Proof",
};

const CONTENT_TYPE_TO_LOCATION: Record<ContentType, LocationType> = {
  "sacred-art": "sacred-art",
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

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ExplorePage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Artwork | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [items, allThemes] = await Promise.all([
          getAllContentItems(),
          getThemes(),
        ]);
        setContent(items ?? []);
        setThemes((allThemes ?? []).sort((a: Theme, b: Theme) => (a.order ?? 99) - (b.order ?? 99)));
      } catch (err) {
        console.error("Error fetching Explore data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [retryCount]);

  // Filter content by selected theme
  const filtered = useMemo(() => {
    if (!selectedTheme) return content;
    return content.filter((i) => i.themes?.some((t) => t._id === selectedTheme._id));
  }, [content, selectedTheme]);

  const mappable = useMemo(
    () => filtered.filter((i) => i.coordinates?.lat && i.coordinates?.lng),
    [filtered]
  );

  const mappableArtworks = useMemo(() => mappable.map(toArtwork), [mappable]);

  // Separate themes into populated and empty, so empty ones sort to bottom
  const { populatedThemes, emptyThemes } = useMemo(() => {
    const populated: Theme[] = [];
    const empty: Theme[] = [];
    for (const theme of themes) {
      const hasContent = content.some((i) => i.themes?.some((t) => t._id === theme._id));
      if (hasContent) populated.push(theme);
      else empty.push(theme);
    }
    return { populatedThemes: populated, emptyThemes: empty };
  }, [themes, content]);

  const headerTitle = showMap ? "Map" : selectedTheme ? selectedTheme.title : "Explore";

  return (
    <div className="h-screen bg-[#fdf6e8] flex flex-col overflow-hidden">

      {/* ── Header ── */}
      <div className="bg-[#fdf6e8] border-b border-black/8 px-4 pt-12 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Back button when a theme is selected */}
            {selectedTheme && !showMap && (
              <button
                onClick={() => setSelectedTheme(null)}
                aria-label="Back to themes"
                className="w-8 h-8 flex items-center justify-center text-[#1a1a1a]/50 hover:text-[#1a1a1a] transition-colors -ml-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-[#1a1a1a]">{headerTitle}</h1>
              {selectedTheme && !showMap && (
                <p className="text-xs text-[#7a9a8a] mt-0.5 italic">{selectedTheme.question}</p>
              )}
            </div>
          </div>

          {/* Map / List toggle */}
          <button
            onClick={() => setShowMap((v) => !v)}
            aria-label={showMap ? "Show list view" : "Show map view"}
            className="w-10 h-10 flex items-center justify-center bg-black/5 text-[#1a1a1a]/60 hover:bg-black/10 transition-colors"
          >
            {showMap ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M2.625 6.75a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0A.75.75 0 018.25 6h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75zM2.625 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM7.5 12a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12A.75.75 0 017.5 12zm-4.875 5.25a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M8.161 2.58a1.875 1.875 0 011.678 0l4.993 2.498c.106.052.23.052.336 0l3.869-1.935A1.875 1.875 0 0121.75 4.82v12.485c0 .71-.401 1.36-1.037 1.677l-4.875 2.437a1.875 1.875 0 01-1.676 0l-4.994-2.497a.375.375 0 00-.336 0l-3.868 1.935A1.875 1.875 0 012.25 19.18V6.695c0-.71.401-1.36 1.036-1.677l4.875-2.437zM9 6a.75.75 0 01.75.75V15a.75.75 0 01-1.5 0V6.75A.75.75 0 019 6zm6.75 3a.75.75 0 00-1.5 0v8.25a.75.75 0 001.5 0V9z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="flex-1 relative min-h-0">
        {error ? (
          <div className="h-full flex items-center justify-center px-8">
            <div className="text-center">
              <p className="text-[#7a9a8a] mb-4">Couldn&apos;t load content.</p>
              <button
                onClick={() => { setError(false); setLoading(true); setRetryCount((c) => c + 1); }}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-black/10 border-t-[#4a7a62] rounded-full animate-spin mb-2" />
              <p className="text-[#7a9a8a] text-sm">Loading…</p>
            </div>
          </div>
        ) : showMap ? (
          <GlobalMap
            artworks={mappableArtworks}
            onMarkerClick={(aw) => setSelectedItem(aw)}
            selectedArtwork={selectedItem}
          />
        ) : !selectedTheme ? (

          // ── Theme Cards Landing ──────────────────────────────────────────
          <div className="h-full overflow-y-auto pb-20">
            <div className="px-4 pt-5 pb-3">
              <p className="text-sm text-[#7a9a8a]">What are you drawn to?</p>
            </div>
            <div className="grid grid-cols-2 gap-3 px-4 pb-6">
              {/* Populated themes — tappable */}
              {populatedThemes.map((theme) => (
                <button
                  key={theme._id}
                  onClick={() => setSelectedTheme(theme)}
                  className="text-left relative overflow-hidden aspect-[3/2] flex flex-col justify-end p-3"
                  style={{ backgroundColor: theme.color ?? "#4a7a62" }}
                >
                  {theme.imageUrl && (
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${theme.imageUrl})` }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="relative z-10">
                    <h2 className="text-white font-semibold text-sm tracking-wide leading-tight">
                      {theme.title}
                    </h2>
                    <p className="text-white/70 text-[11px] mt-0.5 italic leading-snug line-clamp-2">
                      {theme.question}
                    </p>
                  </div>
                </button>
              ))}
              {/* Empty themes — non-tappable, grayed out, sorted to bottom */}
              {emptyThemes.map((theme) => (
                <div
                  key={theme._id}
                  aria-disabled="true"
                  className="relative overflow-hidden aspect-[3/2] flex flex-col justify-end p-3 opacity-35 grayscale pointer-events-none select-none"
                  style={{ backgroundColor: theme.color ?? "#4a7a62" }}
                >
                  {theme.imageUrl && (
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${theme.imageUrl})` }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="relative z-10">
                    <h2 className="text-white font-semibold text-sm tracking-wide leading-tight">
                      {theme.title}
                    </h2>
                    <p className="text-white/60 text-[10px] mt-0.5 tracking-widest uppercase">
                      Coming soon
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        ) : (

          // ── Themed Content Feed ──────────────────────────────────────────
          <div className="h-full overflow-y-auto pb-20">
            <div className="flex flex-col gap-4 px-4 pt-4">
              {filtered.map((item) => (
                <button
                  key={item._id}
                  onClick={() => setSelectedItem(toArtwork(item))}
                  className="text-left w-full"
                >
                  <div className="relative aspect-[16/9] overflow-hidden w-full">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent" />
                    {/* Content type badge */}
                    <div className="absolute top-2 left-2">
                      <span className="px-1.5 py-0.5 bg-black/50 backdrop-blur-sm text-white/80 text-[10px] font-medium tracking-wide">
                        {CONTENT_TYPE_LABELS[item.contentType]}
                      </span>
                    </div>
                    {/* Visio Divina link */}
                    {(item.contentType === "sacred-art" || item.contentType === "landscape") && (
                      <Link
                        href={`/pray/${item._id}`}
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Visio Divina prayer"
                        className="absolute top-1 right-1 w-11 h-11 flex items-center justify-center bg-black/40 backdrop-blur-sm text-white/70 hover:text-white transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.06l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.061zM5.404 6.464a.75.75 0 001.06-1.06L5.404 4.343a.75.75 0 10-1.06 1.06l1.06 1.061z" />
                        </svg>
                      </Link>
                    )}
                  </div>
                  <div className="mt-2 px-0.5">
                    <h3 className="text-[#1a1a1a] font-medium text-sm">
                      {item.title}
                    </h3>
                    <p className="text-[#7a9a8a] text-xs mt-0.5">
                      {item.artist ?? item.composer ?? item.author ?? item.thinkerName ?? item.locationName ?? ""}
                    </p>
                    {item.description && (
                      <p className="text-[#5a4a3a] text-xs mt-1.5 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Content Detail Viewer ── */}
      {selectedItem && (
        <ArtworkViewer artwork={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}
