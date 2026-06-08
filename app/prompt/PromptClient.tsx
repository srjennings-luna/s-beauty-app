"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { getDailyPrompt, getDailyPromptPreview, getPpDefaults } from "@/lib/sanity";
import type { DailyPrompt, PpDefaults } from "@/lib/types";
import { addFavorite, removeFavorite, isFavorite } from "@/lib/favorites";
import PageTransition from "@/components/ui/PageTransition";
import NarrationButton from "@/components/NarrationButton";
import {
  NARRATION_START_EVENT,
  NARRATION_END_EVENT,
  AUDITIO_START_EVENT,
  AUDITIO_END_EVENT,
} from "@/lib/audioEvents";
import PPGradientBackground from "@/components/PPGradientBackground";
import useStreak from "@/hooks/useStreak";
import useMediaSession from "@/hooks/useMediaSession";

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  return `${m}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
}

// ── Espresso palette ──────────────────────────────────────────────────────────
// The /prompt screen no longer uses the shared Whisper gradient — it has its
// own three-layer P&P gradient driven by content type (PPGradientBackground).
const C = {
  bg: "var(--color-espresso)",
  header: "rgba(22,17,13,0.97)",
  cream: "rgba(253,246,232,0.88)",
  creamDim: "rgba(253,246,232,0.5)",
  creamFaint: "rgba(253,246,232,0.25)",
  sage: "var(--color-sage)",
  sageMuted: "var(--color-sage-muted)",
  gold: "var(--color-gold)",
  divider: "rgba(253,246,232,0.1)",
};

// ── Streak ────────────────────────────────────────────────────────────────────
// Streak read/write moved to the auth-ready data layer June 2, 2026.
// Components consume via the useStreak() hook (hooks/useStreak.ts) which
// wraps lib/userData.ts. When auth ships the underlying storage swaps
// from localStorage to API; this component does not change.

// ── Share ─────────────────────────────────────────────────────────────────────
async function sharePrompt(prompt: DailyPrompt) {
  // date= ensures the recipient sees the correct day's content.
  // v= is a cache-buster so X/Facebook always scrape fresh OG metadata on every
  // share rather than serving a stale cached card from a previous share of the same URL.
  // The app ignores the v param — only date is used for content lookup.
  const shareUrl = `${window.location.origin}/prompt?date=${prompt.date}&v=${Date.now()}`;
  const text = `"${prompt.promptQuestion}"\n\n— CONTUERI`;
  if (navigator.share) {
    try {
      await navigator.share({ title: "Pause & Ponder — CONTUERI", text, url: shareUrl });
    } catch (_) { /* dismissed */ }
  } else {
    await navigator.clipboard.writeText(`${text}\n\n${shareUrl}`);
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
// Background music (Chant / Ambient) was removed June 2, 2026. Editorial
// decision: music selection is content-specific per day and lives in the
// Auditio field of each dailyPrompt. General music browsing will move to
// the Explore tab. The Music button + dropdown was simplifying clutter
// out of the contemplative chrome row.

function DailyPromptPageInner({
  initialDate,
  showSettings,
}: {
  initialDate?: string;
  // When true (Today landing route), the chrome's left button is a gear
  // icon linking to /settings instead of a back chevron. Back on Today
  // has no meaningful destination; gear is the more useful affordance
  // and matches the SET-01 spec (gear top-right on Today). On the
  // standalone /prompt route and Library archive views, this stays
  // false so the back chevron behaves normally.
  showSettings?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Prefer an explicit path-param date (from /prompt/[date]) over the query
  // string (/prompt?date=X), since Sanity Presentation can only construct
  // path-based iframe URLs cleanly — query strings get URL-encoded into the
  // pathname and 404.
  const dateParam = initialDate ?? searchParams.get("date") ?? undefined;
  // Preview mode is always on for the path-based alias (only Presentation uses it).
  const isPreview = !!initialDate || searchParams.get("preview") === "1";
  const [prompt, setPrompt]               = useState<DailyPrompt | null>(null);
  const [ppDefaults, setPpDefaults]       = useState<PpDefaults | null>(null);
  const [loading, setLoading]             = useState(true);
  const [favorited, setFavorited]         = useState(false);
  const [completed, setCompleted]         = useState(false);
  // `musicPlaying` now tracks Auditio (artwork audio) playback only.
  // Background-music state was retired with the Music button removal.
  const [musicPlaying, setMusicPlaying]   = useState(false);
  const [checkedItems, setCheckedItems]   = useState<boolean[]>([]);
  const [contextExpanded, setContextExpanded] = useState(false);
  const [verbaOpen, setVerbaOpen]             = useState(false);
  // Once the user pinches or pans the hero, the "pinch to explore image"
  // hint fades out. Set to true on first zoom/pan and stays true for the
  // rest of the session — the hint never returns once the affordance has
  // been used.
  const [heroInteracted, setHeroInteracted]   = useState(false);

  const [auditioDuration, setAudiotioDuration] = useState(0);

  // Streak marker. The hook handles the localStorage read/write through
  // the auth-ready data layer; when auth ships the streak count and last-
  // completed date move to the user record without changing this code.
  const { markCompleted: markStreakCompleted } = useStreak();

  const heroRef               = useRef<HTMLDivElement>(null);
  const actioRef              = useRef<HTMLDivElement>(null);
  const auditioRef            = useRef<HTMLAudioElement | null>(null);  // artwork audio
  const observerRef           = useRef<IntersectionObserver | null>(null);
  const wasAuditioPlayingRef  = useRef(false);
  // DOM refs for Auditio progress bar — direct manipulation for smooth real-time updates
  const auditioFillRef        = useRef<HTMLDivElement | null>(null);
  const auditioTimeRef        = useRef<HTMLSpanElement | null>(null);
  const auditioRangeRef       = useRef<HTMLInputElement | null>(null);

  // ── Load prompt — preview mode fetches drafts; falls back to published if no token ─
  // Also parallel-fetches the ppDefaults singleton so the Actio cascade can use
  // the editor-tunable default when this day's actio is blank. PP-DEFAULTS-01.
  useEffect(() => {
    const fetchFn = isPreview && dateParam
      ? getDailyPromptPreview(dateParam).catch(() => null).then(data => data ?? getDailyPrompt(dateParam))
      : getDailyPrompt(dateParam);
    Promise.all([fetchFn, getPpDefaults().catch(() => null)])
      .then(([data, defaults]) => {
        setPrompt(data ?? null);
        setPpDefaults(defaults ?? null);
        if (data) {
          setFavorited(isFavorited(data._id));
          // Parse actio into lines for checkboxes — use the same cascade
          // the render path uses so the checkbox count matches what's shown.
          const actioText =
            (data.actio && data.actio.trim()) ||
            (defaults?.defaultActio && String(defaults.defaultActio).trim()) ||
            "";
          const lines = actioText
            .split("\n")
            .map((l: string) => l.trim())
            .filter(Boolean);
          setCheckedItems(new Array(lines.length).fill(false));
        }
      })
      .catch(() => setPrompt(null))
      .finally(() => setLoading(false));
  }, [dateParam, isPreview]);

  // Parallax removed — hero uses pinch-to-zoom (TransformWrapper handles transforms)

  // ── Streak: mark complete when Actio scrolls into view ────────────────────
  useEffect(() => {
    const actio = actioRef.current;
    if (!actio || completed) return;
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !completed) {
          markStreakCompleted();
          setCompleted(true);
        }
      },
      { threshold: 0.3 }
    );
    observerRef.current.observe(actio);
    return () => observerRef.current?.disconnect();
  }, [loading, completed]);

  // ── Auditio lifecycle ──────────────────────────────────────────────────────
  // Cleanup on unmount.
  useEffect(() => () => { auditioRef.current?.pause(); }, []);

  // MediaSession metadata for the iOS lockscreen, Control Center,
  // AirPods, and CarPlay. Activates while Auditio is playing; clears
  // when paused or the prompt unmounts. The artwork is the day's
  // painting (DailyPrompt content image), which Sanity CDN re-serves
  // at the iOS-appropriate sizes via query params.
  useMediaSession({
    audioRef: auditioRef,
    active: musicPlaying,
    track:
      musicPlaying && prompt?.auditio
        ? {
            // Prefer the structured workTitle (e.g. "O Vos Omnes") with
            // a fallback to the free-text title (used pre R7-migration).
            title:
              prompt.auditio.workTitle?.trim() ||
              prompt.auditio.title?.trim() ||
              "Auditio",
            artist: prompt.auditio.composerArtist?.trim() || undefined,
            album: "Contueri · Pause and Ponder",
            artworkUrl: prompt.content?.imageUrl,
          }
        : null,
    onPlay: () => setMusicPlaying(true),
    onPause: () => setMusicPlaying(false),
  });

  // Pause Auditio when narration starts; auto-resume when narration ends.
  useEffect(() => {
    const startHandler = () => {
      wasAuditioPlayingRef.current = !!(auditioRef.current && !auditioRef.current.paused);
      if (auditioRef.current && !auditioRef.current.paused) {
        auditioRef.current.pause();
        setMusicPlaying(false);
      }
    };
    const endHandler = () => {
      if (wasAuditioPlayingRef.current && auditioRef.current) {
        auditioRef.current.play().catch(() => {});
        setMusicPlaying(true);
        wasAuditioPlayingRef.current = false;
      }
    };
    window.addEventListener(NARRATION_START_EVENT, startHandler);
    window.addEventListener(NARRATION_END_EVENT, endHandler);
    return () => {
      window.removeEventListener(NARRATION_START_EVENT, startHandler);
      window.removeEventListener(NARRATION_END_EVENT, endHandler);
    };
  }, []);

  // Tell the global ambient-sound provider when the P&P Auditio
  // starts / stops so it can pause itself for the duration. Without
  // this, the curated music + the ambient track played simultaneously
  // and stepped on each other (caught June 6, 2026 — Veni Creator
  // Spiritus overlapping Gregorian Chant on a Today screen).
  //
  // The effect dispatches START whenever `musicPlaying` flips to true,
  // and END whenever it flips to false OR the component unmounts. The
  // provider refcounts these events alongside narration, so if both
  // narration and Auditio fire START before either fires END, ambient
  // stays paused until both have ended.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (musicPlaying) {
      window.dispatchEvent(new CustomEvent(AUDITIO_START_EVENT));
      return () => {
        window.dispatchEvent(new CustomEvent(AUDITIO_END_EVENT));
      };
    }
  }, [musicPlaying]);

  // ── Toggle actio checkbox ──────────────────────────────────────────────────
  const toggleCheck = (i: number) => {
    setCheckedItems((prev) => prev.map((v, idx) => idx === i ? !v : v));
  };

  // ── Loading / error states ─────────────────────────────────────────────────
  // Both states wrap with PPGradientBackground so the page atmosphere is
  // consistent before/during/after content load. Undefined contentType
  // falls back to sacred-art (Mineral Blue) per getPPGradient.
  if (loading) {
    return (
      <PPGradientBackground contentType={undefined}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-white/15 border-t-white/60 rounded-full animate-spin mb-2" />
            <p style={{ color: C.creamDim }}>Loading today&apos;s prompt…</p>
          </div>
        </div>
      </PPGradientBackground>
    );
  }

  if (!prompt) {
    return (
      <PPGradientBackground contentType={undefined}>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-sm mb-6" style={{ color: C.creamDim }}>No prompt for today yet.</p>
            <button onClick={() => router.back()} className="text-sm cta-inline-dark">← Back</button>
          </div>
        </div>
      </PPGradientBackground>
    );
  }

  // Actio cascade (PP-DEFAULTS-01): per-day actio on the prompt → editable
  // ppDefaults.defaultActio singleton → hardcoded last-resort fallback. The
  // hardcoded value preserves the exact pre-PP-DEFAULTS-01 string so a fresh
  // dataset with no singleton document still shows something contemplative.
  const HARDCODED_FALLBACK_ACTIO =
    "Look for beauty today, in a person, in the ordinary, in what would have passed unnoticed.";
  const resolvedActio =
    (prompt.actio && prompt.actio.trim()) ||
    (ppDefaults?.defaultActio && ppDefaults.defaultActio.trim()) ||
    HARDCODED_FALLBACK_ACTIO;
  // Parse the resolved actio into lines. When the resolution comes from the
  // singleton/hardcoded fallback (one sentence), this becomes a single-line
  // array — the render path still shows it correctly via the empty-actio-lines
  // branch below.
  const actioLines = (prompt.actio ?? "")
    .split("\n")
    .map((l: string) => l.trim())
    .filter(Boolean);
  // Keep the `defaultActio` name for the existing JSX `else` branch — but
  // route it through the cascade now so editorial can tune the fallback.
  const defaultActio = resolvedActio;

  // Note on nesting order: PPGradientBackground wraps PageTransition (not
  // the other way around). PageTransition uses `transform` + `will-change`
  // which create a CSS containing block for position:fixed children. If the
  // gradient lived inside, its `position: fixed` would be relative to
  // PageTransition's element rather than the viewport — clipping the
  // gradient at the page's scroll height. Outside, the gradient covers the
  // viewport reliably while the content still animates.
  return (
    <PPGradientBackground contentType={prompt.content?.contentType}>
      <PageTransition variant="slide-up">
      <div className="pb-28">

        {/* Preview mode banner */}
        {isPreview && (
          <div
            className="font-open-sans"
            style={{
              position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
              background: "var(--color-gold)", color: "var(--color-espresso)",
              textAlign: "center", padding: "8px 16px",
              fontSize: "0.8rem",
              fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
            }}>
            Preview mode — draft content
          </div>
        )}

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

        {/* ── Sticky top chrome ────────────────────────────────────────────
            Sticky (not fixed) so the chrome occupies its own physical row
            at the top of the document, with the image flush below it. As
            the user scrolls, the chrome pins to the viewport top. Image
            scrolls up and disappears under the chrome cleanly. Removing
            the prior `fixed` + hero `marginTop: 48px` pattern eliminates
            the dead space above the image that long predated the strip
            work. June 2, 2026 redesign.
            Music button + dropdown removed same date (see Music section). */}
        <div
          className="sticky top-0 z-30"
          style={{
            paddingTop: "env(safe-area-inset-top, 16px)",
            background: "rgba(22,17,13,0.82)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{
              borderBottom: `1px solid ${C.divider}`,
            }}
          >
            {showSettings ? (
              <Link
                href="/settings"
                className="w-10 h-10 flex items-center justify-center"
                style={{ color: C.creamDim }}
                aria-label="Settings"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.759 6.759 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
            ) : (
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
            )}

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
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
              </svg>
            </button>
          </div>
        </div>
        </div>

        {/* ── Hero — pinch-to-zoom + pan ───────────────────────────────────── */}
        {/* Dynamic height — the image determines container height. Wide
            horizontal pieces produce a short hero; tall icons / portraits
            produce a tall one. `max-height: 85vh` caps the extreme so a
            very tall painting still lets the date + title peek at the
            bottom of the first viewport. No more fixed 62vh letterbox.
            No marginTop — chrome is sticky and sits above this row in
            document flow, so the image starts flush against the chrome's
            bottom border. June 2, 2026 redesign. */}
        <div
          ref={heroRef}
          className="relative w-full overflow-hidden"
          style={{ maxHeight: "85vh" }}
        >
          <TransformWrapper
            maxScale={8}
            minScale={1}
            centerOnInit
            wheel={{ disabled: true }}
            onZoomStart={() => setHeroInteracted(true)}
            onPanningStart={() => setHeroInteracted(true)}
          >
            <TransformComponent
              wrapperStyle={{ width: "100%", height: "auto" }}
              contentStyle={{ width: "100%", height: "auto" }}
            >
              <img
                src={prompt.content.imageUrl}
                alt={prompt.content.title}
                style={{ width: "100%", height: "auto", maxHeight: "85vh", display: "block" }}
              />
            </TransformComponent>
          </TransformWrapper>

          {/* Light fade at bottom */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `linear-gradient(to top, rgba(22,17,13,0.35) 0%, transparent 50%)` }}
          />

          {/* Pinch hint — overlaid bottom-right of image. Fades out on
              first zoom or pan via TransformWrapper's onZoomStart /
              onPanningStart callbacks above (which set heroInteracted).
              Stays mounted so the opacity transition reads as a graceful
              fade rather than a pop, and aria-hidden once faded. */}
          <div
            className="absolute pointer-events-none"
            aria-hidden={heroInteracted}
            style={{
              bottom: 12,
              right: 14,
              color: "rgba(253,246,232,0.5)",
              fontFamily: "var(--font-open-sans), 'Open Sans', sans-serif",
              fontSize: 11,
              fontStyle: "italic",
              letterSpacing: "0.02em",
              textShadow: "0 1px 3px rgba(0,0,0,0.45)",
              opacity: heroInteracted ? 0 : 1,
              transition: "opacity 0.4s ease-out",
            }}
          >
            pinch to explore image
          </div>
        </div>

        {/* ── Editorial title + date ────────────────────────────────────────
            Date on its own line in sage caps (color cascades from the
            type-accent so a Music day reads plum, a Sacred Art day
            reads mineral blue, etc.). Title sits below the date in
            Cormorant Garamond italic at 50px — confidently editorial.
            Pinch hint that used to share the date's row has moved onto
            the image as an overlay (see hero block above). June 2, 2026.
            No background — PPGradientBackground is the atmosphere now. */}
        <div className="px-6" style={{ paddingTop: 32, paddingBottom: 4 }}>
          <p
            className="uppercase"
            style={{
              color: "var(--pp-accent)",
              fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: "0.24em",
              marginBottom: 14,
            }}
          >
            {new Date(prompt.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <p
            style={{
              color: C.cream,
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: "clamp(2.25rem, 11vw, 3.125rem)",
              lineHeight: 1.02,
              letterSpacing: "0.003em",
            }}
          >
            {prompt.content.title}
          </p>
        </div>

        {/* ── Content body ─────────────────────────────────────────────────── */}
        <div className="px-6 mt-4 space-y-12">

          {/* ── Curator note — dark box, p-8, subtle border ───────────────
             The P&P curator note is the hook for THIS prompt-day. It is a
             separate field (dailyPrompt.curatorNote) from the content item's
             artworkHook. We render only the prompt-day's curator note here.
             The content item's artworkHook is intentionally NOT shown on P&P;
             it belongs on Journey / Explore / Library where the piece appears
             standalone. Rule: three fields, three jobs (R1, April 24 2026).
          */}
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
                style={{ color: C.cream, fontSize: "0.95rem", lineHeight: "1.75" }}
              >
                {prompt.curatorNote}
              </p>
              {prompt.curatorNoteAudioUrl && (
                <div className="mt-3">
                  <NarrationButton audioUrl={prompt.curatorNoteAudioUrl} />
                </div>
              )}
            </div>
          )}

          {/* ── Day Title / Prompt Question ───────────────────────────────
              PP-DAYTITLE-01 (June 7, 2026): prefer the editorial dayTitle
              (e.g. "God Does Not Die" for the Sacred Heart day) when it's
              set on the dailyPrompt. Falls back to promptQuestion for
              backwards-compat with older P&P docs that pre-date dayTitle.
              Both occupy the same visual slot — Cormorant italic, large
              type, sits beneath curator note and above artwork hook. */}
          {(prompt.dayTitle || prompt.promptQuestion) && (
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
                {prompt.dayTitle || prompt.promptQuestion}
              </p>
            </div>
          )}

          {/* ── Context — teaser + collapsible ──────────────────────────── */}
          {prompt.content.context && (() => {
            const contextAudioUrl = prompt.content.contextAudioUrl;
            // Split by paragraph breaks (Sanity plain text uses \n\n between paragraphs)
            const paragraphs = prompt.content.context.split(/\n\n+/).map((p: string) => p.trim()).filter(Boolean);
            const teaser = paragraphs[0] ?? "";
            const remainderParagraphs = paragraphs.slice(1);
            return (
              <div>
                <p
                  className="leading-relaxed mb-3"
                  style={{ color: C.cream, fontSize: "0.95rem", lineHeight: "1.7", whiteSpace: "pre-line" }}
                >
                  {teaser}
                </p>
                {remainderParagraphs.length === 0 && contextAudioUrl && (
                  <NarrationButton audioUrl={contextAudioUrl} />
                )}
                {remainderParagraphs.length > 0 && (
                  <>
                    {contextExpanded && (
                      <div className="mb-3">
                        {remainderParagraphs.map((para: string, i: number) => (
                          <p
                            key={i}
                            className="leading-relaxed"
                            style={{ color: C.cream, fontSize: "0.95rem", lineHeight: "1.7", whiteSpace: "pre-line", marginBottom: i < remainderParagraphs.length - 1 ? "0.75rem" : 0 }}
                          >
                            {para}
                          </p>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setContextExpanded(!contextExpanded)}
                        className="flex items-center gap-2 text-xs tracking-widest uppercase"
                        style={{ color: "var(--pp-accent)", letterSpacing: "0.18em" }}
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
                      <NarrationButton audioUrl={contextAudioUrl} />
                    </div>
                  </>
                )}
              </div>
            );
          })()}

          {/* ── Music (Auditio): circular player ────────────────────────────
              Moved above Voices + Lectio June 2 2026. The day's editorial
              music sets the contemplative ground for the reading that
              follows. On no-music days the section is skipped and the
              user lands directly on Voices.
              VERBA stays inside this section as the Latin to English
              translation panel for chanted audio (conditional on the
              auditio.verbaOriginal field being populated). */}
          {prompt.auditio && (
            <section>
              <p
                className="text-xs tracking-widest mb-6 pb-2"
                style={{ color: "var(--pp-accent)", borderBottom: `1px solid ${C.divider}`, letterSpacing: "0.2em" }}
              >
                MUSIC <span style={{ color: C.creamFaint, fontWeight: 300 }}>(Auditio)</span>
              </p>
              {/* Resolve playable URL: Sanity-hosted file takes priority over external URL */}
              {(prompt.auditio.audioFileUrl ?? prompt.auditio.audioUrl) ? (
                /* ── In-app player — direct MP3 ── */
                <div>
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => {
                        if (musicPlaying) {
                          auditioRef.current?.pause();
                          setMusicPlaying(false);
                        } else {
                          // Create fresh audio element on first play or after track ended
                          if (!auditioRef.current || auditioRef.current.ended) {
                            const a = new Audio(prompt.auditio!.audioFileUrl ?? prompt.auditio!.audioUrl);
                            a.loop = false; a.volume = 0.85;
                            a.addEventListener("timeupdate", () => {
                              if (!a.duration) return;
                              const pct = a.currentTime / a.duration;
                              if (auditioFillRef.current)  auditioFillRef.current.style.width  = `${pct * 100}%`;
                              if (auditioTimeRef.current)  auditioTimeRef.current.textContent  = formatTime(a.currentTime);
                              if (auditioRangeRef.current) auditioRangeRef.current.value       = String(pct);
                            });
                            a.addEventListener("loadedmetadata", () => setAudiotioDuration(a.duration));
                            a.addEventListener("ended", () => {
                              setMusicPlaying(false);
                              if (auditioFillRef.current)  auditioFillRef.current.style.width  = "0%";
                              if (auditioTimeRef.current)  auditioTimeRef.current.textContent  = "0:00";
                              if (auditioRangeRef.current) auditioRangeRef.current.value       = "0";
                            });
                            auditioRef.current = a;
                          }
                          auditioRef.current.play().catch(() => {});
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
                      <p className="italic truncate" style={{ color: C.cream, fontSize: "0.95rem" }}>
                        {prompt.auditio.title}
                      </p>
                      {prompt.auditio.composerArtist && (
                        <p className="text-sm mt-1 truncate" style={{ color: C.creamFaint }}>{prompt.auditio.composerArtist}</p>
                      )}
                    </div>
                  </div>
                  {/* Progress bar — only shows once audio has loaded metadata */}
                  {auditioDuration > 0 && (
                    <div className="mt-4">
                      <div style={{ position: "relative", width: "100%", height: 20, display: "flex", alignItems: "center" }}>
                        <div style={{ position: "absolute", width: "100%", height: 3, background: "rgba(253,246,232,0.12)" }}>
                          <div ref={auditioFillRef} style={{ width: "0%", height: "100%", background: "var(--pp-accent)" }} />
                        </div>
                        {/* Uncontrolled range input — value updated via ref in timeupdate for smooth scrubbing */}
                        <input
                          ref={auditioRangeRef}
                          type="range"
                          min={0}
                          max={1}
                          step={0.001}
                          defaultValue={0}
                          onChange={(e) => {
                            const ratio = parseFloat(e.target.value);
                            if (auditioRef.current) auditioRef.current.currentTime = ratio * auditioDuration;
                            if (auditioFillRef.current)  auditioFillRef.current.style.width  = `${ratio * 100}%`;
                            if (auditioTimeRef.current)  auditioTimeRef.current.textContent  = formatTime(ratio * auditioDuration);
                          }}
                          style={{ position: "absolute", width: "100%", height: "100%", opacity: 0, cursor: "pointer", margin: 0, padding: 0, zIndex: 1 }}
                          aria-label="Seek"
                        />
                      </div>
                      <div className="flex justify-between mt-1" style={{ color: C.creamFaint, fontSize: "0.65rem", letterSpacing: "0.04em" }}>
                        <span ref={auditioTimeRef}>0:00</span>
                        <span>{formatTime(auditioDuration)}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : prompt.auditio.externalUrl ? (
                /* ── External reference — no play button ── */
                <div className="flex items-start gap-4">
                  <div className="flex-grow min-w-0">
                    <p className="italic" style={{ color: C.cream, fontSize: "0.95rem" }}>
                      {prompt.auditio.title}
                    </p>
                    {prompt.auditio.composerArtist && (
                      <p className="text-sm mt-1" style={{ color: C.creamFaint }}>{prompt.auditio.composerArtist}</p>
                    )}
                    <a
                      href={prompt.auditio.externalUrl}
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
                  <p className="italic" style={{ color: C.cream, fontSize: "0.95rem" }}>
                    {prompt.auditio.title}
                  </p>
                  {prompt.auditio.composerArtist && (
                    <p className="text-sm mt-1" style={{ color: C.creamFaint }}>{prompt.auditio.composerArtist}</p>
                  )}
                </div>
              )}

              {/* ── Verba — expandable lyrics panel (only when text is present) ── */}
              {prompt.auditio.verbaOriginal && (
                <div className="mt-6">
                  <button
                    onClick={() => setVerbaOpen(v => !v)}
                    className="flex items-center gap-2 text-left"
                    style={{ color: "var(--pp-accent)" }}
                    aria-expanded={verbaOpen}
                  >
                    <span className="text-xs tracking-widest" style={{ letterSpacing: "0.2em" }}>VERBA</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      width="14"
                      height="14"
                      style={{
                        transform: verbaOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.25s ease",
                        flexShrink: 0,
                      }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {verbaOpen && (
                    <div
                      className="mt-4 overflow-y-auto"
                      style={{
                        maxHeight: "14rem",
                        borderLeft: `2px solid ${C.divider}`,
                        paddingLeft: "1rem",
                      }}
                    >
                      <p
                        className="whitespace-pre-line leading-relaxed"
                        style={{ color: C.creamDim, fontSize: "0.85rem", fontStyle: "italic" }}
                      >
                        {prompt.auditio.verbaOriginal}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* ── Voices (Voces): philosophy quote ────────────────────────────
              Split from the prior single READING (Lectio) section on
              June 2, 2026. The philosophy quote gets its own section in
              Open Sans Regular at a smaller clamp than scripture, so it
              reads as voice/argument rather than devotional weight.
              Renders only when the day has a philosophyText populated.
              Eyebrow uses the same gold caps treatment as other section
              headers, with a Voces italic faint right-eyebrow mirroring
              the VERBA pattern. Sage left hairline on the quote block
              anchors it as a structured quotation. */}
          {prompt.lectio?.philosophyText && (
            <section>
              <p
                className="text-xs tracking-widest mb-6 pb-2 flex items-center justify-between"
                style={{
                  color: "var(--pp-accent)",
                  borderBottom: `1px solid ${C.divider}`,
                  letterSpacing: "0.2em",
                }}
              >
                <span>VOICES</span>
                <span
                  className="italic"
                  style={{
                    color: C.creamFaint,
                    fontWeight: 300,
                    letterSpacing: "0.05em",
                    textTransform: "none",
                  }}
                >
                  Voces
                </span>
              </p>
              <div
                className="pl-4 space-y-2"
                style={{ borderLeft: `1px solid rgba(138,126,114,0.3)` }}
              >
                <p
                  className="leading-relaxed"
                  style={{
                    color: C.cream,
                    fontFamily: "var(--font-open-sans), 'Open Sans', sans-serif",
                    fontWeight: 400,
                    fontSize: "clamp(1rem, 3.5vw, 1.2rem)",
                    lineHeight: 1.5,
                  }}
                >
                  &ldquo;{prompt.lectio.philosophyText}&rdquo;
                </p>
                {prompt.lectio.philosophyAttribution && (
                  <p
                    className="text-xs tracking-widest uppercase"
                    style={{ color: "var(--pp-accent)" }}
                  >
                    {prompt.lectio.philosophyAttribution}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* ── Lectio: scripture ───────────────────────────────────────────
              Split from the prior single READING (Lectio) section on
              June 2, 2026. Scripture closes the reading sequence and is
              the devotional moment of the day. Cormorant Garamond italic
              at the larger clamp carries the gravity; no eyebrow rule
              and no left hairline on the quote, so the typography lands
              without framing. The eyebrow is "LECTIO" alone (no Latin
              parenthetical, since Lectio is already Latin). Renders only
              when the day has a scripture quote populated, which is the
              expected baseline for every day. */}
          {prompt.lectio?.text && (
            <section>
              <p
                className="text-xs tracking-widest mb-6"
                style={{ color: "var(--pp-accent)", letterSpacing: "0.2em" }}
              >
                LECTIO
              </p>
              <div className="space-y-2">
                <p
                  className="italic leading-tight"
                  style={{
                    color: C.cream,
                    fontFamily: "var(--font-cormorant)",
                    fontSize: "clamp(1.3rem, 4.5vw, 1.55rem)",
                    lineHeight: 1.4,
                  }}
                >
                  &ldquo;{prompt.lectio.text}&rdquo;
                </p>
                {prompt.lectio.attribution && (
                  <p
                    className="text-xs tracking-widest uppercase"
                    style={{ color: "var(--pp-accent)" }}
                  >
                    {prompt.lectio.attribution}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* ── Actio — checkboxes ──────────────────────────────────────────── */}
          <section ref={actioRef}>
            <p
              className="text-xs tracking-widest mb-6 pb-2"
              style={{ color: "var(--pp-accent)", borderBottom: `1px solid ${C.divider}`, letterSpacing: "0.2em" }}
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
                          // Checkbox uses the type-specific accent so the
                          // "done" affordance lives in the same color family
                          // as the rest of the P&P screen (per gradient brief).
                          border: `1px solid ${checkedItems[i] ? "var(--pp-accent)" : C.creamFaint}`,
                          background: checkedItems[i] ? "var(--pp-accent)" : "transparent",
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
                          // Active items match context/lectio readability baseline (C.cream).
                          // Checked items dim to creamFaint as a "done" cue. No
                          // strike-through, intentional: striking out a
                          // contemplative practice reads productivity-app, not
                          // contemplative. The dim alone says "honored."
                          color: checkedItems[i] ? C.creamFaint : C.cream,
                          fontSize: "0.95rem",
                          lineHeight: "1.65",
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
                style={{ color: C.cream, fontSize: "0.95rem", lineHeight: "1.65" }}
              >
                {defaultActio}
              </p>
            )}

          {completed && (
            <p className="text-xs mt-6 tracking-wide" style={{ color: "var(--pp-accent)" }}>
              You showed up today.
            </p>
          )}
          </section>

          {/* ── Related Journey CTA ─────────────────────────────────────────── */}
          {prompt.relatedJourney && (
            <section>
              <div className="py-4 px-5" style={{ border: `1px solid ${C.divider}` }}>
                <p className="text-xs tracking-widest uppercase mb-2" style={{ color: C.creamFaint }}>Related Journey</p>
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
    </PPGradientBackground>
  );
}

// useSearchParams() requires a Suspense boundary in Next.js App Router.
//
// The `topSlot` prop (used to render JourneyContinueStrip above the chrome
// on Today) was removed June 2, 2026 along with the strip rollback. Today
// now renders <PromptClient /> exactly as standalone /prompt does.
export default function PromptClient({
  initialDate,
  showSettings,
}: {
  initialDate?: string;
  showSettings?: boolean;
} = {}) {
  return (
    <Suspense>
      <DailyPromptPageInner initialDate={initialDate} showSettings={showSettings} />
    </Suspense>
  );
}
