"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getReleasedEpisodes } from "@/data/episodes";
import PageTransition from "@/components/ui/PageTransition";

export default function HomePage() {
  const router = useRouter();
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);
  const releasedEpisodes = getReleasedEpisodes();

  useEffect(() => {
    const onboarded = localStorage.getItem("seeking-beauty-onboarded");
    if (!onboarded) {
      router.push("/splash");
    } else {
      setHasOnboarded(true);
    }
  }, [router]);

  // Show nothing while checking onboarding status
  if (hasOnboarded === null) {
    return <div className="min-h-screen bg-[#203545]" />;
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#203545]">
        {/* Hero Image */}
        <div className="relative h-[280px]">
        <img
          src="https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800"
          alt="David Henrie in Rome"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#203545]" />

        {/* Logo overlay */}
        <div className="absolute bottom-6 left-5 right-5">
          <p className="text-white/60 text-xs tracking-widest uppercase mb-1">
            An EWTN+ Original Series
          </p>
          <h1 className="font-serif-elegant text-3xl text-white tracking-wide">
            Seeking Beauty
          </h1>
          <p className="text-white/70 text-sm mt-1">with David Henrie</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-6 pb-28">
        {/* Title & Description */}
        <h2 className="text-2xl font-bold text-white mb-3">
          Seeking Beauty
        </h2>
        <p className="text-white/60 leading-relaxed mb-8">
          An adventure documentary series hosted by David Henrie bringing together audiences from all walks of life in a fun-loving exploration of the culture, architecture, food, art and music that point us to the beautiful and lead us to the divine.
        </p>

        {/* Episode Carousel */}
        <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-5 px-5 pb-4">
          {releasedEpisodes.map((episode) => (
            <Link
              key={episode.id}
              href={`/episodes/${episode.id}`}
              className="flex-shrink-0 w-[280px] artwork-card"
            >
              {/* Episode Image - no rounded corners */}
              <div className="relative aspect-[4/3] overflow-hidden mb-3">
                <img
                  src={episode.heroImageUrl}
                  alt={episode.shortTitle}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Episode Info */}
              <h3 className="text-white font-semibold text-lg mb-1">
                {episode.shortTitle}
              </h3>
              <p className="text-white/50 text-sm mb-2">
                {episode.airDate}
              </p>
              <p className="text-white/60 text-sm line-clamp-2">
                {episode.summary.slice(0, 100)}...
              </p>
            </Link>
          ))}
        </div>
      </div>
      </div>
    </PageTransition>
  );
}
