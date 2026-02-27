"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getJourneys } from "@/lib/sanity";
import type { Journey } from "@/lib/types";
import PageTransition from "@/components/ui/PageTransition";

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

export default function JourneysPage() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getJourneys();
        setJourneys(data ?? []);
        // Load progress for each journey
        const prog: Record<string, number> = {};
        (data ?? []).forEach((j: Journey) => {
          prog[j.slug.current] = getProgress(j.slug.current);
        });
        setProgress(prog);
      } catch (err) {
        console.error("Error fetching journeys:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#203545] pb-28">

        {/* Header */}
        <div className="px-5 pt-12 pb-6">
          <h1 className="text-3xl font-bold text-white mb-1">Journeys</h1>
          <p className="text-white/40 text-sm">
            7-day curated explorations of beauty and truth
          </p>
        </div>

        {loading ? (
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
            <p className="text-[#C19B5F] text-xs tracking-widest uppercase mb-4">Coming soon</p>
            <h2 className="font-serif-elegant text-2xl text-white mb-3">
              Journeys are being prepared
            </h2>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto">
              Each Journey is a 7-day curated exploration of one theme — sacred art, music,
              literature, landscape, and the wisdom of the great tradition.
            </p>
            <Link
              href="/explore"
              className="inline-block mt-8 px-6 py-3 bg-[#C19B5F] text-[#111820] text-sm font-semibold tracking-wide"
            >
              Explore Content
            </Link>
          </div>
        ) : (
          <div className="px-5 space-y-6">
            {journeys.map((journey) => {
              const completedDays = progress[journey.slug.current] ?? 0;
              const pct = Math.round((completedDays / 7) * 100);
              const isStarted = completedDays > 0;

              return (
                <Link
                  key={journey._id}
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
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111820] via-[#111820]/30 to-transparent" />

                    {/* Theme pill */}
                    {journey.theme && (
                      <span
                        className="absolute top-3 left-3 px-2 py-1 text-white text-xs font-medium tracking-wide"
                        style={{ backgroundColor: journey.theme.color ?? "#C19B5F" }}
                      >
                        {journey.theme.title}
                      </span>
                    )}

                    {/* Progress badge */}
                    {isStarted && (
                      <span className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
                        Day {completedDays}/7
                      </span>
                    )}

                    {/* Title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h2 className="font-serif-elegant text-2xl text-white leading-snug mb-1">
                        {journey.title}
                      </h2>
                      <p className="text-white/60 text-xs">
                        {journey.estimatedMinutesPerDay ?? 10} min/day · 7 days
                      </p>
                    </div>
                  </div>

                  {/* Description + progress bar */}
                  <div className="px-4 py-4 bg-[#1a2a36]">
                    <p className="text-white/60 text-sm leading-relaxed line-clamp-2 mb-3">
                      {journey.description}
                    </p>

                    {/* Progress bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1 bg-white/10">
                        <div
                          className="h-full bg-[#C19B5F] transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-white/30 text-xs flex-shrink-0">
                        {isStarted ? `${pct}%` : "Begin"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
