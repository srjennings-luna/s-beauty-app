"use client";

import { useState } from "react";
import { episodes } from "@/data/episodes";
import { Artwork } from "@/lib/types";
import ArtworkViewer from "@/components/ArtworkViewer";
import { useFavorites } from "@/hooks/useFavorites";

export default function ArtPage() {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const { isFavorite } = useFavorites();

  // Get all artworks from all episodes
  const allArtworks = episodes
    .filter((ep) => ep.isReleased)
    .flatMap((ep) => ep.artworks);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Sacred Art</h1>
        <p className="text-white/50">Meditate with sacred art</p>
      </div>

      {/* Art Grid */}
      <div className="px-5 pb-28">
        <div className="grid grid-cols-2 gap-3">
          {allArtworks.map((artwork) => {
            const isFav = isFavorite(artwork.id, "artwork");

            return (
              <button
                key={artwork.id}
                onClick={() => setSelectedArtwork(artwork)}
                className="text-left"
              >
                {/* Image Container */}
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-2">
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                  />

                  {/* Only show heart if favorited */}
                  {isFav && (
                    <div className="absolute top-2 right-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5 text-red-500 drop-shadow-lg"
                      >
                        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Title & Location below image */}
                <h3 className="text-white font-medium text-sm line-clamp-1">
                  {artwork.title}
                </h3>
                <p className="text-white/40 text-xs mt-0.5 line-clamp-1">
                  {artwork.locationName}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Artwork Viewer */}
      {selectedArtwork && (
        <ArtworkViewer
          artwork={selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
        />
      )}
    </div>
  );
}
