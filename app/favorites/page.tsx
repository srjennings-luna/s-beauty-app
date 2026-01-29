"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useFavorites } from "@/hooks/useFavorites";
import { episodes, getEpisodeById } from "@/data/episodes";
import EpisodeCard from "@/components/EpisodeCard";
import ArtworkCard from "@/components/ArtworkCard";
import ReflectionCard from "@/components/ReflectionCard";
import ArtworkViewer from "@/components/ArtworkViewer";
import { Artwork, Episode, Reflection } from "@/lib/types";

type TabType = "all" | "episodes" | "artworks" | "reflections";

export default function FavoritesPage() {
  const { favorites, isLoaded, getByType } = useFavorites();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  // Get all favorited items with their full data
  const favoritedEpisodes = useMemo(() => {
    return getByType("episode")
      .map((fav) => getEpisodeById(fav.itemId))
      .filter((ep): ep is Episode => ep !== undefined && ep.isReleased);
  }, [getByType]);

  const favoritedArtworks = useMemo(() => {
    const artworks: Artwork[] = [];
    getByType("artwork").forEach((fav) => {
      episodes.forEach((ep) => {
        const artwork = ep.artworks.find((a) => a.id === fav.itemId);
        if (artwork) artworks.push(artwork);
      });
    });
    return artworks;
  }, [getByType]);

  const favoritedReflections = useMemo(() => {
    const reflections: (Reflection & { episodeTitle: string })[] = [];
    getByType("reflection").forEach((fav) => {
      episodes.forEach((ep) => {
        const reflection = ep.reflections.find((r) => r.id === fav.itemId);
        if (reflection) {
          reflections.push({ ...reflection, episodeTitle: ep.shortTitle });
        }
      });
    });
    return reflections;
  }, [getByType]);

  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: "all", label: "All", count: favorites.length },
    { id: "episodes", label: "Episodes", count: favoritedEpisodes.length },
    { id: "artworks", label: "Artworks", count: favoritedArtworks.length },
    { id: "reflections", label: "Reflections", count: favoritedReflections.length },
  ];

  const isEmpty =
    favoritedEpisodes.length === 0 &&
    favoritedArtworks.length === 0 &&
    favoritedReflections.length === 0;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-catskill-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-deep-navy border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-gray-500">Loading favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-catskill-white">
      {/* Header */}
      <div className="bg-deep-navy text-white p-6 pb-4">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          My Favorites
        </h1>
        <p className="text-white/80">
          {favorites.length} item{favorites.length !== 1 ? "s" : ""} saved
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 sticky top-0 z-10">
        <div className="flex overflow-x-auto hide-scrollbar -mx-4 px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-ewtn-red text-ewtn-red"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id
                      ? "bg-ewtn-red/10 text-ewtn-red"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isEmpty ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8 text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </div>
            <h2
              className="text-lg font-semibold text-deep-navy mb-2"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              No favorites yet
            </h2>
            <p className="text-gray-500 mb-6">
              Tap the heart icon on episodes, artworks, or reflections to save
              them here.
            </p>
            <Link
              href="/episodes"
              className="inline-block btn-primary"
            >
              Explore Episodes
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Episodes Section */}
            {(activeTab === "all" || activeTab === "episodes") &&
              favoritedEpisodes.length > 0 && (
                <section>
                  {activeTab === "all" && (
                    <h2
                      className="text-lg font-semibold text-deep-navy mb-3"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      Episodes
                    </h2>
                  )}
                  <div className="space-y-4">
                    {favoritedEpisodes.map((episode) => (
                      <EpisodeCard key={episode.id} episode={episode} />
                    ))}
                  </div>
                </section>
              )}

            {/* Artworks Section */}
            {(activeTab === "all" || activeTab === "artworks") &&
              favoritedArtworks.length > 0 && (
                <section>
                  {activeTab === "all" && (
                    <h2
                      className="text-lg font-semibold text-deep-navy mb-3"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      Artworks
                    </h2>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {favoritedArtworks.map((artwork) => (
                      <ArtworkCard
                        key={artwork.id}
                        artwork={artwork}
                        onClick={() => setSelectedArtwork(artwork)}
                      />
                    ))}
                  </div>
                </section>
              )}

            {/* Reflections Section */}
            {(activeTab === "all" || activeTab === "reflections") &&
              favoritedReflections.length > 0 && (
                <section>
                  {activeTab === "all" && (
                    <h2
                      className="text-lg font-semibold text-deep-navy mb-3"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      Reflections
                    </h2>
                  )}
                  <div className="space-y-3">
                    {favoritedReflections.map((reflection) => (
                      <div key={reflection.id}>
                        <p
                          className="text-xs text-gray-500 mb-1 ml-1"
                          style={{ fontFamily: "Montserrat, sans-serif" }}
                        >
                          From: {reflection.episodeTitle}
                        </p>
                        <ReflectionCard reflection={reflection} />
                      </div>
                    ))}
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
  );
}
