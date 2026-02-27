"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getAllContentItems, getThemes } from "@/lib/sanity";
import type { ContentItem, Theme, ContentType, Artwork, LocationType } from "@/lib/types";
import ArtworkViewer from "@/components/ArtworkViewer";

// Dynamically import map (no SSR) — reuses existing GlobalMap component
const GlobalMap = dynamic(() => import("@/components/GlobalMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#203545]">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mb-2" />
        <p className="text-white/50 text-sm">Loading map…</p>
      </div>
    </div>
  ),
});

// ── Content type display labels ──────────────────────────────────────────────

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  "sacred-art": "Sacred Art",
  "thinker": "Thinkers",
  "literature": "Literature",
  "music": "Music",
  "food-wine": "Food & Wine",
  "landscape": "Landscape",
  "watch-listen": "Watch & Listen",
};

// Map ContentType → legacy LocationType for GlobalMap marker colours
const CONTENT_TYPE_TO_LOCATION: Record<ContentType, LocationType> = {
  "sacred-art": "sacred-art",
  "thinker": "architecture",
  "literature": "cultural",
  "music": "workshop",
  "food-wine": "workshop",
  "landscape": "landscape",
  "watch-listen": "cultural",
};

// Adapt ContentItem → Artwork shape expected by GlobalMap / ArtworkViewer
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

  const [typeFilter, setTypeFilter] = useState<ContentType | null>(null);
  const [themeFilter, setThemeFilter] = useState<string | null>(null); // theme _id
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
        setThemes(allThemes ?? []);
      } catch (err) {
        console.error("Error fetching Explore data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Apply filters
  const filtered = useMemo(() => {
    let result = content;
    if (typeFilter) result = result.filter((i) => i.contentType === typeFilter);
    if (themeFilter) result = result.filter((i) => i.themes?.some((t) => t._id === themeFilter));
    return result;
  }, [content, typeFilter, themeFilter]);

  // Only items with valid coordinates go on the map
  const mappable = useMemo(
    () => filtered.filter((i) => i.coordinates?.lat && i.coordinates?.lng),
    [filtered]
  );

  const artworks = useMemo(() => filtered.map(toArtwork), [filtered]);
  const mappableArtworks = useMemo(() => mappable.map(toArtwork), [mappable]);

  return (
    <div className="h-screen bg-[#203545] flex flex-col overflow-hidden">

      {/* ── Header ── */}
      <div className="bg-[#1a2a36] border-b border-white/10 px-4 pt-12 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">
              {showMap ? "Map" : "Explore"}
            </h1>
            <p className="text-sm text-white/40 mt-0.5">
              {loading ? "Loading…" : `${filtered.length} item${filtered.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          {/* Map / List toggle */}
          <button
            onClick={() => setShowMap((v) => !v)}
            aria-label={showMap ? "Show list view" : "Show map view"}
            className="w-10 h-10 flex items-center justify-center bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            {showMap ? (
              // List icon
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M2.625 6.75a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0A.75.75 0 018.25 6h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75zM2.625 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM7.5 12a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12A.75.75 0 017.5 12zm-4.875 5.25a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75z" clipRule="evenodd" />
              </svg>
            ) : (
              // Map icon
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M8.161 2.58a1.875 1.875 0 011.678 0l4.993 2.498c.106.052.23.052.336 0l3.869-1.935A1.875 1.875 0 0121.75 4.82v12.485c0 .71-.401 1.36-1.037 1.677l-4.875 2.437a1.875 1.875 0 01-1.676 0l-4.994-2.497a.375.375 0 00-.336 0l-3.868 1.935A1.875 1.875 0 012.25 19.18V6.695c0-.71.401-1.36 1.036-1.677l4.875-2.437zM9 6a.75.75 0 01.75.75V15a.75.75 0 01-1.5 0V6.75A.75.75 0 019 6zm6.75 3a.75.75 0 00-1.5 0v8.25a.75.75 0 001.5 0V9z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Content Type Filter ── */}
      <div className="bg-[#1a2a36] border-b border-white/10 px-4 py-2 flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setTypeFilter(null)}
            className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium tracking-wide transition-all ${
              typeFilter === null
                ? "bg-[#C19B5F] text-[#111820]"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            All
          </button>
          {(Object.entries(CONTENT_TYPE_LABELS) as [ContentType, string][]).map(([type, label]) => (
            <button
              key={type}
              onClick={() => setTypeFilter(typeFilter === type ? null : type)}
              className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium tracking-wide transition-all ${
                typeFilter === type
                  ? "bg-[#C19B5F] text-[#111820]"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Theme Filter ── */}
      {themes.length > 0 && (
        <div className="bg-[#111820]/60 border-b border-white/5 px-4 py-2 flex-shrink-0">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {themes.map((theme) => (
              <button
                key={theme._id}
                onClick={() => setThemeFilter(themeFilter === theme._id ? null : theme._id)}
                className={`flex-shrink-0 px-3 py-1 text-xs font-medium transition-all border ${
                  themeFilter === theme._id
                    ? "border-[#C19B5F] text-[#C19B5F]"
                    : "border-white/10 text-white/40 hover:border-white/30 hover:text-white/60"
                }`}
                style={themeFilter === theme._id && theme.color ? { borderColor: theme.color, color: theme.color } : {}}
              >
                {theme.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Content Area ── */}
      <div className="flex-1 relative min-h-0">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-white/30 border-t-[#C19B5F] rounded-full animate-spin mb-2" />
              <p className="text-white/50 text-sm">Loading…</p>
            </div>
          </div>
        ) : showMap ? (
          <GlobalMap
            artworks={mappableArtworks}
            onMarkerClick={(aw) => setSelectedItem(aw)}
            selectedArtwork={selectedItem}
          />
        ) : filtered.length === 0 ? (
          <div className="h-full flex items-center justify-center px-8">
            <div className="text-center">
              <p className="text-[#C19B5F] text-xs tracking-widest uppercase mb-3">Nothing here yet</p>
              <h2 className="font-serif-elegant text-xl text-white mb-2">
                {typeFilter ? CONTENT_TYPE_LABELS[typeFilter] : "Content"} is being curated
              </h2>
              <p className="text-white/40 text-sm leading-relaxed">
                Add Content Items in Sanity Studio to see them here.
              </p>
              {(typeFilter || themeFilter) && (
                <button
                  onClick={() => { setTypeFilter(null); setThemeFilter(null); }}
                  className="mt-6 px-5 py-2 border border-white/20 text-white/60 text-sm hover:border-white/40 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        ) : (
          // List view
          <div className="h-full overflow-y-auto pb-20">
            <div className="grid grid-cols-2 gap-3 p-4">
              {filtered.map((item) => (
                <button
                  key={item._id}
                  onClick={() => setSelectedItem(toArtwork(item))}
                  className="text-left artwork-card"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
                    {/* Content type badge */}
                    <div className="absolute top-2 left-2">
                      <span className="px-1.5 py-0.5 bg-black/50 backdrop-blur-sm text-white/80 text-[10px] font-medium tracking-wide">
                        {CONTENT_TYPE_LABELS[item.contentType]}
                      </span>
                    </div>
                    {/* Pray link for eligible items */}
                    {(item.contentType === "sacred-art" || item.contentType === "landscape") && (
                      <Link
                        href={`/pray/${item._id}`}
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Visio Divina prayer"
                        className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-black/40 backdrop-blur-sm text-white/70 hover:text-white transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.06l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.061zM5.404 6.464a.75.75 0 001.06-1.06L5.404 4.343a.75.75 0 10-1.06 1.06l1.06 1.061z" />
                        </svg>
                      </Link>
                    )}
                  </div>
                  <div className="mt-2 px-0.5">
                    <h3 className="text-white font-medium text-sm line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-white/40 text-xs mt-0.5 line-clamp-1">
                      {item.artist ?? item.composer ?? item.author ?? item.thinkerName ?? item.locationName ?? ""}
                    </p>
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
