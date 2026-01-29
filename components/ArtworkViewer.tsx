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
    <div className="fullscreen-viewer flex flex-col">
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
          <div className="bg-white rounded-t-3xl max-h-[70vh] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className="text-xl font-bold text-deep-navy"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {artwork.title}
                  </h3>
                  {artwork.artist && (
                    <p className="text-sm text-gray-500 mt-0.5">
                      {artwork.artist}{artwork.year && `, ${artwork.year}`}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowReflections(false)}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
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

            <div className="p-5">
              {/* Scripture Pairing - elegant meditation style */}
              {artwork.scripturePairing && (
                <div className="mb-8 meditation-card p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-1 self-stretch bg-gradient-to-b from-accent-gold to-accent-gold/30 rounded-full" />
                    <div>
                      <p className="scripture-verse">
                        &ldquo;{artwork.scripturePairing.verse}&rdquo;
                      </p>
                      <p className="scripture-reference mt-3">
                        — {artwork.scripturePairing.reference}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Historical Summary */}
              {artwork.historicalSummary && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-deep-navy/10 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-deep-navy">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className="text-xs font-bold text-deep-navy uppercase tracking-wider">
                      Historical Context
                    </h4>
                  </div>
                  <p className="text-gray-600 text-[15px] leading-relaxed">
                    {artwork.historicalSummary}
                  </p>
                </div>
              )}

              {/* Reflection Questions */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-ewtn-red/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-ewtn-red">
                      <path d="M10 8.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM3.293 8.293a1 1 0 011.414 0L10 13.586l5.293-5.293a1 1 0 111.414 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414z"/>
                    </svg>
                  </div>
                  <h4 className="text-xs font-bold text-deep-navy uppercase tracking-wider">
                    Questions for Reflection
                  </h4>
                </div>
                <div className="space-y-3">
                  {artwork.reflectionQuestions.map((question, index) => (
                    <ReflectionQuestion key={index} question={question} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info bar */}
        {!showReflections && (
          <div className="p-4 safe-area-bottom">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <div className="flex items-end justify-between">
                <div className="flex-1 text-white">
                  <h2
                    className="text-xl font-bold drop-shadow-lg font-serif-elegant"
                  >
                    {artwork.title}
                  </h2>
                  {artwork.artist && (
                    <p className="text-white/80 mt-1 text-sm">
                      {artwork.artist}
                      {artwork.year && ` · ${artwork.year}`}
                    </p>
                  )}
                  <p className="text-white/60 text-sm mt-2 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4 mr-1.5 opacity-80"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {artwork.locationName}
                  </p>
                </div>
                {(artwork.reflectionQuestions.length > 0 || artwork.scripturePairing) && (
                  <button
                    onClick={() => setShowReflections(true)}
                    className="ml-4 px-5 py-2.5 bg-white rounded-xl text-deep-navy text-sm font-semibold flex items-center shadow-lg transition-transform hover:scale-105"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4 mr-2 text-ewtn-red"
                    >
                      <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.462 7.462 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z" />
                    </svg>
                    Reflect
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Zoom hint - fades out after first interaction */}
      <div
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-700 ${
          showUI ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="bg-black/40 backdrop-blur-sm text-white text-sm px-5 py-2.5 rounded-full border border-white/10">
          Pinch to zoom · Double-tap to expand
        </div>
      </div>
    </div>
  );
}
