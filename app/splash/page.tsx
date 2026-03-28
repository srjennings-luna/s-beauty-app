"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const TOTAL = 5;

export default function SplashPage() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const next = () => setCurrent((c) => Math.min(c + 1, TOTAL - 1));
  const prev = () => setCurrent((c) => Math.max(c - 1, 0));

  // Mark session so Today tab doesn't re-trigger mid-session
  const markSession = () => sessionStorage.setItem("kallos-session", "true");

  const skipToToday = () => {
    markSession();
    router.push("/prompt");
  };

  const startJourney = () => {
    markSession();
    // Routes to 3-day Beauty, Truth & Goodness intro journey.
    // Slug confirmed: beauty-truth-and-goodness. Publish the journey in Sanity to activate.
    router.push("/journeys/beauty-truth-and-goodness");
  };

  const seeToday = () => {
    markSession();
    router.push("/prompt");
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 50) next();
    else if (diff < -50) prev();
    setTouchStartX(null);
  };

  // Shared animation class helper
  const anim = (screen: number, delay = 0) =>
    `transition-all duration-700 ${delay ? `delay-${delay}` : ""} ${
      current === screen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    }`;

  const E = "#16110d"; // espresso
  const G = "#C19B5F"; // gold
  const CREAM = "rgba(253,246,232,0.9)";
  const CREAM_DIM = "rgba(253,246,232,0.52)";

  const montserrat = "Montserrat, sans-serif";
  const cormorant = "Cormorant Garamond, Georgia, serif";
  const openSans = "Open Sans, sans-serif";

  const GoldRule = ({ mt = 48, mb = 48 }: { mt?: number; mb?: number }) => (
    <div style={{ height: "1px", width: "48px", backgroundColor: G, marginTop: mt, marginBottom: mb }} />
  );

  // Inline nav button — defined outside render cycle so click handlers survive re-renders
  const navBtn = (animClass: string, onTap: () => void) => (
    <div className={`flex justify-end ${animClass}`}>
      <button
        onClick={onTap}
        aria-label="Next screen"
        style={{ position: "relative", width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <div className="kallos-nav-ring" style={{ position: "absolute", inset: -8, borderRadius: "50%", border: "1px solid rgba(193,155,95,0.45)", pointerEvents: "none" }} />
        <div style={{ width: 56, height: 56, borderRadius: "50%", border: "1px solid rgba(193,155,95,0.55)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(193,155,95,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </button>
    </div>
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

      {/* ── Progress bar ── */}
      <div
        className="absolute left-0 right-0 z-50 flex gap-0.5"
        style={{ top: "env(safe-area-inset-top, 0px)", padding: "10px 16px 0" }}
      >
        {Array.from({ length: TOTAL }).map((_, i) => (
          <div
            key={i}
            className="flex-1 transition-colors duration-300"
            style={{
              height: "2px",
              backgroundColor: i <= current ? "rgba(193,155,95,0.9)" : "rgba(255,255,255,0.18)",
            }}
          />
        ))}
      </div>

      {/* ── Skip ── */}
      <button
        onClick={skipToToday}
        className="absolute z-50 transition-colors duration-200 hover:opacity-70"
        style={{
          top: "calc(env(safe-area-inset-top, 0px) + 18px)",
          right: "20px",
          fontFamily: montserrat,
          fontSize: "0.65rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.32)",
        }}
      >
        Skip
      </button>

      {/* ── Slide container ── */}
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >

        {/* ════════════════════════════════ SCREEN 1 — Brand Identity ════════════════════════════════ */}
        <div
          className="min-w-full h-full flex flex-col px-10"
          style={{ backgroundColor: E, paddingTop: "calc(env(safe-area-inset-top, 0px) + 110px)", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)" }}
        >
          <div>
            <div className={anim(0)}>
              <p style={{ fontFamily: montserrat, fontSize: "1.75rem", letterSpacing: "0.3em", textTransform: "uppercase", color: CREAM, fontWeight: 600 }}>
                KALLOS
              </p>
              <p style={{ fontFamily: cormorant, fontSize: "1.25rem", fontStyle: "italic", color: "rgba(253,246,232,0.5)", letterSpacing: "0.06em", marginTop: "6px" }}>
                kal · os
              </p>
            </div>

            <GoldRule />

            <p className={anim(0, 100)} style={{ fontFamily: cormorant, fontSize: "2.125rem", fontStyle: "italic", fontWeight: 400, color: CREAM, lineHeight: 1.2, marginBottom: "40px" }}>
              &ldquo;Beauty will save the world.&rdquo;
            </p>

            <p className={anim(0, 200)} style={{ fontFamily: openSans, fontSize: "0.9375rem", color: CREAM_DIM, lineHeight: 1.8, fontWeight: 300 }}>
              Rediscover beauty, truth and goodness through tradition. The Greeks called it KALLOS, and they believed the three were inseparable.
            </p>

            <p className={anim(0, 300)} style={{ fontFamily: montserrat, fontSize: "0.875rem", color: G, letterSpacing: "0.02em", marginTop: "48px" }}>
              Your daily dose of what is beautiful. true. good.
            </p>
          </div>

          <div className="flex-1" />

          {navBtn(anim(0, 400), next)}
        </div>

        {/* ════════════════════════════════ SCREEN 2 — The Three ════════════════════════════════ */}
        <div
          className="min-w-full h-full flex flex-col px-10"
          style={{ backgroundColor: E, paddingTop: "calc(env(safe-area-inset-top, 0px) + 110px)", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)" }}
        >
          <div className={`w-full transition-all duration-700 ${current === 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <p style={{ fontFamily: cormorant, fontSize: "2.125rem", fontStyle: "italic", fontWeight: 400, color: CREAM, lineHeight: 1.25 }}>
              Beauty. Truth. Goodness.
            </p>

            <div style={{ height: "1px", width: "48px", backgroundColor: G, margin: "48px 0" }} />

            <p className={anim(1, 150)} style={{ fontFamily: openSans, fontSize: "0.9375rem", color: CREAM_DIM, lineHeight: 1.8, fontWeight: 300 }}>
              Ancient philosophers called them the transcendentals: beauty, truth, goodness. Three things woven together that finding one means brushing against the divine.
            </p>

            <p className={anim(1, 250)} style={{ fontFamily: openSans, fontSize: "0.9375rem", color: CREAM_DIM, lineHeight: 1.8, fontWeight: 300, marginTop: "32px" }}>
              The tradition that produced the greatest art in the Western world kept all three in the same room.
            </p>

            <p className={anim(1, 350)} style={{ fontFamily: montserrat, fontSize: "0.875rem", color: G, letterSpacing: "0.02em", marginTop: "48px" }}>
              KALLOS is built on that.
            </p>
          </div>

          <div className="flex-1" />

          {navBtn(anim(1, 400), next)}
        </div>

        {/* ════════════════════════════════ SCREEN 3 — Feature Tour ════════════════════════════════ */}
        <div
          className="min-w-full h-full flex flex-col px-6"
          style={{ backgroundColor: E, paddingTop: "calc(env(safe-area-inset-top, 0px) + 110px)", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)" }}
        >
          <p
            className={anim(2)}
            style={{ fontFamily: cormorant, fontSize: "1.5rem", fontStyle: "italic", fontWeight: 400, color: CREAM, marginBottom: "28px" }}
          >
            Two ways to explore.
          </p>

          <div
            className={`mb-4 ${anim(2, 100)}`}
            style={{ border: `1px solid rgba(193,155,95,0.25)`, padding: "22px 20px" }}
          >
            <p style={{ fontFamily: montserrat, fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase", color: G, marginBottom: "10px" }}>
              Pause &amp; Ponder
            </p>
            <p style={{ fontFamily: cormorant, fontSize: "1.15rem", fontStyle: "italic", color: CREAM, lineHeight: 1.5 }}>
              Every day, a piece of art and a question to sit with.
            </p>
          </div>

          <div
            className={anim(2, 200)}
            style={{ border: `1px solid rgba(193,155,95,0.25)`, padding: "22px 20px" }}
          >
            <p style={{ fontFamily: montserrat, fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase", color: G, marginBottom: "10px" }}>
              Journeys
            </p>
            <p style={{ fontFamily: cormorant, fontSize: "1.15rem", fontStyle: "italic", color: CREAM, lineHeight: 1.5 }}>
              Or go deeper. A theme, an artist, a question. One day at a time.
            </p>
          </div>

          <div className="flex-1" />

          {navBtn(anim(2, 300), next)}
        </div>

        {/* ════════════════════════════════ SCREEN 4 — Hook ════════════════════════════════ */}
        <div
          className="min-w-full h-full flex flex-col px-10"
          style={{ backgroundColor: E, paddingTop: "calc(env(safe-area-inset-top, 0px) + 110px)", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)" }}
        >
          <div className={`w-full transition-all duration-700 ${current === 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <p style={{ fontFamily: cormorant, fontSize: "2.125rem", fontStyle: "italic", fontWeight: 400, color: CREAM, lineHeight: 1.25 }}>
              You already know this feeling.
            </p>

            <div style={{ height: "1px", width: "48px", backgroundColor: G, margin: "48px 0" }} />

            <p className={anim(3, 150)} style={{ fontFamily: openSans, fontSize: "0.9375rem", color: CREAM_DIM, lineHeight: 1.8, fontWeight: 300 }}>
              The painting you can&apos;t look away from. The piece of music that opens something in you. The line from a book you&apos;ve carried for years.
            </p>

            <p className={anim(3, 250)} style={{ fontFamily: openSans, fontSize: "0.9375rem", color: CREAM_DIM, lineHeight: 1.8, fontWeight: 300, marginTop: "32px" }}>
              KALLOS is built for exactly that.
            </p>
          </div>

          <div className="flex-1" />

          {navBtn(anim(3, 350), next)}
        </div>

        {/* ════════════════════════════════ SCREEN 5 — Invitation ════════════════════════════════ */}
        <div
          className="min-w-full h-full flex flex-col px-8"
          style={{ backgroundColor: E, paddingTop: "calc(env(safe-area-inset-top, 0px) + 110px)", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)" }}
        >
          <div className={`w-full transition-all duration-700 ${current === 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div style={{ height: "1px", width: "48px", backgroundColor: G, marginBottom: "48px" }} />

            <p style={{ fontFamily: cormorant, fontSize: "2.125rem", fontStyle: "italic", fontWeight: 400, color: CREAM, lineHeight: 1.25, marginBottom: "32px" }}>
              Start where you are.
            </p>

            <p className={anim(4, 100)} style={{ fontFamily: openSans, fontSize: "0.9375rem", color: CREAM_DIM, lineHeight: 1.8, fontWeight: 300 }}>
              No preparation needed. No right way to begin. Start a 3-day journey into beauty, truth and goodness. Something new every day.
            </p>
          </div>

          <div className="flex-1" />

          <div className={anim(4, 200)}>
            <button
              onClick={startJourney}
              className="w-full active:scale-95 transition-all duration-200"
              style={{
                backgroundColor: G,
                color: E,
                fontFamily: montserrat,
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "18px 24px",
                marginBottom: "12px",
              }}
            >
              Start here →
            </button>

            <button
              onClick={seeToday}
              className="w-full py-3"
              style={{
                fontFamily: montserrat,
                fontSize: "0.65rem",
                color: "rgba(193,155,95,0.45)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              See today&apos;s Pause &amp; Ponder →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
