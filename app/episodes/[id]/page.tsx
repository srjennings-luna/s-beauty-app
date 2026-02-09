"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getEpisodeById } from "@/lib/sanity";
import FavoriteButton from "@/components/ui/FavoriteButton";
import ArtworkViewer from "@/components/ArtworkViewer";
import { useFavorites } from "@/hooks/useFavorites";
import PageTransition from "@/components/ui/PageTransition";

interface Artwork {
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

interface Episode {
  _id: string;
  title: string;
  shortTitle: string;
  season: number;
  episodeNumber: number;
  summary: string;
  heroImageUrl: string;
  airDate: string;
  isReleased: boolean;
  youtubeUrl?: string;
  featuredExperts?: { name: string; role: string }[];
  artworks: Artwork[];
}

// Extract YouTube video ID from various URL formats
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function EpisodeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const { isFavorite } = useFavorites();

  useEffect(() => {
    async function fetchEpisode() {
      try {
        const data = await getEpisodeById(params.id as string);
        setEpisode(data);
      } catch (error) {
        console.error("Error fetching episode:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEpisode();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#203545]">
        <div className="h-[35vh] min-h-[250px] bg-white/10 skeleton" />
        <div className="px-5 pt-4">
          <div className="h-4 bg-white/10 skeleton w-3/4 mb-4" />
          <div className="h-20 bg-white/10 skeleton mb-6" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[16/9] bg-white/10 skeleton" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="min-h-screen bg-[#203545] flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-white mb-2">
            Episode not found
          </h1>
          <Link href="/" className="text-amber-500">
            Back to episodes
          </Link>
        </div>
      </div>
    );
  }

  if (!episode.isReleased) {
    router.push("/");
    return null;
  }

  // Build description with experts included
  const fullDescription = episode.summary + (
    episode.featuredExperts && episode.featuredExperts.length > 0
      ? ` Featuring ${episode.featuredExperts.map(e => `${e.name} (${e.role})`).join(', ')}.`
      : ''
  );
  const truncatedDescription = fullDescription.slice(0, 150);
  const needsTruncation = fullDescription.length > 150;

  // Convert artwork for ArtworkViewer (map _id to id for compatibility)
  const handleArtworkClick = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#203545]">
        {/* Hero Section */}
        <div className="relative h-[35vh] min-h-[250px]">
        <img
          src={episode.heroImageUrl}
          alt={episode.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#203545]" />

        {/* Back button */}
        <div className="absolute top-4 left-4 z-10">
          <Link
            href="/"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path
                fillRule="evenodd"
                d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>

        {/* Favorite button */}
        <div className="absolute top-4 right-4 z-10">
          <FavoriteButton itemId={episode._id} type="episode" />
        </div>

        {/* Episode info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <p className="text-white/60 text-sm mb-1">
            Episode {episode.episodeNumber}
          </p>
          <h1 className="text-2xl font-bold">
            {episode.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-4 pb-28">
        {/* Description with inline read more */}
        <div className="mb-6">
          <p className="text-white/60 leading-relaxed">
            {showFullDescription || !needsTruncation
              ? fullDescription
              : truncatedDescription}
            {needsTruncation && !showFullDescription && (
              <button
                onClick={() => setShowFullDescription(true)}
                className="text-amber-500 ml-1"
              >
                ...more
              </button>
            )}
            {showFullDescription && needsTruncation && (
              <button
                onClick={() => setShowFullDescription(false)}
                className="text-amber-500 ml-1"
              >
                less
              </button>
            )}
          </p>
        </div>

        {/* Watch Episode Section - YouTube */}
        {episode.youtubeUrl && getYouTubeVideoId(episode.youtubeUrl) && (
          <section className="mb-6">
            <h2 className="text-xl font-bold text-white mb-1">
              Watch Episode
            </h2>
            <p className="text-white/40 text-sm mb-4">Stream on YouTube</p>
            <div className="relative w-full aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeVideoId(episode.youtubeUrl)}`}
                title={episode.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </section>
        )}

        {/* Sacred Art Section */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-bold text-white">
              Sacred Art
            </h2>
          </div>
          <p className="text-white/40 text-sm mb-4">Meditate with sacred art</p>

          {/* Horizontal thumbnails - no rounded corners */}
          <div className="space-y-3">
            {episode.artworks?.map((artwork) => {
              const isFav = isFavorite(artwork._id, "artwork");

              return (
                <div
                  key={artwork._id}
                  onClick={() => handleArtworkClick(artwork)}
                  className="w-full text-left artwork-card cursor-pointer"
                >
                  {/* Image Container - horizontal rectangle, no rounded corners */}
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
                    {(artwork.reflectionQuestions?.length > 0 || artwork.scripturePairing) && (
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
                  <Link
                    href={`/pray/${artwork._id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1.5 inline-block text-amber-500/90 text-xs font-medium"
                  >
                    Pray with this image →
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      </div>

        {/* Fullscreen Artwork Viewer */}
        {selectedArtwork && (
          <ArtworkViewer
            artwork={{
              id: selectedArtwork._id,
              title: selectedArtwork.title,
              artist: selectedArtwork.artist,
              year: selectedArtwork.year,
              imageUrl: selectedArtwork.imageUrl,
              description: selectedArtwork.description,
              historicalSummary: selectedArtwork.historicalSummary,
              scripturePairing: selectedArtwork.scripturePairing,
              quote: selectedArtwork.quote,
              locationType: selectedArtwork.locationType,
              reflectionQuestions: selectedArtwork.reflectionQuestions || [],
              locationName: selectedArtwork.locationName,
              city: selectedArtwork.city,
              country: selectedArtwork.country,
              coordinates: selectedArtwork.coordinates,
              order: selectedArtwork.order,
              episodeId: episode._id,
            }}
            onClose={() => setSelectedArtwork(null)}
          />
        )}
      </div>
    </PageTransition>
  );
}
