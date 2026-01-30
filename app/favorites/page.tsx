"use client";

import { useState } from "react";
import Link from "next/link";
import { useFavorites } from "@/hooks/useFavorites";
import { episodes, getEpisodeById } from "@/data/episodes";
import ArtworkViewer from "@/components/ArtworkViewer";
import { Artwork, Episode } from "@/lib/types";
import PageTransition from "@/components/ui/PageTransition";

export default function FavoritesPage() {
  const { favorites, isLoaded, getByType, isFavorite } = useFavorites();
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  // Get all favorited items with their full data
  const favoritedEpisodes = getByType("episode")
    .map((fav) => getEpisodeById(fav.itemId))
    .filter((ep): ep is Episode => ep !== undefined && ep.isReleased);

  const favoritedArtworks: Artwork[] = [];
  getByType("artwork").forEach((fav) => {
    episodes.forEach((ep) => {
      const artwork = ep.artworks.find((a) => a.id === fav.itemId);
      if (artwork) favoritedArtworks.push(artwork);
    });
  });

  const isEmpty = favoritedEpisodes.length === 0 && favoritedArtworks.length === 0;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#203545] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin mb-2"></div>
          <p className="text-white/50">Loading favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#203545]">
        {/* Header */}
        <div className="px-5 pt-12 pb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Favorites</h1>
          <p className="text-white/50">
            {favorites.length} item{favorites.length !== 1 ? "s" : ""} saved
          </p>
        </div>

        {/* Content */}
        <div className="px-5 pb-28">
        {isEmpty ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
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
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">
              No favorites yet
            </h2>
            <p className="text-white/50 mb-6">
              Tap the heart icon on episodes or artworks to save them here.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-amber-500 text-black font-semibold rounded-full"
            >
              Explore Episodes
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Episodes Section */}
            {favoritedEpisodes.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-white mb-4">
                  Episodes
                </h2>
                <div className="space-y-3">
                  {favoritedEpisodes.map((episode) => (
                    <Link
                      key={episode.id}
                      href={`/episodes/${episode.id}`}
                      className="flex gap-4 bg-white/5 p-3 artwork-card"
                    >
                      <div className="w-24 h-16 overflow-hidden flex-shrink-0">
                        <img
                          src={episode.heroImageUrl}
                          alt={episode.shortTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium line-clamp-1">
                          {episode.shortTitle}
                        </h3>
                        <p className="text-white/40 text-sm mt-0.5">
                          Episode {episode.episodeNumber}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Artworks Section */}
            {favoritedArtworks.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-white mb-4">
                  Sacred Art
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {favoritedArtworks.map((artwork) => {
                    const isFav = isFavorite(artwork.id, "artwork");

                    return (
                      <button
                        key={artwork.id}
                        onClick={() => setSelectedArtwork(artwork)}
                        className="text-left artwork-card"
                      >
                        {/* Image Container */}
                        <div className="relative aspect-[16/9] overflow-hidden mb-1.5">
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
              </section>
            )}
          </div>
        )}
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
