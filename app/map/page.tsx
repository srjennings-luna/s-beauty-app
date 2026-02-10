"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { getReleasedEpisodes } from "@/lib/sanity";
import { Artwork } from "@/lib/types";
import ArtworkViewer from "@/components/ArtworkViewer";

// Dynamically import the map component with no SSR
const GlobalMap = dynamic(() => import("@/components/GlobalMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#203545]">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mb-2"></div>
        <p className="text-white/50 text-sm">Loading map...</p>
      </div>
    </div>
  ),
});

interface SanityArtwork {
  _id: string;
  title: string;
  artist?: string;
  year?: string;
  imageUrl: string;
  description?: string;
  historicalSummary?: string;
  scripturePairing?: {
    verse: string;
    reference: string;
  };
  quote?: {
    text: string;
    attribution: string;
  };
  locationType?: 'sacred-art' | 'architecture' | 'workshop' | 'cultural' | 'landscape';
  reflectionQuestions: string[];
  locationName: string;
  city: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  order: number;
}

interface SanityEpisode {
  _id: string;
  title: string;
  shortTitle: string;
  artworks: SanityArtwork[];
}

export default function MapPage() {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [viewerArtwork, setViewerArtwork] = useState<Artwork | null>(null);
  const [selectedEpisodeFilter, setSelectedEpisodeFilter] = useState<string | null>(null);
  const [showListView, setShowListView] = useState(false);
  const [episodes, setEpisodes] = useState<SanityEpisode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEpisodes() {
      try {
        const data = await getReleasedEpisodes();
        setEpisodes(data);
      } catch (error) {
        console.error("Error fetching episodes:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEpisodes();
  }, []);

  // Get all artworks from released episodes
  const allArtworks = useMemo(() => {
    const artworks: (Artwork & { episodeTitle: string; episodeId: string })[] = [];
    episodes.forEach((episode) => {
      episode.artworks?.forEach((artwork) => {
        artworks.push({
          id: artwork._id,
          title: artwork.title,
          artist: artwork.artist,
          year: artwork.year,
          imageUrl: artwork.imageUrl,
          description: artwork.description,
          historicalSummary: artwork.historicalSummary,
          scripturePairing: artwork.scripturePairing,
          quote: artwork.quote,
          locationType: artwork.locationType,
          reflectionQuestions: artwork.reflectionQuestions || [],
          locationName: artwork.locationName,
          city: artwork.city,
          country: artwork.country,
          coordinates: artwork.coordinates,
          order: artwork.order,
          episodeId: episode._id,
          episodeTitle: episode.shortTitle,
        });
      });
    });
    return artworks;
  }, [episodes]);

  // Filter artworks by episode if filter is set
  const filteredArtworks = useMemo(() => {
    if (!selectedEpisodeFilter) return allArtworks;
    return allArtworks.filter((a) => a.episodeId === selectedEpisodeFilter);
  }, [allArtworks, selectedEpisodeFilter]);

  // Handle marker click - open ArtworkViewer directly
  const handleMarkerClick = (artwork: Artwork) => {
    setViewerArtwork(artwork);
  };

  // Handle artwork selection from list
  const handleArtworkSelect = (artwork: Artwork) => {
    setViewerArtwork(artwork);
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#203545] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mb-2"></div>
          <p className="text-white/50 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#203545] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#2a4050] border-b border-white/10 px-4 py-3 safe-area-top flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">
              {showListView ? "Sacred Art" : "Artwalk"}
            </h1>
            <p className="text-sm text-white/50 mt-0.5">
              {filteredArtworks.length} artwork{filteredArtworks.length !== 1 ? "s" : ""} across Italy
            </p>
          </div>
          {/* Toggle between map and list view */}
          <button
            onClick={() => setShowListView(!showListView)}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label={showListView ? "Show map view" : "Show list view"}
          >
            {showListView ? (
              // Map icon - when in list view, show this to switch to map
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M8.161 2.58a1.875 1.875 0 011.678 0l4.993 2.498c.106.052.23.052.336 0l3.869-1.935A1.875 1.875 0 0121.75 4.82v12.485c0 .71-.401 1.36-1.037 1.677l-4.875 2.437a1.875 1.875 0 01-1.676 0l-4.994-2.497a.375.375 0 00-.336 0l-3.868 1.935A1.875 1.875 0 012.25 19.18V6.695c0-.71.401-1.36 1.036-1.677l4.875-2.437zM9 6a.75.75 0 01.75.75V15a.75.75 0 01-1.5 0V6.75A.75.75 0 019 6zm6.75 3a.75.75 0 00-1.5 0v8.25a.75.75 0 001.5 0V9z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              // List icon - when in map view, show this to switch to list
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M2.625 6.75a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0A.75.75 0 018.25 6h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75zM2.625 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM7.5 12a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12A.75.75 0 017.5 12zm-4.875 5.25a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Episode Filter Pills */}
      <div className="bg-[#1a2a36] border-b border-white/10 px-4 py-3 flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setSelectedEpisodeFilter(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedEpisodeFilter === null
                ? "bg-white text-[#203545]"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            All
          </button>
          {episodes.map((episode) => (
            <button
              key={episode._id}
              onClick={() => setSelectedEpisodeFilter(episode._id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedEpisodeFilter === episode._id
                  ? "bg-white text-[#203545]"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              {episode.shortTitle}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area - Map or List */}
      <div className="flex-1 relative min-h-0">
        {showListView ? (
          // List View - Sacred Art Gallery
          <div className="h-full overflow-y-auto pb-20">
            <div className="px-4 py-4 space-y-4">
              {filteredArtworks.map((artwork) => (
                <div
                  key={artwork.id}
                  onClick={() => handleArtworkSelect(artwork)}
                  className="artwork-card cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Episode badge */}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-white/90 text-xs font-medium rounded">
                        {(artwork as Artwork & { episodeTitle: string }).episodeTitle}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-sm line-clamp-1">
                        {artwork.title}
                      </h3>
                      <p className="text-white/50 text-xs line-clamp-1">
                        {artwork.artist && `${artwork.artist} • `}{artwork.locationName}
                      </p>
                    </div>
                    {(artwork.reflectionQuestions.length > 0 || artwork.scripturePairing || artwork.quote) && (
                      <div className="ml-2 w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-white/60 flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.462 7.462 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Map View
          <GlobalMap
            artworks={filteredArtworks}
            onMarkerClick={handleMarkerClick}
            selectedArtwork={selectedArtwork}
          />
        )}
      </div>

      {/* Fullscreen Artwork Viewer */}
      {viewerArtwork && (
        <ArtworkViewer
          artwork={viewerArtwork}
          onClose={() => setViewerArtwork(null)}
        />
      )}
    </div>
  );
}
