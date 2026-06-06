"use client";

import { useState, useEffect, useRef } from "react";
import { getTraditionReflections } from "@/lib/sanity";
import { defaultTraditionReflections } from "@/data/traditionReflections";
import type { TraditionReflection } from "@/lib/types";
import NarrationButton from "@/components/NarrationButton";

interface GoDeeperSectionProps {
  reflections?: TraditionReflection[];
  /**
   * When true, render the section as a normal in-flow block (no
   * top border, no maxHeight cap on the expanded drawer). Used when
   * the section sits inside an already-scrollable parent — e.g. the
   * Visio Divina Meditate slide content, where the slide handles its
   * own overflow and an internal 35vh cap would create a nested
   * scroll trap.
   *
   * When false (default), render the section as a fixed-bottom-style
   * drawer with a top border and a 35vh cap on the expanded content,
   * so it doesn't blanket the screen.
   */
  inline?: boolean;
}

export default function GoDeeperSection({ reflections: propReflections, inline = false }: GoDeeperSectionProps) {
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
    <div className={inline ? "" : "border-t border-white/10"}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center justify-between text-left ${inline ? "py-3" : "px-4 py-4"}`}
        aria-expanded={expanded}
        aria-label={expanded ? "Collapse Go deeper" : "Go deeper – reflections from the tradition"}
      >
        {/* "Go deeper" label retired the gold treatment June 5, 2026
            per Sheri's call ("Remove GO Deeper in gold, it's jarring
            against the meditative mode"). Gold is reserved for clear
            CTA moments; this is an expandable section header.
            Switched June 6, 2026 from `rgba(253,246,232,...)` to the
            warm-cream base `rgba(232,217,184,...)` — the previous tone
            read as stark white on OLED rather than cream. Subtitle
            "Reflections from the tradition" and chevron both moved off
            `text-white/50` to the matching warm-cream at lower alpha
            so the whole row reads as a single parchment register. */}
        <span
          className="font-semibold tracking-wide"
          style={{ color: "rgba(232,217,184,0.85)" }}
        >
          Go deeper
        </span>
        <span
          className="text-sm"
          style={{ color: "rgba(232,217,184,0.55)" }}
        >
          Reflections from the tradition
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`w-5 h-5 transition-transform ${expanded ? "rotate-180" : ""}`}
          style={{ color: "rgba(232,217,184,0.55)" }}
        >
          <path
            fillRule="evenodd"
            d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* EX-01 fix (June 2, 2026): cap the expanded drawer height with
          maxHeight: 35vh + overflow-y-auto so the artwork image above
          stays visible. Previously the drawer grew to fit all carousel
          content and on shorter viewports (iPhone SE / 8) the expanded
          drawer covered the image entirely. Cap is on the expanded
          content wrapper, not the parent button, so the collapsed
          trigger row stays its natural height. Carousel content
          scrolls internally if it exceeds 35vh. */}
      {expanded && (
        <div
          className={`animate-fade-in ${inline ? "pb-4" : "px-4 pb-6 overflow-y-auto"}`}
          style={inline ? undefined : { maxHeight: "35vh" }}
        >
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
              {/* Carousel card - swipeable.
                  June 5, 2026: minHeight added so cards stay the same
                  frame size when swiping between short and long
                  reflections (some include context paragraphs,
                  others don't). The card scrolls internally if a
                  particular reflection runs longer than the frame.
                  Pairs with the X/Y counter below — the dot-
                  indicator carousel was visually competing with the
                  Stories progress segments at the top of the Visio
                  Divina header (two steppers on one page read as
                  confusion); a numeric counter retires that conflict. */}
              <div
                className="bg-white/5 border border-white/10 p-4 overflow-y-auto relative"
                style={{ minHeight: "220px" }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {/* X/Y counter — top-right corner of card.
                    Replaces the gold-pill dot row that previously sat
                    below the card and competed with the page-stepper
                    Stories segments at the top of the Visio Divina
                    header. Only shown when there's more than one
                    reflection to count. */}
                {reflections.length > 1 && (
                  <span
                    aria-label={`Reflection ${currentIndex + 1} of ${reflections.length}`}
                    className="absolute top-3 right-3 text-[10px] font-mono tracking-wider"
                    style={{ color: "rgba(253,246,232,0.55)" }}
                  >
                    {currentIndex + 1}/{reflections.length}
                  </span>
                )}
                <h3 className="text-white font-semibold text-base mb-2 pr-10">
                  {currentReflection.title}
                </h3>
                {currentReflection.shortQuote && (
                  <p className="font-serif-elegant italic text-white/80 text-sm border-l-2 border-[#C19B5F] pl-3 mb-2">
                    &ldquo;{currentReflection.shortQuote}&rdquo;
                  </p>
                )}
                {/*
                  Use inline rgba to match the C.cream baseline used by
                  context/lectio/openText (rgba(253,246,232,0.88)). Tailwind's
                  /88 opacity value isn't in the default scale and may not
                  generate, leaving the previous text-white/70 behavior.
                  Inline style guarantees the right value lands. Source byline
                  stays a step below body to preserve hierarchy.
                */}
                <p
                  className="text-sm leading-relaxed mb-2"
                  style={{ color: "rgba(253,246,232,0.88)" }}
                >
                  {currentReflection.summary}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "rgba(253,246,232,0.65)" }}
                >
                  — {currentReflection.source}
                </p>
                <div className="mt-3">
                  <NarrationButton audioUrl={currentReflection.reflectionAudioUrl} />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
