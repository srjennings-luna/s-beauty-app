"use client";

import { useState } from "react";
import Link from "next/link";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Artwork } from "@/lib/types";
import FavoriteButton from "./ui/FavoriteButton";

interface ArtworkViewerProps {
  artwork: Artwork;
  onClose: () => void;
}

export default function ArtworkViewer({ artwork, onClose }: ArtworkViewerProps) {
  const [showReflections, setShowReflections] = useState(false);

  const hasReflectionContent = artwork.reflectionQuestions.length > 0 ||
    artwork.scripturePairing ||
    artwork.quote ||
    artwork.historicalSummary;

  // Determine if this is Sacred Art (shows scripture) or other type (shows quote)
  const isSacredArt = !artwork.locationType || artwork.locationType === 'sacred-art' || artwork.locationType === 'architecture';

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      {/* Header - fixed at top */}
      <div className="flex items-center justify-between p-4 flex-shrink-0">
        <button
          onClick={onClose}
          aria-label="Close"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <FavoriteButton itemId={artwork.id} type="artwork" />
      </div>

      {/* Image area - fills available space, image at top */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={8}
          centerOnInit={false}
          doubleClick={{
            mode: "toggle",
            step: 2,
          }}
        >
          <TransformComponent
            wrapperStyle={{
              width: "100%",
              height: "100%",
            }}
            contentStyle={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              paddingTop: "0",
            }}
          >
            <img
              src={artwork.imageUrl}
              alt={artwork.title}
              className="max-w-full max-h-full object-contain"
              draggable={false}
            />
          </TransformComponent>
        </TransformWrapper>
      </div>

      {/* Bottom panel - always visible */}
      <div className="flex-shrink-0 safe-area-bottom">
        {/* Reflections expanded panel */}
        {showReflections && (
          <div className="bg-[#203545] max-h-[60vh] overflow-y-auto border-t border-white/10">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 sticky top-0 bg-[#203545] z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {artwork.title}
                  </h3>
                  {artwork.artist && (
                    <p className="text-sm text-white/50">
                      {artwork.artist}{artwork.year && `, ${artwork.year}`}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowReflections(false)}
                  aria-label="Collapse reflection panel"
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-4 py-3 space-y-4">
              {/* Historical Context */}
              {artwork.historicalSummary && (
                <div>
                  <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">
                    History
                  </h4>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {artwork.historicalSummary}
                  </p>
                </div>
              )}

              {/* Scripture Pairing - for Sacred Art and Architecture */}
              {isSacredArt && artwork.scripturePairing && (
                <div>
                  <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">
                    Scripture
                  </h4>
                  <div className="bg-white/10 p-3 border-l-2 border-[#C19B5F]">
                    <p className="text-white/80 italic text-sm leading-relaxed">
                      &ldquo;{artwork.scripturePairing.verse}&rdquo;
                    </p>
                    <p className="text-[#C19B5F] text-xs mt-2 font-medium">
                      — {artwork.scripturePairing.reference}
                    </p>
                  </div>
                </div>
              )}

              {/* Quote - for Workshop, Cultural, Landscape types */}
              {!isSacredArt && artwork.quote && (
                <div>
                  <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">
                    Quote
                  </h4>
                  <div className="bg-white/10 p-3 border-l-2 border-[#C19B5F]">
                    <p className="text-white/80 italic text-sm leading-relaxed">
                      &ldquo;{artwork.quote.text}&rdquo;
                    </p>
                    <p className="text-[#C19B5F] text-xs mt-2 font-medium">
                      — {artwork.quote.attribution}
                    </p>
                  </div>
                </div>
              )}

              {/* Reflection Questions */}
              {artwork.reflectionQuestions.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                    Reflection Questions
                  </h4>
                  <div className="space-y-2">
                    {artwork.reflectionQuestions.map((question, index) => (
                      <p key={index} className="text-white/70 text-sm leading-relaxed">
                        • {question}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info bar - always shown when reflections not expanded */}
        {!showReflections && (
          <div className="px-4 pt-4 pb-20 bg-[#203545] border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-white font-semibold text-lg">
                  {artwork.title}
                </h2>
                {artwork.artist && (
                  <p className="text-white/60 text-sm">
                    {artwork.artist}{artwork.year && `, ${artwork.year}`}
                  </p>
                )}
                <p className="text-white/40 text-sm mt-0.5">
                  {artwork.locationName}
                </p>
              </div>
              {hasReflectionContent && (
                <button
                  onClick={() => setShowReflections(true)}
                  className="ml-3 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white"
                  aria-label="View reflection content"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.462 7.462 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z" />
                  </svg>
                </button>
              )}
            </div>
            <Link
              href={`/pray/${artwork.id}`}
              className="mt-3 inline-block text-[#C19B5F] text-sm font-medium"
            >
              Pray with this image →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
