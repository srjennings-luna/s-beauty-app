"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getReleasedEpisodes } from "@/data/episodes";
import { Artwork } from "@/lib/types";

// Dynamically import the map component with no SSR
const GlobalMap = dynamic(() => import("@/components/GlobalMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-deep-navy border-t-transparent rounded-full animate-spin mb-2"></div>
        <p className="text-gray-500 text-sm">Loading map...</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [selectedEpisodeFilter, setSelectedEpisodeFilter] = useState<string | null>(null);

  const releasedEpisodes = getReleasedEpisodes();

  // Get all artworks from released episodes
  const allArtworks = useMemo(() => {
    const artworks: (Artwork & { episodeTitle: string })[] = [];
    releasedEpisodes.forEach((episode) => {
      episode.artworks.forEach((artwork) => {
        artworks.push({ ...artwork, episodeTitle: episode.shortTitle });
      });
    });
    return artworks;
  }, [releasedEpisodes]);

  // Filter artworks by episode if filter is set
  const filteredArtworks = useMemo(() => {
    if (!selectedEpisodeFilter) return allArtworks;
    return allArtworks.filter((a) => a.episodeId === selectedEpisodeFilter);
  }, [allArtworks, selectedEpisodeFilter]);

  return (
    <div className="min-h-screen bg-catskill-white flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 py-3 safe-area-top">
        <h1
          className="text-xl font-bold text-deep-navy"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          Explore Locations
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {filteredArtworks.length} artwork{filteredArtworks.length !== 1 ? "s" : ""} across Italy
        </p>
      </div>

      {/* Episode Filter Pills */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setSelectedEpisodeFilter(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedEpisodeFilter === null
                ? "bg-deep-navy text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            All
          </button>
          {releasedEpisodes.map((episode) => (
            <button
              key={episode.id}
              onClick={() => setSelectedEpisodeFilter(episode.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedEpisodeFilter === episode.id
                  ? "bg-deep-navy text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {episode.shortTitle}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <GlobalMap
          artworks={filteredArtworks}
          onMarkerClick={(artwork) => setSelectedArtwork(artwork)}
          selectedArtwork={selectedArtwork}
        />

        {/* Selected Artwork Card */}
        {selectedArtwork && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
              <div className="flex">
                <div
                  className="w-24 h-24 flex-shrink-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${selectedArtwork.imageUrl}')` }}
                />
                <div className="flex-1 p-3 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-ewtn-red font-semibold mb-0.5">
                    {(selectedArtwork as Artwork & { episodeTitle: string }).episodeTitle}
                  </p>
                  <h3
                    className="font-semibold text-deep-navy text-sm line-clamp-1"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {selectedArtwork.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                    {selectedArtwork.artist}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-3 h-3 mr-1"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {selectedArtwork.locationName}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedArtwork(null)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
              <Link
                href={`/episodes/${selectedArtwork.episodeId}`}
                className="block w-full py-2.5 text-center text-sm font-semibold text-ewtn-red border-t border-gray-100"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                View Episode
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
