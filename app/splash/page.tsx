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
        <div className="min-w-full h-full flex flex-col" style={{ backgroundColor: E }}>
          {/* Image */}
          <div className="relative flex-shrink-0" style={{ height: "55vh" }}>
            <img
              src="/images/promo-splash.jpeg"
              alt="KALLOS"
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(to top, ${E} 0%, rgba(22,17,13,0.25) 55%, transparent 100%)` }}
            />
          </div>

          {/* Copy */}
          <div
            className="flex-1 flex flex-col justify-between px-8"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 44px)", paddingTop: "4px" }}
          >
            <div>
              {/* Wordmark + pronunciation */}
              <div className={anim(0)}>
                <p style={{ fontFamily: montserrat, fontSize: "1.1rem", letterSpacing: "0.28em", textTransform: "uppercase", color: CREAM, fontWeight: 600 }}>
                  KALLOS
                </p>
                <p style={{ fontFamily: cormorant, fontSize: "0.78rem", fontStyle: "italic", color: "rgba(253,246,232,0.38)", letterSpacing: "0.06em", marginTop: "2px" }}>
                  kal · os
                </p>
              </div>

              <GoldRule />

              {/* Headline */}
              <p className={anim(0, 100)} style={{ fontFamily: cormorant, fontSize: "1.6rem", fontStyle: "italic", fontWeight: 400, color: CREAM, lineHeight: 1.35 }}>
                &ldquo;Beauty will save the world.&rdquo;
              </p>

              {/* Body */}
              <p className={anim(0, 200)} style={{ fontFamily: openSans, fontSize: "0.855rem", color: CREAM_DIM, lineHeight: 1.78, marginTop: "14px" }}>
                Rediscover beauty, truth and goodness through tradition. The Greeks called it KALLOS, and they believed the three were inseparable.
              </p>

              {/* Daily dose — gold */}
              <p className={anim(0, 300)} style={{ fontFamily: montserrat, fontSize: "0.72rem", color: G, letterSpacing: "0.06em", marginTop: "14px" }}>
                Your daily dose of what is beautiful. true. good.
              </p>
            </div>

            <button
              onClick={next}
              className={anim(0, 400)}
              style={{ fontFamily: montserrat, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(193,155,95,0.65)", textAlign: "left" }}
            >
              Keep going →
            </button>
          </div>
        </div>

        {/* ════════════════════════════════ SCREEN 2 — The Three ════════════════════════════════ */}
        <div className="min-w-full h-full flex flex-col items-center justify-center px-10" style={{ backgroundColor: E }}>
          <div className={`w-full transition-all duration-700 ${current === 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <p style={{ fontFamily: cormorant, fontSize: "2rem", fontStyle: "italic", fontWeight: 400, color: CREAM, textAlign: "center", lineHeight: 1.3 }}>
              Beauty. Truth. Goodness.
            </p>

            <div style={{ height: "1px", width: "32px", backgroundColor: G, margin: "20px auto" }} />

            <p className={anim(1, 150)} style={{ fontFamily: openSans, fontSize: "0.875rem", color: CREAM_DIM, lineHeight: 1.8, textAlign: "center" }}>
              Ancient philosophers called them the transcendentals: beauty, truth, goodness. Three things woven together that finding one means brushing against the divine.
            </p>

            <p className={anim(1, 250)} style={{ fontFamily: openSans, fontSize: "0.875rem", color: CREAM_DIM, lineHeight: 1.8, textAlign: "center", marginTop: "16px" }}>
              The tradition that produced the greatest art in the Western world kept all three in the same room.
            </p>

            <p className={anim(1, 350)} style={{ fontFamily: montserrat, fontSize: "0.7rem", letterSpacing: "0.1em", color: G, textAlign: "center", marginTop: "18px" }}>
              KALLOS is built on that.
            </p>
          </div>

          <button
            onClick={next}
            className={`mt-14 ${anim(1, 400)}`}
            style={{ fontFamily: montserrat, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(193,155,95,0.65)" }}
          >
            Keep going →
          </button>
        </div>

        {/* ════════════════════════════════ SCREEN 3 — Feature Tour ════════════════════════════════ */}
        <div className="min-w-full h-full flex flex-col justify-center px-6" style={{ backgroundColor: E }}>
          <p
            className={anim(2)}
            style={{ fontFamily: cormorant, fontSize: "1.5rem", fontStyle: "italic", fontWeight: 400, color: CREAM, marginBottom: "28px" }}
          >
            Two ways to explore.
          </p>

          {/* P&P card */}
          <div
            className={`relative overflow-hidden mb-4 ${anim(2, 100)}`}
            style={{ height: "152px" }}
          >
            <img src="/images/promo-splash.jpeg" alt="Pause and Ponder" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(22,17,13,0.94) 0%, rgba(22,17,13,0.55) 55%, rgba(22,17,13,0.15) 100%)" }} />
            <div className="absolute inset-0 flex flex-col justify-center px-5">
              <p style={{ fontFamily: montserrat, fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase", color: G, marginBottom: "8px" }}>
                Pause &amp; Ponder
              </p>
              <p style={{ fontFamily: cormorant, fontSize: "1.05rem", fontStyle: "italic", color: CREAM, lineHeight: 1.4, maxWidth: "210px" }}>
                Every day, a piece of art and a question to sit with.
              </p>
            </div>
          </div>

          {/* Journeys card */}
          <div
            className={`relative overflow-hidden ${anim(2, 200)}`}
            style={{ height: "152px" }}
          >
            <img src="/images/promo-splash.jpeg" alt="Journeys" className="w-full h-full object-cover" style={{ objectPosition: "center 30%" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(22,17,13,0.94) 0%, rgba(22,17,13,0.55) 55%, rgba(22,17,13,0.15) 100%)" }} />
            <div className="absolute inset-0 flex flex-col justify-center px-5">
              <p style={{ fontFamily: montserrat, fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase", color: G, marginBottom: "8px" }}>
                Journeys
              </p>
              <p style={{ fontFamily: cormorant, fontSize: "1.05rem", fontStyle: "italic", color: CREAM, lineHeight: 1.4, maxWidth: "210px" }}>
                Or go deeper. A theme, an artist, a question. One day at a time.
              </p>
            </div>
          </div>

          <button
            onClick={next}
            className={`mt-8 ${anim(2, 300)}`}
            style={{ fontFamily: montserrat, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(193,155,95,0.65)", textAlign: "left" }}
          >
            Keep going →
          </button>
        </div>

        {/* ════════════════════════════════ SCREEN 4 — Hook (copy TBD — Sheri to confirm) ════════════════════════════════ */}
        <div className="min-w-full h-full flex flex-col items-center justify-center px-10" style={{ backgroundColor: E }}>
          <div className={`w-full transition-all duration-700 ${current === 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <p style={{ fontFamily: cormorant, fontSize: "1.8rem", fontStyle: "italic", fontWeight: 400, color: CREAM, textAlign: "center", lineHeight: 1.35 }}>
              You already know this feeling.
            </p>

            <div style={{ height: "1px", width: "32px", backgroundColor: G, margin: "20px auto" }} />

            <p className={anim(3, 150)} style={{ fontFamily: openSans, fontSize: "0.875rem", color: CREAM_DIM, lineHeight: 1.8, textAlign: "center" }}>
              The painting you can&apos;t look away from. The piece of music that opens something in you. The line from a book you&apos;ve carried for years.
            </p>

            <p className={anim(3, 250)} style={{ fontFamily: openSans, fontSize: "0.875rem", color: CREAM_DIM, lineHeight: 1.8, textAlign: "center", marginTop: "16px" }}>
              KALLOS is built for exactly that.
            </p>
          </div>

          <button
            onClick={next}
            className={`mt-14 ${anim(3, 350)}`}
            style={{ fontFamily: montserrat, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(193,155,95,0.65)" }}
          >
            Keep going →
          </button>
        </div>

        {/* ════════════════════════════════ SCREEN 5 — Invitation ════════════════════════════════ */}
        <div
          className="min-w-full h-full flex flex-col justify-center px-8"
          style={{ backgroundColor: E, paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 40px)" }}
        >
          <div className={`w-full transition-all duration-700 ${current === 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div style={{ height: "1px", width: "32px", backgroundColor: G, marginBottom: "22px" }} />

            <p style={{ fontFamily: cormorant, fontSize: "1.75rem", fontStyle: "italic", fontWeight: 400, color: CREAM, lineHeight: 1.35, marginBottom: "18px" }}>
              Start where you are.
            </p>

            <p className={anim(4, 100)} style={{ fontFamily: openSans, fontSize: "0.875rem", color: CREAM_DIM, lineHeight: 1.8, marginBottom: "44px" }}>
              No preparation needed. No right way to begin. Start a 3-day journey into beauty, truth and goodness. Something new every day.
            </p>

            {/* Primary CTA */}
            <button
              onClick={startJourney}
              className={`w-full py-4 mb-4 active:scale-95 transition-all duration-200 ${anim(4, 200)}`}
              style={{
                backgroundColor: G,
                color: E,
                fontFamily: montserrat,
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Start with Beauty, Truth &amp; Goodness
            </button>

            {/* Secondary CTA */}
            <button
              onClick={seeToday}
              className={`w-full py-2 ${anim(4, 300)}`}
              style={{
                fontFamily: montserrat,
                fontSize: "0.65rem",
                color: "rgba(193,155,95,0.55)",
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
