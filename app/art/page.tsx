"use client";

import { useState } from "react";
import { episodes } from "@/data/episodes";
import { Artwork } from "@/lib/types";
import ArtworkViewer from "@/components/ArtworkViewer";
import { useFavorites } from "@/hooks/useFavorites";
import PageTransition from "@/components/ui/PageTransition";

export default function ArtPage() {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const { isFavorite } = useFavorites();

  // Get all artworks from all episodes
  const allArtworks = episodes
    .filter((ep) => ep.isReleased)
    .flatMap((ep) => ep.artworks);

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#203545]">
        {/* Header */}
        <div className="px-5 pt-12 pb-4">
          <h1 className="text-3xl font-bold text-white mb-1">Sacred Art</h1>
          <p className="text-white/50">Meditate with sacred art</p>
        </div>

        {/* Art List - horizontal thumbnails, no rounded corners */}
        <div className="px-5 pb-28 space-y-3">
          {allArtworks.map((artwork) => {
            const isFav = isFavorite(artwork.id, "artwork");

            return (
              <button
                key={artwork.id}
                onClick={() => setSelectedArtwork(artwork)}
                className="w-full text-left artwork-card"
              >
              {/* Image Container - horizontal, no rounded corners */}
              <div className="relative aspect-[16/9] overflow-hidden">
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

              {/* Title & Location - minimal padding */}
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium text-sm line-clamp-1">
                    {artwork.title}
                  </h3>
                  <p className="text-white/40 text-xs line-clamp-1">
                    {artwork.locationName}
                  </p>
                </div>
                {(artwork.reflectionQuestions.length > 0 || artwork.scripturePairing) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedArtwork(artwork);
                    }}
                    className="ml-2 w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-white/60 flex-shrink-0"
                    aria-label="Reflect"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.462 7.462 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z" />
                    </svg>
                  </button>
                )}
              </div>
            </button>
          );
        })}
      </div>

        {/* Fullscreen Artwork Viewer */}
        {selectedArtwork && (
          <ArtworkViewer
            artwork={selectedArtwork}
            onClose={() => setSelectedArtwork(null)}
          />
        )}
      </div>
    </PageTransition>
  );
}
