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

// ── Progress dots ────────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-3">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 transition-all duration-300 ${
            i === current
              ? "w-6 bg-[#C19B5F]"
              : i < current
              ? "w-1.5 bg-[#C19B5F]/60"
              : "w-1.5 bg-white/20"
          }`}
        />
      ))}
      <span className="text-white/30 text-xs ml-2">
        {current + 1} of {total}
      </span>
    </div>
  );
}

// ── Step 1: Open ─────────────────────────────────────────────────────────────

function StepOpen({ day }: { day: JourneyDay }) {
  return (
    <div className="relative h-full w-full">
      {/* Full-screen image */}
      {day.openImageUrl && (
        <img
          src={day.openImageUrl}
          alt={day.dayTitle}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {/* Gradient overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

      {/* Overlaid text */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-8">
        <p className="text-[#C19B5F] text-xs tracking-widest uppercase mb-2">
          Day {day.dayNumber}
        </p>
        <h2 className="font-serif-elegant text-3xl text-white mb-3">
          {day.dayTitle}
        </h2>
        {day.openText && (
          <p className="font-serif-elegant-italic text-white/80 text-lg leading-relaxed">
            {day.openText}
          </p>
        )}
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
        <p className="text-white/50 text-sm">No encounter content available.</p>
      </div>
    );
  }

  const icon = TYPE_ICONS[content.contentType] ?? "✦";
  const typeLabel = content.contentType.replace("-", " ");

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Content image */}
      {content.imageUrl && (
        <div className="relative w-full aspect-[16/10] flex-shrink-0">
          <img
            src={content.imageUrl}
            alt={content.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#203545]" />
        </div>
      )}

      <div className="px-6 py-6 flex-1">
        {/* Type badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{icon}</span>
          <span className="text-[#C19B5F] text-xs tracking-widest uppercase">
            {typeLabel}
          </span>
        </div>

        <h2 className="font-serif-elegant text-2xl text-white mb-2">
          {content.title}
        </h2>

        {/* Artist / author / composer / thinker attribution */}
        {(content.artist || content.author || content.composer || content.thinkerName) && (
          <p className="text-white/50 text-sm mb-4">
            {content.artist || content.author || content.composer || content.thinkerName}
            {content.year && `, ${content.year}`}
          </p>
        )}

        {/* Description */}
        <p className="text-white/70 text-sm leading-relaxed mb-5">
          {content.description}
        </p>

        {/* Context */}
        {content.context && (
          <div className="border-l-2 border-white/15 pl-4 mb-5">
            <p className="text-white/50 text-xs tracking-widest uppercase mb-1">
              Context
            </p>
            <p className="text-white/60 text-sm leading-relaxed">
              {content.context}
            </p>
          </div>
        )}

        {/* Quote (thinker type) */}
        {content.quote?.text && (
          <div className="bg-white/5 p-5 mb-5">
            <p className="font-serif-elegant-italic text-white/80 text-lg leading-relaxed mb-2">
              &ldquo;{content.quote.text}&rdquo;
            </p>
            {content.quote.attribution && (
              <p className="text-[#C19B5F] text-xs">
                — {content.quote.attribution}
              </p>
            )}
          </div>
        )}

        {/* Scripture (sacred art) */}
        {content.scripturePairing?.verse && (
          <div className="bg-white/5 p-5 mb-5">
            <p className="font-serif-elegant-italic text-white/80 text-lg leading-relaxed mb-2">
              {content.scripturePairing.verse}
            </p>
            <p className="text-[#C19B5F] text-xs">
              — {content.scripturePairing.reference}
            </p>
          </div>
        )}

        {/* Excerpt (literature) */}
        {content.excerpt && (
          <div className="bg-white/5 p-5 mb-5">
            <p className="font-serif-elegant-italic text-white/80 text-base leading-relaxed">
              {content.excerpt}
            </p>
            {content.workTitle && (
              <p className="text-white/40 text-xs mt-2">
                from <em>{content.workTitle}</em>
              </p>
            )}
          </div>
        )}

        {/* Encounter guidance */}
        {day.encounterGuidance && (
          <p className="text-white/40 text-xs italic border-t border-white/10 pt-4">
            {day.encounterGuidance}
          </p>
        )}

        {/* Action links */}
        <div className="mt-4 flex flex-wrap gap-3">
          {(content.contentType === "sacred-art" || content.contentType === "landscape") && (
            <Link
              href={`/pray/${content._id}`}
              className="text-[#C19B5F] text-sm tracking-wide hover:underline"
            >
              Pray with this image →
            </Link>
          )}
          {content.contentType === "music" && content.musicUrl && (
            <a
              href={content.musicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C19B5F] text-sm tracking-wide hover:underline"
            >
              Listen →
            </a>
          )}
          {content.contentType === "watch-listen" && content.mediaUrl && (
            <a
              href={content.mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C19B5F] text-sm tracking-wide hover:underline"
            >
              {content.mediaType === "podcast" ? "Listen" : "Watch"} →
            </a>
          )}
        </div>
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
        <p className="text-white/50 text-sm">No reflection questions for this day.</p>
      </div>
    );
  }

  const current = Math.min(questionIndex, total - 1);
  const isLast = current >= total - 1;

  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      {/* Question counter */}
      {total > 1 && (
        <p className="text-white/30 text-xs tracking-widest uppercase mb-8">
          Question {current + 1} of {total}
        </p>
      )}

      {/* The question */}
      <p className="font-serif-elegant-italic text-white text-2xl leading-relaxed text-center max-w-md">
        {questions[current]}
      </p>

      {/* Next question button (if more) */}
      {!isLast && (
        <button
          onClick={onNextQuestion}
          className="mt-10 text-[#C19B5F] text-sm tracking-wide hover:underline"
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
      <p className="text-[#C19B5F] text-xs tracking-widest uppercase mb-6">
        Tomorrow
      </p>
      {day.connectThread ? (
        <p className="font-serif-elegant text-white/80 text-xl leading-relaxed text-center max-w-md">
          {day.connectThread}
        </p>
      ) : (
        <p className="text-white/50 text-sm text-center">
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
    <div className="flex flex-col h-full overflow-y-auto px-6 py-8">
      <p className="text-[#C19B5F] text-xs tracking-widest uppercase mb-2">
        Go Deeper
      </p>
      <h2 className="font-serif-elegant text-2xl text-white mb-2">
        Reflections from the Tradition
      </h2>
      <p className="text-white/40 text-sm mb-6">
        Optional readings from the Church Fathers, Saints, and Popes
      </p>

      {reflections.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/30 text-sm">
            No tradition reflections for this day.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reflections.map((r) => {
            const isOpen = expandedId === r._id;
            return (
              <div key={r._id} className="bg-white/5 border border-white/10">
                <button
                  onClick={() => setExpandedId(isOpen ? null : r._id)}
                  className="w-full flex items-center justify-between px-4 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm font-medium">
                      {r.title}
                    </p>
                    <p className="text-white/30 text-xs mt-0.5">{r.source}</p>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`w-4 h-4 text-white/30 flex-shrink-0 ml-3 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
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
                      <p className="font-serif-elegant-italic text-white/80 text-sm border-l-2 border-[#C19B5F] pl-3 mb-3">
                        &ldquo;{r.shortQuote}&rdquo;
                      </p>
                    )}
                    <p className="text-white/60 text-sm leading-relaxed">
                      {r.summary}
                    </p>
                    {r.era && (
                      <p className="text-white/30 text-xs mt-2">{r.era}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
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
    <div className="fixed inset-0 z-50 bg-[#203545] flex flex-col safe-area-top">
      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 pt-12 pb-3">
        {/* Close / back */}
        <button
          onClick={step === 0 ? onClose : handlePrev}
          className="w-9 h-9 flex items-center justify-center text-white/70"
          aria-label={step === 0 ? "Close" : "Previous step"}
        >
          {step === 0 ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        {/* Step label */}
        <span className="text-white/50 text-xs tracking-widest uppercase">
          {STEP_LABELS[step]}
        </span>

        {/* Close button (always visible on right for quick exit) */}
        {step > 0 && (
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-white/40"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {step === 0 && <div className="w-9" />}
      </div>

      {/* Progress indicator */}
      <div className="flex-shrink-0 px-5 pb-4">
        <StepIndicator current={step} total={totalSteps} />
      </div>

      {/* Step content — fills remaining space */}
      <div className="flex-1 min-h-0 overflow-hidden">
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

      {/* Bottom action bar */}
      <div className="flex-shrink-0 px-5 pt-4 pb-8 safe-area-bottom">
        {isLastStep ? (
          <button
            onClick={() => {
              if (!isComplete) onMarkComplete();
              onClose();
            }}
            className={`w-full py-4 text-sm font-semibold tracking-wide transition-all ${
              isComplete
                ? "bg-white/10 text-white/50"
                : "bg-[#C19B5F] text-[#111820]"
            }`}
          >
            {isComplete ? "✓ Day Complete" : "Complete Day"}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full py-4 bg-[#C19B5F] text-[#111820] text-sm font-semibold tracking-wide"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
