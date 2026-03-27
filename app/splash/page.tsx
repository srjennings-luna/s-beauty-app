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

  const GoldRule = () => (
    <div style={{ height: "1px", width: "32px", backgroundColor: G, margin: "18px 0" }} />
  );

  return (
    <div
      className={`fixed inset-0 overflow-hidden transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
      style={{ backgroundColor: E }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
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
          style={{ backgroundColor: E, paddingTop: "calc(env(safe-area-inset-top, 0px) + 110px)", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 44px)" }}
        >
          <div>
            <div className={anim(0)}>
              <p style={{ fontFamily: montserrat, fontSize: "2rem", letterSpacing: "0.32em", textTransform: "uppercase", color: CREAM, fontWeight: 600 }}>
                KALLOS
              </p>
              <p style={{ fontFamily: cormorant, fontSize: "1.05rem", fontStyle: "italic", color: "rgba(253,246,232,0.55)", letterSpacing: "0.1em", marginTop: "6px" }}>
                kal · os
              </p>
            </div>

            <GoldRule />

            <p className={anim(0, 100)} style={{ fontFamily: cormorant, fontSize: "1.75rem", fontStyle: "italic", fontWeight: 400, color: CREAM, lineHeight: 1.4 }}>
              &ldquo;Beauty will save the world.&rdquo;
            </p>

            <p className={anim(0, 200)} style={{ fontFamily: openSans, fontSize: "0.875rem", color: CREAM_DIM, lineHeight: 1.8, marginTop: "20px" }}>
              Rediscover beauty, truth and goodness through tradition. The Greeks called it KALLOS, and they believed the three were inseparable.
            </p>

            <p className={anim(0, 300)} style={{ fontFamily: montserrat, fontSize: "0.72rem", color: G, letterSpacing: "0.06em", marginTop: "22px" }}>
              Your daily dose of what is beautiful. true. good.
            </p>
          </div>

          <div className="flex-1" />

          <button
            onClick={next}
            className={anim(0, 400)}
            style={{ fontFamily: montserrat, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(193,155,95,0.65)", textAlign: "right" }}
          >
            Keep going →
          </button>
        </div>

        {/* ════════════════════════════════ SCREEN 2 — The Three ════════════════════════════════ */}
        <div
          className="min-w-full h-full flex flex-col px-10"
          style={{ backgroundColor: E, paddingTop: "calc(env(safe-area-inset-top, 0px) + 110px)", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 44px)" }}
        >
          <div className={`w-full transition-all duration-700 ${current === 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <p style={{ fontFamily: cormorant, fontSize: "2rem", fontStyle: "italic", fontWeight: 400, color: CREAM, lineHeight: 1.3 }}>
              Beauty. Truth. Goodness.
            </p>

            <div style={{ height: "1px", width: "32px", backgroundColor: G, margin: "20px 0" }} />

            <p className={anim(1, 150)} style={{ fontFamily: openSans, fontSize: "0.875rem", color: CREAM_DIM, lineHeight: 1.8 }}>
              Ancient philosophers called them the transcendentals: beauty, truth, goodness. Three things woven together that finding one means brushing against the divine.
            </p>

            <p className={anim(1, 250)} style={{ fontFamily: openSans, fontSize: "0.875rem", color: CREAM_DIM, lineHeight: 1.8, marginTop: "16px" }}>
              The tradition that produced the greatest art in the Western world kept all three in the same room.
            </p>

            <p className={anim(1, 350)} style={{ fontFamily: montserrat, fontSize: "0.7rem", letterSpacing: "0.1em", color: G, marginTop: "18px" }}>
              KALLOS is built on that.
            </p>
          </div>

          <div className="flex-1" />

          <button
            onClick={next}
            className={anim(1, 400)}
            style={{ fontFamily: montserrat, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(193,155,95,0.65)", textAlign: "right" }}
          >
            Keep going →
          </button>
        </div>

        {/* ════════════════════════════════ SCREEN 3 — Feature Tour ════════════════════════════════ */}
        <div
          className="min-w-full h-full flex flex-col px-6"
          style={{ backgroundColor: E, paddingTop: "calc(env(safe-area-inset-top, 0px) + 110px)", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 44px)" }}
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

          <button
            onClick={next}
            className={anim(2, 300)}
            style={{ fontFamily: montserrat, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(193,155,95,0.65)", textAlign: "right" }}
          >
            Keep going →
          </button>
        </div>

        {/* ════════════════════════════════ SCREEN 4 — Hook ════════════════════════════════ */}
        <div
          className="min-w-full h-full flex flex-col px-10"
          style={{ backgroundColor: E, paddingTop: "calc(env(safe-area-inset-top, 0px) + 110px)", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 44px)" }}
        >
          <div className={`w-full transition-all duration-700 ${current === 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <p style={{ fontFamily: cormorant, fontSize: "1.8rem", fontStyle: "italic", fontWeight: 400, color: CREAM, lineHeight: 1.35 }}>
              You already know this feeling.
            </p>

            <div style={{ height: "1px", width: "32px", backgroundColor: G, margin: "20px 0" }} />

            <p className={anim(3, 150)} style={{ fontFamily: openSans, fontSize: "0.875rem", color: CREAM_DIM, lineHeight: 1.8 }}>
              The painting you can&apos;t look away from. The piece of music that opens something in you. The line from a book you&apos;ve carried for years.
            </p>

            <p className={anim(3, 250)} style={{ fontFamily: openSans, fontSize: "0.875rem", color: CREAM_DIM, lineHeight: 1.8, marginTop: "16px" }}>
              KALLOS is built for exactly that.
            </p>
          </div>

          <div className="flex-1" />

          <button
            onClick={next}
            className={anim(3, 350)}
            style={{ fontFamily: montserrat, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(193,155,95,0.65)", textAlign: "right" }}
          >
            Keep going →
          </button>
        </div>

        {/* ════════════════════════════════ SCREEN 5 — Invitation ════════════════════════════════ */}
        <div
          className="min-w-full h-full flex flex-col px-8"
          style={{ backgroundColor: E, paddingTop: "calc(env(safe-area-inset-top, 0px) + 110px)", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 44px)" }}
        >
          <div className={`w-full transition-all duration-700 ${current === 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div style={{ height: "1px", width: "32px", backgroundColor: G, marginBottom: "22px" }} />

            <p style={{ fontFamily: cormorant, fontSize: "1.75rem", fontStyle: "italic", fontWeight: 400, color: CREAM, lineHeight: 1.35, marginBottom: "18px" }}>
              Start where you are.
            </p>

            <p className={anim(4, 100)} style={{ fontFamily: openSans, fontSize: "0.875rem", color: CREAM_DIM, lineHeight: 1.8 }}>
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
