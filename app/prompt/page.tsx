"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getDailyPrompt } from "@/lib/sanity";
import type { DailyPrompt } from "@/lib/types";
import PageTransition from "@/components/ui/PageTransition";

// ── Espresso palette (same as Visio Divina) ──────────────────────────────────
const C = {
  bg: "#16110d",
  bgGradient: "linear-gradient(180deg, #1e1410 0%, #16110d 30%, #16110d 70%, #0d0a07 100%)",
  header: "rgba(22,17,13,0.97)",
  cream: "rgba(253,246,232,0.88)",
  creamDim: "rgba(253,246,232,0.5)",
  creamFaint: "rgba(253,246,232,0.25)",
  sage: "#4a7a62",
  sageMuted: "#7a9a8a",
  gold: "#C19B5F",
  divider: "rgba(253,246,232,0.1)",
};

// ── Streak helpers (localStorage) ────────────────────────────────────────────
const STREAK_KEY = "kallos-prompt-streak";
const LAST_KEY   = "kallos-prompt-last";

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getStreak(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(STREAK_KEY) ?? "0", 10);
}

function markCompleted() {
  const today = getTodayStr();
  const last  = localStorage.getItem(LAST_KEY);
  if (last === today) return; // already counted today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);

  const current = getStreak();
  const newStreak = last === yStr ? current + 1 : 1;
  localStorage.setItem(STREAK_KEY, String(newStreak));
  localStorage.setItem(LAST_KEY, today);
}

// ── Share ─────────────────────────────────────────────────────────────────────
async function sharePrompt(prompt: DailyPrompt) {
  const text = `"${prompt.promptQuestion}"\n\n— KALLOS`;
  if (navigator.share) {
    try {
      await navigator.share({ title: prompt.content.title, text, url: window.location.href });
    } catch (_) { /* dismissed */ }
  } else {
    await navigator.clipboard.writeText(text);
    alert("Copied to clipboard");
  }
}

// ── Favorite ──────────────────────────────────────────────────────────────────
const FAV_KEY = "kallos-fav-prompts";

function isFavorited(id: string): boolean {
  if (typeof window === "undefined") return false;
  const favs: string[] = JSON.parse(localStorage.getItem(FAV_KEY) ?? "[]");
  return favs.includes(id);
}

function toggleFavorite(id: string): boolean {
  const favs: string[] = JSON.parse(localStorage.getItem(FAV_KEY) ?? "[]");
  const idx = favs.indexOf(id);
  if (idx > -1) {
    favs.splice(idx, 1);
  } else {
    favs.unshift(id);
  }
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
  return favs.includes(id);
}

// ── Music ─────────────────────────────────────────────────────────────────────
const MUSIC_CHANT   = "/music/nickpanek-ave-maria-latin-catholic-gregorian-chant-218251.mp3";
const MUSIC_AMBIENT = "/music/natureseye-piano-dreamcloud-meditation-179215.mp3";

