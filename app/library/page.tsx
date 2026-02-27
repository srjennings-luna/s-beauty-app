"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useFavorites } from "@/hooks/useFavorites";
import { getContentItemById } from "@/lib/sanity";
import type { ContentItem, Artwork, ContentType, LocationType } from "@/lib/types";
import ArtworkViewer from "@/components/ArtworkViewer";
import PageTransition from "@/components/ui/PageTransition";

const CONTENT_TYPE_TO_LOCATION: Record<ContentType, LocationType> = {
  "sacred-art": "sacred-art",
  "thinker": "architecture",
  "literature": "cultural",
  "music": "workshop",
  "food-wine": "workshop",
  "landscape": "landscape",
  "watch-listen": "cultural",
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

export default function LibraryPage() {
  const { favorites, isLoaded } = useFavorites();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Artwork | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    const ids = favorites
      .filter((f) => f.type === "contentItem" || f.type === "artwork")
      .map((f) => f.itemId);

    if (ids.length === 0) {
      setLoading(false);
      return;
    }

    Promise.all(ids.map((id) => getContentItemById(id)))
      .then((results) => {
        setItems(results.filter((item): item is ContentItem => item != null));
      })
      .catch((err) => {
        console.error("Error fetching library items:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [isLoaded, favorites]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-[#203545] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin mb-2" />
          <p className="text-white/50">Loading…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#203545] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-white/50 mb-4">Couldn't load your library.</p>
          <button
            onClick={() => { setError(false); setLoading(true); }}
            className="px-6 py-3 bg-[#C19B5F] text-[#203545] font-semibold text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#203545]">
        {/* Header */}
        <div className="px-5 pt-12 pb-6">
          <h1 className="text-3xl font-bold text-white mb-1">Library</h1>
          <p className="text-white/40 text-sm">
            {items.length} saved item{items.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="px-5 pb-28">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-white/40"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">
                Your library is empty
              </h2>
              <p className="text-white/50 mb-6 text-sm">
                Tap the heart icon on any content to save it here.
              </p>
              <Link
                href="/explore"
                className="inline-block px-6 py-3 bg-[#C19B5F] text-[#203545] font-semibold text-sm"
              >
                Explore Content
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {items.map((item) => (
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
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <h3 className="text-white text-xs font-medium line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-white/50 text-[10px] mt-0.5 line-clamp-1">
                        {item.artist ?? item.author ?? item.composer ?? item.thinkerName ?? item.locationName ?? ""}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
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
