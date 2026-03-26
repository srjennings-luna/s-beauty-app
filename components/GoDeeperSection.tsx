"use client";

import { useState, useEffect, useRef } from "react";
import { getTraditionReflections } from "@/lib/sanity";
import { defaultTraditionReflections } from "@/data/traditionReflections";
import type { TraditionReflection } from "@/lib/types";

interface GoDeeperSectionProps {
  reflections?: TraditionReflection[];
}

export default function GoDeeperSection({ reflections: propReflections }: GoDeeperSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [reflections, setReflections] = useState<TraditionReflection[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // When collapsed, reset carousel index
  useEffect(() => {
    if (!expanded) {
      setCurrentIndex(0);
    }
  }, [expanded]);

  useEffect(() => {
    if (propReflections) {
      setReflections(propReflections);
      return;
    }

    if (expanded && reflections.length === 0) {
      setLoading(true);
      getTraditionReflections()
        .then((data) => {
          const fromSanity = Array.isArray(data) ? data.slice(0, 3) : [];
          setReflections(
            fromSanity.length > 0
              ? fromSanity
              : defaultTraditionReflections.slice(0, 3)
          );
        })
        .catch(() => setReflections(defaultTraditionReflections.slice(0, 3)))
        .finally(() => setLoading(false));
    }
  }, [expanded, reflections.length, propReflections]);

  const SWIPE_THRESHOLD = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - touchStartX.current;
    const dy = endY - touchStartY.current;

    // Ignore if swipe is too small or vertical
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;

    if (dx < 0) {
      // Swipe left = next
      if (currentIndex < reflections.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    } else if (dx > 0) {
      // Swipe right = previous
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    }
  };

  const currentReflection = reflections[currentIndex];

  return (
    <div className="border-t border-white/10">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-4 flex items-center justify-between text-left"
        aria-expanded={expanded}
        aria-label={expanded ? "Collapse Go deeper" : "Go deeper – reflections from the tradition"}
      >
        <span className="text-[#C19B5F] font-semibold tracking-wide">
          Go deeper
        </span>
        <span className="text-white/50 text-sm">
          Reflections from the tradition
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`w-5 h-5 text-white/50 transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          <path
            fillRule="evenodd"
            d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-6 animate-fade-in">
          {loading ? (
            <div className="py-6 text-center text-white/50 text-sm">
              Loading…
            </div>
          ) : reflections.length === 0 ? (
            <p className="text-white/50 text-sm py-4">
              No reflections available yet. Check back later.
            </p>
          ) : (
            <>
              {/* Carousel card - swipeable */}
              <div
                className="bg-white/5 border border-white/10 p-4"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <h3 className="text-white font-semibold text-base mb-2">
                  {currentReflection.title}
                </h3>
                {currentReflection.shortQuote && (
                  <p className="font-serif-elegant italic text-white/80 text-sm border-l-2 border-[#C19B5F] pl-3 mb-2">
                    &ldquo;{currentReflection.shortQuote}&rdquo;
                  </p>
                )}
                <p className="text-white/70 text-sm leading-relaxed mb-2">
                  {currentReflection.summary}
                </p>
                <p className="text-white/40 text-xs">
                  — {currentReflection.source}
                </p>
              </div>

              {/* Dot indicators - unified design */}
              {reflections.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-4">
                  {reflections.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentIndex(i)}
                      aria-label={`Reflection ${i + 1}`}
                      className={`transition-all ${
                        i === currentIndex
                          ? "w-5 h-1.5 rounded-full bg-[#C19B5F]"
                          : "w-1.5 h-1.5 rounded-full bg-white/35"
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
