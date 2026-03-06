"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import type { JourneyDay } from "@/lib/types";

const STEP_LABELS = ["Open", "Encounter", "Reflect", "Connect", "Go Deeper"];

// ── KALLOS espresso palette ───────────────────────────────────────────────────
const C = {
  bg: "#16110d",
  cream: "rgba(253,246,232,0.88)",
  creamDim: "rgba(253,246,232,0.5)",
  creamFaint: "rgba(253,246,232,0.25)",
  sage: "#4a7a62",
  sageMuted: "#7a9a8a",
  gold: "#C19B5F",
  divider: "rgba(253,246,232,0.1)",
  darkBox: "#24201d",
};

// ── Progress dots — square, KALLOS design system ──────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            style={{
              width: i === current ? 20 : 6,
              height: 6,
              background: i === current ? C.sage : "rgba(255,255,255,0.25)",
              borderRadius: 0,
              transition: "width 300ms ease, background 300ms ease",
            }}
          />
        ))}
      </div>
      <span className="text-xs ml-2" style={{ color: "rgba(255,255,255,0.3)" }}>
        {current + 1} of {total}
      </span>
    </div>
  );
}

// ── Step 1: Open ──────────────────────────────────────────────────────────────
function StepOpen({ day }: { day: JourneyDay }) {
  return (
    <div className="h-full overflow-y-auto">
      {/* Spacer for overlaid header (nav row only — progress is now in footer) */}
      <div style={{ height: "calc(max(env(safe-area-inset-top, 0px), 48px) + 56px)" }} />

      {/* Hero image — full width, reliable 4:3 aspect ratio via padding trick */}
      {day.openImageUrl && (
        <div className="relative w-full" style={{ paddingBottom: "75%" }}>
          <img
            src={day.openImageUrl}
            alt={day.dayTitle}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      )}

      {/* Dark box — Day number, title, openText */}
      <div className="px-6 pt-6 pb-4">
        <div className="p-6" style={{ background: C.darkBox, border: `1px solid rgba(253,246,232,0.05)` }}>
          <p className="text-xs tracking-widest uppercase mb-3" style={{ color: C.creamFaint }}>
            Day {day.dayNumber}
          </p>
          <h2
            className="font-serif-elegant mb-4"
            style={{ color: C.cream, fontSize: "clamp(1.4rem, 5vw, 1.9rem)", fontStyle: "italic", lineHeight: "1.1" }}
          >
            {day.dayTitle}
          </h2>
          {day.openText ? (
            <p
              className="italic leading-relaxed"
              style={{ color: C.creamDim, fontFamily: "var(--font-cormorant)", fontSize: "1.05rem", lineHeight: "1.65" }}
            >
              {day.openText}
            </p>
          ) : (
            <p
              className="italic leading-relaxed"
              style={{ color: C.creamDim, fontFamily: "var(--font-cormorant)", fontSize: "1.05rem", lineHeight: "1.65" }}
            >
              Sit with this image. Let your eyes explore without reaching for meaning. What do you notice first?
            </p>
          )}
        </div>
      </div>

      {/* Footer spacer */}
      <div className="h-28" />
    </div>
  );
}

