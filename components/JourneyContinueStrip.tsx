"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getJourneys } from "@/lib/sanity";
import type { Journey } from "@/lib/types";

// Shape of a single journey progress record in localStorage.
type ProgressRecord = {
  completedDays?: number[];
  updatedAt?: string;
};

// Pulls active journey progress from localStorage. An "active" journey
// is one with at least one completed day but not all days completed.
// Returns the slug of the journey with the most-recently-touched
// updatedAt timestamp, or null if no journey qualifies.
function pickMostRecentActiveSlug(
  journeys: Journey[],
): { slug: string; completedCount: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("kallos-journey-progress");
    if (!raw) return null;
    const data = JSON.parse(raw) as Record<string, ProgressRecord>;

    type Candidate = {
      slug: string;
      completedCount: number;
      updatedAt: string;
    };
    const candidates: Candidate[] = [];

    for (const journey of journeys) {
      const slug = journey.slug?.current;
      if (!slug) continue;
      const record = data[slug];
      if (!record) continue;
      const completedCount = record.completedDays?.length ?? 0;
      const totalDays = journey.totalDays ?? journey.days?.length ?? 0;
      if (completedCount === 0) continue;
      if (totalDays > 0 && completedCount >= totalDays) continue;
      candidates.push({
        slug,
        completedCount,
        updatedAt: record.updatedAt ?? "",
      });
    }

    if (candidates.length === 0) return null;
    candidates.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return { slug: candidates[0].slug, completedCount: candidates[0].completedCount };
  } catch {
    return null;
  }
}

// Slim banner shown above today's P&P when the user has at least one
// journey in progress. Surfaces the most-recently-touched active
// journey. Returns null when no active journey exists (new user, all
// journeys complete, etc.) so the page collapses to pure P&P.
//
// Multi-journey case is intentionally not surfaced here. The Journeys
// tab carries the full picture; the Today strip stays focused on the
// single most-recent thread to keep the contemplative landing quiet.
export default function JourneyContinueStrip() {
  const [journey, setJourney] = useState<Journey | null>(null);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const allJourneys = await getJourneys();
        if (cancelled) return;
        const pick = pickMostRecentActiveSlug(allJourneys ?? []);
        if (!pick) return;
        const matched = (allJourneys ?? []).find(
          (j) => j.slug?.current === pick.slug,
        );
        if (matched) {
          setJourney(matched);
          setCompletedCount(pick.completedCount);
        }
      } catch {
        // Silent fail. The strip is auxiliary; absence is graceful.
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!journey || !journey.slug?.current) return null;

  const totalDays = journey.totalDays ?? journey.days?.length ?? 0;
  // Next day the user has not completed. Display "DAY N OF M".
  const nextDay = totalDays > 0 ? Math.min(completedCount + 1, totalDays) : completedCount + 1;

  return (
    <Link
      href={`/journeys/${journey.slug.current}`}
      className="block w-full"
      style={{
        // Espresso surface so it reads as part of the P&P atmosphere.
        // Subtle hairline border underneath to separate the strip from
        // the gradient + P&P content below.
        background: "rgba(22,17,13,0.78)",
        borderBottom: "0.5px solid rgba(253,246,232,0.08)",
        paddingTop: "env(safe-area-inset-top, 16px)",
      }}
      aria-label={`Continue ${journey.title}, day ${nextDay} of ${totalDays}`}
    >
      <div
        className="flex items-center justify-between"
        style={{
          padding: "10px 18px 12px",
          gap: 12,
        }}
      >
        <div className="flex items-center min-w-0" style={{ gap: 10 }}>
          {/* Theme color dot. Falls back to gold if no theme color set. */}
          <span
            aria-hidden="true"
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: journey.theme?.color ?? "#C19B5F",
              flexShrink: 0,
            }}
          />
          <span
            className="truncate"
            style={{
              fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(253,246,232,0.85)",
              minWidth: 0,
            }}
          >
            Day {nextDay} of {totalDays} &middot; {journey.title}
          </span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          width="14"
          height="14"
          style={{
            color: "rgba(253,246,232,0.55)",
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </Link>
  );
}
