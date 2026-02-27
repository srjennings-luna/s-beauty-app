"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getJourney } from "@/lib/sanity";
import type { Journey, JourneyDay } from "@/lib/types";
import PageTransition from "@/components/ui/PageTransition";

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
  "thinker": "📖",
  "literature": "✍️",
  "music": "🎵",
  "food-wine": "🍷",
  "landscape": "🌿",
  "watch-listen": "🎬",
};

// ── Day card ─────────────────────────────────────────────────────────────────

function DayCard({
  day,
  isComplete,
  isActive,
  onToggleComplete,
}: {
  day: JourneyDay;
  isComplete: boolean;
  isActive: boolean;
  onToggleComplete: () => void;
}) {
  const [expanded, setExpanded] = useState(isActive);
  const content = day.encounterContent;
  const icon = content ? (TYPE_ICONS[content.contentType] ?? "✦") : "✦";

  return (
    <div className={`border-l-2 transition-colors ${isComplete ? "border-[#C19B5F]" : "border-white/10"}`}>
      {/* Day header — tap to expand */}
      <button
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
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
            className={`w-4 h-4 text-white/30 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          >
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-6">
          {/* Open — image */}
          <div className="relative aspect-[4/3] overflow-hidden mb-4">
            <img
              src={day.openImageUrl}
              alt={day.dayTitle}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Open text */}
          {day.openText && (
            <p className="text-white/70 text-sm leading-relaxed mb-5 italic">
              {day.openText}
            </p>
          )}

          {/* Encounter */}
          {content && (
            <div className="mb-5">
              <p className="text-[#C19B5F] text-xs tracking-widest uppercase mb-2">Encounter</p>
              <div className="bg-white/5 p-4">
                <div className="flex gap-3 items-start">
                  <span className="text-xl flex-shrink-0">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold text-sm mb-1">{content.title}</h4>
                    <p className="text-white/50 text-xs leading-relaxed line-clamp-3">
                      {content.description}
                    </p>
                  </div>
                </div>
                {day.encounterGuidance && (
                  <p className="text-white/40 text-xs italic mt-3 border-t border-white/10 pt-3">
                    {day.encounterGuidance}
                  </p>
                )}
                {/* Link to Visio Divina for eligible types */}
                {(content.contentType === "sacred-art" || content.contentType === "landscape") && (
                  <Link
                    href={`/pray/${content._id}`}
                    className="inline-block mt-3 text-[#C19B5F] text-xs tracking-wide hover:underline"
                  >
                    Pray with this image →
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Reflect */}
          {day.reflectQuestions?.length > 0 && (
            <div className="mb-5">
              <p className="text-[#C19B5F] text-xs tracking-widest uppercase mb-2">Reflect</p>
              <div className="space-y-3">
                {day.reflectQuestions.map((q, i) => (
                  <p key={i} className="text-white/70 text-sm leading-relaxed italic border-l border-white/20 pl-3">
                    {q}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Connect */}
          {day.connectThread && (
            <div className="mb-5">
              <p className="text-[#C19B5F] text-xs tracking-widest uppercase mb-2">Tomorrow</p>
              <p className="text-white/50 text-sm italic">{day.connectThread}</p>
            </div>
          )}

          {/* Go Deeper */}
          {day.goDeeper && day.goDeeper.length > 0 && (
            <div className="mb-5">
              <p className="text-[#C19B5F] text-xs tracking-widest uppercase mb-2">Go Deeper</p>
              <div className="space-y-3">
                {day.goDeeper.map((r) => (
                  <div key={r._id} className="bg-white/5 p-3">
                    <p className="text-white/80 text-sm font-medium mb-1">{r.title}</p>
                    <p className="text-white/50 text-xs leading-relaxed line-clamp-3">{r.summary}</p>
                    {r.shortQuote && (
                      <p className="text-[#C19B5F] text-xs italic mt-2">&ldquo;{r.shortQuote}&rdquo;</p>
                    )}
                    <p className="text-white/30 text-xs mt-1">— {r.source}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complete button */}
          <button
            onClick={onToggleComplete}
            className={`w-full py-3 text-sm font-semibold tracking-wide transition-all ${
              isComplete
                ? "bg-white/10 text-white/50 hover:bg-white/15"
                : "bg-[#C19B5F] text-[#111820] hover:bg-[#D4B56A]"
            }`}
          >
            {isComplete ? "✓ Completed" : "Mark Day Complete"}
          </button>
        </div>
      )}
    </div>
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

  const toggleDay = useCallback(
    (dayNumber: number) => {
      setCompletedDays((prev) => {
        const next = prev.includes(dayNumber)
          ? prev.filter((d) => d !== dayNumber)
          : [...prev, dayNumber];
        saveProgress(slug, next);
        return next;
      });
    },
    [slug]
  );

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

  if (!journey) {
    return (
      <div className="min-h-screen bg-[#203545] flex items-center justify-center px-5">
        <div className="text-center">
          <p className="text-[#C19B5F] text-xs tracking-widest uppercase mb-3">Not found</p>
          <h2 className="text-white text-xl font-bold mb-4">Journey not found</h2>
          <button onClick={() => router.back()} className="text-white/50 text-sm hover:text-white">
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  const completedCount = completedDays.length;
  const progressPct = Math.round((completedCount / 7) * 100);
  const nextDay = journey.days?.find((d) => !completedDays.includes(d.dayNumber));

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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
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
          <h1 className="font-serif-elegant text-3xl text-white mb-2">{journey.title}</h1>
          <p className="text-white/50 text-sm leading-relaxed mb-4">{journey.description}</p>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-white/40 text-xs">{journey.estimatedMinutesPerDay ?? 10} min/day</span>
            <span className="text-white/20">·</span>
            <span className="text-white/40 text-xs">7 days</span>
            {completedCount > 0 && (
              <>
                <span className="text-white/20">·</span>
                <span className="text-[#C19B5F] text-xs">{completedCount}/7 complete</span>
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
            <p className="text-white/30 text-xs mt-2">
              Continue with Day {nextDay.dayNumber}: {nextDay.dayTitle}
            </p>
          )}
        </div>

        {/* Days */}
        <div className="pb-28">
          {journey.days?.map((day) => {
            const isComplete = completedDays.includes(day.dayNumber);
            const isActive = !isComplete && day === nextDay;
            return (
              <DayCard
                key={day.dayNumber}
                day={day}
                isComplete={isComplete}
                isActive={isActive || (completedCount === 0 && day.dayNumber === 1)}
                onToggleComplete={() => toggleDay(day.dayNumber)}
              />
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
}
