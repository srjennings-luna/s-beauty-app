"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import type { JourneyDay } from "@/lib/types";

const STEP_LABELS = ["Open", "Encounter", "Breathe", "Reflect", "Go Deeper", "Connect"];

// ── Breathe overlay — continuous breathing pulse ─────────────────────────────
// Loops infinitely while the Breathe page is visible. pointer-events: none
// so it never interferes with pinch-to-zoom on the image beneath.
function BreatheOverlay() {
  return (
    <>
      <style>{`
        @keyframes kallosBreathe {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50%       { transform: scale(4); opacity: 0.8; }
        }
        .kallos-breathe-dot {
          animation: kallosBreathe 8s ease-in-out infinite;
        }
      `}</style>
      <div
        className="absolute inset-0 flex items-end justify-center pointer-events-none"
        style={{ paddingBottom: "28px", zIndex: 10 }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            border: "1px solid rgba(253,246,232,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="kallos-breathe-dot"
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "rgba(253,246,232,0.9)",
            }}
          />
        </div>
      </div>
    </>
  );
}

// ── Text truncation — snap to last sentence boundary before maxChars ──────────
function truncateToSentences(text: string, maxChars = 220): string {
  if (!text || text.length <= maxChars) return text;
  const slice = text.slice(0, maxChars);
  const lastEnd = Math.max(
    slice.lastIndexOf(". "),
    slice.lastIndexOf("! "),
    slice.lastIndexOf("? ")
  );
  return lastEnd > 60 ? text.slice(0, lastEnd + 1) : slice.trimEnd() + "…";
}

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

// ── Stories-style progress bar — thin segments at top ─────────────────────────
function StoriesProgressBar({ current, total }: { current: number; total: number }) {
  return (
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
      {Array.from({ length: total }, (_, i) => (
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
              background: i <= current ? "rgba(253,246,232,0.55)" : "transparent",
              transition: "background 0.4s ease",
            }}
          />
        </div>
      ))}
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
              style={{ color: C.creamDim, fontSize: "0.95rem", lineHeight: "1.75" }}
            >
              {day.openText}
            </p>
          ) : (
            <p
              className="italic leading-relaxed"
              style={{ color: C.creamDim, fontSize: "0.95rem", lineHeight: "1.75" }}
            >
              Sit with this image. Let your eyes explore without reaching for meaning. What do you notice first?
            </p>
          )}
        </div>
      </div>

      {/* Footer spacer */}
      <div className="h-12" />
    </div>
  );
}

