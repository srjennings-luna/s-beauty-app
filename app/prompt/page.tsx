"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getDailyPrompt } from "@/lib/sanity";
import type { DailyPrompt } from "@/lib/types";
import PageTransition from "@/components/ui/PageTransition";

// ── Espresso palette ──────────────────────────────────────────────────────────
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

// ── Streak helpers ────────────────────────────────────────────────────────────
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
  if (last === today) return;

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
  if (idx > -1) { favs.splice(idx, 1); } else { favs.unshift(id); }
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
  return favs.includes(id);
}

// ── Music ─────────────────────────────────────────────────────────────────────
const MUSIC_CHANT   = "/music/nickpanek-ave-maria-latin-catholic-gregorian-chant-218251.mp3";
const MUSIC_AMBIENT = "/music/natureseye-piano-dreamcloud-meditation-179215.mp3";

export default function DailyPromptPage() {
  const router = useRouter();
  const [prompt, setPrompt]               = useState<DailyPrompt | null>(null);
  const [loading, setLoading]             = useState(true);
  const [favorited, setFavorited]         = useState(false);
  const [completed, setCompleted]         = useState(false);
  const [musicPlaying, setMusicPlaying]   = useState(false);
  const [musicMenuOpen, setMusicMenuOpen] = useState(false);
  const [checkedItems, setCheckedItems]   = useState<boolean[]>([]);

  const heroRef     = useRef<HTMLDivElement>(null);
  const actioRef    = useRef<HTMLDivElement>(null);
  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // ── Load today's prompt ────────────────────────────────────────────────────
  useEffect(() => {
    getDailyPrompt()
      .then((data) => {
        setPrompt(data ?? null);
        if (data) {
          setFavorited(isFavorited(data._id));
          // Parse actio into lines for checkboxes
          const lines = (data.actio ?? "")
            .split("\n")
            .map((l: string) => l.trim())
            .filter(Boolean);
          setCheckedItems(new Array(lines.length).fill(false));
        }
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
      img.style.transform = `translateY(${window.scrollY * 0.2}px)`;
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
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
    const a = new Audio(MUSIC_CHANT);
    a.loop = true; a.volume = 0.7;
    a.play().catch(() => {});
    audioRef.current = a;
    setMusicPlaying(true); setMusicMenuOpen(false);
  };

  const playAmbient = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
    const a = new Audio(MUSIC_AMBIENT);
    a.loop = true; a.volume = 0.7;
    a.play().catch(() => {});
    audioRef.current = a;
    setMusicPlaying(true); setMusicMenuOpen(false);
  };

  const stopMusic = () => {
    audioRef.current?.pause();
    setMusicPlaying(false); setMusicMenuOpen(false);
  };

  useEffect(() => () => audioRef.current?.pause(), []);

  // ── Toggle actio checkbox ──────────────────────────────────────────────────
  const toggleCheck = (i: number) => {
    setCheckedItems((prev) => prev.map((v, idx) => idx === i ? !v : v));
  };

  // ── Loading / error states ─────────────────────────────────────────────────
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

  // Parse actio text into lines
  const actioLines = (prompt.actio ?? "")
    .split("\n")
    .map((l: string) => l.trim())
    .filter(Boolean);

  const defaultActio = "Carry one image of beauty with you today. Let it be a question, not an answer.";

  return (
    <PageTransition variant="slide-up">
      <div className="min-h-screen pb-28" style={{ background: C.bgGradient }}>

        {/* Film grain */}
        <div
          aria-hidden
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            pointerEvents: "none",
            mixBlendMode: "overlay",
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
          }}
        />

        {/* ── Sticky glass header ──────────────────────────────────────────── */}
        <div
          className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 safe-area-top"
          style={{
            background: "rgba(22,17,13,0.82)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: `1px solid ${C.divider}`,
          }}
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

        {/* ── Hero — full color, tall, parallax ───────────────────────────── */}
        <div
          ref={heroRef}
          className="relative w-full overflow-hidden"
          style={{ height: "72vh", marginTop: "48px" }}
        >
          <img
            src={prompt.content.imageUrl}
            alt={prompt.content.title}
            className="w-full h-full object-cover"
            style={{ willChange: "transform" }}
          />
          {/* Gradient — bottom fade only, preserves color in upper portion */}
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(to top, ${C.bg} 0%, rgba(22,17,13,0.5) 40%, transparent 70%)` }}
          />
          {/* Date + title in lower third */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-7">
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: C.sage }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h1
              className="font-serif-elegant leading-[0.92]"
              style={{ color: C.cream, fontSize: "clamp(2.6rem, 8vw, 4rem)", fontStyle: "italic" }}
            >
              {prompt.content.title}
            </h1>
          </div>
        </div>

        {/* ── Prompt question — full width below hero ──────────────────────── */}
        <div className="px-5 pt-7 pb-4">
          <p
            className="leading-snug"
            style={{
              color: C.cream,
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(1.35rem, 4.5vw, 1.7rem)",
              fontStyle: "italic",
              lineHeight: "1.35",
            }}
          >
            &ldquo;{prompt.promptQuestion}&rdquo;
          </p>
        </div>

        {/* ── Curator note — contained box ────────────────────────────────── */}
        {prompt.curatorNote && (
          <div className="px-5 pt-2 pb-2">
            <div
              className="px-5 py-4"
              style={{
                background: "rgba(253,246,232,0.04)",
                borderLeft: `2px solid ${C.gold}`,
              }}
            >
              <p
                className="text-sm italic leading-relaxed"
                style={{ color: C.creamDim, fontFamily: "var(--font-cormorant)", fontSize: "1.05rem" }}
              >
                {prompt.curatorNote}
              </p>
            </div>
          </div>
        )}

        {/* ── Lectio ───────────────────────────────────────────────────────── */}
        {prompt.lectio && (
          <section className="px-5 pt-10 pb-2">
            <p
              className="text-xs tracking-widest mb-5 pb-3"
              style={{ color: C.sageMuted, borderBottom: `1px solid ${C.divider}`, letterSpacing: "0.2em" }}
            >
              READING <span style={{ color: C.creamFaint, fontWeight: 300 }}>(Lectio)</span>
            </p>
            <p
              className="italic leading-relaxed mb-3"
              style={{
                color: C.cream,
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(1.2rem, 4vw, 1.5rem)",
                lineHeight: "1.5",
              }}
            >
              &ldquo;{prompt.lectio.text}&rdquo;
            </p>
            {prompt.lectio.attribution && (
              <p className="text-xs tracking-widest uppercase mt-4" style={{ color: C.creamFaint }}>
                — {prompt.lectio.attribution}
              </p>
            )}
          </section>
        )}

        {/* ── Auditio — circular player ────────────────────────────────────── */}
        {prompt.auditio && (
          <section className="px-5 pt-10 pb-2">
            <p
              className="text-xs tracking-widest mb-5 pb-3"
              style={{ color: C.sageMuted, borderBottom: `1px solid ${C.divider}`, letterSpacing: "0.2em" }}
            >
              MUSIC <span style={{ color: C.creamFaint, fontWeight: 300 }}>(Auditio)</span>
            </p>
            <div className="flex items-center gap-5">
              {/* Large circular play button */}
              {prompt.auditio.url ? (
                <a
                  href={prompt.auditio.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{
                    width: 64, height: 64,
                    borderRadius: "50%",
                    background: C.cream,
                    color: C.bg,
                  }}
                  aria-label="Open in music app"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </a>
              ) : (
                <button
                  onClick={() => { if (musicPlaying) stopMusic(); else playChant(); }}
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{
                    width: 64, height: 64,
                    borderRadius: "50%",
                    background: C.cream,
                    color: C.bg,
                  }}
                  aria-label={musicPlaying ? "Pause" : "Play chant"}
                >
                  {musicPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
              )}
              {/* Track info */}
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium truncate" style={{ color: C.cream }}>
                  {prompt.auditio.title}
                </p>
                {prompt.auditio.artist && (
                  <p className="text-sm mt-0.5 truncate" style={{ color: C.creamFaint }}>
                    {prompt.auditio.artist}
                  </p>
                )}
                {prompt.auditio.url && (
                  <p className="text-xs mt-1" style={{ color: C.sageMuted }}>Opens externally →</p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── Actio — checkboxes ───────────────────────────────────────────── */}
        <section ref={actioRef} className="px-5 pt-10 pb-2">
          <p
            className="text-xs tracking-widest mb-5 pb-3"
            style={{ color: C.sageMuted, borderBottom: `1px solid ${C.divider}`, letterSpacing: "0.2em" }}
          >
            ACTION <span style={{ color: C.creamFaint, fontWeight: 300 }}>(Actio)</span>
          </p>

          {actioLines.length > 0 ? (
            <div className="flex flex-col gap-5">
              {actioLines.map((line: string, i: number) => (
                <button
                  key={i}
                  onClick={() => toggleCheck(i)}
                  className="flex items-start gap-4 text-left w-full"
                  aria-label={`Mark complete: ${line}`}
                >
                  {/* Square checkbox — KALLOS design system: no rounded corners */}
                  <div
                    className="flex-shrink-0 mt-1"
                    style={{
                      width: 20, height: 20,
                      border: `1px solid ${checkedItems[i] ? C.gold : C.creamFaint}`,
                      background: checkedItems[i] ? C.gold : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {checkedItems[i] && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke={C.bg} strokeWidth={2.5} width="12" height="12">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                  <p
                    className="italic leading-relaxed flex-1"
                    style={{
                      color: checkedItems[i] ? C.creamFaint : C.cream,
                      fontFamily: "var(--font-cormorant)",
                      fontSize: "clamp(1.1rem, 3.5vw, 1.3rem)",
                      textDecoration: checkedItems[i] ? "line-through" : "none",
                      textDecorationColor: C.creamFaint,
                      transition: "color 0.2s ease",
                    }}
                  >
                    {line}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <p
              className="italic leading-relaxed"
              style={{ color: C.cream, fontFamily: "var(--font-cormorant)", fontSize: "clamp(1.1rem, 3.5vw, 1.3rem)" }}
            >
              {defaultActio}
            </p>
          )}

          {completed && (
            <p className="text-xs mt-6 tracking-wide" style={{ color: C.sageMuted }}>
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

        <div className="h-16" />
      </div>
    </PageTransition>
  );
}
