"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getJourney } from "@/lib/sanity";
import type { Journey, JourneyDay } from "@/lib/types";
import PageTransition from "@/components/ui/PageTransition";
import JourneyDaySteps from "@/components/JourneyDaySteps";

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

// ── Content type icon map ────────────────────────────────────────────────────

const TYPE_ICONS: Record<string, string> = {
  "sacred-art": "🎨",
  thinker: "📖",
  literature: "✍️",
  music: "🎵",
  "food-wine": "🍷",
  landscape: "🌿",
  "watch-listen": "🎬",
};

// ── Day row (overview list item — taps to open stepper) ──────────────────────

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
  const content = day.encounterContent;
  const icon = content ? (TYPE_ICONS[content.contentType] ?? "✦") : "✦";

  return (
    <button
      className={`w-full flex items-center gap-4 px-5 py-4 text-left border-l-2 transition-colors ${
        isComplete ? "border-[#C19B5F]" : "border-white/10"
      }`}
      onClick={onOpen}
    >
      {/* Day number circle */}
      <div
        className={`flex-shrink-0 w-9 h-9 flex items-center justify-center text-sm font-bold border transition-colors ${
          isComplete
            ? "border-[#C19B5F] text-[#C19B5F] bg-[#C19B5F]/10"
            : isActive
            ? "border-white/40 text-white"
            : "border-white/15 text-white/30"
        }`}
      >
        {isComplete ? "✓" : day.dayNumber}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white/40 text-xs tracking-widest uppercase mb-0.5">
          Day {day.dayNumber}
        </p>
        <h3
          className={`font-semibold text-sm line-clamp-1 transition-colors ${
            isActive || isComplete ? "text-white" : "text-white/50"
          }`}
        >
          {day.dayTitle}
        </h3>
      </div>

      <div className="flex-shrink-0 flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4 text-white/30"
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

// ── Page ─────────────────────────────────────────────────────────────────────

export default function JourneyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [journey, setJourney] = useState<Journey | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [activeDay, setActiveDay] = useState<JourneyDay | null>(null);

  useEffect(() => {
    if (!slug) return;
    async function fetchData() {
      try {
        const data = await getJourney(slug);
        setJourney(data ?? null);
        setCompletedDays(loadProgress(slug));
      } catch (err) {
        console.error("Error fetching journey:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  const toggleDayComplete = useCallback(
    (dayNumber: number) => {
      setCompletedDays((prev) => {
        const next = prev.includes(dayNumber)
          ? prev
          : [...prev, dayNumber];
        saveProgress(slug, next);
        return next;
      });
    },
    [slug],
  );

  // ── Loading state ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#203545] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-white/30 border-t-[#C19B5F] rounded-full animate-spin mb-2" />
          <p className="text-white/50 text-sm">Loading journey…</p>
        </div>
      </div>
    );
  }

  // ── Not found state ────────────────────────────────────────────────────────

  if (!journey) {
    return (
      <div className="min-h-screen bg-[#203545] flex items-center justify-center px-5">
        <div className="text-center">
          <p className="text-[#C19B5F] text-xs tracking-widest uppercase mb-3">
            Not found
          </p>
          <h2 className="text-white text-xl font-bold mb-4">
            Journey not found
          </h2>
          <button
            onClick={() => router.back()}
            className="text-white/50 text-sm hover:text-white"
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  // ── Derived values ─────────────────────────────────────────────────────────

  const completedCount = completedDays.length;
  const progressPct = Math.round((completedCount / 7) * 100);
  const nextDay = journey.days?.find(
    (d) => !completedDays.includes(d.dayNumber),
  );

  // ── Full-screen day stepper (when a day is tapped) ─────────────────────────

  if (activeDay) {
    return (
      <JourneyDaySteps
        day={activeDay}
        isComplete={completedDays.includes(activeDay.dayNumber)}
        onClose={() => setActiveDay(null)}
        onMarkComplete={() => toggleDayComplete(activeDay.dayNumber)}
      />
    );
  }

  // ── Journey overview ───────────────────────────────────────────────────────

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#203545]">
        {/* Hero */}
        <div className="relative h-[280px]">
          <img
            src={journey.heroImageUrl}
            alt={journey.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#203545]" />

          {/* Back button */}
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="absolute top-12 left-4 w-9 h-9 flex items-center justify-center bg-black/40 backdrop-blur-sm text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Theme pill */}
          {journey.theme?.color && (
            <span
              className="absolute top-12 right-4 px-2 py-1 text-white text-xs font-medium tracking-wide"
              style={{ backgroundColor: journey.theme.color }}
            >
              {journey.theme.title}
            </span>
          )}
        </div>

        {/* Journey info */}
        <div className="px-5 pt-2 pb-6">
          <h1 className="font-serif-elegant text-3xl text-white mb-2">
            {journey.title}
          </h1>
          <p className="text-white/50 text-sm leading-relaxed mb-4">
            {journey.description}
          </p>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-white/40 text-xs">
              {journey.estimatedMinutesPerDay ?? 10} min/day
            </span>
            <span className="text-white/20">·</span>
            <span className="text-white/40 text-xs">7 days</span>
            {completedCount > 0 && (
              <>
                <span className="text-white/20">·</span>
                <span className="text-[#C19B5F] text-xs">
                  {completedCount}/7 complete
                </span>
              </>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-white/10 mb-2">
            <div
              className="h-full bg-[#C19B5F] transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Jump to next day */}
          {nextDay && completedCount > 0 && (
            <button
              onClick={() => setActiveDay(nextDay)}
              className="text-[#C19B5F] text-xs mt-2 hover:underline"
            >
              Continue with Day {nextDay.dayNumber}: {nextDay.dayTitle} →
            </button>
          )}
        </div>

        {/* Day list */}
        <div className="pb-28">
          {journey.days?.map((day) => {
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
                onOpen={() => setActiveDay(day)}
              />
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
}
