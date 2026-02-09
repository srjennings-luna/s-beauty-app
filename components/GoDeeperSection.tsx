"use client";

import { useState, useEffect } from "react";
import { getTraditionReflections } from "@/lib/sanity";
import { defaultTraditionReflections } from "@/data/traditionReflections";
import type { TraditionReflection } from "@/lib/types";

export default function GoDeeperSection() {
  const [expanded, setExpanded] = useState(false);
  const [reflections, setReflections] = useState<TraditionReflection[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expanded && reflections.length === 0) {
      setLoading(true);
      getTraditionReflections()
        .then((data) => {
          const fromSanity = Array.isArray(data) ? data.slice(0, 3) : [];
          // Use Sanity content if any; otherwise show built-in tradition reflections
          setReflections(
            fromSanity.length > 0
              ? fromSanity
              : defaultTraditionReflections.slice(0, 3)
          );
        })
        .catch(() => setReflections(defaultTraditionReflections.slice(0, 3)))
        .finally(() => setLoading(false));
    }
  }, [expanded, reflections.length]);

  return (
    <div className="border-t border-white/10">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-4 flex items-center justify-between text-left"
        aria-expanded={expanded}
        aria-label={expanded ? "Collapse Go deeper" : "Go deeper – reflections from the tradition"}
      >
        <span className="text-amber-500/90 font-semibold tracking-wide">
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
        <div className="px-4 pb-6 space-y-4 animate-fade-in">
          {loading ? (
            <div className="py-6 text-center text-white/50 text-sm">
              Loading…
            </div>
          ) : reflections.length === 0 ? (
            <p className="text-white/50 text-sm py-4">
              No reflections available yet. Check back later.
            </p>
          ) : (
            reflections.map((r) => (
              <article
                key={r._id}
                className="bg-white/5 border border-white/10 p-4"
              >
                <h3 className="text-white font-semibold text-base mb-2">
                  {r.title}
                </h3>
                {r.shortQuote && (
                  <p className="font-serif-elegant italic text-white/80 text-sm border-l-2 border-amber-500/50 pl-3 mb-2">
                    &ldquo;{r.shortQuote}&rdquo;
                  </p>
                )}
                <p className="text-white/70 text-sm leading-relaxed mb-2">
                  {r.summary}
                </p>
                <p className="text-white/40 text-xs">
                  — {r.source}
                </p>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
}
