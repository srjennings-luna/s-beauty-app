"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { getDailyPrompt } from "@/lib/sanity";
import type { DailyPrompt } from "@/lib/types";
import { addFavorite, removeFavorite, isFavorite } from "@/lib/favorites";
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

// ── Favorite — uses unified lib/favorites system (type: 'dailyPrompt') ────────
function isFavorited(id: string): boolean {
  if (typeof window === "undefined") return false;
  return isFavorite(id, "dailyPrompt");
}

function toggleFavorite(id: string): boolean {
  if (isFavorite(id, "dailyPrompt")) {
    removeFavorite(id, "dailyPrompt");
    return false;
  } else {
    addFavorite("dailyPrompt", id);
    return true;
  }
}

// ── Music ─────────────────────────────────────────────────────────────────────
const MUSIC_CHANT   = "/music/nickpanek-ave-maria-latin-catholic-gregorian-chant-218251.mp3";
const MUSIC_AMBIENT = "/music/natureseye-piano-dreamcloud-meditation-179215.mp3";

function DailyPromptPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date") ?? undefined; // e.g. "2026-03-17" from Library favorites
  const [prompt, setPrompt]               = useState<DailyPrompt | null>(null);
  const [loading, setLoading]             = useState(true);
  const [favorited, setFavorited]         = useState(false);
  const [completed, setCompleted]         = useState(false);
  const [musicPlaying, setMusicPlaying]   = useState(false);
  const [musicMenuOpen, setMusicMenuOpen] = useState(false);
  const [checkedItems, setCheckedItems]   = useState<boolean[]>([]);
  const [contextExpanded, setContextExpanded] = useState(false);

  const heroRef     = useRef<HTMLDivElement>(null);
  const actioRef    = useRef<HTMLDivElement>(null);
  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // ── Load prompt — uses ?date= param if present (e.g. from Library favorites) ─
  useEffect(() => {
    getDailyPrompt(dateParam)
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
  }, [dateParam]);

  // Parallax removed — hero uses pinch-to-zoom (TransformWrapper handles transforms)

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

        {/* ── Hero — pinch-to-zoom + pan ───────────────────────────────────── */}
        <div
          ref={heroRef}
          className="relative w-full overflow-hidden"
          style={{ height: "62vh", marginTop: "48px" }}
        >
          <TransformWrapper
            maxScale={8}
            minScale={1}
            centerOnInit
            wheel={{ disabled: true }}
          >
            <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
              <img
                src={prompt.content.imageUrl}
                alt={prompt.content.title}
                className="w-full h-full object-cover"
              />
            </TransformComponent>
          </TransformWrapper>

          {/* Light fade at bottom */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `linear-gradient(to top, rgba(22,17,13,0.35) 0%, transparent 50%)` }}
          />

          {/* Pinch hint — fades after first interaction */}
          <p
            className="absolute bottom-3 right-4 text-xs tracking-wide pointer-events-none"
            style={{ color: "rgba(253,246,232,0.4)" }}
          >
            pinch to explore
          </p>
        </div>

        {/* ── Title + date — always below image, small print ───────────────── */}
        <div className="px-6 pt-5 pb-2" style={{ background: C.bgGradient }}>
          <p className="text-xs tracking-widest uppercase mb-1" style={{ color: C.sageMuted, letterSpacing: "0.15em" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <p
            style={{
              color: C.creamDim,
              fontSize: "clamp(0.9rem, 3vw, 1.05rem)",
              fontWeight: 400,
            }}
          >
            {prompt.content.title}
          </p>
        </div>

        {/* ── Content body ─────────────────────────────────────────────────── */}
        <div className="px-6 mt-4 space-y-12">

          {/* ── Curator note — dark box, p-8, subtle border ─────────────── */}
          {prompt.curatorNote && (
            <div
              className="p-8"
              style={{
                background: "#24201d",
                border: `1px solid rgba(253,246,232,0.05)`,
              }}
            >
              <p
                className="leading-relaxed"
                style={{ color: C.creamDim, fontSize: "0.95rem", lineHeight: "1.75" }}
              >
                {prompt.curatorNote}
              </p>
            </div>
          )}

          {/* ── Prompt Question ─────────────────────────────────────────── */}
          {prompt.promptQuestion && (
            <div>
              <p
                className="leading-snug"
                style={{
                  color: C.cream,
                  fontFamily: "var(--font-cormorant)",
                  fontSize: "clamp(1.55rem, 5.5vw, 2rem)",
                  fontStyle: "italic",
                  lineHeight: "1.35",
                }}
              >
                {prompt.promptQuestion}
              </p>
            </div>
          )}

          {/* ── Context — teaser + collapsible ──────────────────────────── */}
          {prompt.content.context && (() => {
            // Split into sentences; show first 2 as teaser, rest behind toggle
            const sentences = prompt.content.context.match(/[^.!?]+[.!?]+/g) ?? [prompt.content.context];
            const teaser = sentences.slice(0, 2).join(" ").trim();
            const remainder = sentences.slice(2).join(" ").trim();
            return (
              <div>
                <p
                  className="leading-relaxed mb-3"
                  style={{ color: C.creamDim, fontSize: "0.95rem", lineHeight: "1.7" }}
                >
                  {teaser}
                </p>
                {remainder && (
                  <>
                    {contextExpanded && (
                      <p
                        className="leading-relaxed mb-3"
                        style={{ color: C.creamDim, fontSize: "0.95rem", lineHeight: "1.7" }}
                      >
                        {remainder}
                      </p>
                    )}
                    <button
                      onClick={() => setContextExpanded(!contextExpanded)}
                      className="flex items-center gap-2 text-xs tracking-widest uppercase"
                      style={{ color: C.sageMuted, letterSpacing: "0.18em" }}
                    >
                      <span>{contextExpanded ? "Less" : "Read more"}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        width={14}
                        height={14}
                        style={{ transform: contextExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            );
          })()}

          {/* ── Lectio ────────────────────────────────────────────────────── */}
          {prompt.lectio && (
            <section>
              <p
                className="text-xs tracking-widest mb-6 pb-2"
                style={{ color: C.sageMuted, borderBottom: `1px solid ${C.divider}`, letterSpacing: "0.2em" }}
              >
                READING <span style={{ color: C.creamFaint, fontWeight: 300 }}>(Lectio)</span>
              </p>
              <div className="pl-4 space-y-6" style={{ borderLeft: `1px solid rgba(138,126,114,0.3)` }}>

                {/* Philosophy quote — shown first when present */}
                {prompt.lectio.philosophyText && (
                  <div className="space-y-2">
                    <p
                      className="italic leading-tight"
                      style={{
                        color: C.cream,
                        fontFamily: "var(--font-cormorant)",
                        fontSize: "clamp(1.3rem, 4.5vw, 1.55rem)",
                        lineHeight: "1.4",
                      }}
                    >
                      &ldquo;{prompt.lectio.philosophyText}&rdquo;
                    </p>
                    {prompt.lectio.philosophyAttribution && (
                      <p className="text-xs tracking-widest uppercase" style={{ color: C.sageMuted }}>
                        — {prompt.lectio.philosophyAttribution}
                      </p>
                    )}
                  </div>
                )}

                {/* Scripture — shown second (or alone if no philosophy quote) */}
                <div className="space-y-2">
                  <p
                    className="italic leading-tight"
                    style={{
                      color: C.cream,
                      fontFamily: "var(--font-cormorant)",
                      fontSize: "clamp(1.3rem, 4.5vw, 1.55rem)",
                      lineHeight: "1.4",
                    }}
                  >
                    &ldquo;{prompt.lectio.text}&rdquo;
                  </p>
                  {prompt.lectio.attribution && (
                    <p className="text-xs tracking-widest uppercase" style={{ color: C.sageMuted }}>
                      — {prompt.lectio.attribution}
                    </p>
                  )}
                </div>

              </div>
            </section>
          )}

          {/* ── Auditio — circular player ──────────────────────────────────── */}
          {prompt.auditio && (
            <section>
              <p
                className="text-xs tracking-widest mb-6 pb-2"
                style={{ color: C.sageMuted, borderBottom: `1px solid ${C.divider}`, letterSpacing: "0.2em" }}
              >
                MUSIC <span style={{ color: C.creamFaint, fontWeight: 300 }}>(Auditio)</span>
              </p>
              {/* Resolve playable URL: Sanity-hosted file takes priority over external URL */}
              {(prompt.auditio.audioFileUrl ?? prompt.auditio.audioUrl) ? (
                /* ── In-app player — direct MP3 ── */
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => {
                      if (musicPlaying) {
                        stopMusic();
                      } else {
                        if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
                        const a = new Audio(prompt.auditio!.audioFileUrl ?? prompt.auditio!.audioUrl);
                        a.loop = false; a.volume = 0.85;
                        a.play().catch(() => {});
                        audioRef.current = a;
                        setMusicPlaying(true);
                      }
                    }}
                    className="flex-shrink-0 flex items-center justify-center shadow-2xl"
                    style={{ width: 64, height: 64, borderRadius: "50%", background: C.cream, color: C.bg }}
                    aria-label={musicPlaying ? "Pause" : "Play"}
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
                  <div className="flex-grow min-w-0">
                    <p className="italic truncate" style={{ color: C.cream, fontFamily: "var(--font-cormorant)", fontSize: "1.25rem" }}>
                      {prompt.auditio.title}
                    </p>
                    {prompt.auditio.artist && (
                      <p className="text-sm mt-1 truncate" style={{ color: C.creamFaint }}>{prompt.auditio.artist}</p>
                    )}
                  </div>
                </div>
              ) : prompt.auditio.url ? (
                /* ── External reference — no play button ── */
                <div className="flex items-start gap-4">
                  <div className="flex-grow min-w-0">
                    <p className="italic" style={{ color: C.cream, fontFamily: "var(--font-cormorant)", fontSize: "1.25rem" }}>
                      {prompt.auditio.title}
                    </p>
                    {prompt.auditio.artist && (
                      <p className="text-sm mt-1" style={{ color: C.creamFaint }}>{prompt.auditio.artist}</p>
                    )}
                    <a
                      href={prompt.auditio.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs mt-2 inline-block cta-inline-dark"
                    >
                      Listen externally →
                    </a>
                  </div>
                </div>
              ) : (
                /* ── Title only — no playback ── */
                <div>
                  <p className="italic" style={{ color: C.cream, fontFamily: "var(--font-cormorant)", fontSize: "1.25rem" }}>
                    {prompt.auditio.title}
                  </p>
                  {prompt.auditio.artist && (
                    <p className="text-sm mt-1" style={{ color: C.creamFaint }}>{prompt.auditio.artist}</p>
                  )}
                </div>
              )}
            </section>
          )}

          {/* ── Actio — checkboxes ──────────────────────────────────────────── */}
          <section ref={actioRef}>
            <p
              className="text-xs tracking-widest mb-6 pb-2"
              style={{ color: C.sageMuted, borderBottom: `1px solid ${C.divider}`, letterSpacing: "0.2em" }}
            >
              ACTION <span style={{ color: C.creamFaint, fontWeight: 300 }}>(Actio)</span>
            </p>

            {actioLines.length > 0 ? (
              <ul className="space-y-6">
                {actioLines.map((line: string, i: number) => (
                  <li key={i}>
                    <button
                      onClick={() => toggleCheck(i)}
                      className="flex items-start gap-4 text-left w-full"
                      aria-label={`Mark complete: ${line}`}
                    >
                      {/* Square checkbox — no rounded corners */}
                      <div
                        className="flex-shrink-0 mt-1"
                        style={{
                          width: 20, height: 20,
                          border: `1px solid ${checkedItems[i] ? C.gold : C.creamFaint}`,
                          background: checkedItems[i] ? C.gold : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        {checkedItems[i] && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke={C.bg} strokeWidth={2.5} width="12" height="12">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                      <span
                        className="leading-relaxed flex-1"
                        style={{
                          color: checkedItems[i] ? C.creamFaint : C.creamDim,
                          fontSize: "0.95rem",
                          lineHeight: "1.65",
                          textDecoration: checkedItems[i] ? "line-through" : "none",
                          textDecorationColor: C.creamFaint,
                          transition: "color 0.2s ease",
                        }}
                      >
                        {line}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p
                className="leading-relaxed"
                style={{ color: C.creamDim, fontSize: "0.95rem", lineHeight: "1.65" }}
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

          {/* ── Related Journey CTA ─────────────────────────────────────────── */}
          {prompt.relatedJourney && (
            <section>
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

        </div>{/* end space-y-12 */}
        <div className="h-16" />
      </div>
    </PageTransition>
  );
}

// useSearchParams() requires a Suspense boundary in Next.js App Router
export default function DailyPromptPage() {
  return (
    <Suspense>
      <DailyPromptPageInner />
    </Suspense>
  );
}
