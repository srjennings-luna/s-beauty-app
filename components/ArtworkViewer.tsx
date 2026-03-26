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
    <div className="fixed inset-0 z-[60] flex flex-col" style={{ background: "#16110d" }}>
      {/* Header - fixed at top */}
      <div className="flex items-center justify-between p-4 flex-shrink-0">
        <button
          onClick={onClose}
          aria-label="Close"
          className="w-10 h-10 flex items-center justify-center"
          style={{ background: "rgba(253,246,232,0.1)", color: "rgba(253,246,232,0.88)" }}
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
          <div className="max-h-[60vh] overflow-y-auto" style={{ background: "#16110d", borderTop: "1px solid rgba(253,246,232,0.1)" }}>
            {/* Header */}
            <div className="px-4 py-3 sticky top-0 z-10" style={{ background: "#16110d", borderBottom: "1px solid rgba(253,246,232,0.1)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold" style={{ color: "rgba(253,246,232,0.88)" }}>
                    {artwork.title}
                  </h3>
                  {artwork.artist && (
                    <p className="text-sm" style={{ color: "rgba(253,246,232,0.5)" }}>
                      {artwork.artist}{artwork.year && `, ${artwork.year}`}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowReflections(false)}
                  aria-label="Collapse reflection panel"
                  className="w-8 h-8 flex items-center justify-center"
                  style={{ background: "rgba(253,246,232,0.1)", color: "rgba(253,246,232,0.6)" }}
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
                  <h4 className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "rgba(253,246,232,0.4)" }}>
                    Context
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(253,246,232,0.7)" }}>
                    {artwork.historicalSummary}
                  </p>
                </div>
              )}

              {/* Scripture Pairing */}
              {isSacredArt && artwork.scripturePairing && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "rgba(253,246,232,0.4)" }}>
                    Scripture
                  </h4>
                  <div className="p-3" style={{ background: "rgba(253,246,232,0.06)", borderLeft: "2px solid #C19B5F" }}>
                    <p className="italic text-sm leading-relaxed" style={{ color: "rgba(253,246,232,0.8)", fontFamily: "var(--font-cormorant)" }}>
                      &ldquo;{artwork.scripturePairing.verse}&rdquo;
                    </p>
                    <p className="text-xs mt-2" style={{ color: "#C19B5F" }}>
                      — {artwork.scripturePairing.reference}
                    </p>
                  </div>
                </div>
              )}

              {/* Quote */}
              {!isSacredArt && artwork.quote && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "rgba(253,246,232,0.4)" }}>
                    Quote
                  </h4>
                  <div className="p-3" style={{ background: "rgba(253,246,232,0.06)", borderLeft: "2px solid #C19B5F" }}>
                    <p className="italic text-sm leading-relaxed" style={{ color: "rgba(253,246,232,0.8)", fontFamily: "var(--font-cormorant)" }}>
                      &ldquo;{artwork.quote.text}&rdquo;
                    </p>
                    <p className="text-xs mt-2" style={{ color: "#C19B5F" }}>
                      — {artwork.quote.attribution}
                    </p>
                  </div>
                </div>
              )}

              {/* Reflection Questions */}
              {artwork.reflectionQuestions.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(253,246,232,0.4)" }}>
                    Reflect
                  </h4>
                  <div className="space-y-3">
                    {artwork.reflectionQuestions.map((question, index) => (
                      <p key={index} className="text-sm leading-relaxed" style={{ color: "rgba(253,246,232,0.7)" }}>
                        {question}
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
          <div className="px-4 pt-4 pb-20" style={{ background: "#16110d", borderTop: "1px solid rgba(253,246,232,0.1)" }}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-lg" style={{ color: "rgba(253,246,232,0.88)" }}>
                  {artwork.title}
                </h2>
                {artwork.artist && (
                  <p className="text-sm" style={{ color: "rgba(253,246,232,0.5)" }}>
                    {artwork.artist}{artwork.year && `, ${artwork.year}`}
                  </p>
                )}
                <p className="text-sm mt-0.5" style={{ color: "rgba(253,246,232,0.35)" }}>
                  {artwork.locationName}
                </p>
              </div>
              {hasReflectionContent && (
                <button
                  onClick={() => setShowReflections(true)}
                  className="ml-3 flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-widest uppercase"
                  style={{ background: "rgba(253,246,232,0.08)", color: "rgba(253,246,232,0.6)" }}
                  aria-label="View reflection content"
                >
                  Reflect
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3.5 h-3.5"
                  >
                    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
            <Link
              href={`/pray/${artwork.id}`}
              className="cta-inline-dark mt-3 inline-block"
            >
              Pray with this image →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