// ── Step 2: Encounter ─────────────────────────────────────────────────────────
function StepEncounter({ day }: { day: JourneyDay }) {
  const content = day.encounterContent;
  if (!content) {
    return (
      <div className="flex items-center justify-center h-full px-6">
        <p className="text-sm" style={{ color: C.creamFaint }}>No encounter content available.</p>
      </div>
    );
  }

  // Clean text label — no emojis
  const typeLabel = content.contentType
    .split("-")
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const showPrayLink =
    content.contentType === "sacred-art" || content.contentType === "landscape";
  const showListenLink =
    content.contentType === "music" && content.musicUrl;
  const showWatchLink =
    content.contentType === "watch-listen" && content.mediaUrl;

  return (
    <div className="h-full overflow-y-auto">
      {/* Spacer for overlaid header */}
      <div style={{ height: "calc(max(env(safe-area-inset-top, 0px), 48px) + 56px)" }} />

      {/* Content image — pinch to zoom (8x) */}
      {content.imageUrl && (
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/10" }}>
          <TransformWrapper maxScale={8} minScale={1} centerOnInit>
            <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
              <img
                src={content.imageUrl}
                alt={content.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </TransformComponent>
          </TransformWrapper>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `linear-gradient(to bottom, transparent 60%, ${C.bg})` }}
          />
        </div>
      )}

      <div className="px-6 py-6 space-y-6">
        {/* Type label — no emoji */}
        <p className="text-xs tracking-widest uppercase" style={{ color: C.sageMuted, letterSpacing: "0.2em" }}>
          {typeLabel}
        </p>

        <div>
          <h2 className="font-serif-elegant text-2xl mb-2" style={{ color: C.cream }}>
            {content.title}
          </h2>
          {(content.artist || content.author || content.composer || content.thinkerName) && (
            <p className="text-sm" style={{ color: C.creamDim }}>
              {content.artist || content.author || content.composer || content.thinkerName}
              {content.year && `, ${content.year}`}
            </p>
          )}
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed" style={{ color: C.cream }}>
          {content.description}
        </p>

        {/* Context */}
        {content.context && (
          <div className="pl-4" style={{ borderLeft: `1px solid ${C.divider}` }}>
            <p className="text-xs tracking-widest uppercase mb-2" style={{ color: C.creamFaint }}>Context</p>
            <p className="text-sm leading-relaxed" style={{ color: C.creamDim }}>{content.context}</p>
          </div>
        )}

        {/* Quote / scripture / excerpt */}
        {content.quote?.text && (
          <div className="p-6" style={{ background: C.darkBox, border: `1px solid rgba(253,246,232,0.05)` }}>
            <p className="font-serif-elegant italic text-lg leading-relaxed mb-3" style={{ color: C.cream }}>
              &ldquo;{content.quote.text}&rdquo;
            </p>
            {content.quote.attribution && (
              <p className="text-xs tracking-widest uppercase" style={{ color: C.creamFaint }}>— {content.quote.attribution}</p>
            )}
          </div>
        )}

        {content.scripturePairing?.verse && (
          <div className="p-6" style={{ background: C.darkBox, border: `1px solid rgba(253,246,232,0.05)` }}>
            <p className="font-serif-elegant italic text-lg leading-relaxed mb-3" style={{ color: C.cream }}>
              {content.scripturePairing.verse}
            </p>
            <p className="text-xs tracking-widest uppercase" style={{ color: C.creamFaint }}>— {content.scripturePairing.reference}</p>
          </div>
        )}

        {content.excerpt && (
          <div className="p-6" style={{ background: C.darkBox, border: `1px solid rgba(253,246,232,0.05)` }}>
            <p className="font-serif-elegant italic text-base leading-relaxed" style={{ color: C.cream }}>
              {content.excerpt}
            </p>
            {content.workTitle && (
              <p className="text-xs mt-3" style={{ color: C.creamFaint }}>from <em>{content.workTitle}</em></p>
            )}
          </div>
        )}

        {/* Encounter guidance */}
        {day.encounterGuidance && (
          <p className="text-xs italic pt-2" style={{ color: C.creamFaint, borderTop: `1px solid ${C.divider}` }}>
            {day.encounterGuidance}
          </p>
        )}

        {/* Pray / Listen / Watch — promoted CTA block */}
        {showPrayLink && (
          <div style={{ border: `1px solid ${C.divider}` }}>
            <Link
              href={`/pray/${content._id}`}
              className="flex items-center justify-between px-5 py-4 w-full"
            >
              <div>
                <p className="text-xs tracking-widest uppercase mb-1" style={{ color: C.creamFaint }}>
                  Visio Divina
                </p>
                <p className="text-sm" style={{ color: C.cream }}>Pray with this image →</p>
              </div>
            </Link>
          </div>
        )}

        {showListenLink && (
          <div style={{ border: `1px solid ${C.divider}` }}>
            <a
              href={content.musicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-5 py-4 w-full"
            >
              <p className="text-sm" style={{ color: C.cream }}>Listen →</p>
            </a>
          </div>
        )}

        {showWatchLink && (
          <div style={{ border: `1px solid ${C.divider}` }}>
            <a
              href={content.mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-5 py-4 w-full"
            >
              <p className="text-sm" style={{ color: C.cream }}>
                {content.mediaType === "podcast" ? "Listen" : "Watch"} →
              </p>
            </a>
          </div>
        )}
      </div>

      {/* Spacer for footer */}
      <div className="h-28" />
    </div>
  );
}

// ── Step 3: Reflect — blurred background + Ken Burns zoom ─────────────────────
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
  const current = Math.min(questionIndex, total - 1);
  const isLast = current >= total - 1;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-full px-6">
        <p className="text-sm" style={{ color: C.creamFaint }}>No reflection questions for this day.</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col items-center justify-center px-8">
      {/* Blurred background = encounter image (the painting just seen in Step 2) */}
      {(day.encounterContent?.imageUrl ?? day.openImageUrl) && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${day.encounterContent?.imageUrl ?? day.openImageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(10px) brightness(0.5)",
            animation: "kenBurns 8s ease-in-out infinite alternate",
          }}
        />
      )}
      {/* Dark scrim for readability */}
      <div className="absolute inset-0" style={{ background: "rgba(22,17,13,0.45)" }} />

      {/* Content */}
      <div className="relative z-10 text-center max-w-md w-full">
        {total > 1 && (
          <p className="text-xs tracking-widest uppercase mb-8" style={{ color: C.creamFaint }}>
            Question {current + 1} of {total}
          </p>
        )}
        <p
          className="font-serif-elegant italic leading-relaxed"
          style={{ color: C.cream, fontSize: "clamp(1.4rem, 5vw, 1.8rem)", lineHeight: "1.4" }}
        >
          {questions[current]}
        </p>
        {!isLast && (
          <button
            onClick={onNextQuestion}
            className="mt-10 text-sm tracking-wide"
            style={{ color: C.creamDim }}
          >
            Next question →
          </button>
        )}
      </div>
    </div>
  );
}