// ── Circular audio player — shared between content-level and day-level audio ──
function CircularAudioPlayer({
  audioSrc,
  title,
  subtitle,
  externalUrl,
}: {
  audioSrc?: string;
  title?: string;
  subtitle?: string;
  externalUrl?: string;
}) {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stop audio and clean up when the component unmounts (journey closes)
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  if (!audioSrc && !externalUrl) return null;

  if (!audioSrc && externalUrl) {
    // External link only — no in-app playback
    return (
      <div style={{ border: `1px solid ${C.divider}` }}>
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-5 py-4 w-full"
        >
          <div className="flex-1 min-w-0 mr-3">
            {title && (
              <p className="italic truncate" style={{ color: C.cream, fontSize: "0.95rem" }}>
                {title}
              </p>
            )}
            {subtitle && (
              <p className="text-xs mt-0.5 truncate" style={{ color: C.creamFaint }}>{subtitle}</p>
            )}
          </div>
          <p className="text-sm flex-shrink-0" style={{ color: C.sageMuted }}>Listen →</p>
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-5">
      <button
        onClick={() => {
          if (audioPlaying) {
            audioRef.current?.pause();
            setAudioPlaying(false);
          } else {
            if (!audioRef.current) {
              const audio = new Audio(audioSrc!);
              audio.volume = 0.85;
              // Sync UI state when audio ends or is paused externally (e.g. iOS interruption)
              audio.addEventListener("ended", () => setAudioPlaying(false));
              audio.addEventListener("pause", () => setAudioPlaying(false));
              audio.addEventListener("play", () => setAudioPlaying(true));
              audioRef.current = audio;
            }
            audioRef.current.play().catch(() => {});
            setAudioPlaying(true);
          }
        }}
        className="flex-shrink-0 flex items-center justify-center shadow-2xl"
        style={{ width: 64, height: 64, borderRadius: "50%", background: C.cream, color: C.bg }}
        aria-label={audioPlaying ? "Pause" : "Play"}
      >
        {audioPlaying ? (
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
        {title && (
          <p className="italic truncate" style={{ color: C.cream, fontSize: "0.95rem" }}>
            {title}
          </p>
        )}
        {subtitle && (
          <p className="text-sm mt-1 truncate" style={{ color: C.creamFaint }}>
            {subtitle}
          </p>
        )}
        {externalUrl && (
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs mt-1 inline-block"
            style={{ color: C.sageMuted }}
          >
            Also on YouTube / Spotify →
          </a>
        )}
      </div>
    </div>
  );
}

// ── Step 2: Encounter ─────────────────────────────────────────────────────────
function StepEncounter({ day }: { day: JourneyDay }) {
  const content = day.encounterContent;
  const [ctxExpanded, setCtxExpanded] = useState(false);
  const [noteExpanded, setNoteExpanded] = useState(false);

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

  // Visio Divina ("Pray with this image") is intentionally excluded from Journey steps.
  // It is only accessible via Explore and Library entry points.

  // Audio priority: journey day auditio > content-level music audio
  const journeyAuditioSrc = day.auditio?.audioFileUrl || day.auditio?.audioUrl;
  const contentAudioSrc =
    content.contentType === "music"
      ? (content.audioFileUrl || content.audioUrl)
      : undefined;
  const inAppAudioSrc = journeyAuditioSrc || contentAudioSrc;

  // For the player display: prefer journey auditio metadata; fall back to content metadata
  const audioTitle = day.auditio?.title || (content.contentType === "music" ? content.title : undefined);
  const audioSubtitle = day.auditio?.composer || content.composer || content.artist || undefined;
  const audioExternalUrl =
    day.auditio?.externalUrl ||
    (content.contentType === "music" ? (content.externalMusicUrl || content.musicUrl) : undefined);

  // Watch/Listen for watch-listen content type (content level only)
  const showWatchLink = content.contentType === "watch-listen" && content.mediaUrl;

  const ctxTruncated = truncateToSentences(content.context ?? "");
  const ctxNeedsExpand = (content.context?.length ?? 0) > ctxTruncated.length;

  const noteTruncated = truncateToSentences(day.encounterNote ?? "", 200);
  const noteNeedsExpand = (day.encounterNote?.length ?? 0) > noteTruncated.length;

  return (
    <div className="h-full overflow-y-auto">
      {/* Spacer for overlaid header */}
      <div style={{ height: "calc(max(env(safe-area-inset-top, 0px), 48px) + 56px)" }} />

      {/* Content image — no zoom (zoom lives on the Breathe page) */}
      {content.imageUrl && (
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/10" }}>
          <img
            src={content.imageUrl}
            alt={content.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
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

        {/* Curator Note — the hook. First thing the user reads. */}
        {content.curatorNote && (
          <p className="text-sm leading-relaxed" style={{ color: C.cream, lineHeight: "1.75" }}>
            {content.curatorNote}
          </p>
        )}

        {/* Description — brief card text, shown only if no curator note, or as fallback */}
        {!content.curatorNote && (
          <p className="text-sm leading-relaxed" style={{ color: C.cream }}>
            {content.description}
          </p>
        )}

        {/* Context — collapsed by default, expandable */}
        {content.context && (
          <div className="pl-4" style={{ borderLeft: `1px solid ${C.divider}` }}>
            <button
              onClick={() => setCtxExpanded(!ctxExpanded)}
              className="flex items-center gap-2 w-full text-left mb-2"
            >
              <p className="text-xs tracking-widest uppercase" style={{ color: C.creamFaint }}>Context</p>
              <span className="text-xs" style={{ color: C.creamFaint, transition: "transform 0.2s", display: "inline-block", transform: ctxExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
            </button>
            {ctxExpanded && (
              <p className="text-sm leading-relaxed" style={{ color: C.creamDim }}>{content.context}</p>
            )}
            {!ctxExpanded && (
              <p className="text-sm leading-relaxed" style={{ color: C.creamDim }}>{ctxTruncated}</p>
            )}
            {ctxNeedsExpand && !ctxExpanded && (
              <button
                onClick={() => setCtxExpanded(true)}
                className="mt-1 text-xs tracking-widest uppercase"
                style={{ color: C.sageMuted }}
              >
                Read more ↓
              </button>
            )}
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

        {/* Encounter Note — interpretive layer (iconography, listening guide, etc.) */}
        {day.encounterNote && (
          <div className="pl-4" style={{ borderLeft: `1px solid ${C.divider}` }}>
            <button
              onClick={() => setNoteExpanded(!noteExpanded)}
              className="flex items-center gap-2 w-full text-left mb-2"
            >
              <p className="text-xs tracking-widest uppercase" style={{ color: C.creamFaint }}>Look Closer</p>
              <span className="text-xs" style={{ color: C.creamFaint, transition: "transform 0.2s", display: "inline-block", transform: noteExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
            </button>
            {noteExpanded && (
              <p className="text-sm leading-relaxed" style={{ color: C.creamDim }}>{day.encounterNote}</p>
            )}
            {!noteExpanded && (
              <p className="text-sm leading-relaxed" style={{ color: C.creamDim }}>{noteTruncated}</p>
            )}
            {noteNeedsExpand && !noteExpanded && (
              <button
                onClick={() => setNoteExpanded(true)}
                className="mt-1 text-xs tracking-widest uppercase"
                style={{ color: C.sageMuted }}
              >
                Read more ↓
              </button>
            )}
          </div>
        )}

        {/* Auditio — circular player or external link */}
        {(inAppAudioSrc || audioExternalUrl) && (
          <CircularAudioPlayer
            audioSrc={inAppAudioSrc}
            title={audioTitle}
            subtitle={audioSubtitle}
            externalUrl={inAppAudioSrc ? audioExternalUrl : undefined}
          />
        )}

        {/* Watch/Listen — for watch-listen content type */}
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

        {/* Lectio — philosophy + scripture pairing */}
        {(day.lectio?.philosophyQuote || day.lectio?.scriptureVerse) && (
          <div style={{ borderTop: `1px solid ${C.divider}`, paddingTop: "24px" }}>
            <p className="text-xs tracking-widest uppercase mb-5" style={{ color: C.sageMuted, letterSpacing: "0.2em" }}>
              Lectio
            </p>

            {day.lectio?.philosophyQuote && (
              <div className="mb-4" style={{ borderLeft: `2px solid ${C.sageMuted}`, paddingLeft: "16px" }}>
                <p
                  className="italic"
                  style={{
                    color: C.cream,
                    fontFamily: "var(--font-cormorant)",
                    fontSize: "clamp(1.3rem, 4.5vw, 1.55rem)",
                    lineHeight: "1.4",
                  }}
                >
                  &ldquo;{day.lectio.philosophyQuote}&rdquo;
                </p>
                {day.lectio?.philosophySource && (
                  <p className="text-xs mt-2 tracking-wide" style={{ color: C.creamFaint }}>
                    {day.lectio.philosophySource}
                  </p>
                )}
              </div>
            )}

            {day.lectio?.scriptureVerse && (
              <div style={{ borderLeft: `2px solid ${C.gold}`, paddingLeft: "16px" }}>
                <p
                  className="italic"
                  style={{
                    color: C.cream,
                    fontFamily: "var(--font-cormorant)",
                    fontSize: "clamp(1.3rem, 4.5vw, 1.55rem)",
                    lineHeight: "1.4",
                  }}
                >
                  {day.lectio.scriptureVerse}
                </p>
                {day.lectio?.scriptureReference && (
                  <p className="text-xs mt-2 tracking-wide" style={{ color: C.creamFaint }}>
                    {day.lectio.scriptureReference}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Spacer for footer */}
      <div className="h-12" />
    </div>
  );
}

// ── Step 2b: Breathe — full-bleed image + contemplative pause ────────────────
function StepBreathe({ day }: { day: JourneyDay }) {
  const content = day.encounterContent;
  const imageUrl = content?.imageUrl;

  return (
    <div className="h-full overflow-hidden" style={{ backgroundColor: C.bg }}>
      {/* Full-screen image with 8x zoom */}
      {imageUrl && (
        <div className="absolute inset-0">
          <TransformWrapper maxScale={8} minScale={1} centerOnInit>
            <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
              <img
                src={imageUrl}
                alt={content?.title ?? "Artwork"}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </TransformComponent>
          </TransformWrapper>

          {/* Gradient overlay — heavier at bottom for text legibility */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, rgba(22,17,13,0.1) 0%, rgba(22,17,13,0.3) 50%, rgba(22,17,13,0.75) 80%, ${C.bg} 100%)`,
            }}
          />

          {/* Breathe animation — centered in lower third */}
          <BreatheOverlay />

          {/* Helper text — anchored at bottom */}
          <div
            className="absolute inset-x-0 bottom-0 pointer-events-none flex flex-col items-center"
            style={{ paddingBottom: "calc(max(env(safe-area-inset-bottom, 0px), 24px) + 72px)", gap: "10px" }}
          >
            <p
              className="italic text-center px-10 leading-relaxed"
              style={{
                color: "rgba(253,246,232,0.55)",
                fontSize: "0.875rem",
                letterSpacing: "0.02em",
              }}
            >
              Sit with this image and let your eyes explore
            </p>
            {day.encounterGuidance && (
              <p
                className="text-center px-10 leading-relaxed"
                style={{
                  color: "rgba(253,246,232,0.42)",
                  fontSize: "0.875rem",
                  fontStyle: "italic",
                  marginTop: "6px",
                }}
              >
                {day.encounterGuidance}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Fallback when no image */}
      {!imageUrl && (
        <div className="flex items-center justify-center h-full">
          <p className="text-sm" style={{ color: C.creamFaint }}>No image available for this day.</p>
        </div>
      )}
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
            filter: "blur(7px) brightness(0.5)",
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

// ── Step 4: Connect — text above, constrained image window below ──────────────
function StepConnect({ day, nextDayImageUrl, onClose, onMarkComplete }: { day: JourneyDay; nextDayImageUrl?: string; onClose: () => void; onMarkComplete: () => void }) {
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>

      {/* Spacer for header */}
      <div style={{ height: "calc(max(env(safe-area-inset-top, 0px), 48px) + 56px)", flexShrink: 0 }} />

      {/* Text — centered above the window */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Label: "TOMORROW" when there is a next day, nothing when last day */}
        {nextDayImageUrl && (
          <p className="text-xs tracking-widest uppercase mb-5" style={{ color: C.sageMuted, letterSpacing: "0.2em" }}>
            Tomorrow
          </p>
        )}
        {day.connectThread ? (
          <p
            className="font-serif-elegant italic text-center"
            style={{ color: C.cream, fontSize: "clamp(1.1rem, 4vw, 1.5rem)", lineHeight: "1.5", maxWidth: "300px" }}
          >
            {day.connectThread}
          </p>
        ) : nextDayImageUrl ? (
          // Has a next day but no thread text — neutral bridge
          <p className="text-sm text-center" style={{ color: C.creamFaint }}>
            Something new waits tomorrow.
          </p>
        ) : (
          // Last day of the journey — close or start a new journey
          <div className="flex flex-col items-center gap-5" style={{ maxWidth: "260px" }}>
            <p className="text-xs tracking-widest uppercase" style={{ color: C.sageMuted, letterSpacing: "0.2em" }}>
              Journey complete
            </p>
            <button
              onClick={() => { onMarkComplete(); window.location.href = "/journeys"; }}
              className="w-full text-center text-sm tracking-widest uppercase py-3 px-6"
              style={{
                background: C.gold,
                color: C.bg,
                fontWeight: 600,
                letterSpacing: "0.15em",
              }}
            >
              Start a new journey
            </button>
            <button
              onClick={onClose}
              className="text-sm tracking-wide"
              style={{ color: C.creamDim }}
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Image window — constrained frame, image drifts inside */}
      <div
        className="flex-shrink-0 flex flex-col items-center"
        style={{ paddingBottom: "calc(max(env(safe-area-inset-bottom, 0px), 24px) + 96px)", paddingTop: "16px" }}
      >
        {nextDayImageUrl ? (
          <>
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: C.creamFaint, letterSpacing: "0.18em" }}>
              A glimpse of what&apos;s next
            </p>
            {/* The frame — 2/3 screen width, panoramic ratio, hard clip edges */}
            <div
              style={{
                width: "66%",
                aspectRatio: "16 / 7",
                overflow: "hidden",
                position: "relative",
                border: `1px solid rgba(253,246,232,0.15)`,
              }}
            >
              {/* Image scaled up so no edge shows during drift — pans continuously */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url(${nextDayImageUrl})`,
                  backgroundSize: "160%",
                  backgroundPosition: "center",
                  filter: "brightness(0.72)",
                  animation: "windowDrift 18s ease-in-out infinite alternate",
                }}
              />
            </div>
          </>
        ) : (
          <div style={{ height: "8vh" }} />
        )}
      </div>

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

      <div className="h-12" />
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
  // Go Deeper only included if there is actual content to show
  const hasGoDeeper = (day.goDeeper ?? []).length > 0;
  const totalSteps = hasGoDeeper ? STEP_LABELS.length : STEP_LABELS.length - 1;

  const handleNext = useCallback(() => {
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
      if (step + 1 !== 3) setQuestionIndex(0); // Reflect is now step 3
    }
  }, [step, totalSteps]);

  const handlePrev = useCallback(() => {
    if (step > 0) { setStep((s) => s - 1); setQuestionIndex(0); }
  }, [step]);

  const handleNextQuestion = useCallback(() => setQuestionIndex((i) => i + 1), []);
  const isLastStep = step === totalSteps - 1;

  // Swipe detection
  // touch-action: pan-y on the container (see JSX below) tells the browser to handle
  // vertical scrolling natively and pass horizontal gestures to JS — prevents off-center artifacts.
  // Transitioning lock prevents double-swipe before slide animation completes.
  const touchRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const transitioningRef = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (transitioningRef.current) return;
    // Multi-touch (pinch/zoom) — cancel swipe detection entirely
    if (e.touches.length > 1) { touchRef.current = null; return; }
    const touch = e.touches[0];
    touchRef.current = { x: touch.clientX, y: touch.clientY, t: Date.now() };
  }, []);
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchRef.current || transitioningRef.current) return;
    // If a second finger appeared (pinch), cancel
    if (e.touches.length > 0) { touchRef.current = null; return; }
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchRef.current.x;
    const dy = touch.clientY - touchRef.current.y;
    const dt = Date.now() - touchRef.current.t;
    touchRef.current = null;
    // Stricter thresholds: >90px horizontal, clearly horizontal (not diagonal), within 350ms
    if (Math.abs(dx) > 90 && Math.abs(dy) < Math.abs(dx) * 0.4 && dt < 350) {
      transitioningRef.current = true;
      setTimeout(() => { transitioningRef.current = false; }, 520);
      if (dx < 0) {
        // Swipe left → next
        if (isLastStep) { if (!isComplete) onMarkComplete(); onClose(); }
        else handleNext();
      } else {
        // Swipe right → previous
        handlePrev();
      }
    }
  }, [handleNext, handlePrev, isLastStep, isComplete, onMarkComplete, onClose]);

  const nextDayImageUrl = nextDay?.openImageUrl;

  const stepComponents = [
    <StepOpen key="open" day={day} />,
    <StepEncounter key="encounter" day={day} />,
    <StepBreathe key="breathe" day={day} />,
    <StepReflect key="reflect" day={day} questionIndex={questionIndex} onNextQuestion={handleNextQuestion} />,
    ...(hasGoDeeper ? [<StepGoDeeper key="deeper" day={day} />] : []),
    <StepConnect key="connect" day={day} nextDayImageUrl={nextDayImageUrl} onMarkComplete={onMarkComplete} onClose={() => { if (!isComplete) onMarkComplete(); onClose(); }} />,
  ];

  return (
    <>
      <div className="fixed inset-0 z-[60]" style={{ height: "100dvh", backgroundColor: C.bg }}>
        {/* Slide container — swipe left/right to navigate */}
        {/* touch-action: pan-y tells the browser to handle vertical scroll natively
            and pass horizontal gestures to JS — prevents off-center artifacts on iOS */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ touchAction: "pan-y" }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
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

            {step > 0 && (
              <span className="text-xs tracking-widest uppercase" style={{ color: C.creamDim }}>
                {STEP_LABELS[step]}
              </span>
            )}
            {step === 0 && <span className="w-9" />}

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

        {/* Stories progress bar — thin segments at top */}
        <StoriesProgressBar current={step} total={totalSteps} />

        {/* Navigation: swipe left/right detected on the slide container above */}
      </div>
    </>
  );
}
