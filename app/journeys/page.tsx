"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getJourneys } from "@/lib/sanity";
import type { Journey } from "@/lib/types";
import PageTransition from "@/components/ui/PageTransition";

// ── Progress helper ──────────────────────────────────────────────────────────

function getProgress(slug: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem("kallos-journey-progress");
    if (!raw) return 0;
    const data = JSON.parse(raw);
    return (data[slug]?.completedDays ?? []).length;
  } catch {
    return 0;
  }
}

// ── Section header (gold small caps over thin rule) ──────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-5 mb-4">
      <div className="border-t" style={{ borderColor: "rgba(42,32,21,0.4)" }} />
      <p
        className="mt-3 text-[11px] tracking-[0.18em] uppercase font-semibold"
        style={{ color: "#C19B5F" }}
      >
        {label}
      </p>
    </div>
  );
}

// ── Card variants ────────────────────────────────────────────────────────────

type CardProps = {
  journey: Journey;
  completedDays: number;
};

function StandardCard({ journey, completedDays }: CardProps) {
  const totalDays = journey.totalDays ?? 7;
  const pct = Math.round((completedDays / totalDays) * 100);
  const isStarted = completedDays > 0;
  const isIntro = journey.journeyType === "intro";

  return (
    <Link
      href={`/journeys/${journey.slug.current}`}
      className="block artwork-card"
    >
      {/* Hero image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={journey.heroImageUrl}
          alt={journey.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/30 to-transparent" />

        {/* Top-right badge: START HERE on intros (always), or progress on standards */}
        {isIntro ? (
          <span
            className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] uppercase"
            style={{
              backgroundColor: "rgba(193,155,95,0.95)",
              color: "#16110d",
            }}
          >
            Start Here
          </span>
        ) : isStarted && pct >= 100 ? (
          <div
            className="absolute top-3 right-3 flex items-center justify-center"
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              backgroundColor: "rgba(193,155,95,0.92)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <polyline
                points="2.5,7 5.5,10 11.5,4"
                stroke="#fdf6e8"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        ) : isStarted ? (
          <span className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
            Day {completedDays}/{totalDays}
          </span>
        ) : null}

        {/* On intro cards, progress badge (when started) moves to top-left so it does not collide with START HERE */}
        {isIntro && isStarted && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
            {pct >= 100 ? "Complete" : `Day ${completedDays}/${totalDays}`}
          </span>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h2 className="font-serif-elegant text-2xl text-white leading-snug mb-1">
            {journey.title}
          </h2>
          <p className="text-white/60 text-xs">
            {journey.estimatedMinutesPerDay ?? 10} min/day · {totalDays} days
          </p>
        </div>
      </div>

      {/* Description + progress bar */}
      <div className="px-4 py-4 bg-white border border-black/5">
        <p className="text-[#7a9a8a] text-sm leading-relaxed line-clamp-2 mb-3">
          {journey.description}
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1 bg-black/5">
            <div
              className="h-full bg-[#4a7a62] transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[#7a9a8a] text-xs flex-shrink-0">
            {isStarted ? `${pct}%` : "Begin →"}
          </span>
        </div>
      </div>
    </Link>
  );
}

function CompanionCard({ journey, completedDays }: CardProps) {
  const totalDays = journey.totalDays ?? 7;
  const pct = Math.round((completedDays / totalDays) * 100);
  const isStarted = completedDays > 0;

  return (
    <Link
      href={`/journeys/${journey.slug.current}`}
      className="block"
      style={{ border: "1px solid #1e3028" }}
    >
      {/* Show strip — dark teal band above the artwork */}
      <div
        className="flex items-center justify-between px-4"
        style={{ backgroundColor: "#0d1a12", height: 32, paddingTop: 7, paddingBottom: 7 }}
      >
        <span
          className="uppercase font-semibold"
          style={{
            color: "#5fa87a",
            fontSize: "9px",
            letterSpacing: "0.16em",
          }}
        >
          {journey.showName ?? ""}
        </span>
        <span
          className="uppercase font-semibold"
          style={{
            color: "#4a7a62",
            fontSize: "10px",
            letterSpacing: "0.12em",
          }}
        >
          {journey.episodeLabel ?? ""}
        </span>
      </div>

      {/* Hero image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={journey.heroImageUrl}
          alt={journey.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/30 to-transparent" />

        {/* COMPANION tag — teal pill, top-right */}
        <span
          className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] uppercase"
          style={{
            backgroundColor: "rgba(74,122,98,0.2)",
            color: "#5fa87a",
            backdropFilter: "blur(4px)",
          }}
        >
          Companion
        </span>

        {/* Progress badge top-left when started, so it does not clash with COMPANION tag */}
        {isStarted && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
            {pct >= 100 ? "Complete" : `Day ${completedDays}/${totalDays}`}
          </span>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h2 className="font-serif-elegant text-2xl text-white leading-snug mb-1">
            {journey.title}
          </h2>
          <p className="text-white/60 text-xs">
            {journey.estimatedMinutesPerDay ?? 10} min/day · {totalDays} days
          </p>
        </div>
      </div>

      {/* Description + watch cue + progress bar */}
      <div className="px-4 py-4 bg-white border-t-0">
        <p className="text-[#7a9a8a] text-sm leading-relaxed line-clamp-2 mb-2">
          {journey.description}
        </p>
        <p
          className="font-serif-elegant italic mb-3"
          style={{ color: "#4a7a62", fontSize: "11px" }}
        >
          Watch the episode before beginning
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1 bg-black/5">
            <div
              className="h-full bg-[#4a7a62] transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[#7a9a8a] text-xs flex-shrink-0">
            {isStarted ? `${pct}%` : "Begin →"}
          </span>
        </div>
      </div>
    </Link>
  );
}

