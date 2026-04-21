"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageTransition from "@/components/ui/PageTransition";
import JourneyDaySteps from "@/components/JourneyDaySteps";
import type { Journey, JourneyDay, PlannedDay } from "@/lib/types";

// ── Progress helpers ─────────────────────────────────────────────────────────

const PROGRESS_KEY = "kallos-journey-progress";

function loadProgress(slug: string): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return (JSON.parse(raw ?? "{}")?.[slug]?.completedDays ?? []) as number[];
  } catch {
    return [];
  }
}

function saveProgress(slug: string, completedDays: number[]) {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    const data = JSON.parse(raw ?? "{}");
    data[slug] = { completedDays, updatedAt: new Date().toISOString() };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

// ── Day row ──────────────────────────────────────────────────────────────────

function DayRow({
  day,
  isComplete,
  isActive,
  onOpen,
}: {
  day: JourneyDay;
  isComplete: boolean;
  isActive: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      className={`w-full flex items-center gap-4 px-5 py-4 text-left border-l-2 transition-colors bg-white border-b border-black/5 ${
        isComplete ? "border-l-[#4a7a62]" : "border-l-black/8"
      }`}
      onClick={onOpen}
    >
      <div
        className={`flex-shrink-0 w-9 h-9 flex items-center justify-center text-sm font-bold border transition-colors ${
          isComplete
            ? "border-[#4a7a62] text-[#4a7a62] bg-[#4a7a62]/8"
            : isActive
            ? "border-[#1a1a1a]/40 text-[#1a1a1a]"
            : "border-black/10 text-[#7a9a8a]"
        }`}
      >
        {isComplete ? "✓" : day.dayNumber}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[#7a9a8a] text-xs tracking-widest uppercase mb-0.5">
          Day {day.dayNumber}
        </p>
        <h3
          className={`font-semibold text-sm line-clamp-1 transition-colors ${
            isActive || isComplete ? "text-[#1a1a1a]" : "text-[#7a9a8a]"
          }`}
        >
          {day.dayTitle}
        </h3>
      </div>

      <div className="flex-shrink-0 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4 text-[#7a9a8a]"
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
      <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-sm font-bold border border-black/10 text-[#7a9a8a]">
        {planned.dayNumber}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[#7a9a8a] text-xs tracking-widest uppercase mb-0.5">
          Day {planned.dayNumber}
        </p>
        <h3 className="font-semibold text-sm line-clamp-1 text-[#7a9a8a]">
          {planned.dayTitle}
        </h3>
      </div>

      <div className="flex-shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4 text-[#7a9a8a]"
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
}: {
  journey: Journey;
  slug: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [activeDay, setActiveDay] = useState<JourneyDay | null>(null);

  // Load progress and open day from URL on mount
  useEffect(() => {
    const loaded = loadProgress(slug);
    setCompletedDays(loaded);

    const dayParam = searchParams.get("day");
    if (dayParam) {
      const dayNum = parseInt(dayParam, 10);
      const day = journey.days?.find((d) => d.dayNumber === dayNum) ?? null;
      if (day) setActiveDay(day);
    }
  }, [slug, journey.days, searchParams]);

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
      setCompletedDays((prev) => {
        const next = prev.includes(dayNumber) ? prev : [...prev, dayNumber];
        saveProgress(slug, next);
        return next;
      });
    },
    [slug],
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
      <div className="min-h-screen bg-[#fdf6e8]">
        {/* Hero */}
        <div className="relative h-[280px]">
          <img
            src={journey.heroImageUrl}
            alt={journey.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#fdf6e8]" />
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
          <h1 className="font-serif-elegant text-3xl text-[#1a1a1a] mb-2">
            {journey.title}
          </h1>
          <p className="text-[#7a9a8a] text-sm leading-relaxed mb-4">
            {journey.description}
          </p>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-[#7a9a8a] text-xs">
              {journey.estimatedMinutesPerDay ?? 10} min/day
            </span>
            <span className="text-[#7a9a8a]/40">·</span>
            <span className="text-[#7a9a8a] text-xs">{totalDays} days</span>
            {completedCount > 0 && (
              <>
                <span className="text-[#7a9a8a]/40">·</span>
                <span className="text-[#4a7a62] text-xs">
                  {completedCount}/{totalDays} complete
                </span>
              </>
            )}
          </div>

          <div className="h-1 bg-black/5 mb-2">
            <div
              className="h-full bg-[#4a7a62] transition-all duration-500"
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
                />
              );
            });
          })()}
        </div>
      </div>
    </PageTransition>
  );
}
