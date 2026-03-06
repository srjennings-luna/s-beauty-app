"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import type { JourneyDay } from "@/lib/types";

const STEP_LABELS = ["Open", "Encounter", "Reflect", "Connect", "Go Deeper"];

const TYPE_ICONS: Record<string, string> = {
  "sacred-art": "🎨",
  thinker: "📖",
  literature: "✍️",
  music: "🎵",
  "food-wine": "🍷",
  landscape: "🌿",
  "watch-listen": "🎬",
};

// ── KALLOS espresso palette (immersive overlay) ───────────────────────────────
const C = {
  bg: "#16110d",
  cream: "rgba(253,246,232,0.88)",
  creamDim: "rgba(253,246,232,0.5)",
  creamFaint: "rgba(253,246,232,0.25)",
  sage: "#4a7a62",
  sageMuted: "#7a9a8a",
  gold: "#C19B5F",  // ONE moment: Tradition quote border in Go Deeper
};

// ── Progress dots ─────────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            style={i === current ? { background: C.sage } : undefined}
            className={`transition-all ${
              i === current
                ? "w-5 h-1.5 rounded-full"
                : "w-1.5 h-1.5 rounded-full bg-white/25"
            }`}
          />
        ))}
      </div>
      <span className="text-white/30 text-xs ml-2">
        {current + 1} of {total}
      </span>
    </div>
  );
}

// ── Step 1: Open ─────────────────────────────────────────────────────────────