function JourneyCard({ journey, completedDays }: CardProps) {
  if (journey.journeyType === "companion") {
    return <CompanionCard journey={journey} completedDays={completedDays} />;
  }
  return <StandardCard journey={journey} completedDays={completedDays} />;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function JourneysPage() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getJourneys();
        setJourneys(data ?? []);
        const prog: Record<string, number> = {};
        (data ?? []).forEach((j: Journey) => {
          prog[j.slug.current] = getProgress(j.slug.current);
        });
        setProgress(prog);
      } catch (err) {
        console.error("Error fetching journeys:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [retryCount]);

  // Group by journeyType. Untyped (legacy) journeys default to standard.
  const intros = journeys.filter((j) => j.journeyType === "intro");
  const standards = journeys.filter(
    (j) => !j.journeyType || j.journeyType === "standard"
  );
  const companions = journeys.filter((j) => j.journeyType === "companion");

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#fdf6e8] pb-28">

        {/* Page header */}
        <div className="px-5 pt-12 pb-6">
          <h1 className="text-3xl font-bold text-[#1a1a1a] mb-1">Journeys</h1>
          <p className="text-[#7a9a8a] text-sm">
            Curated explorations of beauty and truth
          </p>
        </div>

        {error ? (
          <div className="px-5 py-16 text-center">
            <p className="text-[#7a9a8a] mb-4">Couldn&apos;t load journeys.</p>
            <button
              onClick={() => {
                setError(false);
                setLoading(true);
                setRetryCount((c) => c + 1);
              }}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div className="px-5 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="aspect-[16/9] skeleton w-full mb-3" />
                <div className="h-5 skeleton w-2/3 mb-2" />
                <div className="h-4 skeleton w-1/2" />
              </div>
            ))}
          </div>
        ) : journeys.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-[#4a7a62] text-xs tracking-widest uppercase mb-4">
              Coming soon
            </p>
            <h2 className="font-serif-elegant text-2xl text-[#1a1a1a] mb-3">
              Journeys are being prepared
            </h2>
            <p className="text-[#7a9a8a] text-sm leading-relaxed max-w-xs mx-auto">
              Each Journey is a curated exploration of one theme: sacred art, music,
              literature, landscape, and the wisdom of the great tradition.
            </p>
            <Link href="/explore" className="inline-block mt-8 cta-inline">
              Explore Content →
            </Link>
          </div>
        ) : (
          <>
            {/* Section 1 — Where to Begin */}
            {intros.length > 0 && (
              <>
                <SectionHeader label="Where to Begin" />
                <div className="px-5 space-y-6 mb-10">
                  {intros.map((journey) => (
                    <JourneyCard
                      key={journey._id}
                      journey={journey}
                      completedDays={progress[journey.slug.current] ?? 0}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Section 2 — Journeys */}
            {standards.length > 0 && (
              <>
                <SectionHeader label="Journeys" />
                <div className="px-5 space-y-6 mb-10">
                  {standards.map((journey) => (
                    <JourneyCard
                      key={journey._id}
                      journey={journey}
                      completedDays={progress[journey.slug.current] ?? 0}
                    />
                  ))}

                  {/* Coming soon — 5 founding themes placeholders, only here */}
                  {standards.length < 5 && (
                    <div className="pt-4">
                      <div className="border-t border-black/6 pt-6">
                        <p className="text-[#4a7a62] text-xs tracking-widest uppercase mb-5">
                          Coming soon
                        </p>
                        <div className="space-y-3">
                          {[
                            { title: "Silence", question: "What do we hear when we stop talking?", color: "#6b7c93" },
                            { title: "Suffering & Beauty", question: "How does beauty survive darkness?", color: "#8b6f5e" },
                            { title: "Creation", question: "What is the world trying to tell us?", color: "#5a7a52" },
                            { title: "Home", question: "Why do we long for something we've never seen?", color: "#7a6a8a" },
                          ]
                            .filter((t) => !journeys.some((j) => j.title === t.title))
                            .map((theme) => (
                              <div
                                key={theme.title}
                                className="flex items-start gap-3 px-4 py-3 bg-white border border-black/5 opacity-60"
                              >
                                <span
                                  className="w-1 self-stretch flex-shrink-0 mt-0.5"
                                  style={{ backgroundColor: theme.color }}
                                />
                                <div>
                                  <p className="text-[#1a1a1a] text-sm font-medium">{theme.title}</p>
                                  <p className="text-[#7a9a8a] text-xs mt-0.5 italic">{theme.question}</p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Section 3 — Episode Companions (only when at least one exists) */}
            {companions.length > 0 && (
              <>
                <SectionHeader label="Episode Companions" />
                <div className="px-5 space-y-6 mb-10">
                  {companions.map((journey) => (
                    <JourneyCard
                      key={journey._id}
                      journey={journey}
                      completedDays={progress[journey.slug.current] ?? 0}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
}
