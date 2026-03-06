"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { getArtworkById } from "@/lib/sanity";
import GoDeeperSection from "@/components/GoDeeperSection";
import PageTransition from "@/components/ui/PageTransition";
import type { TraditionReflection } from "@/lib/types";

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
  traditionReflections?: TraditionReflection[];
};

// FIX 1: Swap pray and contemplate order
const STEPS = [
  { key: "gaze", title: "Gaze", label: "Visio" },
  { key: "meditate", title: "Meditate", label: "Meditatio" },
  { key: "contemplate", title: "Contemplate", label: "Contemplatio" },
  { key: "pray", title: "Pray", label: "Oratio" },
  { key: "action", title: "Action", label: "Operatio" },
];

const MUSIC_AMBIENT = "/music/natureseye-piano-dreamcloud-meditation-179215.mp3";
const MUSIC_CHANT = "/music/nickpanek-ave-maria-latin-catholic-gregorian-chant-218251.mp3";

type MusicMode = "off" | "chant" | "ambient";

const FALLBACK_PRAYER = `Lord, as I look upon this image, I am reminded of your glory made visible.
Open the eyes of my heart. Let what I see lead me beyond what I see.

Glory be to the Father, and to the Son, and to the Holy Spirit.
As it was in the beginning, is now, and ever shall be,
world without end. Amen.`;

// Espresso color palette — immersive mode
const C = {
  bg: "linear-gradient(180deg, #1e1410 0%, #16110d 30%, #16110d 70%, #0d0a07 100%)",
  header: "rgba(22,17,13,0.97)",
  cream: "rgba(253,246,232,0.88)",
  creamDim: "rgba(253,246,232,0.5)",
  creamFaint: "rgba(253,246,232,0.3)",
  sage: "#4a7a62",
  sageMuted: "#7a9a8a",
  gold: "#C19B5F",           // ONE moment: sacred quote border only
};

