"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageTransition from "@/components/ui/PageTransition";
import JourneyDaySteps from "@/components/JourneyDaySteps";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import type { Journey, JourneyDay, PlannedDay } from "@/lib/types";

// Progress read/write moved to the auth-ready data layer June 2, 2026.
// The useJourneyProgress hook (hooks/useJourneyProgress.ts) wraps
// lib/userData.ts. Today reads/writes flow through localStorage with
// the existing kallos-journey-progress key; when auth ships, the same
// hook resolves from the authenticated user record without changing
// this component.

// ── Day row ──────────────────────────────────────────────────────────────────

function DayRow({
  day,
  isComplete,
  isActive,
  onOpen,
  onShare,
}: {
  day: JourneyDay;
  isComplete: boolean;
  isActive: boolean;
  onOpen: () => void;
  onShare: () => void;
}) {
  return (
    <button
      className={`w-full flex items-center gap-4 px-5 py-4 text-left border-l-2 transition-colors bg-white border-b border-black/5 ${
        isComplete ? "border-l-sage" : "border-l-black/8"
      }`}
      onClick={onOpen}
    >
      <div
        className={`flex-shrink-0 w-9 h-9 flex items-center justify-center text-sm font-bold border transition-colors ${
          isComplete
            ? "border-sage text-sage bg-sage/8"
            : isActive
            ? "border-near-black/40 text-near-black"
            : "border-black/10 text-sage-muted"
        }`}
      >
        {isComplete ? "✓" : day.dayNumber}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sage-muted text-xs tracking-widest uppercase mb-0.5">
          Day {day.dayNumber}
        </p>
        <h3
          className={`font-semibold text-sm line-clamp-1 transition-colors ${
            isActive || isComplete ? "text-near-black" : "text-sage-muted"
          }`}
        >
          {day.dayTitle}
        </h3>
      </div>

      <div className="flex-shrink-0 flex items-center gap-1">
        <button
          onClick={(e) => { e.stopPropagation(); onShare(); }}
          className="w-8 h-8 flex items-center justify-center text-[#b0c4b8] hover:text-sage transition-colors"
          aria-label={`Share Day ${day.dayNumber}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
          </svg>
        </button>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4 text-sage-muted"
        >
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </button>
  );
}

// ── Locked day row ───────────────────────────────────────────────────────────

function LockedDayRow({ planned }: { planned: PlannedDay }) {
  return (
    <div className="w-full flex items-center gap-4 px-5 py-4 text-left border-l-2 border-b border-black/5 border-l-black/8 opacity-35 select-none">
      <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-sm font-bold border border-black/10 text-sage-muted">
        {planned.dayNumber}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sage-muted text-xs tracking-widest uppercase mb-0.5">
          Day {planned.dayNumber}
        </p>
        <h3 className="font-semibold text-sm line-clamp-1 text-sage-muted">
          {planned.dayTitle}
        </h3>
      </div>

      <div className="flex-shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4 text-sage-muted"
        >
          <path
            fillRule="evenodd"
            d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
}

// ── Client component ─────────────────────────────────────────────────────────

export default function JourneyDetailClient({
  journey,
  slug,
  initialDayNumber,
}: {
  journey: Journey;
  slug: string;
  /**
   * Optional: when present (from the /journeys/[slug]/day/[n] path alias used
   * by Sanity Presentation), preselect that day on mount. Takes precedence
   * over ?day=N query param. Presentation can't carry query strings cleanly
   * through its iframe — path segments are the safe form.
   */
  initialDayNumber?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { completedDays, markDayComplete } = useJourneyProgress(slug);
  const [activeDay, setActiveDay] = useState<JourneyDay | null>(null);

  // Open day from URL on mount (progress comes from the hook).
  useEffect(() => {
    const dayNumFromPath = initialDayNumber;
    const dayParam = dayNumFromPath ?? parseInt(searchParams.get("day") ?? "", 10);
    if (Number.isFinite(dayParam)) {
      const day = journey.days?.find((d) => d.dayNumber === dayParam) ?? null;
      if (day) setActiveDay(day);
    }
  }, [slug, journey.days, searchParams, initialDayNumber]);

  const openDay = useCallback(
    (day: JourneyDay) => {
      setActiveDay(day);
      router.replace(`/journeys/${slug}?day=${day.dayNumber}`, { scroll: false });
    },
    [router, slug],
  );

  const closeDay = useCallback(() => {
    setActiveDay(null);
    router.replace(`/journeys/${slug}`, { scroll: false });
  }, [router, slug]);

  const toggleDayComplete = useCallback(
    (dayNumber: number) => {
      markDayComplete(dayNumber);
    },
    [markDayComplete],
  );

  // ── Derived values ─────────────────────────────────────────────────────────

  const completedCount = completedDays.length;

  const builtDayNumbers = new Set((journey.days ?? []).map((d) => d.dayNumber));
  const lockedDays: PlannedDay[] = (journey.plannedDays ?? []).filter(
    (p) => !builtDayNumbers.has(p.dayNumber),
  );
  const totalDays = journey.totalDays ?? (builtDayNumbers.size + lockedDays.length || 7);
  const progressPct = Math.round((completedCount / totalDays) * 100);
  const nextDay = journey.days?.find((d) => !completedDays.includes(d.dayNumber));

  // ── Day stepper (full-screen) ──────────────────────────────────────────────

  if (activeDay) {
    const nextDayInSequence = journey.days?.find(
      (d) => d.dayNumber === activeDay.dayNumber + 1,
    );
    return (
      <JourneyDaySteps
        day={activeDay}
        nextDay={nextDayInSequence}
        isComplete={completedDays.includes(activeDay.dayNumber)}
        onClose={() => { toggleDayComplete(activeDay.dayNumber); closeDay(); }}
        onMarkComplete={() => toggleDayComplete(activeDay.dayNumber)}
        journeyTitle={journey.title}
        journeySlug={slug}
      />
    );
  }

  // ── Journey overview ───────────────────────────────────────────────────────

  return (
    <PageTransition>
      <div className="min-h-screen bg-parchment">
        {/* Hero */}
        <div className="relative h-[280px]">
          <img
            src={journey.heroImageUrl}
            alt={journey.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-parchment" />
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="absolute top-12 left-4 w-9 h-9 flex items-center justify-center bg-black/40 backdrop-blur-sm text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Journey info */}
        <div className="px-5 pt-2 pb-6">
          <h1 className="font-serif-elegant text-3xl text-near-black mb-2">
            {journey.title}
          </h1>
          <p className="text-sage-muted text-sm leading-relaxed mb-4">
            {journey.description}
          </p>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-sage-muted text-xs">
              {journey.estimatedMinutesPerDay ?? 10} min/day
            </span>
            <span className="text-sage-muted/40">·</span>
            <span className="text-sage-muted text-xs">{totalDays} days</span>
            {completedCount > 0 && (
              <>
                <span className="text-sage-muted/40">·</span>
                <span className="text-sage text-xs">
                  {completedCount}/{totalDays} complete
                </span>
              </>
            )}
          </div>

          <div className="h-1 bg-black/5 mb-2">
            <div
              className="h-full bg-sage transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {nextDay && completedCount > 0 && (
            <button onClick={() => openDay(nextDay)} className="cta-inline mt-2">
              Continue with Day {nextDay.dayNumber}: {nextDay.dayTitle} →
            </button>
          )}
        </div>

        {/* Day list */}
        <div className="pb-28">
          {(() => {
            type BuiltEntry = { type: "built"; day: JourneyDay };
            type LockedEntry = { type: "locked"; planned: PlannedDay };
            type Entry = BuiltEntry | LockedEntry;

            const entries: Entry[] = [
              ...(journey.days ?? []).map((d): BuiltEntry => ({ type: "built", day: d })),
              ...lockedDays.map((p): LockedEntry => ({ type: "locked", planned: p })),
            ].sort((a, b) => {
              const numA = a.type === "built" ? a.day.dayNumber : a.planned.dayNumber;
              const numB = b.type === "built" ? b.day.dayNumber : b.planned.dayNumber;
              return numA - numB;
            });

            return entries.map((entry) => {
              if (entry.type === "locked") {
                return <LockedDayRow key={`planned-${entry.planned.dayNumber}`} planned={entry.planned} />;
              }
              const { day } = entry;
              const isComplete = completedDays.includes(day.dayNumber);
              const isActive =
                (!isComplete && day === nextDay) ||
                (completedCount === 0 && day.dayNumber === 1);
              return (
                <DayRow
                  key={day.dayNumber}
                  day={day}
                  isComplete={isComplete}
                  isActive={isActive}
                  onOpen={() => openDay(day)}
                  onShare={() => {
                    const url = `${window.location.origin}/journeys/${slug}?day=${day.dayNumber}`;
                    const title = `Day ${day.dayNumber} of ${journey.title} — CONTUERI`;
                    if (navigator.share) {
                      navigator.share({ title, url }).catch(() => {});
                    } else {
                      navigator.clipboard.writeText(url).catch(() => {});
                    }
                  }}
                />
              );
            });
          })()}
        </div>
      </div>
    </PageTransition>
  );
}
