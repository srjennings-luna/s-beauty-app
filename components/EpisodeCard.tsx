"use client";

import Link from "next/link";
import { Episode } from "@/lib/types";
import FavoriteButton from "./ui/FavoriteButton";

interface EpisodeCardProps {
  episode: Episode;
  variant?: "default" | "featured";
}

export default function EpisodeCard({ episode, variant = "default" }: EpisodeCardProps) {
  if (!episode.isReleased) {
    return (
      <div className="relative group">
        <div className="relative overflow-hidden rounded-2xl aspect-[4/3]">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url('${episode.heroImageUrl}')` }}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-deep-navy/60" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-4">
            <p className="text-white/60 text-xs uppercase tracking-wider font-medium">
              Episode {episode.episodeNumber}
            </p>
            <h3
              className="text-white font-bold text-xl mt-1"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {episode.shortTitle}
            </h3>
            <p className="text-white/70 text-sm mt-1 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 mr-1 opacity-70"
              >
                <path
                  fillRule="evenodd"
                  d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
                  clipRule="evenodd"
                />
              </svg>
              {episode.locationLabel.split(",")[0]}
            </p>
          </div>

          {/* Coming Soon badge with glassmorphism */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/30 shadow-lg">
              <span
                className="text-white font-semibold text-sm tracking-wide"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Coming Soon
              </span>
            </div>
          </div>

          {/* Air date badge */}
          {episode.airDate && (
            <div className="absolute top-3 left-3">
              <div className="bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                <span className="text-white/90 text-[10px] font-medium">
                  {episode.airDate}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Featured variant (larger, more prominent)
  if (variant === "featured") {
    return (
      <Link href={`/episodes/${episode.id}`} className="block group">
        <div className="relative overflow-hidden rounded-2xl aspect-[16/10]">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url('${episode.heroImageUrl}')` }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Favorite button */}
          <div className="absolute top-4 right-4 z-10">
            <FavoriteButton itemId={episode.id} type="episode" size="sm" />
          </div>

          {/* Episode badge */}
          <div className="absolute top-4 left-4">
            <div className="bg-ewtn-red px-3 py-1 rounded-full">
              <span
                className="text-white text-xs font-semibold"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Episode {episode.episodeNumber}
              </span>
            </div>
          </div>

          {/* Content with glassmorphism card */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
              <h3
                className="text-white font-bold text-2xl"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                {episode.title}
              </h3>
              <p className="text-white/80 text-sm mt-2 line-clamp-2">
                {episode.summary}
              </p>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center text-white/70 text-sm">
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
                {episode.durationMinutes && (
                  <div className="flex items-center text-white/70 text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4 mr-1"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {episode.durationMinutes} min
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default card variant
  return (
    <Link href={`/episodes/${episode.id}`} className="block group">
      <div className="relative overflow-hidden rounded-2xl aspect-[4/3] shadow-lg transition-shadow duration-300 group-hover:shadow-xl">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url('${episode.heroImageUrl}')` }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Favorite button */}
        <div className="absolute top-3 right-3 z-10">
          <FavoriteButton itemId={episode.id} type="episode" size="sm" />
        </div>

        {/* Episode number badge */}
        <div className="absolute top-3 left-3">
          <div className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/30">
            <span className="text-white text-[10px] font-semibold tracking-wide">
              EP {episode.episodeNumber}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3
            className="text-white font-bold text-xl drop-shadow-lg"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            {episode.shortTitle}
          </h3>
          <p className="text-white/80 text-sm mt-1 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4 mr-1 opacity-80"
            >
              <path
                fillRule="evenodd"
                d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
                clipRule="evenodd"
              />
            </svg>
            {episode.locationLabel.split(",")[0]}
          </p>

          {/* Artwork count pill */}
          {episode.artworks.length > 0 && (
            <div className="mt-2">
              <span className="inline-flex items-center bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full text-white text-[10px] font-medium">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-3 h-3 mr-1"
                >
                  <path
                    fillRule="evenodd"
                    d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {episode.artworks.length} artworks
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
