"use client";

import { useState, useCallback } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Artwork } from "@/lib/types";
import FavoriteButton from "./ui/FavoriteButton";
import { ReflectionQuestion } from "./ReflectionCard";

interface ArtworkViewerProps {
  artwork: Artwork;
  onClose: () => void;
}

export default function ArtworkViewer({ artwork, onClose }: ArtworkViewerProps) {
  const [showUI, setShowUI] = useState(true);
  const [showReflections, setShowReflections] = useState(false);

  const toggleUI = useCallback(() => {
    if (!showReflections) {
      setShowUI((prev) => !prev);
    }
  }, [showReflections]);

  return (
    <div className="fullscreen-viewer flex flex-col bg-black">
      {/* Header */}
      <div
        className={`absolute top-0 left-0 right-0 z-10 transition-opacity duration-300 ${
          showUI ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent safe-area-top">
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/15 backdrop-blur-md text-white border border-white/20 transition-all hover:bg-white/25"
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
      </div>

      {/* Image viewer with zoom/pan */}
      <div className="flex-1 flex items-center justify-center" onClick={toggleUI}>
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={4}
          centerOnInit
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
              alignItems: "center",
              justifyContent: "center",
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

      {/* Bottom panel - Artwork info and reflections */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-10 transition-all duration-300 ${
          showUI ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Reflections panel */}
        {showReflections && (
          <div className="bg-[#0a0a0a] rounded-t-3xl max-h-[70vh] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            {/* Header - reduced padding */}
            <div className="px-5 py-4 border-b border-white/10 sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-sm z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {artwork.title}
                  </h3>
                  {artwork.artist && (
                    <p className="text-sm text-white/50 mt-0.5">
                      {artwork.artist}{artwork.year && `, ${artwork.year}`}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowReflections(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 transition-colors"
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

            {/* Content - reduced padding */}
            <div className="px-5 py-4">
              {/* Scripture Pairing - no rounded corners, minimal padding */}
              {artwork.scripturePairing && (
                <div className="mb-6 bg-white/5 p-4 border-l-2 border-amber-500/70">
                  <p className="text-white/80 italic text-base leading-relaxed">
                    &ldquo;{artwork.scripturePairing.verse}&rdquo;
                  </p>
                  <p className="text-amber-500/80 text-sm mt-2 font-medium">
                    — {artwork.scripturePairing.reference}
                  </p>
                </div>
              )}

              {/* Historical Summary */}
              {artwork.historicalSummary && (
                <div className="mb-6">
                  <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                    Historical Context
                  </h4>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {artwork.historicalSummary}
                  </p>
                </div>
              )}

              {/* Reflection Questions */}
              {artwork.reflectionQuestions.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                    Questions for Reflection
                  </h4>
                  <div className="space-y-2">
                    {artwork.reflectionQuestions.map((question, index) => (
                      <ReflectionQuestion key={index} question={question} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info bar - simplified with title/location below, reflect icon only */}
        {!showReflections && (
          <div className="p-4 safe-area-bottom bg-gradient-to-t from-black/90 to-transparent">
            <div className="flex items-end justify-between">
              <div className="flex-1 text-white">
                <h2 className="text-lg font-semibold">
                  {artwork.title}
                </h2>
                <p className="text-white/50 text-sm mt-0.5">
                  {artwork.locationName}
                </p>
              </div>
              {(artwork.reflectionQuestions.length > 0 || artwork.scripturePairing) && (
                <button
                  onClick={() => setShowReflections(true)}
                  className="ml-4 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/20 transition-all hover:bg-white/20"
                  aria-label="Reflect"
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
          </div>
        )}
      </div>
    </div>
  );
}
