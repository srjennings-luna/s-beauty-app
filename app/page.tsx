"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getDailyPrompt, getJourneys, getAllContentItems } from "@/lib/sanity";
import type { DailyPrompt, Journey, ContentItem } from "@/lib/types";
import PageTransition from "@/components/ui/PageTransition";
import FadeUp from "@/components/ui/FadeUp";

export default function TodayPage() {
  const router = useRouter();
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);
  const [dailyPrompt, setDailyPrompt] = useState<DailyPrompt | null>(null);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [recentContent, setRecentContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Migrate old onboarding key
    const legacy = localStorage.getItem("seeking-beauty-onboarded");
    if (legacy) {
      localStorage.setItem("kallos-onboarded", legacy);
      localStorage.removeItem("seeking-beauty-onboarded");
    }
    const onboarded = localStorage.getItem("kallos-onboarded");
    if (!onboarded) {
      router.push("/splash");
    } else {
      setHasOnboarded(true);
    }
  }, [router]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [prompt, allJourneys, content] = await Promise.all([
          getDailyPrompt(),
          getJourneys(),
          getAllContentItems(),
        ]);
        setDailyPrompt(prompt ?? null);
        setJourneys(allJourneys ?? []);
        setRecentContent((content ?? []).slice(0, 6));
      } catch (err) {
        console.error("Error fetching Today data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [retryCount]);

  if (hasOnboarded === null) {
    return <div className="min-h-screen bg-[#fdf6e8]" />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fdf6e8] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-[#7a9a8a] mb-4">Couldn&apos;t load today&apos;s content.</p>
          <button
            onClick={() => { setError(false); setLoading(true); setRetryCount((c) => c + 1); }}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#fdf6e8] pb-28">

        {/* Header */}
        <FadeUp delay={0} className="px-5 pt-12 pb-4">
          <p className="text-[#8aacb8] text-xs tracking-widest uppercase mb-1">{today}</p>
          <h1 className="font-serif-elegant text-3xl text-[#1a1a1a] tracking-widest uppercase">
            KALLOS
          </h1>
        </FadeUp>

        {loading ? (
          <div className="px-5 space-y-4 mt-2">
            <div className="aspect-[4/3] skeleton w-full" />
            <div className="h-6 skeleton w-3/4" />
            <div className="h-4 skeleton w-1/2" />
          </div>
        ) : (
          <>
            {/* ── Daily Prompt hero card ── */}
            <FadeUp delay={60}>
              {dailyPrompt ? (
                <section className="mb-8">
                  {/* Image with gradient overlay */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={dailyPrompt.content.imageUrl}
                      alt={dailyPrompt.content.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/20 to-transparent" />
                    {/* Text in lower third */}
                    <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
                      <p className="text-[#4a7a62] text-xs tracking-widest uppercase mb-2">
                        Today&apos;s Prompt
                      </p>
                      <h2 className="font-serif-elegant text-2xl text-white leading-snug mb-2">
                        {dailyPrompt.content.title}
                      </h2>
                      <p className="text-white/75 text-sm italic leading-relaxed line-clamp-2">
                        &ldquo;{dailyPrompt.promptQuestion}&rdquo;
                      </p>
                    </div>
                  </div>
                  {/* CTA below image */}
                  <div className="px-5 pt-3 pb-1 flex items-center justify-between">
                    {dailyPrompt.curatorNote ? (
                      <p className="text-[#7a9a8a] text-xs italic line-clamp-1 flex-1 mr-4">
                        {dailyPrompt.curatorNote}
                      </p>
                    ) : (
                      <span />
                    )}
                    <Link href="/prompt" className="cta-inline flex-shrink-0">
                      Enter practice →
                    </Link>
                  </div>
                </section>
              ) : (
                <section className="mx-5 mb-8 py-12 text-center border border-black/8">
                  <p className="text-[#4a7a62] text-xs tracking-widest uppercase mb-4">Today</p>
                  <p className="font-serif-elegant text-xl text-[#1a1a1a]/70 italic leading-relaxed">
                    &ldquo;Beauty will save the world.&rdquo;
                  </p>
                  <p className="text-[#7a9a8a] text-sm mt-3">— Dostoevsky</p>
                  <p className="text-[#7a9a8a] text-xs mt-6">
                    Add a Daily Prompt in Sanity Studio to appear here.
                  </p>
                </section>
              )}
            </FadeUp>

            {/* ── Journeys ── */}
            {journeys.length > 0 && (
              <FadeUp delay={120}>
                <section className="px-5 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[#4a7a62] font-medium tracking-widest uppercase text-xs">
                      Journeys
                    </h2>
                    <Link href="/journeys" className="text-[#7a9a8a] text-xs tracking-wide hover:text-[#1a1a1a] transition-colors">
                      See all →
                    </Link>
                  </div>
                  <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-5 px-5 pb-2">
                    {journeys.slice(0, 4).map((journey) => (
                      <Link
                        key={journey._id}
                        href={`/journeys/${journey.slug.current}`}
                        className="flex-shrink-0 w-[200px] artwork-card"
                      >
                        <div className="relative aspect-[3/2] overflow-hidden">
                          <img
                            src={journey.heroImageUrl}
                            alt={journey.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" />
                          {journey.theme?.color && (
                            <span
                              className="absolute top-2 left-2 px-2 py-0.5 text-white text-xs font-medium tracking-wide"
                              style={{ backgroundColor: journey.theme.color }}
                            >
                              {journey.theme.title}
                            </span>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <h3 className="text-white font-semibold text-sm line-clamp-1">
                              {journey.title}
                            </h3>
                            <p className="text-white/60 text-xs mt-0.5">
                              {journey.estimatedMinutesPerDay ?? 10} min/day · 7 days
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              </FadeUp>
            )}

            {/* ── Recent Content ── */}
            {recentContent.length > 0 && (
              <FadeUp delay={180}>
                <section className="px-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[#4a7a62] font-medium tracking-widest uppercase text-xs">
                      Explore
                    </h2>
                    <Link href="/explore" className="text-[#7a9a8a] text-xs tracking-wide hover:text-[#1a1a1a] transition-colors">
                      See all →
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {recentContent.map((item) => (
                      <Link key={item._id} href="/explore" className="artwork-card">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-2">
                            <h3 className="text-white text-xs font-medium line-clamp-2 leading-snug">
                              {item.title}
                            </h3>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              </FadeUp>
            )}

            {/* ── Empty state ── */}
            {!dailyPrompt && journeys.length === 0 && recentContent.length === 0 && (
              <FadeUp delay={60}>
                <div className="px-5 py-16 text-center">
                  <p className="text-[#4a7a62] text-xs tracking-widest uppercase mb-4">Coming soon</p>
                  <h2 className="font-serif-elegant text-2xl text-[#1a1a1a] mb-3">
                    Content is being curated
                  </h2>
                  <p className="text-[#7a9a8a] text-sm leading-relaxed max-w-xs mx-auto">
                    Add Daily Prompts, Journeys, and Content Items in Sanity Studio to begin.
                  </p>
                  <Link
                    href="/explore"
                    className="inline-block mt-8 cta-inline"
                  >
                    Explore Content →
                  </Link>
                </div>
              </FadeUp>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
}
