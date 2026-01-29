"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getEpisodeById } from "@/data/episodes";
import Button from "@/components/ui/Button";
import FavoriteButton from "@/components/ui/FavoriteButton";
import ArtworkCard from "@/components/ArtworkCard";
import ArtworkViewer from "@/components/ArtworkViewer";
import ReflectionCard from "@/components/ReflectionCard";
import { Artwork } from "@/lib/types";

export default function EpisodeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  const episode = getEpisodeById(params.id as string);

  if (!episode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-deep-navy mb-2">
            Episode not found
          </h1>
          <Link href="/episodes" className="text-ewtn-red">
            Back to episodes
          </Link>
        </div>
      </div>
    );
  }

  if (!episode.isReleased) {
    router.push("/episodes");
    return null;
  }

  return (
    <div className="min-h-screen bg-catskill-white">
      {/* Hero Section */}
      <div className="relative h-[35vh] min-h-[250px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${episode.heroImageUrl}')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
        </div>

        {/* Back button */}
        <div className="absolute top-4 left-4 z-10">
          <Link
            href="/episodes"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm"
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
          <FavoriteButton itemId={episode.id} type="episode" />
        </div>

        {/* Episode info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <p className="text-white/80 text-sm mb-1">
            Episode {episode.episodeNumber}
          </p>
          <h1
            className="text-2xl font-bold mb-2"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            {episode.title}
          </h1>
          <div className="flex items-center text-white/80 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4 mr-1"
            >
              <path
                fillRule="evenodd"
                d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
                clipRule="evenodd"
              />
            </svg>
            {episode.locationLabel}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Summary */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <p className="text-gray-600 leading-relaxed">{episode.summary}</p>

          {/* Episode metadata */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-500">
            {episode.airDate && (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                  <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
                </svg>
                {episode.airDate}
              </div>
            )}
            {episode.durationMinutes && (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                </svg>
                {episode.durationMinutes} min
              </div>
            )}
          </div>
        </div>

        {/* Featured Experts */}
        {episode.featuredExperts && episode.featuredExperts.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <h3 className="text-sm font-semibold text-deep-navy uppercase tracking-wide mb-3">
              Featured Experts
            </h3>
            <div className="flex flex-wrap gap-2">
              {episode.featuredExperts.map((expert, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg px-3 py-2 flex items-center"
                >
                  <div className="w-8 h-8 rounded-full bg-deep-navy/10 flex items-center justify-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-deep-navy">
                      <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{expert.name}</p>
                    <p className="text-xs text-gray-500">{expert.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <Link href={`/episodes/${episode.id}/artwalk`} className="flex-1">
            <Button fullWidth>Start Artwalk</Button>
          </Link>
          {episode.ewtnPlusUrl && (
            <a
              href={episode.ewtnPlusUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0"
            >
              <Button variant="outline">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            </a>
          )}
        </div>

        {/* Artworks Section */}
        <section className="mb-6">
          <h2
            className="text-lg font-semibold text-deep-navy mb-3"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Artworks & Locations ({episode.artworks.length})
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {episode.artworks.map((artwork) => (
              <ArtworkCard
                key={artwork.id}
                artwork={artwork}
                showOrder
                onClick={() => setSelectedArtwork(artwork)}
              />
            ))}
          </div>
        </section>

        {/* Reflections Section */}
        {episode.reflections.length > 0 && (
          <section className="mb-6">
            <h2
              className="text-lg font-semibold text-deep-navy mb-3"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Episode Reflections
            </h2>
            <div className="space-y-3">
              {episode.reflections.map((reflection) => (
                <ReflectionCard key={reflection.id} reflection={reflection} />
              ))}
            </div>
          </section>
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
