"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getEpisodeById } from "@/data/episodes";
import ArtwalkMapWrapper from "@/components/ArtwalkMapWrapper";
import ArtworkViewer from "@/components/ArtworkViewer";
import { ArtworkCardCompact } from "@/components/ArtworkCard";
import { Artwork } from "@/lib/types";

export default function ArtwalkPage() {
  const params = useParams();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  const episode = getEpisodeById(params.id as string);

  if (!episode || !episode.isReleased) {
    router.push("/episodes");
    return null;
  }

  const artworks = episode.artworks.sort((a, b) => a.order - b.order);
  const activeArtwork = artworks[activeIndex];

  const handlePrevious = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const handleNext = () => {
    if (activeIndex < artworks.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-catskill-white">
      {/* Header */}
      <div className="bg-deep-navy text-white p-4 flex items-center justify-between flex-shrink-0 safe-area-top">
        <Link
          href={`/episodes/${episode.id}`}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20"
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
        <div className="text-center">
          <h1
            className="font-semibold"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            {episode.shortTitle} Artwalk
          </h1>
          <p className="text-white/70 text-sm">
            {activeIndex + 1} of {artworks.length}
          </p>
        </div>
        <div className="w-10" /> {/* Spacer for alignment */}
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <ArtwalkMapWrapper
          artworks={artworks}
          activeArtworkIndex={activeIndex}
          onMarkerClick={setActiveIndex}
        />

        {/* Progress indicator dots */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-md">
            {artworks.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === activeIndex
                    ? "bg-ewtn-red w-4"
                    : index < activeIndex
                    ? "bg-deep-navy"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Panel */}
      <div className="bg-white shadow-lg flex-shrink-0 safe-area-bottom">
        {/* Current Artwork Info */}
        <div className="p-4 border-b border-gray-100">
          <ArtworkCardCompact
            artwork={activeArtwork}
            isActive
            onClick={() => setSelectedArtwork(activeArtwork)}
          />
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between p-4">
          <button
            onClick={handlePrevious}
            disabled={activeIndex === 0}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
              activeIndex === 0
                ? "text-gray-300 cursor-not-allowed"
                : "text-deep-navy hover:bg-gray-100"
            }`}
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 mr-1"
            >
              <path
                fillRule="evenodd"
                d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                clipRule="evenodd"
              />
            </svg>
            Previous
          </button>

          <button
            onClick={() => setSelectedArtwork(activeArtwork)}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-ewtn-red text-white shadow-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
              <path
                fillRule="evenodd"
                d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <button
            onClick={handleNext}
            disabled={activeIndex === artworks.length - 1}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
              activeIndex === artworks.length - 1
                ? "text-gray-300 cursor-not-allowed"
                : "text-deep-navy hover:bg-gray-100"
            }`}
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Next
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 ml-1"
            >
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clipRule="evenodd"
              />
            </svg>
          </button>
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
