"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export type SplashBlock =
  | { _type: "wordmark"; _key: string; text: string }
  | { _type: "pronunciation"; _key: string; text: string }
  | { _type: "goldRule"; _key: string }
  | { _type: "quote"; _key: string; text: string }
  | { _type: "heading"; _key: string; text: string }
  | { _type: "body"; _key: string; text: string }
  | { _type: "tagline"; _key: string; text: string }
  | { _type: "featureCard"; _key: string; label: string; body: string }
  | { _type: "primaryCta"; _key: string; label: string; linkPath: string }
  | { _type: "secondaryCta"; _key: string; label: string; linkPath: string };

export type SplashScreen = {
  _id: string;
  screenNumber: number;
  screenTitle?: string;
  blocks: SplashBlock[];
};

// Brand constants stay in code — colors, fonts, and the design system are
// non-negotiable per CLAUDE.md. Sanity controls content and ordering only.
const E = "#16110d";
const G = "#C19B5F";
const CREAM = "rgba(253,246,232,0.9)";
const CREAM_DIM = "rgba(253,246,232,0.52)";
const montserrat = "Montserrat, sans-serif";
const cormorant = "Cormorant Garamond, Georgia, serif";
const openSans = "Open Sans, sans-serif";

const STAGGER_MS = [0, 100, 200, 300, 400, 400, 400, 400, 400];
const delayFor = (i: number) => STAGGER_MS[Math.min(i, STAGGER_MS.length - 1)];

const CTA_TYPES = new Set(["primaryCta", "secondaryCta"]);

