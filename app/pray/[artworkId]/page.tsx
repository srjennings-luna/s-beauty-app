"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
  const chantAudioRef = useRef<HTMLAudioElement | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);

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

  const setMusic = (mode: MusicMode) => {
    const chant = chantAudioRef.current;
    const ambient = ambientAudioRef.current;
    chant?.pause();
    ambient?.pause();
    if (mode === "chant" && chant) {
      chant.play().catch(() => setMusicMode("off"));
      setMusicPaused(false);
    }
    if (mode === "ambient" && ambient) {
      ambient.play().catch(() => setMusicMode("off"));
      setMusicPaused(false);
    }
    if (mode === "off") setMusicPaused(true);
    setMusicMode(mode);
    setMusicMenuOpen(false);
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
          <Link href="/" className="text-amber-500">Back to home</Link>
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
      <div className="min-h-screen bg-[#203545] flex flex-col pb-24 safe-area-bottom">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/10 safe-area-top">
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
            <button type="button" onClick={() => setMusicMenuOpen(true)} className="text-white/40 text-xs font-medium">
              Music
            </button>
          ) : (
            <div className="w-10" />
          )}
        </div>
        <audio ref={chantAudioRef} src={MUSIC_CHANT} loop playsInline />
        <audio ref={ambientAudioRef} src={MUSIC_AMBIENT} loop playsInline />

        {/* Music menu (shared: opened from floating button or inline link) */}
        {musicMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" aria-hidden onClick={() => setMusicMenuOpen(false)} />
            <div className="fixed bottom-32 right-4 z-50 w-40 bg-[#66293C] border border-white/10 py-1" style={{ marginBottom: "env(safe-area-inset-bottom, 0)" }}>
              {isPlaying ? (
                <button type="button" onClick={pauseMusic} className="w-full px-4 py-2 text-left text-sm text-white/80">Pause</button>
              ) : (musicMode === "chant" || musicMode === "ambient") ? (
                <button type="button" onClick={resumeMusic} className="w-full px-4 py-2 text-left text-sm text-[#C19B5F]">Resume</button>
              ) : null}
              <button type="button" onClick={() => setMusic("off")} className={`w-full px-4 py-2 text-left text-sm ${musicMode === "off" ? "text-[#C19B5F]" : "text-white/80"}`}>Off</button>
              <button type="button" onClick={() => setMusic("chant")} className={`w-full px-4 py-2 text-left text-sm ${musicMode === "chant" ? "text-[#C19B5F]" : "text-white/80"}`}>Chant</button>
              <button type="button" onClick={() => setMusic("ambient")} className={`w-full px-4 py-2 text-left text-sm ${musicMode === "ambient" ? "text-[#C19B5F]" : "text-white/80"}`}>Ambient</button>
            </div>
          </>
        )}

        {/* Floating music button – only when chant or ambient is selected (playing or paused) */}
        {(musicMode === "chant" || musicMode === "ambient") && (
          <button
            type="button"
            onClick={() => setMusicMenuOpen(!musicMenuOpen)}
            className="fixed bottom-24 right-4 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-[#66293C] border border-white/20 text-[#C19B5F] shadow-lg safe-area-bottom"
            style={{ marginBottom: "env(safe-area-inset-bottom, 0)" }}
            aria-label="Music options"
            aria-expanded={musicMenuOpen}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.14c-.938 0-1.64.703-1.64 1.64v6.72c0 .937.702 1.64 1.64 1.64h2.3l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.44 18.53c.266-.436.227-.905-.096-1.228A9.92 9.92 0 0119 12c0-2.233-.758-4.29-2.034-5.964a1.077 1.077 0 00-1.532.066 1.077 1.077 0 00.066 1.532A7.92 7.92 0 0117 12c0 1.61-.428 3.118-1.176 4.408a1.078 1.078 0 00.616 1.479c.44.161.92.023 1.24-.355z" />
            </svg>
          </button>
        )}

        {/* Step content */}
        <div className="flex-1 overflow-y-auto">
          {/* Gaze */}
          {step === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 py-8">
              <h2 className="text-amber-500/90 text-sm font-semibold uppercase tracking-wider mb-4">Gaze</h2>
              <div className="relative w-full max-w-lg aspect-[4/3] overflow-hidden mb-6">
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-white/80 text-center text-sm leading-relaxed max-w-md">
                Let your eyes rest on the image. Notice what draws you. Ask God to open the eyes of your heart.
              </p>
              <p className="text-white/40 text-xs mt-4">Take 1–2 minutes if you like.</p>
            </div>
          )}

          {/* Meditate */}
          {step === 1 && (
            <div className="px-6 py-8">
              <h2 className="text-amber-500/90 text-sm font-semibold uppercase tracking-wider mb-4">Meditate</h2>
              <div className="relative w-full max-w-md mx-auto aspect-video overflow-hidden mb-6">
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-white font-semibold text-lg mb-2">Reflect</h2>
              <p className="text-white/70 text-sm mb-4">
                Look deeper. What movement or relationships do you see? Where are you in this image?
              </p>
              {questions.length > 0 && (
                <ul className="space-y-2">
                  {questions.slice(0, 3).map((q, i) => (
                    <li key={i} className="text-white/80 text-sm flex gap-2">
                      <span className="text-amber-500/80">•</span>
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
              <h2 className="text-amber-500/90 text-sm font-semibold uppercase tracking-wider mb-4">Pray</h2>
              {isSacredArt && artwork.scripturePairing && (
                <div className="bg-white/5 border-l-2 border-amber-500/70 p-4 mb-6">
                  <p className="font-serif-elegant italic text-white/90 text-base leading-relaxed">
                    &ldquo;{artwork.scripturePairing.verse}&rdquo;
                  </p>
                  <p className="text-amber-500/90 text-sm mt-2 font-medium">
                    — {artwork.scripturePairing.reference}
                  </p>
                </div>
              )}
              {!isSacredArt && artwork.quote && (
                <div className="bg-white/5 border-l-2 border-amber-500/70 p-4 mb-6">
                  <p className="font-serif-elegant italic text-white/90 text-base leading-relaxed">
                    &ldquo;{artwork.quote.text}&rdquo;
                  </p>
                  <p className="text-amber-500/90 text-sm mt-2 font-medium">
                    — {artwork.quote.attribution}
                  </p>
                </div>
              )}
              <p className="text-white/70 text-sm">
                Respond to God in prayer—thanksgiving, intercession, or simply conversation about what you notice.
              </p>
            </div>
          )}

          {/* Contemplate */}
          {step === 3 && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 py-8">
              <h2 className="text-amber-500/90 text-sm font-semibold uppercase tracking-wider mb-4">Contemplate</h2>
              <div className="relative w-full max-w-sm aspect-square overflow-hidden mb-6">
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-white/80 text-center text-sm leading-relaxed max-w-md">
                Rest in God’s presence. No words are needed. Let the beauty you’ve seen lead you into silence and communion.
              </p>
            </div>
          )}

          {/* Action */}
          {step === 4 && (
            <div className="px-6 py-8">
              <h2 className="text-amber-500/90 text-sm font-semibold uppercase tracking-wider mb-4">Action</h2>
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
        </div>

        {/* Step navigation – above Go deeper so it’s clearly tied to the content */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-white/10 bg-[#203545] flex gap-3 justify-center">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 border border-white/30 text-white/90 font-medium"
            >
              Previous
            </button>
          ) : (
            <span className="w-[5.5rem]" aria-hidden />
          )}
          <button
            type="button"
            onClick={() => (isLastStep ? router.back() : setStep(step + 1))}
            className="px-6 py-3 bg-[#C19B5F] text-[#203545] font-semibold"
          >
            {isLastStep ? "Finish" : "Next"}
          </button>
        </div>

        {/* Go deeper – optional, below step navigation */}
        <div className="flex-shrink-0 bg-[#66293C]">
          <GoDeeperSection />
        </div>
      </div>
    </PageTransition>
  );
}