// ── Step 4: Connect — text above, sneak peek strip at bottom ──────────────────
function StepConnect({ day, nextDayImageUrl }: { day: JourneyDay; nextDayImageUrl?: string }) {
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>

      {/* Spacer for header */}
      <div style={{ height: "calc(max(env(safe-area-inset-top, 0px), 48px) + 56px)", flexShrink: 0 }} />

      {/* Text — centered in the dark upper portion */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <p className="text-xs tracking-widest uppercase mb-6" style={{ color: C.sageMuted, letterSpacing: "0.2em" }}>
          Tomorrow
        </p>
        {day.connectThread ? (
          <p
            className="font-serif-elegant italic text-center"
            style={{ color: C.cream, fontSize: "clamp(1.2rem, 4.5vw, 1.6rem)", lineHeight: "1.45", maxWidth: "320px" }}
          >
            {day.connectThread}
          </p>
        ) : (
          <p className="text-sm text-center" style={{ color: C.creamFaint }}>
            You&apos;ve completed today&apos;s journey.
          </p>
        )}
      </div>

      {/* Sneak peek strip — partial image at bottom edge */}
      {nextDayImageUrl ? (
        <div
          className="flex-shrink-0 relative overflow-hidden"
          style={{
            height: "32vh",
            marginBottom: "calc(max(env(safe-area-inset-bottom, 0px), 24px) + 88px)",
          }}
        >
          {/* Gradient: fades from dark background into the image */}
          <div
            className="absolute inset-x-0 top-0 z-10"
            style={{ height: "55%", background: `linear-gradient(to bottom, ${C.bg}, transparent)` }}
          />
          {/* Next day image with slow drift */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${nextDayImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center top",
              filter: "brightness(0.7)",
              animation: "gentleDrift 16s ease-in-out infinite alternate",
            }}
          />
        </div>
      ) : (
        <div style={{ height: "calc(max(env(safe-area-inset-bottom, 0px), 24px) + 88px)", flexShrink: 0 }} />
      )}

    </div>
  );
}