export default function SplashClient({ screens }: { screens: SplashScreen[] }) {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const router = useRouter();

  const total = screens.length;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const next = () => setCurrent((c) => Math.min(c + 1, total - 1));
  const prev = () => setCurrent((c) => Math.max(c - 1, 0));

  const markSession = () => {
    try {
      localStorage.setItem("kallos-onboarded", "true");
    } catch {
      // Private mode / storage blocked — splash will show again next visit. Not fatal.
    }
  };

  const skipToToday = () => {
    markSession();
    router.push("/prompt");
  };

  const handleCta = (linkPath: string) => {
    markSession();
    router.push(linkPath);
  };

  const handleTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 50) next();
    else if (diff < -50) prev();
    setTouchStartX(null);
  };

  if (total === 0) return null;

  const animStyle = (screenIdx: number, blockIdx: number): React.CSSProperties => ({
    transitionProperty: "opacity, transform",
    transitionDuration: "700ms",
    transitionDelay: `${delayFor(blockIdx)}ms`,
    opacity: current === screenIdx ? 1 : 0,
    transform: current === screenIdx ? "translateY(0)" : "translateY(16px)",
  });

  // Auto nav button: shown when a screen has no CTAs. On non-last screens it
  // advances. On the last screen (when an editor forgot a CTA) it falls back
  // to marking onboarding complete and routing to P&P so users can never get
  // trapped in the splash.
  const autoNavHandler = (screenIdx: number) => () => {
    if (screenIdx === total - 1) {
      markSession();
      router.push("/prompt");
    } else {
      next();
    }
  };

  const renderNavButton = (style: React.CSSProperties, onTap: () => void) => (
    <div style={{ display: "flex", justifyContent: "flex-end", ...style }}>
      <button
        onClick={onTap}
        aria-label="Next screen"
        style={{
          position: "relative",
          width: 56,
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="kallos-nav-ring"
          style={{
            position: "absolute",
            inset: -8,
            borderRadius: "50%",
            border: "1px solid rgba(193,155,95,0.45)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "1px solid rgba(193,155,95,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(193,155,95,0.85)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </button>
    </div>
  );

  const renderBlock = (screenIdx: number, block: SplashBlock, blockIdx: number) => {
    const style = animStyle(screenIdx, blockIdx);

    switch (block._type) {
      case "wordmark":
        return (
          <p
            key={block._key}
            style={{
              fontFamily: montserrat,
              fontSize: "1.75rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: CREAM,
              fontWeight: 600,
              ...style,
            }}
          >
            {block.text}
          </p>
        );
      case "pronunciation":
        return (
          <p
            key={block._key}
            style={{
              fontFamily: cormorant,
              fontSize: "1.25rem",
              fontStyle: "italic",
              color: "rgba(253,246,232,0.5)",
              letterSpacing: "0.06em",
              marginTop: 6,
              ...style,
            }}
          >
            {block.text}
          </p>
        );
      case "goldRule":
        return (
          <div
            key={block._key}
            style={{ height: 1, width: 48, backgroundColor: G, marginTop: 48, marginBottom: 48, ...style }}
          />
        );
      case "quote":
        return (
          <p
            key={block._key}
            style={{
              fontFamily: cormorant,
              fontSize: "2.125rem",
              fontStyle: "italic",
              fontWeight: 400,
              color: CREAM,
              lineHeight: 1.2,
              marginBottom: 40,
              ...style,
            }}
          >
            &ldquo;{block.text}&rdquo;
          </p>
        );
      case "heading":
        return (
          <p
            key={block._key}
            style={{
              fontFamily: cormorant,
              fontSize: "2.125rem",
              fontStyle: "italic",
              fontWeight: 400,
              color: CREAM,
              lineHeight: 1.25,
              marginBottom: blockIdx === 0 ? 0 : 40,
              ...style,
            }}
          >
            {block.text}
          </p>
        );
      case "body":
        return (
          <p
            key={block._key}
            style={{
              fontFamily: openSans,
              fontSize: "0.9375rem",
              color: CREAM_DIM,
              lineHeight: 1.8,
              fontWeight: 300,
              marginTop: blockIdx === 0 ? 0 : 32,
              ...style,
            }}
          >
            {block.text}
          </p>
        );
      case "tagline":
        return (
          <p
            key={block._key}
            style={{
              fontFamily: montserrat,
              fontSize: "0.875rem",
              color: G,
              letterSpacing: "0.02em",
              marginTop: 48,
              ...style,
            }}
          >
            {block.text}
          </p>
        );
      case "featureCard":
        return (
          <div
            key={block._key}
            style={{
              border: `1px solid rgba(193,155,95,0.25)`,
              padding: "22px 20px",
              marginTop: blockIdx === 0 ? 0 : 16,
              ...style,
            }}
          >
            <p
              style={{
                fontFamily: montserrat,
                fontSize: "0.58rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: G,
                marginBottom: 10,
              }}
            >
              {block.label}
            </p>
            <p
              style={{
                fontFamily: openSans,
                fontSize: "0.9375rem",
                color: CREAM_DIM,
                lineHeight: 1.7,
                fontWeight: 300,
              }}
            >
              {block.body}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const renderPrimaryCta = (
    screenIdx: number,
    block: Extract<SplashBlock, { _type: "primaryCta" }>,
    blockIdx: number,
  ) => (
    <button
      key={block._key}
      onClick={() => handleCta(block.linkPath)}
      className="w-full active:scale-95"
      style={{
        backgroundColor: G,
        color: E,
        fontFamily: montserrat,
        fontSize: "0.75rem",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        padding: "18px 24px",
        marginBottom: 12,
        ...animStyle(screenIdx, blockIdx),
      }}
    >
      {block.label}
    </button>
  );

  const renderSecondaryCta = (
    screenIdx: number,
    block: Extract<SplashBlock, { _type: "secondaryCta" }>,
    blockIdx: number,
  ) => (
    <button
      key={block._key}
      onClick={() => handleCta(block.linkPath)}
      className="w-full py-3"
      style={{
        fontFamily: montserrat,
        fontSize: "0.65rem",
        color: "rgba(193,155,95,0.45)",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        ...animStyle(screenIdx, blockIdx),
      }}
    >
      {block.label}
    </button>
  );

  return (
    <div
      className={`fixed inset-0 overflow-hidden transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
      style={{ backgroundColor: E }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <style>{`
        @keyframes kallosNavBreathe {
          0%, 100% { transform: scale(1); opacity: 0.45; }
          50%       { transform: scale(1.55); opacity: 0; }
        }
        .kallos-nav-ring { animation: kallosNavBreathe 3.5s ease-in-out infinite; }
      `}</style>

      {/* Progress bar */}
      <div
        className="absolute left-0 right-0 z-50 flex gap-0.5"
        style={{ top: "env(safe-area-inset-top, 0px)", padding: "10px 16px 0" }}
      >
        {screens.map((s, i) => (
          <div
            key={s._id}
            className="flex-1 transition-colors duration-300"
            style={{
              height: 2,
              backgroundColor: i <= current ? "rgba(193,155,95,0.9)" : "rgba(255,255,255,0.18)",
            }}
          />
        ))}
      </div>

      {/* Skip */}
      <button
        onClick={skipToToday}
        className="absolute z-50 transition-colors duration-200 hover:opacity-70"
        style={{
          top: "calc(env(safe-area-inset-top, 0px) + 18px)",
          right: 20,
          fontFamily: montserrat,
          fontSize: "0.65rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.32)",
        }}
      >
        Skip
      </button>

      {/* Slide container */}
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {screens.map((screen, screenIdx) => {
          const contentBlocks: { block: SplashBlock; originalIdx: number }[] = [];
          const ctaBlocks: { block: SplashBlock; originalIdx: number }[] = [];
          screen.blocks.forEach((b, i) => {
            if (CTA_TYPES.has(b._type)) ctaBlocks.push({ block: b, originalIdx: i });
            else contentBlocks.push({ block: b, originalIdx: i });
          });

          // Horizontal padding: feature-card screens use a narrower gutter
          // (card has its own inner padding); CTA-heavy screens get px-8;
          // everything else uses px-10. Matches the original 5-screen layout.
          const hasCards = contentBlocks.some((c) => c.block._type === "featureCard");
          const hasCtas = ctaBlocks.length > 0;
          const padX = hasCards ? "px-6" : hasCtas ? "px-8" : "px-10";

          return (
            <div
              key={screen._id}
              className={`min-w-full h-full flex flex-col ${padX}`}
              style={{
                backgroundColor: E,
                paddingTop: "calc(env(safe-area-inset-top, 0px) + 110px)",
                paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)",
              }}
            >
              <div>
                {contentBlocks.map(({ block, originalIdx }) =>
                  renderBlock(screenIdx, block, originalIdx),
                )}
              </div>

              <div className="flex-1" />

              {hasCtas ? (
                <div>
                  {ctaBlocks.map(({ block, originalIdx }) => {
                    if (block._type === "primaryCta")
                      return renderPrimaryCta(screenIdx, block, originalIdx);
                    if (block._type === "secondaryCta")
                      return renderSecondaryCta(screenIdx, block, originalIdx);
                    return null;
                  })}
                </div>
              ) : (
                renderNavButton(
                  animStyle(screenIdx, contentBlocks.length),
                  autoNavHandler(screenIdx),
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
