"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { getArtworkById } from "@/lib/sanity";
import GoDeeperSection from "@/components/GoDeeperSection";
import PageTransition from "@/components/ui/PageTransition";

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
};

const STEPS = [
  { key: "gaze", title: "Gaze", label: "Visio" },
  { key: "meditate", title: "Meditate", label: "Meditatio" },
  { key: "pray", title: "Pray", label: "Oratio" },
  { key: "contemplate", title: "Contemplate", label: "Contemplatio" },
  { key: "action", title: "Action", label: "Operatio" },
];

const MUSIC_AMBIENT = "/music/natureseye-piano-dreamcloud-meditation-179215.mp3";
const MUSIC_CHANT = "/music/nickpanek-ave-maria-latin-catholic-gregorian-chant-218251.mp3";

type MusicMode = "off" | "chant" | "ambient";

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
    // Show selection immediately so floating icon appears on iOS even if play() fails
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#203545] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin mb-2" />
          <p className="text-white/50">Loading…</p>
        </div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen bg-[#203545] flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-white mb-2">Artwork not found</h1>
          <Link href="/" className="text-[#C19B5F]">Back to home</Link>
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
      <div className="min-h-screen flex flex-col pb-24 safe-area-bottom" style={{ background: "linear-gradient(180deg, #2a4050 0%, #203545 30%, #203545 70%, #1a2a36 100%)" }}>
        {/* Header – slightly lighter teal */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/10 safe-area-top bg-[#2a4050]">
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (step > 0) setStep(step - 1);
              else router.back();
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white"
            aria-label={step > 0 ? "Previous step" : "Back"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
          <span className="text-white/60 text-sm">
            {step + 1} of {STEPS.length} · {STEPS[step].title}
          </span>
          {musicMode === "off" ? (
            <button type="button" onClick={() => { setMusicLoadError(false); setMusicMenuOpen(true); }} className="text-white/40 text-xs font-medium">
              Music
            </button>
          ) : (
            <div className="w-10" />
          )}
        </div>
        <audio ref={chantAudioRef} src={MUSIC_CHANT} loop playsInline preload="auto" muted={false} />
        <audio ref={ambientAudioRef} src={MUSIC_AMBIENT} loop playsInline preload="auto" muted={false} />

        {/* Music menu – opens near Music text (below header, right-aligned) */}
        {musicMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" aria-hidden onClick={() => setMusicMenuOpen(false)} />
            <div className="fixed top-14 right-4 z-50 w-40 bg-[#1a2a36] border border-white/10 py-1 shadow-lg">
              {isPlaying ? (
                <button type="button" onClick={pauseMusic} className="w-full px-4 py-2 text-left text-sm text-white/80">Pause</button>
              ) : (musicMode === "chant" || musicMode === "ambient") ? (
                <button type="button" onClick={resumeMusic} className="w-full px-4 py-2 text-left text-sm text-[#C19B5F]">Resume</button>
              ) : null}
              <button type="button" onClick={() => setMusic("off")} className={`w-full px-4 py-2 text-left text-sm ${musicMode === "off" ? "text-[#C19B5F]" : "text-white/80"}`}>Off</button>
              <button type="button" onClick={() => setMusic("chant")} className={`w-full px-4 py-2 text-left text-sm ${musicMode === "chant" ? "text-[#C19B5F]" : "text-white/80"}`}>Chant</button>
              <button type="button" onClick={() => setMusic("ambient")} className={`w-full px-4 py-2 text-left text-sm ${musicMode === "ambient" ? "text-[#C19B5F]" : "text-white/80"}`}>Ambient</button>
              {musicLoadError && (
                <p className="px-4 py-2 text-xs text-white/50 border-t border-white/10">Couldn’t load music. Try again or check the file.</p>
              )}
              <p className="px-4 py-2 text-xs text-white/40 border-t border-white/10">No sound? Check device volume and, on iPhone, the side mute switch.</p>
            </div>
          </>
        )}

        {/* Floating music button – only when chant or ambient is selected (playing or paused) */}
        {(musicMode === "chant" || musicMode === "ambient") && (
          <button
            type="button"
            onClick={() => setMusicMenuOpen(!musicMenuOpen)}
            className="fixed bottom-24 right-4 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-[#1a2a36] border border-white/20 text-[#C19B5F] shadow-lg safe-area-bottom"
            style={{ marginBottom: "env(safe-area-inset-bottom, 0)" }}
            aria-label="Music options"
            aria-expanded={musicMenuOpen}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.14c-.938 0-1.64.703-1.64 1.64v6.72c0 .937.702 1.64 1.64 1.64h2.3l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.44 18.53c.266-.436.227-.905-.096-1.228A9.92 9.92 0 0119 12c0-2.233-.758-4.29-2.034-5.964a1.077 1.077 0 00-1.532.066 1.077 1.077 0 00.066 1.532A7.92 7.92 0 0117 12c0 1.61-.428 3.118-1.176 4.408a1.078 1.078 0 00.616 1.479c.44.161.92.023 1.24-.355z" />
            </svg>
          </button>
        )}

        {/* Step content – swipe left = next, swipe right = previous (wrapper captures touch so swipe works) */}
        <div
          className="flex-1 min-h-0 flex flex-col"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex-1 overflow-y-auto touch-pan-y">
          {/* Gaze – image priority: full image visible, pinch to zoom / pan */}
          {step === 0 && (
            <div className="flex flex-col px-4 py-6">
              <h2 className="text-[#C19B5F] text-sm font-semibold uppercase tracking-wider mb-4 text-center">Gaze</h2>
              <div className="w-full min-h-[55vh] flex-1 flex flex-col mb-6">
                <TransformWrapper
                  initialScale={1}
                  minScale={1}
                  maxScale={8}
                  centerOnInit={false}
                  doubleClick={{ mode: "toggle", step: 2 }}
                >
                  <TransformComponent
                    wrapperStyle={{ width: "100%", height: "100%", minHeight: "55vh" }}
                    contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <img
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      className="max-w-full max-h-[70vh] object-contain select-none"
                      draggable={false}
                    />
                  </TransformComponent>
                </TransformWrapper>
              </div>
              <p className="text-white/80 text-center text-sm leading-relaxed max-w-md mx-auto">
                Let your eyes rest on the image. Notice what draws you. Ask God to open the eyes of your heart.
              </p>
              <p className="text-white/40 text-xs mt-4 text-center">Take 1–2 minutes if you like. Pinch to zoom the image.</p>
            </div>
          )}

          {/* Meditate – same image priority: full image, zoom/pan */}
          {step === 1 && (
            <div className="px-4 py-6">
              <h2 className="text-[#C19B5F] text-sm font-semibold uppercase tracking-wider mb-4">Meditate</h2>
              <div className="w-full min-h-[50vh] mb-6">
                <TransformWrapper
                  initialScale={1}
                  minScale={1}
                  maxScale={8}
                  centerOnInit={false}
                  doubleClick={{ mode: "toggle", step: 2 }}
                >
                  <TransformComponent
                    wrapperStyle={{ width: "100%", height: "100%", minHeight: "50vh" }}
                    contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <img
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      className="max-w-full max-h-[65vh] object-contain select-none"
                      draggable={false}
                    />
                  </TransformComponent>
                </TransformWrapper>
              </div>
              <h2 className="text-white font-semibold text-lg mb-2">Reflect</h2>
              <p className="text-white/70 text-sm mb-4">
                Look deeper. What movement or relationships do you see? Where are you in this image?
              </p>
              {questions.length > 0 && (
                <ul className="space-y-2">
                  {questions.slice(0, 3).map((q, i) => (
                    <li key={i} className="text-white/80 text-sm flex gap-2">
                      <span className="text-[#C19B5F]">•</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Pray */}
          {step === 2 && (
            <div className="px-6 py-8">
              <h2 className="text-[#C19B5F] text-sm font-semibold uppercase tracking-wider mb-4">Pray</h2>
              {isSacredArt && artwork.scripturePairing && (
                <div className="bg-white/5 border-l-2 border-[#C19B5F] p-4 mb-6">
                  <p className="font-serif-elegant italic text-white/90 text-base leading-relaxed">
                    &ldquo;{artwork.scripturePairing.verse}&rdquo;
                  </p>
                  <p className="text-[#C19B5F] text-sm mt-2 font-medium">
                    — {artwork.scripturePairing.reference}
                  </p>
                </div>
              )}
              {!isSacredArt && artwork.quote && (
                <div className="bg-white/5 border-l-2 border-[#C19B5F] p-4 mb-6">
                  <p className="font-serif-elegant italic text-white/90 text-base leading-relaxed">
                    &ldquo;{artwork.quote.text}&rdquo;
                  </p>
                  <p className="text-[#C19B5F] text-sm mt-2 font-medium">
                    — {artwork.quote.attribution}
                  </p>
                </div>
              )}
              <p className="text-white/70 text-sm">
                Respond to God in prayer—thanksgiving, intercession, or simply conversation about what you notice.
              </p>
            </div>
          )}

          {/* Contemplate – same image priority: full image, zoom/pan */}
          {step === 3 && (
            <div className="flex flex-col px-4 py-6">
              <h2 className="text-[#C19B5F] text-sm font-semibold uppercase tracking-wider mb-4 text-center">Contemplate</h2>
              <div className="w-full min-h-[55vh] mb-6">
                <TransformWrapper
                  initialScale={1}
                  minScale={1}
                  maxScale={8}
                  centerOnInit={false}
                  doubleClick={{ mode: "toggle", step: 2 }}
                >
                  <TransformComponent
                    wrapperStyle={{ width: "100%", height: "100%", minHeight: "55vh" }}
                    contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <img
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      className="max-w-full max-h-[70vh] object-contain select-none"
                      draggable={false}
                    />
                  </TransformComponent>
                </TransformWrapper>
              </div>
              <p className="text-white/80 text-center text-sm leading-relaxed max-w-md mx-auto">
                Rest in God’s presence. No words are needed. Let the beauty you’ve seen lead you into silence and communion.
              </p>
              <p className="text-white/40 text-xs mt-4 text-center">Pinch to zoom the image.</p>
            </div>
          )}

          {/* Action */}
          {step === 4 && (
            <div className="px-6 py-8">
              <h2 className="text-[#C19B5F] text-sm font-semibold uppercase tracking-wider mb-4">Action</h2>
              <h3 className="text-white font-semibold text-lg mb-2">How will you live this out?</h3>
              <p className="text-white/70 text-sm mb-4">
                Ask yourself and God: How will you apply what you’ve received in prayer to your life?
              </p>
              <textarea
                placeholder="Optional: a few words to remember..."
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                className="w-full min-h-[100px] bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm p-3 resize-none"
                rows={3}
              />
              <p className="text-white/40 text-xs mt-2">
                Your note is kept only on this device and is not saved to the cloud.
              </p>
            </div>
          )}

          {/* Pagination: centered under step content, same background as page */}
          <div className="flex-shrink-0 px-4 py-5 flex flex-col items-center justify-center gap-2">
            <div className="flex items-center justify-center gap-2" role="tablist" aria-label="Prayer steps">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-label={`${STEPS[i].title}${step === i ? ", current" : ""}`}
                  aria-selected={step === i}
                  onClick={() => setStep(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#C19B5F] focus:ring-offset-2 focus:ring-offset-transparent ${step === i ? "bg-[#C19B5F] scale-125" : "bg-white/30 hover:bg-white/50"}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => (isLastStep ? router.back() : setStep(step + 1))}
              className="text-[#C19B5F] text-sm font-medium hover:underline focus:outline-none focus:underline"
            >
              {isLastStep ? "Finish" : "Next"}
            </button>
            <p className="text-white/40 text-xs">Swipe or tap Next to move between steps</p>
          </div>
          </div>
        </div>

        {/* Go deeper – only bar with darker background so it’s clearly tied to the content */}
        <div className="flex-shrink-0 bg-[#1a2a36]">
          <GoDeeperSection />
        </div>
      </div>
    </PageTransition>
  );
}