// ── Step 5: Go Deeper ─────────────────────────────────────────────────────────
function StepGoDeeper({ day }: { day: JourneyDay }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const reflections = day.goDeeper ?? [];

  return (
    <div className="h-full overflow-y-auto">
      {/* Spacer for overlaid header */}
      <div style={{ height: "calc(max(env(safe-area-inset-top, 0px), 48px) + 56px)" }} />

      <div className="px-6 pt-4 pb-8">
        <p className="text-xs tracking-widest uppercase mb-2" style={{ color: C.sageMuted }}>Go Deeper</p>
        <h2 className="font-serif-elegant text-2xl mb-2" style={{ color: C.cream }}>
          Voices from the Tradition
        </h2>
        <p className="text-sm mb-8" style={{ color: C.creamFaint }}>
          Optional readings from thinkers, saints, and writers across the centuries.
        </p>

        {reflections.length === 0 ? (
          <div className="py-20 flex items-center justify-center">
            <p className="text-sm" style={{ color: C.creamFaint }}>No tradition reflections for this day.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reflections.map((r) => {
              const isOpen = expandedId === r._id;
              return (
                <div
                  key={r._id}
                  style={{ background: C.darkBox, border: `1px solid rgba(253,246,232,0.05)` }}
                >
                  <button
                    onClick={() => setExpandedId(isOpen ? null : r._id)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: C.cream }}>{r.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: C.creamDim }}>{r.source}</p>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={`w-4 h-4 flex-shrink-0 ml-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      style={{ color: C.creamFaint }}
                    >
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5">
                      {r.shortQuote && (
                        <p
                          className="font-serif-elegant italic text-sm pl-3 mb-4"
                          style={{ color: "rgba(255,255,255,0.8)", borderLeft: `2px solid ${C.gold}` }}
                        >
                          &ldquo;{r.shortQuote}&rdquo;
                        </p>
                      )}
                      <p className="text-sm leading-relaxed" style={{ color: C.creamDim }}>{r.summary}</p>
                      {r.era && <p className="text-xs mt-3" style={{ color: C.creamFaint }}>{r.era}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="h-28" />
    </div>
  );
}

// ── Main stepper ──────────────────────────────────────────────────────────────
export default function JourneyDaySteps({
  day,
  nextDay,
  onClose,
  onMarkComplete,
  isComplete,
}: {
  day: JourneyDay;
  nextDay?: JourneyDay;
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
    if (step > 0) { setStep((s) => s - 1); setQuestionIndex(0); }
  }, [step]);

  const handleNextQuestion = useCallback(() => setQuestionIndex((i) => i + 1), []);
  const isLastStep = step === totalSteps - 1;

  const nextDayImageUrl = nextDay?.openImageUrl;

  const stepComponents = [
    <StepOpen key="open" day={day} />,
    <StepEncounter key="encounter" day={day} />,
    <StepReflect key="reflect" day={day} questionIndex={questionIndex} onNextQuestion={handleNextQuestion} />,
    <StepConnect key="connect" day={day} nextDayImageUrl={nextDayImageUrl} />,
    <StepGoDeeper key="deeper" day={day} />,
  ];

  return (
    <>
      <div className="fixed inset-0 z-[60]" style={{ height: "100dvh", backgroundColor: C.bg }}>
        {/* Slide container */}
        <div className="absolute inset-0 overflow-hidden">
          {stepComponents.map((component, index) => (
            <div
              key={index}
              className="absolute inset-0"
              style={{
                transform: `translateX(${(index - step) * 100}%)`,
                transition: "transform 500ms cubic-bezier(0.4, 0, 0.2, 1)",
                willChange: "transform",
                overflow: "hidden",
              }}
            >
              {component}
            </div>
          ))}
        </div>

        {/* Overlaid header */}
        <div className="absolute inset-x-0 top-0 z-10 pointer-events-none">
          <div
            className="pointer-events-auto flex items-center justify-between px-5 pb-2"
            style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 48px)" }}
          >
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

        </div>

        {/* Overlaid footer — progress squares + action button */}
        <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none">
          <div
            className="pointer-events-auto px-5 pt-3"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 24px)" }}
          >
            {/* Progress squares — bottom, above button */}
            <div className="flex justify-center mb-4">
              <StepIndicator current={step} total={totalSteps} />
            </div>

            {isLastStep ? (
              <button
                onClick={() => { if (!isComplete) onMarkComplete(); onClose(); }}
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
                style={{ color: C.cream, borderTop: `1px solid rgba(253,246,232,0.2)` }}
              >
                Continue →
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
