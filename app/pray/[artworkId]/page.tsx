"use client";

import { useState, useEffect } from "react";
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

export default function PrayPage() {
  const params = useParams();
  const router = useRouter();
  const [artwork, setArtwork] = useState<SanityArtwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [actionNote, setActionNote] = useState("");

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
  const stepConfig = STEPS[step];
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
            {step + 1} of {STEPS.length}
          </span>
          <div className="w-10" />
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto">
          {/* Gaze */}
          {step === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 py-8">
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
              <h2 className="text-white font-semibold text-lg mb-2">How will you live this out?</h2>
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

        {/* Go deeper – after the step flow */}
        <div className="flex-shrink-0 bg-[#1a2a36]">
          <GoDeeperSection />
        </div>

        {/* Next / Finish */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-white/10 bg-[#203545]">
          <button
            type="button"
            onClick={() => (isLastStep ? router.back() : setStep(step + 1))}
            className="w-full py-3 bg-amber-500/90 text-[#1a2a36] font-semibold text-center"
          >
            {isLastStep ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </PageTransition>
  );
}
