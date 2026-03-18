"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSplashPages } from "@/lib/sanity";

interface SplashPageData {
  _id: string;
  pageNumber: number;
  pageType: "image-quote" | "text-content";
  heroImageUrl?: string;
  quote?: string;
  quoteAttribution?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  // Styling fields
  quoteColor?: string;
  quoteFont?: "italic" | "normal";
  attributionColor?: string;
  bottomBackgroundColor?: string;
  titleColor?: string;
  titleSize?: string;
  descriptionColor?: string;
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
  backgroundGradientStart?: string;
  backgroundGradientEnd?: string;
}

// Default content (used if Sanity data not available)
const defaultPages: SplashPageData[] = [
  {
    _id: "default-1",
    pageNumber: 1,
    pageType: "image-quote",
    heroImageUrl: "/images/promo-splash.jpeg",
    quote: "Beauty will save the world",
    quoteAttribution: "Fyodor Dostoevsky",
  },
  {
    _id: "default-2",
    pageNumber: 2,
    pageType: "text-content",
    title: "There's a question beauty keeps asking.",
    description:
      "Sacred art. Music. Poetry. Storied places. A daily encounter with what's beautiful and true — and what it might be saying to you.",
    buttonText: "Begin",
  },
];

export default function SplashPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [pages, setPages] = useState<SplashPageData[]>([]);
  const [pagesReady, setPagesReady] = useState(false);
  const router = useRouter();

  // Fetch splash pages from Sanity — don't render until resolved
  useEffect(() => {
    async function fetchPages() {
      try {
        const data = await getSplashPages();
        setPages(data && data.length > 0 ? data : defaultPages);
      } catch (error) {
        console.error("Error fetching splash pages:", error);
        setPages(defaultPages);
      } finally {
        setPagesReady(true);
      }
    }
    fetchPages();
  }, []);

  // Fade in once data is ready
  useEffect(() => {
    if (pagesReady) {
      // Small rAF delay so the opacity transition fires after paint
      requestAnimationFrame(() => setIsVisible(true));
    }
  }, [pagesReady]);

  const goToHome = () => {
    localStorage.setItem("kallos-onboarded", "true");
    router.push("/");
  };

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      goToHome();
    }
  };

  // Hold a blank espresso screen while Sanity resolves — prevents flash of old default image
  if (!pagesReady) {
    return <div className="fixed inset-0" style={{ backgroundColor: "#16110d" }} />;
  }

  return (
    <div
      className={`fixed inset-0 overflow-hidden transition-opacity duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      {/* Skip button - always visible */}
      <button
        onClick={goToHome}
        className="absolute top-6 right-6 z-50 text-white/40 text-xs tracking-widest uppercase hover:text-white/70 transition-colors duration-200"
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      >
        Skip
      </button>

      {/* Swipeable pages container */}
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentPage * 100}%)` }}
      >
        {pages.map((page, index) => (
          <div key={page._id} className="min-w-full h-full">
            {page.pageType === "image-quote" ? (
              // Page 1 — Full bleed image + quote
              <div className="h-full flex flex-col" style={{ backgroundColor: page.bottomBackgroundColor || '#16110d' }}>
                {/* Full bleed image - top 65% */}
                <div className="h-[65vh] relative flex-shrink-0">
                  <img
                    src={page.heroImageUrl || "/images/promo-splash.jpeg"}
                    alt="KALLOS — Love the beautiful and the good"
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient fade into espresso */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-40"
                    style={{
                      background: `linear-gradient(to top, ${page.bottomBackgroundColor || '#16110d'}, transparent)`
                    }}
                  />
                </div>

                {/* Quote section */}
                <div
                  className="flex-1 flex flex-col items-center justify-center px-10 pb-16"
                  style={{ backgroundColor: page.bottomBackgroundColor || '#16110d' }}
                >
                  {/* Gold divider */}
                  <div
                    className={`w-8 mb-6 transition-all duration-700 delay-200 ${currentPage === index ? "opacity-100" : "opacity-0"}`}
                    style={{ height: '1px', backgroundColor: '#C19B5F' }}
                  />
                  <p
                    className={`text-xl text-center leading-relaxed max-w-xs transition-all duration-700 delay-300 ${currentPage === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                    style={{
                      color: page.quoteColor || 'rgba(255,255,255,0.85)',
                      fontStyle: page.quoteFont || 'italic',
                      fontFamily: 'Cormorant Garamond, Georgia, serif',
                    }}
                  >
                    &ldquo;{page.quote}&rdquo;
                  </p>
                  <p
                    className={`text-xs mt-4 tracking-widest uppercase transition-all duration-700 delay-500 ${currentPage === index ? "opacity-100" : "opacity-0"}`}
                    style={{
                      color: page.attributionColor || '#C19B5F',
                      fontFamily: 'Montserrat, sans-serif',
                    }}
                  >
                    {page.quoteAttribution}
                  </p>
                </div>
              </div>
            ) : (
              // Page 2 — The showstopper
              <div
                className="h-full flex flex-col items-center justify-center px-8 pb-safe"
                style={{ backgroundColor: '#16110d' }}
              >
                {/* KALLOS wordmark */}
                <p
                  className={`text-xs tracking-[0.35em] uppercase mb-12 transition-all duration-700 ${currentPage === index ? "opacity-100" : "opacity-0"}`}
                  style={{
                    color: '#C19B5F',
                    fontFamily: 'Montserrat, sans-serif',
                  }}
                >
                  KALLOS
                </p>

                {/* Headline */}
                <h2
                  className={`text-3xl text-center leading-snug mb-6 transition-all duration-700 delay-100 ${currentPage === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                  style={{
                    color: 'rgba(255,255,255,0.92)',
                    fontFamily: 'Cormorant Garamond, Georgia, serif',
                    fontStyle: 'italic',
                    fontWeight: 400,
                  }}
                >
                  {page.title || "There's a question beauty keeps asking."}
                </h2>

                {/* Gold divider */}
                <div
                  className={`w-8 mb-6 transition-all duration-700 delay-150 ${currentPage === index ? "opacity-100" : "opacity-0"}`}
                  style={{ height: '1px', backgroundColor: '#C19B5F' }}
                />

                {/* Description */}
                <p
                  className={`text-center leading-loose max-w-xs mb-14 transition-all duration-700 delay-200 ${currentPage === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                  style={{
                    color: 'rgba(255,255,255,0.55)',
                    fontFamily: 'Open Sans, sans-serif',
                    fontSize: '0.9rem',
                  }}
                >
                  {page.description || "Sacred art. Music. Poetry. Storied places. A daily encounter with what's beautiful and true — and what it might be saying to you."}
                </p>

                {/* Begin button — full width, sharp corners, gold */}
                <button
                  onClick={goToHome}
                  className={`w-full max-w-xs py-4 text-sm font-semibold tracking-widest uppercase active:scale-95 transition-all duration-300 delay-300 ${currentPage === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                  style={{
                    backgroundColor: page.buttonBackgroundColor || '#C19B5F',
                    color: page.buttonTextColor || '#16110d',
                    fontFamily: 'Montserrat, sans-serif',
                    boxShadow: `0 0 30px ${page.buttonBackgroundColor || '#C19B5F'}50`,
                  }}
                >
                  {page.buttonText || "Begin"}
                </button>

                {/* Tagline beneath button */}
                <p
                  className={`mt-5 text-xs tracking-wider transition-all duration-700 delay-500 ${currentPage === index ? "opacity-100" : "opacity-0"}`}
                  style={{
                    color: 'rgba(255,255,255,0.2)',
                    fontFamily: 'Montserrat, sans-serif',
                  }}
                >
                  Daily Vibes: Beauty • Truth • Goodness
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Page indicators — thin sharp bars, not dots */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {pages.map((page, index) => (
          <button
            key={page._id}
            onClick={() => setCurrentPage(index)}
            className="transition-all duration-300"
            style={{
              width: currentPage === index ? '24px' : '8px',
              height: '2px',
              backgroundColor: currentPage === index ? 'rgba(193,155,95,0.9)' : 'rgba(255,255,255,0.25)',
            }}
          />
        ))}
      </div>

      {/* Touch / click to advance */}
      <div
        className="absolute inset-0 z-10"
        onClick={nextPage}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          (e.currentTarget as HTMLElement).dataset.startX =
            touch.clientX.toString();
        }}
        onTouchEnd={(e) => {
          const startX = parseFloat(
            (e.currentTarget as HTMLElement).dataset.startX || "0"
          );
          const endX = e.changedTouches[0].clientX;
          const diff = startX - endX;

          if (diff > 50 && currentPage < pages.length - 1) {
            setCurrentPage(currentPage + 1);
          } else if (diff < -50 && currentPage > 0) {
            setCurrentPage(currentPage - 1);
          }
        }}
      />
    </div>
  );
}