function StepOpen({ day }: { day: JourneyDay }) {
  return (
    <div className="relative h-full w-full overflow-y-auto">
      {/* Fixed background image */}
      {day.openImageUrl && (
        <div className="sticky top-0 w-full h-full -mb-[100%]">
          <img
            src={day.openImageUrl}
            alt={day.dayTitle}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Scrollable content layer */}
      <div className="relative min-h-full flex flex-col justify-end">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 pointer-events-none" />

        {/* Text content */}
        <div className="relative px-6 pb-24">
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: C.creamDim }}>
            Day {day.dayNumber}
          </p>
          <h2 className="font-serif-elegant text-3xl text-white mb-3">
            {day.dayTitle}
          </h2>
          {day.openText && (
            <p className="font-serif-elegant-italic text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
              {day.openText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Step 2: Encounter ────────────────────────────────────────────────────────

function StepEncounter({ day }: { day: JourneyDay }) {
  const content = day.encounterContent;
  if (!content) {
    return (
      <div className="flex items-center justify-center h-full px-6">
        <p className="text-sm" style={{ color: C.creamFaint }}>No encounter content available.</p>
      </div>
    );
  }

  const icon = TYPE_ICONS[content.contentType] ?? "✦";
  const typeLabel = content.contentType.replace("-", " ");

  return (
    <div className="h-full overflow-y-auto">
      {/* Spacer for overlaid header — nav row + progress dots row */}
      <div style={{ height: "calc(max(env(safe-area-inset-top, 0px), 48px) + 96px)" }} />

      {/* Content image */}
      {content.imageUrl && (
        <div className="relative w-full aspect-[16/10] flex-shrink-0">
          <img
            src={content.imageUrl}
            alt={content.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent" style={{ background: `linear-gradient(to bottom, transparent, ${C.bg})` }} />
        </div>
      )}

      <div className="px-6 py-6">
        {/* Type badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{icon}</span>
          <span className="text-xs tracking-widest uppercase" style={{ color: C.sageMuted }}>
            {typeLabel}
          </span>
        </div>

        <h2 className="font-serif-elegant text-2xl text-white mb-2">
          {content.title}
        </h2>

        {/* Attribution */}
        {(content.artist || content.author || content.composer || content.thinkerName) && (
          <p className="text-sm mb-4" style={{ color: C.creamFaint }}>
            {content.artist || content.author || content.composer || content.thinkerName}
            {content.year && `, ${content.year}`}
          </p>
        )}

        {/* Description */}
        <p className="text-sm leading-relaxed mb-5" style={{ color: C.sageMuted }}>
          {content.description}
        </p>

        {/* Context */}
        {content.context && (
          <div className="border-l-2 border-white/10 pl-4 mb-5">
            <p className="text-xs tracking-widest uppercase mb-1" style={{ color: C.creamFaint }}>
              Context
            </p>
            <p className="text-sm leading-relaxed" style={{ color: C.sageMuted }}>
              {content.context}
            </p>
          </div>
        )}

        {/* Quote (thinker type) */}
        {content.quote?.text && (
          <div className="bg-white/5 p-5 mb-5">
            <p className="font-serif-elegant-italic text-lg leading-relaxed mb-2" style={{ color: "rgba(255,255,255,0.8)" }}>
              &ldquo;{content.quote.text}&rdquo;
            </p>
            {content.quote.attribution && (
              <p className="text-xs" style={{ color: C.sageMuted }}>
                — {content.quote.attribution}
              </p>
            )}
          </div>
        )}

        {/* Scripture (sacred art) */}
        {content.scripturePairing?.verse && (
          <div className="bg-white/5 p-5 mb-5">
            <p className="font-serif-elegant-italic text-lg leading-relaxed mb-2" style={{ color: "rgba(255,255,255,0.8)" }}>
              {content.scripturePairing.verse}
            </p>
            <p className="text-xs" style={{ color: C.sageMuted }}>
              — {content.scripturePairing.reference}
            </p>
          </div>
        )}

        {/* Excerpt (literature) */}
        {content.excerpt && (
          <div className="bg-white/5 p-5 mb-5">
            <p className="font-serif-elegant-italic text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
              {content.excerpt}
            </p>
            {content.workTitle && (
              <p className="text-xs mt-2" style={{ color: C.creamFaint }}>
                from <em>{content.workTitle}</em>
              </p>
            )}
          </div>
        )}

        {/* Encounter guidance */}
        {day.encounterGuidance && (
          <p className="text-xs italic border-t border-white/8 pt-4" style={{ color: C.creamFaint }}>
            {day.encounterGuidance}
          </p>
        )}

        {/* Action links */}
        <div className="mt-4 flex flex-wrap gap-3">
          {(content.contentType === "sacred-art" || content.contentType === "landscape") && (
            <Link
              href={`/pray/${content._id}`}
              className="text-sm tracking-wide hover:underline"
              style={{ color: C.sageMuted }}
            >
              Pray with this image →
            </Link>
          )}
          {content.contentType === "music" && content.musicUrl && (
            <a
              href={content.musicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm tracking-wide hover:underline"
              style={{ color: C.sageMuted }}
            >
              Listen →
            </a>
          )}
          {content.contentType === "watch-listen" && content.mediaUrl && (
            <a
              href={content.mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm tracking-wide hover:underline"
              style={{ color: C.sageMuted }}
            >
              {content.mediaType === "podcast" ? "Listen" : "Watch"} →
            </a>
          )}
        </div>

        {/* Spacer for overlaid footer */}
        <div className="h-24" />
      </div>
    </div>
  );
}

// ── Step 3: Reflect ──────────────────────────────────────────────────────────

function StepReflect({
  day,
  questionIndex,
  onNextQuestion,
}: {
  day: JourneyDay;
  questionIndex: number;
  onNextQuestion: () => void;
}) {
  const questions = day.reflectQuestions ?? [];
  const total = questions.length;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-full px-6">
        <p className="text-sm" style={{ color: C.creamFaint }}>No reflection questions for this day.</p>
      </div>
    );
  }

  const current = Math.min(questionIndex, total - 1);
  const isLast = current >= total - 1;

  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      {/* Question counter */}
      {total > 1 && (
        <p className="text-xs tracking-widest uppercase mb-8" style={{ color: C.creamFaint }}>
          Question {current + 1} of {total}
        </p>
      )}

      {/* The question */}
      <p className="font-serif-elegant-italic text-white text-2xl leading-relaxed text-center max-w-md">
        {questions[current]}
      </p>

      {/* Next question */}
      {!isLast && (
        <button
          onClick={onNextQuestion}
          className="mt-10 text-sm tracking-wide hover:underline"
          style={{ color: C.cream }}
        >
          Next question →
        </button>
      )}
    </div>
  );
}

// ── Step 4: Connect ──────────────────────────────────────────────────────────

function StepConnect({ day }: { day: JourneyDay }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <p className="text-xs tracking-widest uppercase mb-6" style={{ color: C.creamDim }}>
        Tomorrow
      </p>
      {day.connectThread ? (
        <p className="font-serif-elegant text-xl leading-relaxed text-center max-w-md" style={{ color: "rgba(255,255,255,0.8)" }}>
          {day.connectThread}
        </p>
      ) : (
        <p className="text-sm text-center" style={{ color: C.creamFaint }}>
          You&apos;ve completed today&apos;s journey.
        </p>
      )}
    </div>
  );
}

// ── Step 5: Go Deeper ────────────────────────────────────────────────────────

function StepGoDeeper({ day }: { day: JourneyDay }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const reflections = day.goDeeper ?? [];

  return (
    <div className="h-full overflow-y-auto px-6 pt-4 pb-8">
      {/* Spacer for overlaid header — nav row + progress dots row */}
      <div style={{ height: "calc(max(env(safe-area-inset-top, 0px), 48px) + 96px)" }} />
      <p className="text-xs tracking-widest uppercase mb-2" style={{ color: C.creamDim }}>
        Go Deeper
      </p>
      <h2 className="font-serif-elegant text-2xl text-white mb-2">
        Reflections from the Tradition
      </h2>
      <p className="text-sm mb-6" style={{ color: C.creamFaint }}>
        Optional readings from the Church Fathers, Saints, and Popes
      </p>

      {reflections.length === 0 ? (
        <div className="py-20 flex items-center justify-center">
          <p className="text-sm" style={{ color: C.creamFaint }}>
            No tradition reflections for this day.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reflections.map((r) => {
            const isOpen = expandedId === r._id;
            return (
              <div key={r._id} className="bg-white/5 border border-white/8">
                <button
                  onClick={() => setExpandedId(isOpen ? null : r._id)}
                  className="w-full flex items-center justify-between px-4 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>
                      {r.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: C.creamFaint }}>{r.source}</p>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`w-4 h-4 flex-shrink-0 ml-3 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    style={{ color: C.creamFaint }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 animate-fade-in">
                    {r.shortQuote && (
                      // ── Gold: ONE sacred moment in the Journey immersive ──
                      <p className="font-serif-elegant-italic text-sm border-l-2 pl-3 mb-3" style={{ color: "rgba(255,255,255,0.8)", borderColor: C.gold }}>
                        &ldquo;{r.shortQuote}&rdquo;
                      </p>
                    )}
                    <p className="text-sm leading-relaxed" style={{ color: C.sageMuted }}>
                      {r.summary}
                    </p>
                    {r.era && (
                      <p className="text-xs mt-2" style={{ color: C.creamFaint }}>{r.era}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Spacer for overlaid footer */}
      <div className="h-24" />
    </div>
  );
}

// ── Main stepper ─────────────────────────────────────────────────────────────

export default function JourneyDaySteps({
  day,
  onClose,
  onMarkComplete,
  isComplete,
}: {
  day: JourneyDay;
  onClose: () => void;
  onMarkComplete: () => void;
  isComplete: boolean;
}) {
  const [step, setStep] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);

  const totalSteps = STEP_LABELS.length;

  const handleNext = useCallback(() => {
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
      if (step + 1 !== 2) setQuestionIndex(0);
    }
  }, [step, totalSteps]);

  const handlePrev = useCallback(() => {
    if (step > 0) {
      setStep((s) => s - 1);
      setQuestionIndex(0);
    }
  }, [step]);

  const handleNextQuestion = useCallback(() => {
    setQuestionIndex((i) => i + 1);
  }, []);

  const isLastStep = step === totalSteps - 1;

  return (
    <div className="fixed inset-0 z-[60]" style={{ height: "100dvh", backgroundColor: C.bg }}>
      {/* Content — fills entire screen */}
      <div className="absolute inset-0">
        {step === 0 && <StepOpen day={day} />}
        {step === 1 && <StepEncounter day={day} />}
        {step === 2 && (
          <StepReflect
            day={day}
            questionIndex={questionIndex}
            onNextQuestion={handleNextQuestion}
          />
        )}
        {step === 3 && <StepConnect day={day} />}
        {step === 4 && <StepGoDeeper day={day} />}
      </div>

      {/* Overlaid header */}
      <div className="absolute inset-x-0 top-0 z-10 pointer-events-none">
        <div className="pointer-events-auto flex items-center justify-between px-5 pb-2" style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 48px)" }}>
          <button
            onClick={step === 0 ? onClose : handlePrev}
            className="w-9 h-9 flex items-center justify-center"
            style={{ color: "rgba(255,255,255,0.6)" }}
            aria-label={step === 0 ? "Close" : "Previous step"}
          >
            {step === 0 ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          <span className="text-xs tracking-widest uppercase" style={{ color: C.creamDim }}>
            {STEP_LABELS[step]}
          </span>

          {step > 0 ? (
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center" style={{ color: C.creamFaint }} aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <div className="w-9" />
          )}
        </div>

        {/* Progress dots */}
        <div className="pointer-events-auto flex justify-center px-5 pt-3 pb-4">
          <StepIndicator current={step} total={totalSteps} />
        </div>
      </div>

      {/* Overlaid footer — Continue / Complete */}
      <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none">
        <div className="pointer-events-auto px-5 pt-4" style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 24px)" }}>
          {isLastStep ? (
            <button
              onClick={() => {
                if (!isComplete) onMarkComplete();
                onClose();
              }}
              className="w-full py-4 text-sm font-semibold tracking-widest uppercase transition-all"
              style={{
                color: isComplete ? C.creamFaint : C.cream,
                borderTop: `1px solid ${isComplete ? "rgba(253,246,232,0.1)" : "rgba(253,246,232,0.25)"}`,
              }}
            >
              {isComplete ? "✓ Day Complete" : "Complete Day →"}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full py-4 text-sm font-semibold tracking-widest uppercase"
              style={{
                color: C.cream,
                borderTop: `1px solid rgba(253,246,232,0.2)`,
              }}
            >
              Continue →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
