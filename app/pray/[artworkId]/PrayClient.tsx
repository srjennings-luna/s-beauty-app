"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import GoDeeperSection from "@/components/GoDeeperSection";
import PageTransition from "@/components/ui/PageTransition";
import useVisioNote from "@/hooks/useVisioNote";
import { WHISPER_GRADIENT } from "@/lib/design-tokens";
type SanityArtwork = {
  _id: string;
  title: string;
  artist?: string;
  year?: string;
  imageUrl: string;
  description?: string;
  historicalSummary?: string;
  scripturePairing?: { verse: string; reference: string };
  quote?: { text: string; attribution: string };
  locationType?: string;
  reflectionQuestions?: string[];
  locationName: string;
  city: string;
  country: string;
  coordinates?: { lat: number; lng: number };
  order: number;
  traditionalPrayer?: string;
  traditionalPrayerSource?: string;
  // Per-artwork prompt overrides for the Visio Divina Pray + Action steps.
  // When set, override the matching defaults from the visioDefaults
  // singleton. Cascade lives below in the render path. June 6, 2026.
  customPrayerPrompt?: string;
  customActioHeadline?: string;
  customActioInstruction?: string;
};

// visioDefaults singleton shape — see lib/types.ts. Inlined here so this
// file's prop type can live alongside SanityArtwork without a circular
// dependency on lib/types.
type VisioDefaultsProp = {
  defaultActioHeadline: string;
  defaultActioInstruction: string;
  defaultPrayerPrompt: string;
  defaultTraditionalPrayer: string;
  defaultTraditionalPrayerSource?: string;
} | null;

// Visio Divina order (per Lectio Divina tradition): Visio → Meditatio → Oratio → Contemplatio → Actio
const STEPS = [
  { key: "gaze", title: "Gaze", label: "Visio" },
  { key: "meditate", title: "Meditate", label: "Meditatio" },
  { key: "pray", title: "Pray", label: "Oratio" },
  { key: "contemplate", title: "Contemplate", label: "Contemplatio" },
  { key: "action", title: "Action", label: "Actio" },
];

// Visio Divina ambient music is now handled by the global
// AmbientSoundProvider (see components/audio/AmbientSoundProvider.tsx,
// shipped June 5, 2026). The transitional MUSIC_AMBIENT / MUSIC_CHANT
// constants + per-Visio music menu + floating button + dropdown were
// retired here when the global system landed. Users now set their
// preferred ambient sound once in Settings → Sound and it carries
// across every contemplative surface. The narration auto-pause /
// auto-resume contract is handled by the global Provider too via
// NARRATION_START_EVENT / NARRATION_END_EVENT.

const FALLBACK_PRAYER = `Lord, as I look upon this image, I am reminded of your glory made visible.
Open the eyes of my heart. Let what I see lead me beyond what I see.

Glory be to the Father, and to the Son, and to the Holy Spirit.
As it was in the beginning, is now, and ever shall be,
world without end. Amen.`;

// Espresso color palette — immersive mode.
// `bg` is the shared Whisper gradient applied to all page-level surfaces.
//
// `creamWarm` is a more obviously parchment-toned cream used for section
// titles (Reflect, Traditional Prayer, Go deeper) — `cream` at 88% over
// pure-black espresso was reading as stark white on OLED. The warmer
// base (232,217,184) holds its yellow tint at high opacity so titles
// still pop as cream rather than white. June 6, 2026.
const C = {
  bg: WHISPER_GRADIENT,
  header: "rgba(22,17,13,0.97)",
  cream: "rgba(253,246,232,0.88)",
  creamWarm: "rgba(232,217,184,0.92)",
  creamDim: "rgba(253,246,232,0.5)",
  creamFaint: "rgba(253,246,232,0.3)",
  sage: "var(--color-sage)",
  sageMuted: "var(--color-sage-muted)",
  gold: "var(--color-gold)",           // ONE moment: sacred quote border only
};