export default function PrayPage() {
  const params = useParams();
  const router = useRouter();
  const [artwork, setArtwork] = useState<SanityArtwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [actionNote, setActionNote] = useState("");
  const [musicMode, setMusicMode] = useState<MusicMode>("off");
  const [musicPaused, setMusicPaused] = useState(false);
  const [musicMenuOpen, setMusicMenuOpen] = useState(false);
  const [musicLoadError, setMusicLoadError] = useState(false);
  const [reflectionExpanded, setReflectionExpanded] = useState(false);
  const [prayerDrawerOpen, setPrayerDrawerOpen] = useState(false);
  const chantAudioRef = useRef<HTMLAudioElement | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const stepRef = useRef(step);
  stepRef.current = step;

  useEffect(() => {
    const id = params.artworkId as string;
    if (!id) {
      setLoading(false);
      return;
    }
    getArtworkById(id)
      .then((data) => setArtwork(data))
      .catch(() => setArtwork(null))
      .finally(() => setLoading(false));
  }, [params.artworkId]);

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

  const setMusic = (mode: MusicMode) => {
    const chant = chantAudioRef.current;
    const ambient = ambientAudioRef.current;
    chant?.pause();
    ambient?.pause();
    setMusicMenuOpen(false);
    if (mode === "off") {
      setMusicPaused(true);
      setMusicMode("off");
      return;
    }
    if (mode === "chant" && chant) {
      setMusicPaused(false);
      setMusicMode("chant");
      chant.muted = false;
      chant.volume = 1;
      const p = chant.play();
      if (p && typeof p.then === "function") {
        p.then(() => setMusicLoadError(false)).catch(() => setMusicLoadError(true));
      }
      return;
    }
    if (mode === "ambient" && ambient) {
      setMusicPaused(false);
      setMusicMode("ambient");
      ambient.muted = false;
      ambient.volume = 1;
      const p = ambient.play();
      if (p && typeof p.then === "function") {
        p.then(() => setMusicLoadError(false)).catch(() => setMusicLoadError(true));
      }
      return;
    }
    setMusicMode(mode);
  };

  const pauseMusic = () => {
    chantAudioRef.current?.pause();
    ambientAudioRef.current?.pause();
    setMusicPaused(true);
    setMusicMenuOpen(false);
  };

  const resumeMusic = () => {
    if (musicMode === "chant") setMusic("chant");
    else if (musicMode === "ambient") setMusic("ambient");
  };

  const isPlaying = (musicMode === "chant" || musicMode === "ambient") && !musicPaused;

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
      localStorage.setItem(`kallos-visio-note-${artwork?._id}`, actionNote);
    }
    router.back();
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
    <PageTransition>
      <div
        className="min-h-screen flex flex-col safe-area-bottom"
        style={{ background: C.bg, paddingBottom: "calc(4rem + env(safe-area-inset-bottom, 0px))" }}
      >
        {/* Header — espresso dark, sticky */}
        <div
          className="flex-shrink-0 sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-white/8 safe-area-top"
          style={{ background: C.header }}
        >
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (step > 0) setStep(step - 1);
              else router.back();
            }}
            className="w-10 h-10 flex items-center justify-center bg-white/8 transition-colors hover:bg-white/12"
            style={{ color: C.creamDim }}
            aria-label={step > 0 ? "Previous step" : "Back"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
            </svg>
          </Link>

          <span className="text-sm" style={{ color: C.creamDim }}>
            {step + 1} of {STEPS.length} · {STEPS[step].title}
          </span>

          <button
            type="button"
            onClick={() => { setMusicLoadError(false); setMusicMenuOpen(true); }}
            className="text-xs font-medium"
            style={{ color: C.creamFaint }}
          >
            {musicMode === "off" ? "Music" : musicMode === "chant" ? "Chant ♪" : "Ambient ♪"}
          </button>
        </div>

        <audio ref={chantAudioRef} src={MUSIC_CHANT} loop playsInline preload="auto" muted={false} />
        <audio ref={ambientAudioRef} src={MUSIC_AMBIENT} loop playsInline preload="auto" muted={false} />

        {/* Music menu */}
        {musicMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" aria-hidden onClick={() => setMusicMenuOpen(false)} />
            <div className="fixed top-14 right-4 z-50 w-40 bg-[#1e1410] border border-white/10 py-1 shadow-lg">
              {isPlaying ? (
                <button type="button" onClick={pauseMusic} className="w-full px-4 py-2 text-left text-sm" style={{ color: C.cream }}>Pause</button>
              ) : (musicMode === "chant" || musicMode === "ambient") ? (
                <button type="button" onClick={resumeMusic} className="w-full px-4 py-2 text-left text-sm" style={{ color: C.sage }}>Resume</button>
              ) : null}
              <button type="button" onClick={() => setMusic("off")} className="w-full px-4 py-2 text-left text-sm" style={{ color: musicMode === "off" ? C.sage : C.creamDim }}>Off</button>
              <button type="button" onClick={() => setMusic("chant")} className="w-full px-4 py-2 text-left text-sm" style={{ color: musicMode === "chant" ? C.sage : C.creamDim }}>Chant</button>
              <button type="button" onClick={() => setMusic("ambient")} className="w-full px-4 py-2 text-left text-sm" style={{ color: musicMode === "ambient" ? C.sage : C.creamDim }}>Ambient</button>
              {musicLoadError && (
                <p className="px-4 py-2 text-xs border-t border-white/10" style={{ color: C.creamFaint }}>Couldn&apos;t load music. Try again or check the file.</p>
              )}
              <p className="px-4 py-2 text-xs border-t border-white/10" style={{ color: C.creamFaint }}>No sound? Check device volume and, on iPhone, the side mute switch.</p>
            </div>
          </>
        )}

        {/* Floating music button */}
        {(musicMode === "chant" || musicMode === "ambient") && (
          <button
            type="button"
            onClick={() => setMusicMenuOpen(!musicMenuOpen)}
            className="fixed bottom-24 right-4 z-30 w-12 h-12 flex items-center justify-center bg-[#1e1410] border border-white/15 shadow-lg safe-area-bottom"
            style={{ marginBottom: "env(safe-area-inset-bottom, 0)", color: C.sage }}
            aria-label="Music options"
            aria-expanded={musicMenuOpen}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.14c-.938 0-1.64.703-1.64 1.64v6.72c0 .937.702 1.64 1.64 1.64h2.3l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.44 18.53c.266-.436.227-.905-.096-1.228A9.92 9.92 0 0119 12c0-2.233-.758-4.29-2.034-5.964a1.077 1.077 0 00-1.532.066 1.077 1.077 0 00.066 1.532A7.92 7.92 0 0117 12c0 1.61-.428 3.118-1.176 4.408a1.078 1.078 0 00.616 1.479c.44.161.92.023 1.24-.355z" />
            </svg>
          </button>
        )}

        {/* Step content */}
        <div
          className="flex-1 min-h-0 flex flex-col"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex-1 overflow-y-auto touch-pan-y">

            {/* ── Gaze ── */}
            {step === 0 && (
              <div className="flex flex-col px-4 py-6">
                <h2 className="text-sm font-medium uppercase tracking-wider mb-4 text-center" style={{ color: C.cream }}>Gaze</h2>
                <div className="w-full min-h-[55vh] flex-1 flex flex-col mb-6">
                  <TransformWrapper initialScale={1} minScale={1} maxScale={8} centerOnInit={false} doubleClick={{ mode: "toggle", step: 2 }}>
                    <TransformComponent
                      wrapperStyle={{ width: "100%", height: "100%", minHeight: "55vh" }}
                      contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <img src={artwork.imageUrl} alt={artwork.title} className="max-w-full max-h-[70vh] object-contain select-none" draggable={false} />
                    </TransformComponent>
                  </TransformWrapper>
                </div>
                <p className="text-sm text-center leading-relaxed max-w-md mx-auto" style={{ color: C.sageMuted }}>
                  Let your eyes rest on the image. Notice what draws you. Ask God to open the eyes of your heart.
                </p>
                <p className="text-xs mt-4 text-center" style={{ color: C.creamFaint }}>Take 1–2 minutes if you like. Pinch to zoom the image.</p>
              </div>
            )}

            {/* ── Meditate ── */}
            {step === 1 && (
              <div className="px-4 py-6">
                <h2 className="text-sm font-medium uppercase tracking-wider mb-4" style={{ color: C.cream }}>Meditate</h2>
                <div className="w-full min-h-[50vh] mb-6">
                  <TransformWrapper initialScale={1} minScale={1} maxScale={8} centerOnInit={false} doubleClick={{ mode: "toggle", step: 2 }}>
                    <TransformComponent
                      wrapperStyle={{ width: "100%", height: "100%", minHeight: "50vh" }}
                      contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <img src={artwork.imageUrl} alt={artwork.title} className="max-w-full max-h-[65vh] object-contain select-none" draggable={false} />
                    </TransformComponent>
                  </TransformWrapper>
                </div>
                <h2 className="font-semibold text-lg mb-2" style={{ color: C.cream }}>Reflect</h2>
                <p className="text-sm mb-4" style={{ color: C.sageMuted }}>
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
                          <li key={i} className="text-sm flex gap-2" style={{ color: C.sageMuted }}>
                            <span style={{ color: C.sage }}>•</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Contemplate ── */}
            {step === 2 && (
              <div className="flex flex-col px-4 py-6">
                <h2 className="text-sm font-medium uppercase tracking-wider mb-4 text-center" style={{ color: C.cream }}>Contemplate</h2>
                <div className="w-full min-h-[55vh] mb-6">
                  <TransformWrapper initialScale={1} minScale={1} maxScale={8} centerOnInit={false} doubleClick={{ mode: "toggle", step: 2 }}>
                    <TransformComponent
                      wrapperStyle={{ width: "100%", height: "100%", minHeight: "55vh" }}
                      contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <img src={artwork.imageUrl} alt={artwork.title} className="max-w-full max-h-[70vh] object-contain select-none" draggable={false} />
                    </TransformComponent>
                  </TransformWrapper>
                </div>
                <p className="text-sm text-center leading-relaxed max-w-md mx-auto" style={{ color: C.sageMuted }}>
                  Rest in God&apos;s presence. No words are needed. Let the beauty you&apos;ve seen lead you into silence and communion.
                </p>
                <p className="text-xs mt-4 text-center" style={{ color: C.creamFaint }}>Pinch to zoom the image.</p>
              </div>
            )}

            {/* ── Pray ── */}
            {step === 3 && (
              <div className="flex flex-col px-4 py-6">
                <h2 className="text-sm font-medium uppercase tracking-wider mb-4" style={{ color: C.cream }}>Pray</h2>
                <div className="w-full min-h-[40vh] mb-6">
                  <TransformWrapper initialScale={1} minScale={1} maxScale={8} centerOnInit={false} doubleClick={{ mode: "toggle", step: 2 }}>
                    <TransformComponent
                      wrapperStyle={{ width: "100%", height: "100%", minHeight: "40vh" }}
                      contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <img src={artwork.imageUrl} alt={artwork.title} className="max-w-full max-h-[55vh] object-contain select-none" draggable={false} />
                    </TransformComponent>
                  </TransformWrapper>
                </div>

                {/* Sacred quote block — GOLD BORDER is the ONE gold moment on this screen */}
                {isSacredArt && artwork.scripturePairing && (
                  <div className="bg-white/5 border-l-2 p-4 mb-6" style={{ borderColor: C.gold }}>
                    <p className="font-serif-elegant italic text-base leading-relaxed" style={{ color: C.sageMuted }}>
                      &ldquo;{artwork.scripturePairing.verse}&rdquo;
                    </p>
                    <p className="text-sm mt-2 font-medium" style={{ color: C.creamDim }}>
                      — {artwork.scripturePairing.reference}
                    </p>
                  </div>
                )}
                {!isSacredArt && artwork.quote && (
                  <div className="bg-white/5 border-l-2 p-4 mb-6" style={{ borderColor: C.gold }}>
                    <p className="font-serif-elegant italic text-base leading-relaxed" style={{ color: C.sageMuted }}>
                      &ldquo;{artwork.quote.text}&rdquo;
                    </p>
                    <p className="text-sm mt-2 font-medium" style={{ color: C.creamDim }}>
                      — {artwork.quote.attribution}
                    </p>
                  </div>
                )}

                <p className="text-sm mb-4" style={{ color: C.sageMuted }}>
                  Respond to God in prayer—thanksgiving, intercession, or simply conversation about what you notice.
                </p>

                {/* Traditional Prayer drawer */}
                <div className="border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setPrayerDrawerOpen(!prayerDrawerOpen)}
                    className="w-full px-4 py-4 flex items-center justify-between text-left"
                    aria-expanded={prayerDrawerOpen}
                  >
                    <span className="font-medium tracking-wide text-sm" style={{ color: C.cream }}>
                      Traditional Prayer
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 transition-transform ${prayerDrawerOpen ? "rotate-180" : ""}`} style={{ color: C.creamDim }}>
                      <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {prayerDrawerOpen && (
                    <div className="px-4 pb-6 animate-fade-in">
                      <p className="font-serif-elegant italic text-center mb-3 whitespace-pre-line" style={{ color: C.sageMuted }}>
                        {artwork.traditionalPrayer || FALLBACK_PRAYER}
                      </p>
                      {artwork.traditionalPrayer && artwork.traditionalPrayerSource && (
                        <p className="text-xs text-center" style={{ color: C.creamFaint }}>
                          — {artwork.traditionalPrayerSource}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Action ── */}
            {step === 4 && (
              <div className="px-6 py-8">
                <h2 className="text-sm font-medium uppercase tracking-wider mb-4" style={{ color: C.cream }}>Action</h2>
                <h3 className="font-semibold text-lg mb-2" style={{ color: C.cream }}>How will you live this out?</h3>
                <p className="text-sm mb-4" style={{ color: C.sageMuted }}>
                  Ask yourself and God: How will you apply what you&apos;ve received in prayer to your life?
                </p>
                <textarea
                  placeholder="Optional: a few words to remember..."
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="w-full min-h-[100px] bg-white/5 border border-white/10 text-sm p-3 resize-none"
                  style={{ color: C.cream }}
                  rows={3}
                />
                <p className="text-xs mt-2" style={{ color: C.creamFaint }}>
                  Your note is kept only on this device and is not saved to the cloud.
                </p>
              </div>
            )}

            {/* Progress dots + Next/Finish */}
            <div className="flex-shrink-0 px-4 py-5 flex items-center justify-between gap-3 w-full">
              <div className="flex items-center justify-center gap-1.5 flex-1" role="tablist" aria-label="Prayer steps">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-label={`${STEPS[i].title}${step === i ? ", current" : ""}`}
                    aria-selected={step === i}
                    onClick={() => setStep(i)}
                    className={`transition-all focus:outline-none ${step === i ? "w-5 h-1.5 rounded-full" : "w-1.5 h-1.5 rounded-full"}`}
                    style={{ background: step === i ? C.sage : C.creamFaint }}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => (isLastStep ? handleFinish() : setStep(step + 1))}
                className="flex-shrink-0 text-sm font-medium hover:underline focus:outline-none focus:underline"
                style={{ color: C.cream }}
              >
                {isLastStep ? "Finish" : "Next →"}
              </button>
            </div>

          </div>
        </div>

        {/* Go Deeper — fixed bottom, espresso bg */}
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/8 safe-area-bottom" style={{ background: "rgba(13,10,7,0.97)" }}>
          <GoDeeperSection reflections={artwork?.traditionReflections} />
        </div>
      </div>
    </PageTransition>
  );
}
