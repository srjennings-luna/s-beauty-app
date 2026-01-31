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
    title: "Your Companion for Contemplation",
    description:
      "Seeking Beauty invites you on an unforgettable pilgrimage across Italy—where every landscape, masterpiece, and sacred space becomes a living encounter with the beauty of our Catholic faith.",
    buttonText: "Let's explore",
  },
];

export default function SplashPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [pages, setPages] = useState<SplashPageData[]>(defaultPages);
  const router = useRouter();

  // Fetch splash pages from Sanity
  useEffect(() => {
    async function fetchPages() {
      try {
        const data = await getSplashPages();
        if (data && data.length > 0) {
          setPages(data);
        }
      } catch (error) {
        console.error("Error fetching splash pages:", error);
        // Keep default pages on error
      }
    }
    fetchPages();
  }, []);

  // Fade in on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const goToHome = () => {
    localStorage.setItem("seeking-beauty-onboarded", "true");
    router.push("/");
  };

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      goToHome();
    }
  };

  return (
    <div
      className={`fixed inset-0 overflow-hidden transition-opacity duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      {/* Skip button - always visible */}
      <button
        onClick={goToHome}
        className="absolute top-6 right-6 z-50 text-white/50 text-sm tracking-wide hover:text-white transition-colors duration-200"
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
              // Image with Quote layout
              <div className="h-full flex flex-col">
                {/* Top 2/3 - Full bleed promo image */}
                <div className="h-[66vh] relative">
                  <img
                    src={page.heroImageUrl || "/images/promo-splash.jpeg"}
                    alt="Seeking Beauty with David Henrie"
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient fade to bottom color */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-32"
                    style={{
                      background: `linear-gradient(to top, ${page.bottomBackgroundColor || '#203545'}, transparent)`
                    }}
                  />
                </div>

                {/* Bottom 1/3 - Quote section */}
                <div
                  className="flex-1 flex flex-col items-center justify-center px-8"
                  style={{ backgroundColor: page.bottomBackgroundColor || '#203545' }}
                >
                  <p
                    className={`text-lg text-center leading-relaxed max-w-xs transition-all duration-700 delay-300 ${currentPage === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                    style={{
                      color: page.quoteColor || 'rgba(255,255,255,0.7)',
                      fontStyle: page.quoteFont || 'italic'
                    }}
                  >
                    &ldquo;{page.quote}&rdquo;
                  </p>
                  <p
                    className={`text-sm mt-3 transition-all duration-700 delay-500 ${currentPage === index ? "opacity-100" : "opacity-0"}`}
                    style={{ color: page.attributionColor || 'rgba(255,255,255,0.4)' }}
                  >
                    — {page.quoteAttribution}
                  </p>
                </div>
              </div>
            ) : (
              // Text Content layout
              <div
                className="h-full flex flex-col items-center justify-center px-8"
                style={{
                  background: `linear-gradient(135deg, ${page.backgroundGradientStart || '#4C3759'} 0%, ${page.backgroundGradientEnd || '#203545'} 100%)`
                }}
              >
                {/* Icon */}
                <div
                  className={`w-16 h-16 mb-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 transition-all duration-500 ${currentPage === index ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-8 h-8 text-white/60"
                  >
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                  </svg>
                </div>

                {/* Title */}
                <h2
                  className={`mb-6 text-center font-light tracking-wide transition-all duration-500 delay-100 ${page.titleSize || 'text-2xl'} ${currentPage === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                  style={{ color: page.titleColor || 'rgba(255,255,255,0.9)' }}
                >
                  {page.title}
                </h2>

                {/* Description */}
                <p
                  className={`text-center leading-relaxed max-w-sm mb-12 transition-all duration-500 delay-200 ${currentPage === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                  style={{ color: page.descriptionColor || 'rgba(255,255,255,0.5)' }}
                >
                  {page.description}
                </p>

                {/* Begin button - prominent with animated glow */}
                <button
                  onClick={goToHome}
                  className={`px-10 py-4 text-base font-semibold tracking-wider rounded-sm
                    active:scale-95
                    transition-all duration-300
                    animate-pulse-subtle
                    ${currentPage === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                  style={{
                    backgroundColor: page.buttonBackgroundColor || '#C19B5F',
                    color: page.buttonTextColor || '#FFFFFF',
                    boxShadow: `0 0 25px ${page.buttonBackgroundColor || '#C19B5F'}80`
                  }}
                >
                  {page.buttonText || "Let's explore"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Page indicators */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {pages.map((page, index) => (
          <button
            key={page._id}
            onClick={() => setCurrentPage(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentPage === index
                ? "bg-white/80 w-6"
                : "bg-white/30 hover:bg-white/50 w-2"
            }`}
          />
        ))}
      </div>

      {/* Touch swipe area */}
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