export default function DailyPromptPage() {
  const router = useRouter();
  const [prompt, setPrompt]           = useState<DailyPrompt | null>(null);
  const [loading, setLoading]         = useState(true);
  const [favorited, setFavorited]     = useState(false);
  const [completed, setCompleted]     = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicMenuOpen, setMusicMenuOpen] = useState(false);

  const heroRef    = useRef<HTMLDivElement>(null);
  const actioRef   = useRef<HTMLDivElement>(null);
  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // ── Load today's prompt ────────────────────────────────────────────────────
  useEffect(() => {
    getDailyPrompt()
      .then((data) => {
        setPrompt(data ?? null);
        if (data) setFavorited(isFavorited(data._id));
      })
      .catch(() => setPrompt(null))
      .finally(() => setLoading(false));
  }, []);

  // ── Parallax on hero image ─────────────────────────────────────────────────
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const img = hero.querySelector("img") as HTMLImageElement | null;
    if (!img) return;

    const onScroll = () => {
      const scrolled = window.scrollY;
      img.style.transform = `translateY(${scrolled * 0.2}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [loading]);

  // ── Streak: mark complete when Actio scrolls into view ────────────────────
  useEffect(() => {
    const actio = actioRef.current;
    if (!actio || completed) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !completed) {
          markCompleted();
          setCompleted(true);
        }
      },
      { threshold: 0.3 }
    );
    observerRef.current.observe(actio);
    return () => observerRef.current?.disconnect();
  }, [loading, completed]);

  // ── Music ──────────────────────────────────────────────────────────────────
  const playChant = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    const a = new Audio(MUSIC_CHANT);
    a.loop = true;
    a.volume = 0.7;
    a.play().catch(() => {});
    audioRef.current = a;
    setMusicPlaying(true);
    setMusicMenuOpen(false);
  };

  const playAmbient = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    const a = new Audio(MUSIC_AMBIENT);
    a.loop = true;
    a.volume = 0.7;
    a.play().catch(() => {});
    audioRef.current = a;
    setMusicPlaying(true);
    setMusicMenuOpen(false);
  };

  const stopMusic = () => {
    audioRef.current?.pause();
    setMusicPlaying(false);
    setMusicMenuOpen(false);
  };

  // cleanup on unmount
  useEffect(() => () => audioRef.current?.pause(), []);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bgGradient }}>
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-white/15 border-t-white/60 rounded-full animate-spin mb-2" />
          <p style={{ color: C.creamDim }}>Loading today&apos;s prompt…</p>
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: C.bgGradient }}>
        <div className="text-center">
          <p className="text-sm mb-6" style={{ color: C.creamDim }}>No prompt for today yet.</p>
          <button onClick={() => router.back()} className="text-sm cta-inline-dark">← Back</button>
        </div>
      </div>
    );
  }

  return (
    <PageTransition variant="slide-up">
      <div className="min-h-screen pb-28" style={{ background: C.bgGradient }}>

        {/* ── Sticky header ───────────────────────────────────────────────── */}
        <div
          className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 safe-area-top"
          style={{ background: C.header, borderBottom: `1px solid ${C.divider}` }}
        >
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center"
            style={{ color: C.creamDim }}
            aria-label="Back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
            </svg>
          </button>

          <span className="text-xs tracking-widest uppercase" style={{ color: C.creamFaint }}>
            Daily Prompt
          </span>

          <div className="flex items-center gap-3">
            {/* Favorite */}
            <button
              onClick={() => setFavorited(toggleFavorite(prompt._id))}
              className="w-10 h-10 flex items-center justify-center"
              aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
              style={{ color: favorited ? C.gold : C.creamFaint }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={favorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth={favorited ? 0 : 1.5} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>
            {/* Share */}
            <button
              onClick={() => sharePrompt(prompt)}
              className="w-10 h-10 flex items-center justify-center"
              aria-label="Share"
              style={{ color: C.creamFaint }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
            </button>
            {/* Music */}
            <button
              onClick={() => setMusicMenuOpen(!musicMenuOpen)}
              className="text-xs font-medium"
              style={{ color: musicPlaying ? C.sageMuted : C.creamFaint }}
            >
              {musicPlaying ? "♪" : "Music"}
            </button>
          </div>
        </div>

        {/* Music menu */}
        {musicMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" aria-hidden onClick={() => setMusicMenuOpen(false)} />
            <div className="fixed top-14 right-4 z-50 w-40 py-1 shadow-lg" style={{ background: "#1e1410", border: `1px solid ${C.divider}` }}>
              {musicPlaying && (
                <button onClick={stopMusic} className="w-full px-4 py-2 text-left text-sm" style={{ color: C.cream }}>Stop</button>
              )}
              <button onClick={playChant} className="w-full px-4 py-2 text-left text-sm" style={{ color: C.creamDim }}>Chant</button>
              <button onClick={playAmbient} className="w-full px-4 py-2 text-left text-sm" style={{ color: C.creamDim }}>Ambient</button>
            </div>
          </>
        )}

        {/* ── Hero image with parallax ─────────────────────────────────────── */}
        <div ref={heroRef} className="relative w-full overflow-hidden" style={{ height: "55vh", marginTop: "48px" }}>
          <img
            src={prompt.content.imageUrl}
            alt={prompt.content.title}
            className="w-full h-full object-cover"
            style={{ filter: "contrast(1.1) brightness(0.75) sepia(0.08)", willChange: "transform" }}
          />
          {/* Gradient — lower third */}
          <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${C.bg} 0%, transparent 55%)` }} />

          {/* Title in lower third */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-6">
            <p className="text-xs tracking-widest uppercase mb-2" style={{ color: C.sage }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h1 className="font-serif-elegant text-3xl leading-tight mb-3" style={{ color: C.cream }}>
              {prompt.content.title}
            </h1>
            <p className="text-base italic leading-relaxed" style={{ color: C.creamDim, fontFamily: "var(--font-cormorant)" }}>
              &ldquo;{prompt.promptQuestion}&rdquo;
            </p>
          </div>
        </div>

        {/* ── Curator note ─────────────────────────────────────────────────── */}
        {prompt.curatorNote && (
          <div className="px-5 pt-6 pb-2">
            <p className="text-sm italic leading-relaxed" style={{ color: C.creamDim, fontFamily: "var(--font-cormorant)" }}>
              {prompt.curatorNote}
            </p>
          </div>
        )}

        {/* ── Lectio ───────────────────────────────────────────────────────── */}
        {prompt.lectio && (
          <section className="px-5 pt-8 pb-2">
            <p className="text-xs tracking-widest uppercase mb-4 pb-2" style={{ color: C.sageMuted, borderBottom: `1px solid ${C.divider}` }}>
              Reading <span style={{ color: C.creamFaint }}>(Lectio)</span>
            </p>
            <div className="pl-4" style={{ borderLeft: `1px solid ${C.gold}` }}>
              <p className="text-lg italic leading-relaxed" style={{ color: C.cream, fontFamily: "var(--font-cormorant)" }}>
                &ldquo;{prompt.lectio.text}&rdquo;
              </p>
              {prompt.lectio.attribution && (
                <p className="text-xs mt-3 tracking-wide" style={{ color: C.creamFaint }}>
                  — {prompt.lectio.attribution}
                </p>
              )}
            </div>
          </section>
        )}

        {/* ── Auditio ──────────────────────────────────────────────────────── */}
        {prompt.auditio && (
          <section className="px-5 pt-8 pb-2">
            <p className="text-xs tracking-widest uppercase mb-4 pb-2" style={{ color: C.sageMuted, borderBottom: `1px solid ${C.divider}` }}>
              Music <span style={{ color: C.creamFaint }}>(Auditio)</span>
            </p>
            <div className="flex items-center gap-4 py-3 px-4" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${C.divider}` }}>
              {prompt.auditio.url ? (
                <a
                  href={prompt.auditio.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex-shrink-0 flex items-center justify-center border"
                  style={{ borderColor: C.gold, color: C.gold }}
                  aria-label="Open in music app"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.14c-.938 0-1.64.703-1.64 1.64v6.72c0 .937.702 1.64 1.64 1.64h2.3l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06z" />
                  </svg>
                </a>
              ) : (
                <button
                  onClick={() => { if (musicPlaying) stopMusic(); else playChant(); }}
                  className="w-10 h-10 flex-shrink-0 flex items-center justify-center border"
                  style={{ borderColor: C.gold, color: C.gold }}
                  aria-label="Play chant"
                >
                  {musicPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
              )}
              <div>
                <p className="text-sm" style={{ color: C.cream }}>{prompt.auditio.title}</p>
                {prompt.auditio.artist && (
                  <p className="text-xs mt-0.5" style={{ color: C.creamFaint }}>{prompt.auditio.artist}</p>
                )}
                {prompt.auditio.url && (
                  <p className="text-xs mt-0.5" style={{ color: C.sageMuted }}>Opens externally →</p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── Actio ────────────────────────────────────────────────────────── */}
        <section ref={actioRef} className="px-5 pt-8 pb-2">
          <p className="text-xs tracking-widest uppercase mb-4 pb-2" style={{ color: C.sageMuted, borderBottom: `1px solid ${C.divider}` }}>
            Action <span style={{ color: C.creamFaint }}>(Actio)</span>
          </p>
          <p className="text-base italic leading-relaxed" style={{ color: C.cream, fontFamily: "var(--font-cormorant)" }}>
            {prompt.actio ?? "Carry one image of beauty with you today. Let it be a question, not an answer."}
          </p>
          {completed && (
            <p className="text-xs mt-4 tracking-wide" style={{ color: C.sageMuted }}>
              You showed up today.
            </p>
          )}
        </section>

        {/* ── Related Journey CTA ──────────────────────────────────────────── */}
        {prompt.relatedJourney && (
          <section className="px-5 pt-10 pb-2">
            <div className="py-4 px-5" style={{ border: `1px solid ${C.divider}` }}>
              <p className="text-xs tracking-widest uppercase mb-2" style={{ color: C.creamFaint }}>Go deeper</p>
              <Link
                href={`/journeys/${prompt.relatedJourney.slug.current}`}
                className="flex items-center justify-between group"
              >
                <p className="text-sm font-medium" style={{ color: C.cream }}>
                  {prompt.relatedJourney.title}
                </p>
                <span className="text-sm cta-inline-dark">Begin →</span>
              </Link>
            </div>
          </section>
        )}

        {/* ── Bottom padding ───────────────────────────────────────────────── */}
        <div className="h-16" />

      </div>
    </PageTransition>
  );
}