/**
 * Renamed from PrayPage. Receives its artwork data as a prop from the
 * server component wrapper at app/pray/[artworkId]/page.tsx, which chooses
 * between published and draft fetches based on Next.js draftMode.
 */
export default function PrayClient({
  initialArtwork,
  visioDefaults,
}: {
  initialArtwork: SanityArtwork | null;
  visioDefaults: VisioDefaultsProp;
}) {
  const router = useRouter();
  const [artwork] = useState<SanityArtwork | null>(initialArtwork);

  // ── Contemplative prompt cascade ───────────────────────────────────────
  // Each surface text below resolves in this order:
  //   1. Per-artwork override on the contentItem (artwork.customX)
  //   2. visioDefaults singleton (props.visioDefaults.defaultX)
  //   3. Hardcoded last-resort fallback string
  //
  // The hardcoded values preserve exact pre-VD-ACTION-01 copy so a fresh
  // dataset with no singleton document still renders the correct prompts.
  // VD-ACTION-01 shipped June 6, 2026.
  const prayPrompt =
    initialArtwork?.customPrayerPrompt?.trim() ||
    visioDefaults?.defaultPrayerPrompt ||
    "Respond to God in prayer—thanksgiving, intercession, or simply conversation about what you notice.";
  const actioHeadline =
    initialArtwork?.customActioHeadline?.trim() ||
    visioDefaults?.defaultActioHeadline ||
    "How will you live this out?";
  const actioInstruction =
    initialArtwork?.customActioInstruction?.trim() ||
    visioDefaults?.defaultActioInstruction ||
    "Ask yourself and God: How will you apply what you've received in prayer to your life?";
  const fallbackTraditionalPrayer =
    visioDefaults?.defaultTraditionalPrayer || FALLBACK_PRAYER;
  const fallbackTraditionalPrayerSource =
    visioDefaults?.defaultTraditionalPrayerSource;
  // Loading state is no longer meaningful — server pre-fetched. Keep the
  // variable so the existing loading-UI branch still compiles; it will
  // never be true in the new server-fetch flow.
  const [loading] = useState(false);
  const [step, setStep] = useState(0);
  // Visio note read/write moved to the auth-ready data layer June 2,
  // 2026. The useVisioNote hook wraps lib/userData.ts; when auth ships,
  // notes move from per-artwork localStorage keys onto the
  // authenticated user record without changing this component.
  const { note: storedNote, saveNote: persistVisioNote } = useVisioNote(initialArtwork?._id);
  const [actionNote, setActionNote] = useState("");
  // Hydrate the local actionNote textarea state once the hook resolves
  // the stored value. Editing flows through local state for input
  // responsiveness; the hook persists on Finish.
  useEffect(() => {
    if (storedNote) setActionNote(storedNote);
  }, [storedNote]);
  // Music state retired June 5, 2026 — handled by global
  // AmbientSoundProvider (see header comment near the top of the
  // file for context).
  const [reflectionExpanded, setReflectionExpanded] = useState(false);
  const [prayerDrawerOpen, setPrayerDrawerOpen] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const stepRef = useRef(step);
  stepRef.current = step;

  // Data fetch moved to the server component wrapper (see page.tsx);
  // `initialArtwork` arrives pre-fetched for both published and draft flows.

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        if (step > 0) setStep(step - 1);
        return;
      }
      if (e.key === "ArrowRight") {
        if (step < STEPS.length - 1) setStep(step + 1);
        else router.back();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, router]);

  // setMusic / pauseMusic / resumeMusic / isPlaying / chantAudioRef /
  // ambientAudioRef + their audio elements were retired here
  // June 5, 2026 when the global AmbientSoundProvider shipped.
  // Visio Divina now consumes the same provider as every other
  // contemplative surface, so the user's ambient sound preference
  // travels with them through the prayer instead of being a
  // surface-local Chant/Ambient toggle.

  const SWIPE_THRESHOLD = 50;
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - touchStartX.current;
    const dy = endY - touchStartY.current;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    const s = stepRef.current;
    if (dx < 0) {
      if (s < STEPS.length - 1) setStep(s + 1);
      else router.back();
    } else if (dx > 0 && s > 0) setStep(s - 1);
  };

  const handleFinish = () => {
    if (actionNote.trim()) {
      persistVisioNote(actionNote);
    }
    // Explicit nav to Library (where Visio Divina history lives) instead
    // of router.back(); back() silently fails when there is no history,
    // e.g. arriving from a share link or inside Sanity Presentation.
    router.push("/library");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-white/15 border-t-white/60 rounded-full animate-spin mb-2" />
          <p style={{ color: C.creamDim }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: C.bg }}>
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2" style={{ color: C.cream }}>Artwork not found</h1>
          <Link href="/" style={{ color: C.creamDim }}>Back to home</Link>
        </div>
      </div>
    );
  }

  const questions = artwork.reflectionQuestions || [];
  const isSacredArt =
    !artwork.locationType ||
    artwork.locationType === "sacred-art" ||
    artwork.locationType === "architecture";
  const isLastStep = step === STEPS.length - 1;

  return (
    <PageTransition variant="slide-up">
      <div
        className="flex flex-col safe-area-bottom overflow-hidden"
        style={{
          // Use `100dvh` (dynamic viewport height) instead of `min-height:
          // 100vh` (which Tailwind's `min-h-screen` resolves to). On iOS
          // Safari, `vh` units refer to the LAYOUT viewport (URL bar
          // collapsed), which is ~80px taller than the visible viewport
          // when the URL bar is showing. That sized the page bigger than
          // the visible area, made the body scrollable, and let the
          // chrome at top:0 scroll off-screen — user had to swipe down
          // to reveal the header (Sheri caught June 6, 2026 ·
          // VD-SCROLL-01). `100dvh` adapts to whatever the visible
          // viewport actually is; combined with `overflow-hidden` the
          // body never scrolls — only the inner slide containers do.
          // Same pattern used by SplashClient + JourneyDay stepper.
          height: "100dvh",
          background: C.bg,
          paddingBottom: "calc(4rem + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {/* Header: absolutely positioned overlay. Floats ON the image
            (image extends to viewport top) with no espresso background
            so the artwork is the visual ground. Same pattern as Journey
            BREATHE + Step Open + Step Encounter. Sheri June 5, 2026:
            "image to rise to the top of the page just like the breathe
            page." Buttons stay tap-able via pointer-events-auto on the
            inner row; the outer wrapper is pointer-events-none so taps
            on the image (e.g., pinch-zoom) pass through. */}
        <div
          className="absolute top-0 inset-x-0 z-10 safe-area-top pointer-events-none"
        >
          {/* Stories-style progress segments. Mirrors Journey Day pattern:
              cream rail at 12%, sage fill on current and prior segments. */}
          <div
            className="absolute z-20 flex"
            style={{
              top: "calc(max(env(safe-area-inset-top, 0px), 48px) - 8px)",
              left: 12,
              right: 12,
              gap: 3,
              height: 2,
            }}
          >
            {STEPS.map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  background: "rgba(253,246,232,0.12)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    // Stepper segments use cream (Sheri June 5, 2026
                    // reversed prior call: "i agreed to the green
                    // stepper, but it was the wrong call, it should
                    // be cream"). Cream-faint at 88% matches the
                    // baseline cream used for body text on espresso.
                    background: i <= step ? "rgba(253,246,232,0.88)" : "transparent",
                    transition: "background 0.4s ease",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Chrome row: icon-only Back (left), step title centered,
              X close (right). No backgrounds — Sheri June 5: "doesn't
              match other places in app." The step title here is the
              ONLY step-name surface (the previous h2 inside each
              slide's content has been removed so the image can sit
              directly under the chrome). Matches the BREATHE-style
              chrome in Journey Day. */}
          <div className="pointer-events-auto grid grid-cols-[1fr_auto_1fr] items-center px-4 py-2">
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (step > 0) setStep(step - 1);
                else router.back();
              }}
              className="w-10 h-10 flex items-center justify-center justify-self-start"
              style={{ color: C.creamDim }}
              aria-label={step > 0 ? "Previous step" : "Back"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
              </svg>
            </Link>

            {/* Step title only. The content-type label intentionally does
                NOT appear in VD chrome (Sheri's call, June 9, 2026 —
                overrides the brief's "type label on VD screens" line):
                the label lives ONLY on the Explore detail card. VD stays
                cream-typography-only so the artwork is the single focal
                point with zero competing color accents. The gold
                scripture left-border on Pray remains the one acknowledged
                color moment. */}
            <span
              className="text-sm font-medium uppercase tracking-widest"
              style={{ color: C.creamDim }}
            >
              {STEPS[step].title}
            </span>

            <button
              type="button"
              onClick={handleFinish}
              className="w-10 h-10 flex items-center justify-center justify-self-end"
              style={{ color: C.creamDim }}
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/*
          Audio elements (chant + ambient) + music dropdown menu +
          floating music button were retired here June 5, 2026 when
          the global AmbientSoundProvider shipped. The global
          AmbientFloatingButton sits at the same approximate position
          (bottom: env(safe-area-inset-bottom) + 64px; right: 16px)
          and the picker lives in Settings → Sound. Audio playback
          is now via a single shared <audio> element in the provider,
          which survives every route change. The narration auto-
          pause / auto-resume contract is handled by the provider too,
          so the prior wasMusicPlayingRef bookkeeping is no longer
          needed.
        */}

        {/* Step content — lateral slide container */}
        <div className="flex-1 min-h-0 flex flex-col">

          {/* Slide viewport — all 5 steps rendered, translateX for navigation */}
          <div
            className="flex-1 min-h-0 relative overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >

            {/* ── Gaze ──
                Image is FULL BLEED edge-to-edge horizontally per
                Sheri's reference June 5, 2026 — no px-4 frame around
                the image, object-cover so the image fills its
                container without letterboxing (pinch-zoom + pan
                reveal any cropped edges). Contemplative copy below
                keeps its breathing room via px-4 padding on its
                own wrapper, not on the image's container. */}
            <div
              className="absolute inset-0 overflow-y-auto touch-pan-y"
              style={{
                transform: `translateX(${(0 - step) * 100}%)`,
                transition: "transform 500ms cubic-bezier(0.4, 0, 0.2, 1)",
                willChange: "transform",
              }}
            >
              <div className="flex flex-col">
                <div className="w-full mb-4" style={{ height: "calc(65vh + max(env(safe-area-inset-top, 0px), 48px) + 56px)" }}>
                  <TransformWrapper initialScale={1} minScale={1} maxScale={8} centerOnInit={false} doubleClick={{ mode: "toggle", step: 2 }}>
                    <TransformComponent
                      wrapperStyle={{ width: "100%", height: "100%" }}
                      contentStyle={{ width: "100%", height: "100%" }}
                    >
                      <img
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        draggable={false}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        className="select-none"
                      />
                    </TransformComponent>
                  </TransformWrapper>
                </div>
                <div className="px-4 pb-4">
                  <p className="text-sm text-center leading-relaxed max-w-md mx-auto" style={{ color: C.creamDim }}>
                    Let your eyes rest on the image. Notice what draws you. Ask God to open the eyes of your heart.
                  </p>
                  <p className="text-xs mt-3 text-center" style={{ color: C.creamFaint }}>Take 1-2 minutes if you like. Pinch to zoom the image.</p>
                </div>
              </div>
              {/* ScrollCue removed June 6, 2026 — the chevron-down sat
                  inside the contemplative frame and read as a UI control
                  competing with the artwork. The slide's overflow-y-auto
                  preserves scrollability without the visual cue. */}
            </div>

            {/* ── Meditate ── */}
            <div
              className="absolute inset-0 overflow-y-auto touch-pan-y"
              style={{
                transform: `translateX(${(1 - step) * 100}%)`,
                transition: "transform 500ms cubic-bezier(0.4, 0, 0.2, 1)",
                willChange: "transform",
              }}
            >
              <div className="flex flex-col">
                {/* Image is full-bleed edge-to-edge horizontally, no
                    px frame, object-cover so it fills its allocated
                    window (60vh — slightly shorter than Gaze to leave
                    room for the substantial text below). Pinch-zoom
                    + pan reveals any cropped edges. */}
                <div className="w-full mb-4" style={{ height: "calc(65vh + max(env(safe-area-inset-top, 0px), 48px) + 56px)" }}>
                  <TransformWrapper initialScale={1} minScale={1} maxScale={8} centerOnInit={false} doubleClick={{ mode: "toggle", step: 2 }}>
                    <TransformComponent
                      wrapperStyle={{ width: "100%", height: "100%" }}
                      contentStyle={{ width: "100%", height: "100%" }}
                    >
                      <img
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        draggable={false}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        className="select-none"
                      />
                    </TransformComponent>
                  </TransformWrapper>
                </div>
                <div className="px-4 pb-4">
                <h2 className="font-normal text-lg mb-2" style={{ color: C.creamWarm }}>Reflect</h2>
                <p className="text-sm mb-4" style={{ color: C.creamDim }}>
                  Look deeper. What movement or relationships do you see? Where are you in this image?
                </p>
                {questions.length > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setReflectionExpanded(!reflectionExpanded)}
                      className="flex items-center gap-2 text-sm font-medium hover:underline focus:outline-none focus:underline"
                      style={{ color: C.creamDim }}
                      aria-expanded={reflectionExpanded}
                    >
                      Reflection questions ({Math.min(questions.length, 2)})
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 transition-transform ${reflectionExpanded ? "rotate-180" : ""}`}>
                        <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {reflectionExpanded && (
                      <ul className="space-y-2 mt-2">
                        {questions.slice(0, 2).map((q, i) => (
                          <li key={i} className="text-sm flex gap-2" style={{ color: C.creamDim }}>
                            <span style={{ color: C.sage }}>•</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Go Deeper · Reflections from the tradition.
                    Moved here (Meditate step) June 5, 2026 from a
                    fixed-bottom position visible on every step. Per
                    Sheri's call: Meditate is the active-engagement
                    step where text-rich tradition reflections (quotes,
                    summaries, analysis) belong; Contemplate is silent
                    abiding and adding text there fights the mode.
                    Inline within the scrollable Meditate slide — no
                    height cap, no border-top, the section behaves like
                    any other expandable block of the step. */}
                <div className="mt-8">
                  <GoDeeperSection inline />
                </div>
                </div>{/* end px-4 pb-4 text wrapper */}
              </div>
            </div>

            {/* ── Contemplate ── (slide index 3: Gaze→Meditate→Pray→Contemplate→Action) */}
            <div
              className="absolute inset-0 overflow-y-auto touch-pan-y"
              style={{
                transform: `translateX(${(3 - step) * 100}%)`,
                transition: "transform 500ms cubic-bezier(0.4, 0, 0.2, 1)",
                willChange: "transform",
              }}
            >
              <div className="flex flex-col">
                <div className="w-full mb-4" style={{ height: "calc(65vh + max(env(safe-area-inset-top, 0px), 48px) + 56px)" }}>
                  <TransformWrapper initialScale={1} minScale={1} maxScale={8} centerOnInit={false} doubleClick={{ mode: "toggle", step: 2 }}>
                    <TransformComponent
                      wrapperStyle={{ width: "100%", height: "100%" }}
                      contentStyle={{ width: "100%", height: "100%" }}
                    >
                      <img
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        draggable={false}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        className="select-none"
                      />
                    </TransformComponent>
                  </TransformWrapper>
                </div>
                <div className="px-4 pb-4">
                  <p className="text-sm text-center leading-relaxed max-w-md mx-auto" style={{ color: C.creamDim }}>
                    Rest in God&apos;s presence. No words are needed. Let the beauty you&apos;ve seen lead you into silence and communion.
                  </p>
                  <p className="text-xs mt-4 text-center" style={{ color: C.creamFaint }}>Pinch to zoom the image.</p>
                </div>
              </div>
            </div>

            {/* ── Pray ── (slide index 2: Gaze→Meditate→Pray→Contemplate→Action) */}
            <div
              className="absolute inset-0 overflow-y-auto touch-pan-y"
              style={{
                transform: `translateX(${(2 - step) * 100}%)`,
                transition: "transform 500ms cubic-bezier(0.4, 0, 0.2, 1)",
                willChange: "transform",
              }}
            >
              <div className="flex flex-col">
                <div className="w-full mb-4" style={{ height: "calc(65vh + max(env(safe-area-inset-top, 0px), 48px) + 56px)" }}>
                  <TransformWrapper initialScale={1} minScale={1} maxScale={8} centerOnInit={false} doubleClick={{ mode: "toggle", step: 2 }}>
                    <TransformComponent
                      wrapperStyle={{ width: "100%", height: "100%" }}
                      contentStyle={{ width: "100%", height: "100%" }}
                    >
                      <img
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        draggable={false}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        className="select-none"
                      />
                    </TransformComponent>
                  </TransformWrapper>
                </div>
                <div className="px-4 pb-4">

                {/* Sacred quote block — GOLD BORDER is the ONE gold moment on this screen */}
                {isSacredArt && artwork.scripturePairing && (
                  <div className="bg-white/5 border-l-2 p-4 mb-6" style={{ borderColor: C.gold }}>
                    <p className="font-serif-elegant italic text-base leading-relaxed" style={{ color: C.cream }}>
                      &ldquo;{artwork.scripturePairing.verse}&rdquo;
                    </p>
                    <p className="text-sm mt-2 font-medium" style={{ color: C.creamDim }}>
                      — {artwork.scripturePairing.reference}
                    </p>
                  </div>
                )}
                {!isSacredArt && artwork.quote && (
                  <div className="bg-white/5 border-l-2 p-4 mb-6" style={{ borderColor: C.gold }}>
                    <p className="font-serif-elegant italic text-base leading-relaxed" style={{ color: C.cream }}>
                      &ldquo;{artwork.quote.text}&rdquo;
                    </p>
                    <p className="text-sm mt-2 font-medium" style={{ color: C.creamDim }}>
                      — {artwork.quote.attribution}
                    </p>
                  </div>
                )}

                <p className="text-sm mb-4" style={{ color: C.creamDim }}>
                  {prayPrompt}
                </p>

                {/* Traditional Prayer drawer */}
                <div className="border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setPrayerDrawerOpen(!prayerDrawerOpen)}
                    className="w-full px-4 py-4 flex items-center justify-between text-left"
                    aria-expanded={prayerDrawerOpen}
                  >
                    <span className="font-medium tracking-wide text-sm" style={{ color: C.creamWarm }}>
                      Traditional Prayer
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 transition-transform ${prayerDrawerOpen ? "rotate-180" : ""}`} style={{ color: C.creamDim }}>
                      <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {prayerDrawerOpen && (
                    <div className="px-4 pb-6 animate-fade-in">
                      <p className="font-serif-elegant italic text-center mb-3 whitespace-pre-line" style={{ color: C.cream }}>
                        {artwork.traditionalPrayer || fallbackTraditionalPrayer}
                      </p>
                      {(() => {
                        // Source attribution cascade: prefer the
                        // per-artwork source IF the per-artwork prayer is
                        // what's shown; otherwise use the singleton's
                        // default source for the fallback prayer.
                        const source = artwork.traditionalPrayer
                          ? artwork.traditionalPrayerSource
                          : fallbackTraditionalPrayerSource;
                        return source ? (
                          <p className="text-xs text-center" style={{ color: C.creamFaint }}>
                            — {source}
                          </p>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
                </div>{/* end px-4 pb-4 text wrapper */}
              </div>
            </div>

            {/* ── Action ──
                Redesigned June 5, 2026 to match the Journey Reflect
                aesthetic: blurred artwork as background, dark scrim
                for readability, content centered with Cormorant
                italic prompt. Replaces the prior stark espresso /
                form-only layout Sheri flagged as "lacks any design
                aesthetic." Mirrors components/JourneyDaySteps.tsx
                StepReflect exactly so the registers stay consistent
                across Journey and Visio Divina. */}
            <div
              className="absolute inset-0 overflow-hidden touch-pan-y"
              style={{
                transform: `translateX(${(4 - step) * 100}%)`,
                transition: "transform 500ms cubic-bezier(0.4, 0, 0.2, 1)",
                willChange: "transform",
              }}
            >
              {/* Blurred background = the artwork the user has been
                  contemplating. Same blur/brightness values + ken-burns
                  animation as Journey Reflect. */}
              {artwork.imageUrl && (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${artwork.imageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "blur(7px) brightness(0.5)",
                    animation: "kenBurns 8s ease-in-out infinite alternate",
                  }}
                />
              )}
              {/* Dark scrim for text legibility — same value as Reflect. */}
              <div
                className="absolute inset-0"
                style={{ background: "rgba(22,17,13,0.45)" }}
              />

              {/* Content */}
              {/* Action content is centered both vertically and
                  horizontally on the page (Sheri June 5, 2026: the
                  prompt should be page-centered, not anchored under
                  the stepper). justify-center pairs with h-full so
                  the single content block floats at the optical
                  center of the slide. */}
              <div className="relative z-10 h-full w-full overflow-y-auto flex flex-col items-center justify-center px-6 py-10">
                <div className="max-w-md w-full text-center">
                  <p
                    className="font-serif-elegant italic leading-relaxed mb-3"
                    style={{
                      color: C.cream,
                      fontSize: "clamp(1.4rem, 5vw, 1.8rem)",
                      lineHeight: "1.4",
                    }}
                  >
                    {actioHeadline}
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: C.creamDim }}
                  >
                    {actioInstruction}
                  </p>
                </div>

                {/* Textarea + safety caption hidden June 5, 2026 per
                    Sheri ("just hide the text input box for now").
                    The actionNote state + useActionNote hook still
                    persist anything the user wrote previously so a
                    later un-hide doesn't lose data; nothing to do
                    when un-hiding except restore this block. */}
              </div>
            </div>

          </div>{/* end slide viewport */}

          {/*
            Next/Finish footer button removed June 5, 2026.
            Navigation between steps is now swipe-only (touch handlers
            on the slide viewport); exit happens via the X close in
            the upper-right header. Stories segments at the top
            indicate position in the 5-step flow. Removing this
            footer button retires the "competing navigation moments"
            problem Sheri flagged (Stories stepper at top vs Next
            button at bottom) and gives the slide content more
            vertical breathing room.
          */}

        </div>

        {/*
          Go Deeper was previously rendered here as a fixed-bottom
          drawer visible on every step. Moved June 5, 2026 to live
          inside the Meditate slide content (above) per Sheri's call:
          tradition reflections are active-engagement content that
          belongs with Meditate, not with Gaze (which should be the
          image alone) or Contemplate (silent abiding).
        */}
      </div>
    </PageTransition>
  );
}
